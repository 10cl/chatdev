import cx from 'classnames'
import {FC, MouseEventHandler, Suspense, useCallback, useMemo, useRef, useState} from 'react'
import { useTranslation } from 'react-i18next'
import clearIcon from '~/assets/icons/clear.svg'
import chatModeIcon from '~/assets/icons/chatmode.svg'
import gameIcon from '~/assets/icons/game.svg'
import historyIcon from '~/assets/icons/history.svg'
import libraryIcon from '~/assets/icons/library.svg'
import editIcon from '~/assets/icons/edit.svg'
import htmlIcon from '~/assets/icons/html.svg'
import addIcon from '~/assets/icons/add.svg'
import closeIcon from '~/assets/icons/close.svg'
import assistantIcon from '~/assets/icons/assistant.svg'
import datasetsIcon from '~/assets/icons/datasets.svg'
import settingsIcon from '~/assets/icons/setting_top.svg'
import tipsIcon from '~/assets/ex_assets/profile/Wolfgang_Schulz.png'

import { CHATBOTS } from '~app/consts'
import { ConversationContext, ConversationContextValue } from '~app/context'
import { trackEvent } from '~app/plausible'
import { ChatMessageModel } from '~types'
import { BotId, BotInstance } from '../../bots'
import Button from '../Button'
import HistoryDialog from '../History/Dialog'
import HtmlTypeView from '~app/components/AgentPreview/HtmlTypeView'
import SwitchBotDropdown from '../SwitchBotDropdown'
import Tooltip from '../Tooltip'
import ChatMessageInput from './ChatMessageInput'
import ChatMessageList from './ChatMessageList'
import LocalPrompts from '../PromptIDE/LocalPrompts'
import React, { useEffect  } from 'react';
import GameAgentObjectModal from '../GameAgentObjectModal';
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import {toBase64} from "js-base64";
import AgentCommunityDialog from "~app/components/Agent/AgentCommunityDialog";
import loadingImg from "~assets/loading.png";
import SettingsDialog from "~app/components/Settings/SettingsDialog";
import {BeatLoader} from "react-spinners";
import {
  isURL,
  loadYaml,
  saveLocalPrompt,
} from "~services/prompts";
import {
  getStore,
  getRealYaml,
  setRealYaml,
  setRealYamlKey,
  setStore,
  getPromptValue,
  setPromptValue,
  getEditorGenerate,
  setEditorGenerate,
  getRealYamlKey,
  getGameVilleYaml,
  setEditorStatus,
  getEditorStatus,
  setResponseType,
  setResponseStream,
  getTipsPosition,
  getTipsContent,
  getHookedMessage,
  setHookedMessage,
  setPendingMessage,
  getEditorGenerateContent,
  setEditorGenerateContent,
  finishEditorGenerate,
  isHookedResponse,
  getNodeType,
  getEmbeddingDocs,
  getResponseErrorMessage,
  setResponseErrorMessage, setAgentReset, setRealYamlGenerating
} from "~services/storage/memory-store";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";
import {UserConfig} from "~services/user-config";
import AgentUploadDialog from "~app/components/Agent/AgentUploadDialog";
import {useNavigate} from "@tanstack/react-router";
import {importFromText} from "~app/utils/export";

import {useAtom, useAtomValue} from "jotai/index";
import {
  gameModeEnable,
  editorPromptTimesAtom,
  floatTipsOpen,
  agentLocalDialogOpen,
  showEditorAtom,
  workFlowingDisableAtom,
  showHistoryAtom,
  showSettingsAtom,
  showGptsDialogAtom,
  messageTimesTimesAtom,
  editorYamlTimesAtom,
  editorPromptAtom,
  showShareAtom,
  fpHashAtom,
  seminarDisableAtom,
  isNewAgentShowAtom,
  yamlExceptionAtom,
  generateEnableAtom,
  embeddingEnableAtom,
  showDdataSetsAtom,
} from "~app/state";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import NewAgentDialog from "~app/components/Agent/NewAgentDialog";
import {loadUrl} from "~document-loader/loader";
import {embeddingMessage, retrieveDocs} from "~embedding/retrieve";
import {Toaster, toast} from "react-hot-toast";
import Browser from "webextension-polyfill";
import {uuid} from "~utils";
import {isPublicUrlFromWeb} from "~utils/format";
import GameModeView from "~app/components/GameModeView";
import {toastCustom} from "~app/components/Toast";
import ErrorAction from "~app/components/Chat/ErrorAction";
import store from "store2";
import DataSetDialog from "~app/components/Agent/DataSetDialog";

interface Props {
  botId: BotId
  bot: BotInstance
  messages: ChatMessageModel[]
  onUserSendMessage: (input: string, botId: BotId) => void
  resetConversation: () => void
  generating: boolean
  stopGenerating: () => void
  mode?: 'full' | 'compact'
  onSwitchBot?: (botId: BotId) => void
}

const ConversationPanel: FC<Props> = (props) => {
  const { t } = useTranslation()
  const botInfo = CHATBOTS[props.botId]
  const mode = props.mode || 'full'
  const marginClass = 'mx-5'
  const [showHistory, setShowHistory] = useAtom(showHistoryAtom)
  const [generateEnable, setGenerateEnable] = useAtom(generateEnableAtom)

  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [showAssistant, setShowAssistant] = useAtom(showGptsDialogAtom)
  const [showDataSets, setShowDataSets] = useAtom(showDdataSetsAtom)
  const [showSettings, setShowSettings] = useAtom(showSettingsAtom)
  const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [isPreviewShow, setShowWebPreviewDialog] = useState(false)
  const [isNewAgentShow, setNewAgentDialog] = useAtom(isNewAgentShowAtom)
  const [shareViewShow, setShowShareView] = useAtom(showShareAtom)
  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useAtom(agentLocalDialogOpen)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
  const [changeTime, setChangeTime] = useAtom(messageTimesTimesAtom)
  const [gameFloatVisible, setGameFloatVisible] = useAtom(floatTipsOpen);
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)
  const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)
  const [userConfig, setUserConfig] = useState<UserConfig | undefined>(undefined)
  const [fpHash, setFpHash] = useAtom(fpHashAtom);
  const [isEmbeddingEnable, setEmbeddingEnable] = useAtom(embeddingEnableAtom)

  const navigate = useNavigate()

  const setFp = async () => {
    const fp = await FingerprintJS.load();

    const { visitorId } = await fp.get();
    setStore("fp", visitorId)
    setFpHash(visitorId)
  };

  const updateConfigValue = useCallback(
    (update: Partial<UserConfig>) => {
      setUserConfig({ ...userConfig!, ...update })
    },
    [userConfig],
  )

  function propsMessageCheck(props: Props){
    updateSendMessage(props)
    return true;
  }

  const importShareAgent = useCallback((shareValue: string) => {
    toast.promise(
      loadYaml(shareValue).then(promptYaml => {
        try {
          setRealYamlKey("Default_Flow_Dag_Yaml")

          importFromText(JSON.parse(promptYaml.yaml)).then(() => {
            setShowAssistant(false)
            setSeminarDisable(false)
            setWorkFlowingDisable(false)

            setGameModeEnable(false)
            setStore("gameModeEnable", false)

            const botId = props.botId as BotId
            navigate({to: '/chat/$botId', params: {botId}})
          })
        } catch (e) {
          alert(e)
        }
      }),
      {
        loading: t('Load Agent...'),
        success: <b>{t('Load success.')}</b>,
        error: <b>{t('Load failed.')}</b>,
      }, {
        position: "top-center"
      }
    );
  }, [props])

  useEffect(() => {
    // setShowEditor(false)
    setShowShareView(false)
    // setEditorGenerate('')
    setGameFloatVisible(false)
    setIsPromptLibraryDialogOpen(false)

    setStore("gameModeEnable", store.get("gameModeEnable", true))

    /*set fingerprint */
    if (fpHash != ""){
      setStore("fp", fpHash)
    }else{
      setFp();
    }

    /* public url*/
    const publicValue = isPublicUrlFromWeb()
    if (publicValue) {
      /* Cache it to avoid duplicate imports */
      if (!getStore(publicValue)) {
        setStore(publicValue, true)
        importShareAgent(publicValue)
      }
    }
  }, [props])


  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: props.resetConversation,
    }
  }, [props.resetConversation])

  const onSubmit = useCallback(
    async (input: string) => {
      const isGameMode = getStore("gameModeEnable", true)
      const isWorkFlowingDisable = getStore("workFlowingDisable", false)

      // if in editor, send message as the Agent.
      if (getEditorStatus()){
        setStore("workFlowingDisable", false)
        setWorkFlowingDisable(false)
      }else{
        if(isGameMode){
          // Generate Yaml
          setEditorGenerate("")
        }
      }

      if (getStore("chat_reset")){
        setStore("chat_reset", false)
        resetConversation()
      }

      /*Game Mode*/if (isGameMode || !isWorkFlowingDisable){
        setPendingMessage(input)
        updateConfigValue({ startupPage: props.botId })
        await updateSendMessage(props)
      }/*Chat Mode*/else{
        props.onUserSendMessage(input as string, props.botId)
      }
    },
    [props],
  )

  async function handleHookedMessage(sendProp: Props) {
    const inputMessage = isHookedResponse("message")
    const botId = sendProp.botId

    if (inputMessage) {
      const loadType = getNodeType()
      if(loadType == "url" || loadType == "doc"){
        await toast.promise(
            loadUrl(inputMessage).then(document => {
              if (document != ""){
                setResponseType("")
                setResponseStream(document)
              }
            }),
            {
              loading: t('Load url...'),
              success: <b>{t('Load success.')}</b>,
              error: <b>{t('Load failed.')}</b>,
            }, {
              position: "top-center"
            }
        );
      }else if (loadType == "retrieve"){
        await toast.promise(
            retrieveDocs(inputMessage), {
              loading: t('Embedding & retrieve docs...'),
              success: <b>{t('retrieve success.')}</b>,
              error: <b>{t('retrieve failed.')}</b>,
            }, {
              position: "top-center"
            }
        );
      }else{
        sendProp.onUserSendMessage(inputMessage, botId)
      }
    }
  }

  async function updateEditorContent() {
    if (getEditorGenerate() == "Yaml"){
      setRealYamlGenerating(getEditorGenerateContent())
      const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
      setEditorYamlTimes(editorYamlTimes)
      setStore("editorYamlTimes", editorYamlTimes)
    }else if (getEditorGenerate() == "Prompt"){
      setPromptValue(editorPrompt, getEditorGenerateContent())
      setEditorPromptTimes(editorPromptTimes + 1)
    }
  }

  async function updateSendMessage(sendProp: Props) {
    const isGameMode = getStore("gameModeEnable", true)
    setStore("botid", sendProp.botId)

    /* Game mode, embedding llm response.*/
    if (isGameMode && isEmbeddingEnable){
      if (props.generating != getStore("chat_generating", false)) {
        if (!props.generating) {
          await embeddingMessage(props.messages)
        }
        setStore("chat_generating", props.generating)
      }
    }

    /* handle result.*/
    if (isHookedResponse("html")){
      await Browser.storage.sync.set({task_html: getStore("task_html", "")})
      openHtmlDialog()
    }else if (isHookedResponse("generate")){
      toast.success(t('Successfully generated!'), {
        position: "top-center"
      })

      await updateEditorContent()

      finishEditorGenerate()
      setShowEditor(true)
      setEditorStatus(true)

      // generate yaml & reset conversion, protect against context
      resetConversation()
      // alert("Generate Success, You can continue editing in the editor.")
    }else if (isHookedResponse("history")){
      toast.success(t('clear the history!'), {
        position: "top-center"
      })
      props.resetConversation()
    }else if (getEditorGenerate() !== '' && getEditorGenerateContent() != ""){ // stream...
      if (new Date().getTime() - getStore("generate_content_time", 0) > 500) {  // update for Yaml, 2s update
        await updateEditorContent()
        setStore("generate_content_time", new Date().getTime())
      }
    }

    /*toast for last message error*/
    if (props.messages && props.messages[props.messages.length-1]){
      const errorMsg = props.messages[props.messages.length-1].error
      if (errorMsg != undefined){
        if (getResponseErrorMessage() != errorMsg.message){
          setResponseErrorMessage(errorMsg.message)
          setAgentReset(true)
          if (isGameMode){
            toast.error(getResponseErrorMessage(), {
              position: "bottom-right",
              duration: 5000,
            })

            toast((t) => (<ErrorAction error={errorMsg}/>), {
              position: "bottom-right",
              duration: 5000,
            });
          }
        }
      }else{
        setResponseErrorMessage("")
      }
    }

    /*Handle hooked Message*/
    await handleHookedMessage(sendProp)
  }

  const openHtmlDialog = useCallback(() => {
    // setShowWebPreviewDialog(true)
    window.open('https://chatdev.toscl.com/example/preview.html', '_blank');
    trackEvent('open_html_dialog')
  }, [])

  const resetConversation = useCallback(() => {
    if (!props.generating) {
      setAgentReset(true)
      props.resetConversation()
      setStore("yaml_update", true)
    }
  }, [props])

  const openHistoryDialog = useCallback(() => {
    setStore("prompt_edit", "")
    setShowHistory(true)
    trackEvent('open_history_dialog', { botId: props.botId })
  }, [props.botId])

  const newAgentButton = useCallback(() => {
    setNewAgentDialog(true)
  }, [props.botId])

  function setModeChange() {
    trackEvent('switch_map_and_chat')
    setShowEditor(false)
    setEditorStatus(false)
    setGameFloatVisible(false)

    const newState = !getStore("gameModeEnable", false)
    setGameModeEnable(newState)
    setStore("gameModeEnable", newState)
    if (newState){
      setStore("workFlowingDisable", false)
      setWorkFlowingDisable(false)

      setEditorGenerate("")
    }
  }

  function setAgentSwitch() {
    /* Game Mode should keep enable*/
    if (isGameMode){
      toast.error(t("This should be enable in game mode."))
      return
    }

    finishEditorGenerate()
    setGameFloatVisible(false)

    if (!window.confirm((workFlowingDisable?
      t('Confirm whether to start your Agent?'):
      t('Confirm whether to exit the Agent?')) as string)) {
      return
    }
    trackEvent('open_prompt_flow_collapsed')

    const newState = !getStore("workFlowingDisable", false)
    setStore("workFlowingDisable", newState)
    setWorkFlowingDisable(newState)

    setStore("flow_node", "")
    setStore("flow_edge", "")
    setResponseType("");
  }

  async function createNewAgentInGame(agentName: string) {
    setRealYamlKey(agentName)
    // duplicate agent name not save.
    if (getPromptValue(agentName) == undefined) {
      await saveLocalPrompt({
        id: uuid(),
        title: agentName,
        prompt: "#TODO: defined your Agent structure for:" + getStore("player_mark", "") + "\n" + getGameVilleYaml(),
        type: "yaml"
      })
    }
    setEditorPrompt("Action_Prompt_Template");

    setEditorPromptTimes(editorPromptTimes + 1)
    setShowEditor(true)
    setEditorStatus(true)

    const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
    setEditorYamlTimes(editorYamlTimes)
    setStore("editorYamlTimes", editorYamlTimes)

    setGameModeEnable(false)
    setStore("gameModeEnable", false)
  }

  const openFlowEditor = useCallback(() => {
    setGameFloatVisible(false)

    const isGameMode = getStore("gameModeEnable", true)
    const player_mark = getStore("player_mark", "")
    const yamlMark = getPromptValue(player_mark)

    if ((isGameMode && yamlMark) || !isGameMode) {

      if (isGameMode && getRealYaml() == undefined) {
        setRealYaml("#TODO: defined your Agent structure for:" + getStore("player_mark", "") + "\n" + getGameVilleYaml())
      }

      setEditorPrompt("Action_Prompt_Template");

      setEditorPromptTimes(editorPromptTimes + 1)
      setShowEditor(true)
      setEditorStatus(true)

      const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
      setEditorYamlTimes(editorYamlTimes)
      setStore("editorYamlTimes", editorYamlTimes)

      setShowAssistant(false)

      setGameModeEnable(false)
      setStore("gameModeEnable", false)
      toast.success('You are editing ' + getRealYamlKey(), {
        position: "bottom-right"
      })
    } else {
      toastCustom(t('Here is undefined, Create a new Agent for ' + player_mark), ()=> createNewAgentInGame(player_mark), "Create")
    }
    trackEvent('open_editor_prompt_flow')
  }, [])

  const closeFlowEditor = useCallback(() => {
    setShowEditor(false)
    setEditorStatus(false)
    trackEvent('close_editor_prompt_flow')

    // focus set ''
    setEditorGenerate('')

    // force update yaml
    setStore("yaml_update", true)
  },[])


  const openAssistant = useCallback(async () => {
    finishEditorGenerate()
    if (!(await requestHostPermission('https://*.chatdev.toscl.com/'))) {
      throw new ChatError('Missing chatdev.toscl.com permission', ErrorCode.MISSING_HOST_PERMISSION)
    }
    setGameFloatVisible(false)

    setShowAssistant(true)
    // setShowEditor(false)
    trackEvent('open_assistant')
  },[])

  const openDataSets = useCallback(async () => {
    finishEditorGenerate()
    setGameFloatVisible(false)

    setShowDataSets(true)
    trackEvent('open_datasets')
  },[])


  const openSettings = useCallback(() => {
    finishEditorGenerate()
    setShowSettings(true)
    trackEvent('open_settings')
  },[])

  const closeAssistant = useCallback(() => {
    setShowAssistant(false)
    trackEvent('close_assistant')
  },[])

  const openYourAgent = useCallback(() => {
    finishEditorGenerate()
    setStore("prompt_edit", "")
    setIsPromptLibraryDialogOpen(true)
    setGameFloatVisible(false)
    trackEvent('open_prompt_library')
  }, [])

  function getLastMessage() {
    const errorMsg = props.messages[props.messages.length-1].error
    return errorMsg != undefined && errorMsg.message
  }

  return (
    <ConversationContext.Provider value={context}>
      <div className={cx('flex flex-col overflow-hidden bg-primary-background h-full rounded-[20px]')}>
        <div
          className={cx(
            'border-b border-solid border-primary-border flex flex-row items-center justify-between gap-2 py-[10px]',
            marginClass,
          )}
        >
          <div className="flex flex-row items-center">
            <img src={botInfo.avatar} className="w-[18px] h-[18px] object-contain rounded-full" />
            <Tooltip content={props.bot.name || botInfo.name}>
              <span className="font-semibold text-primary-text text-sm cursor-default ml-2 mr-1">{botInfo.name}</span>
            </Tooltip>
            {mode === 'compact' && props.onSwitchBot && (
              <SwitchBotDropdown selectedBotId={props.botId} onChange={props.onSwitchBot} />
            )}
          </div>
          <div className="flex flex-row items-center gap-2 shrink-0 cursor-pointer group">
            <div className="flex flex-row items-center gap-2">
              <img src={gameIcon} className="w-5 h-5 cursor-pointer"/>

              <Tooltip content={cx(isGameMode ? t('Chat Mode') : t('Game Mode'))}>
                <button
                    className={cx("bg-secondary relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out", isGameMode ? '' : 'button-rotate-180')}
                    id="headlessui-switch-:rd:" role="switch" type="button"  aria-checked="false"
                    onClick={() => setModeChange()}
                    data-headlessui-state="" aria-labelledby="headlessui-label-:re:">
                  <span className={cx('translate-x-0 pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')}></span>
                </button>
              </Tooltip>

              <img src={chatModeIcon} className="w-5 h-5 cursor-pointer"/>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3">
            {false && <Tooltip content={t('Open Web Preview')}>
              <img src={htmlIcon} className="w-5 h-5 cursor-pointer" onClick={openHtmlDialog} />
            </Tooltip>}

            {!workFlowingDisable && <Tooltip content={cx(showEditor ? t('Exit') : (t('Edit') + " " + t('Agent')))}>
              <img src={!showEditor?editIcon:closeIcon} className="w-5 h-5 cursor-pointer" onClick={!showEditor?openFlowEditor:closeFlowEditor} />
            </Tooltip>}
            {!workFlowingDisable && <Tooltip content={t('New Agent')}>
              <img src={addIcon} className="w-5 h-5 cursor-pointer" onClick={newAgentButton} />
            </Tooltip>}
            {!workFlowingDisable && <Tooltip content={t('Your Agent')}>
              <img src={libraryIcon} className="w-5 h-5 cursor-pointer" onClick={openYourAgent} />
            </Tooltip>}
            {!workFlowingDisable && <Tooltip content={cx(t('Agent Community'))}>
              <img src={assistantIcon} className="w-5 h-5 cursor-pointer" onClick={openAssistant} />
            </Tooltip>}
            {!workFlowingDisable && <Tooltip content={cx(t('Knowledge'))}>
              <img src={datasetsIcon} className="w-5 h-5 cursor-pointer" onClick={openDataSets} />
            </Tooltip>}
            <Tooltip content={cx(workFlowingDisable ? t('Start') : t('Stop')) + " " + t('Agent')}>
              <button
                  className={cx("bg-secondary relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out", workFlowingDisable ? '' : 'button-rotate-180 ' + (isGameMode ? "":'flow-open'))}
                  id="headlessui-switch-:rd:" role="switch" type="button"  aria-checked="false"
                  onClick={() => setAgentSwitch()}
                  data-headlessui-state="" aria-labelledby="headlessui-label-:re:">
                <span className={cx('translate-x-0 pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')}></span>
              </button>
            </Tooltip>
            <Tooltip content={t('Clear conversation')}>
              <img src={clearIcon} className="w-5 h-5 cursor-pointer" onClick={resetConversation} />
            </Tooltip>
            <Tooltip content={t('View history')}>
              <img src={historyIcon} className="w-5 h-5 cursor-pointer" onClick={openHistoryDialog} />
            </Tooltip>
            <Tooltip content={cx(t('Settings'))}>
              <img src={settingsIcon} className="w-5 h-5 cursor-pointer" onClick={openSettings} />
            </Tooltip>
          </div>
        </div>

        <LocalPrompts className={cx(showEditor?"":"hidden")}/>
        <div className={"hidden"} key={changeTime}>{propsMessageCheck(props)}</div>

        <div className={cx("promptgame overflow-hidden h-full " + cx(showEditor ? "hidden" : ""))}>
          <ChatMessageList botId={props.botId} messages={props.messages}/>
          <div id="loading">
            <div id="loading-wrapper">
              <img src={loadingImg} alt=""/>
              <span>{t('Ensure you are logged in to the LLM website to access all features, When using the default Webapp Mode, no tokens will be consumed.')}</span>
            </div>
          </div>
          <GameModeView  botId={props.botId}/>
        </div>

        <div className={cx('mt-3 flex flex-col', marginClass, mode === 'full' ? 'mb-3' : 'mb-[5px]')}>
          <div className={cx('flex flex-row items-center gap-[5px]', mode === 'full' ? 'mb-3' : 'mb-0')}>
            {mode === 'compact' && <span className="font-medium text-xs text-light-text">Send to {botInfo.name}</span>}
            <hr className="grow border-primary-border" />
          </div>
          <ChatMessageInput
            mode={mode}
            disabled={props.generating}
            placeholder={(showEditor && generateEnable)
                ? (t('Describe here, AI will help you generate your Agent ') + (getEditorGenerate() != "Prompt" ? "YAML: " + getRealYamlKey() : "func: " + editorPrompt))
                : t('Ensure you are logged in to the LLM website to access all features')}
            onSubmit={onSubmit}
            autoFocus={mode === 'full'}
            actionButton={
              props.generating ? (
                <Button
                  text={t('Stop')}
                  color="flat"
                  size={mode === 'full' ? 'normal' : 'small'}
                  onClick={props.stopGenerating}
                />
              ) : (
                mode === 'full' && <Button text={(showEditor && generateEnable)? t('Generate') : t('Send')} color="primary" type="submit" />
              )
            }
          />
        </div>
      </div>
      {showHistory && <HistoryDialog botId={props.botId} open={true} onClose={() => setShowHistory(false)} />}
      {isPreviewShow && (
        <HtmlTypeView open={true} onClose={() => setShowWebPreviewDialog(false)} messages={props.messages} />
      )}
      {isNewAgentShow && (
        <NewAgentDialog open={true} onClose={() => setNewAgentDialog(false)} messages={props.messages} />
      )}
      {shareViewShow && (
          <AgentUploadDialog open={true} onClose={() => setShowShareView(false)} messages={props.messages} />
      )}
      {showAssistant && (
          <AgentCommunityDialog open={true} onClose={() => setShowAssistant(false)} messages={props.messages} />
      )}
      {showDataSets && (
          <DataSetDialog open={true} onClose={() => setShowDataSets(false)} messages={props.messages} />
      )}
      {showSettings && (
          <SettingsDialog open={true} onClose={() => setShowSettings(false)} />
      )}
      <Toaster/>
    </ConversationContext.Provider>
  )
}

export default ConversationPanel
