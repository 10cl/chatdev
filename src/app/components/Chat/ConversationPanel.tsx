import cx from 'classnames'
import {FC, Fragment, MouseEventHandler, Suspense, useCallback, useMemo, useRef, useState} from 'react'
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
import flowIcon from '~/assets/icons/flow.svg'
import flowBlueIcon from '~/assets/icons/flow_blue.svg'
import settingsIcon from '~/assets/icons/setting_top.svg'

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
  setResponseErrorMessage,
  setAgentReset,
  setRealYamlGenerating,
  getResponseStream,
  isGameWindow,
  setGameWindow,
  isChatMode,
  setChatMode,
  setPromptFlowNode,
  getPlayerMark,
  isEditorGenerateEnable,
  getPromptLib, setEditorGenerateTime, getEditorGenerateTime, setBotId, getBotId
} from "~services/storage/memory-store";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";
import {getUserConfig, UserConfig} from "~services/user-config";
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
  showDdataSetsAtom, showNavSettingsAtom, promptFlowTips,
} from "~app/state";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import NewAgentDialog from "~app/components/Agent/NewAgentDialog";
import {loadDoc, loadUrl} from "~document-loader/loader";
import {embeddingMessage, retrieveDocs} from "~embedding/retrieve";
import {Toaster, toast} from "react-hot-toast";
import Browser, {Runtime} from "webextension-polyfill";
import {uuid} from "~utils";
import {isPublicUrlFromWeb} from "~utils/format";
import GameModeView from "~app/components/GameModeView";
import {toastCustom} from "~app/components/Toast";
import ErrorAction from "~app/components/Chat/ErrorAction";
import store from "store2";
import DataSetDialog from "~app/components/Agent/DataSetDialog";
import {PromptFlowDag, PromptFlowNode, promptflowx} from "promptflowx";
import SwitchAgentDropdown from "~app/components/SwitchAgentDropdown";
import {Menu, Transition} from "@headlessui/react";
import i18next from "i18next";
import {waitThreeSeconds} from "~utils/sse";

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
  const [generateEnable] = useAtom(generateEnableAtom)

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
  const [showNavSettings, setShowNavSettings] = useAtom(showNavSettingsAtom)
  const [tips, setTips] = useAtom(promptFlowTips);
  const [initNode, setInitNode] = useState("inputs");

  const navigate = useNavigate()

  const setFp = async () => {
    const fp = await FingerprintJS.load();

    const { visitorId } = await fp.get();
    setStore("fp", visitorId)
    setFpHash(visitorId)
  };

  const isBotShowSetting = useCallback(() => {
    if(props.botId == 'chatgpt' || props.botId == 'claude' || props.botId == 'bing'){
      return true
    }
    return false;
  }, [props])

  const importShareAgent = useCallback((shareValue: string) => {
    toast.promise(
      loadYaml(shareValue).then(promptYaml => {
        try {
          setRealYamlKey("Default_Flow_Dag_Yaml")

          importFromText(JSON.parse(promptYaml.yaml)).then(() => {
            setShowAssistant(false)
            setSeminarDisable(false)
            setWorkFlowingDisable(false)
            setChatMode(false)

            setGameModeEnable(false)
            setGameWindow(false)

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
    setGameFloatVisible(false)
    setIsPromptLibraryDialogOpen(false)

    setGameModeEnable(isGameWindow())
    setWorkFlowingDisable(isChatMode())

    /*set fingerprint */
    if (fpHash != "") {
      setStore("fp", fpHash)
    } else {
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
  }, [])


  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: props.resetConversation,
    }
  }, [props.resetConversation])

  const onSubmit = useCallback(
    async (input: string) => {
      setTips([])
      setAgentReset(false)

      const isGameMode = isGameWindow()
      const isWorkFlowingDisable = isChatMode()

      // if in editor, send message as the Agent.
      if (getEditorStatus()){
        setChatMode(false)
        setWorkFlowingDisable(false)
        if (!isEditorGenerateEnable()) {
          setShowEditor(false)
          setEditorStatus(false)
        }
      }

      /*Game Mode*/if (isGameMode){
        setPendingMessage(input)
        if (getRealYaml() == undefined){
          setRealYaml(getGameVilleYaml())
        }
        promptflowSubmit(input as string, props)
      }/*Chat Mode*/else{
        if (isWorkFlowingDisable){
          props.onUserSendMessage(input as string, props.botId)
        }else{
          promptflowSubmit(input as string, props)
        }
      }
    },
    [props],
  )

  function handleGlobalVar(prompt: string){
    setTips([])

    prompt = prompt.replace("{game_npc_event}", isGameWindow() && window.player? window.player.perceiveChatEvent():"")
    prompt = prompt.replace("{game_player_perceived_event}", isGameWindow() && window.player? window.player.perceiveEvent():"")
    prompt = prompt.replace("{game_player_perceived_space}", isGameWindow() && window.player? window.player.perceiveSpace():"")
    prompt = prompt.replace("{lang}", i18next.language)
    prompt = prompt.replace("{now_time}", new Date().toLocaleString())
    return prompt
  }


  async function nodeRequest(node: PromptFlowNode, prompt: string): Promise<string> {
    setStore("flow_edge", initNode + "-" + node.name)
    setStore("flow_node", node.name)

    if (isHookedResponse("reset")){
      throw new Error("stoped the promptflowx.")
    }
    setPromptFlowNode(node)

    if (node.type == "url" && node.source.code){
      await toast.promise(
        loadUrl(prompt).then(document => {
          if (document != ""){
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
    }else if (node.type == "doc" && node.source.code){
      await toast.promise(
        loadDoc(prompt).then(document => {
          if (document != ""){
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
    }else{
      // handle perceive...
      prompt = handleGlobalVar(prompt)

      console.log("request prompt: " + prompt)
      await props.onUserSendMessage(prompt, props.botId)
      console.log("response: " + getResponseStream())

      await waitThreeSeconds()
    }
    return getResponseStream()

  }

  async function nodeCallback(node: PromptFlowNode) {
    console.log('=> node handled:', node);

    setStore("flow_edge", initNode + "-" + node.name)
    setStore("flow_node", node.name)
    setInitNode(node.name)

    if (getEditorStatus() && isEditorGenerateEnable()){
      setEditorGenerateContent(node.output)
    }
  }

  async function promptflowSubmit(input: string, props: Props){
    let yaml = getRealYaml()
    if (getEditorStatus() && isEditorGenerateEnable()){
      if (getEditorGenerate() == "Prompt"){
        yaml = getPromptLib()["Action_YAML_Generate_Prompt"]
      }
      yaml = getPromptLib()["Action_YAML_Generate_Yaml"]
    }
    console.log(yaml)
    const promptLibs = getStore("prompts")
    try {
      setInitNode("inputs")
      setStore("flow_node", initNode)
      await promptflowx.execute(yaml, promptLibs, nodeRequest, nodeCallback, input);
    }catch (e){
      toast.error(e + "")
    }
    setPromptFlowNode(undefined)
    setStore("flow_edge", initNode + "-" + "outputs")
    setStore("flow_node", "outputs")
  }

  async function handleHookedMessage() {
    const inputMessage = isHookedResponse("message")
    if (inputMessage) {
      await onSubmit(inputMessage as string)
    }
  }

  async function updateEditorContent() {
    console.trace("updateEditorContent")
    if (getEditorGenerate() == "Yaml"){

      setRealYaml(getEditorGenerateContent())
      setEditorGenerateContent("")

      setEditorYamlTimes(editorYamlTimes + 1)
    }else if (getEditorGenerate() == "Prompt"){
      setEditorPromptTimes(editorPromptTimes + 1)
    }
  }

  const propsMessageCheck = useCallback((sendProp: Props) => {
    const isGameMode = isGameWindow()
    if (getBotId() != sendProp.botId){
      setBotId(sendProp.botId)
      Browser.storage.sync.set({botId: sendProp.botId})
      console.log("set botId: " + sendProp.botId)
      setShowNavSettings(isBotShowSetting())
    }

    /* Game mode, embedding llm response.*/
    if (isGameMode && isEmbeddingEnable){
      if (props.generating != getStore("chat_generating", false)) {
        if (!props.generating) {
          embeddingMessage(props.messages)
        }
        setStore("chat_generating", props.generating)
      }
    }

    /* handle result.*/
    if (isHookedResponse("html")){
      Browser.storage.sync.set({task_html: getStore("task_html", "")})
      openHtmlDialog()
    }else if (isHookedResponse("generate")){
      toast.success(t('Successfully generated!'), {
        position: "top-center"
      })

      updateEditorContent()

      finishEditorGenerate()
      setShowEditor(true)
      setEditorStatus(true)

      // generate yaml & reset conversion, protect against context
      resetConversation()
      // alert("Generate Success, You can continue editing in the editor.")
    }/*else if (isHookedResponse("history")){
      toast.success(t('clear the history!'), {
        position: "top-center"
      })
      props.resetConversation()
    }*/else if (getEditorStatus() && isEditorGenerateEnable() && getEditorGenerateContent() != ""){ // stream...
      if (new Date().getTime() - getEditorGenerateTime() > 2000) {  // update for Yaml, 2s update
        updateEditorContent()
        setEditorGenerateTime(new Date().getTime())
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
    handleHookedMessage()
    return true;
  }, [props])

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

    const newState = !isGameWindow()
    setGameModeEnable(newState)
    setGameWindow(newState)
    if (newState){
      setChatMode(false)
      setWorkFlowingDisable(false)
    }
  }

  const setAgentSwitch = useCallback(async () => {
    const isGameMode = isGameWindow()
    /* Game Mode should keep enable*/
    if (isGameMode){
      toast.error(t("Game Window only support Agent Mode."))
      return
    }

    finishEditorGenerate()
    setGameFloatVisible(false)

    // if (!window.confirm((workFlowingDisable?
    //   t('Confirm whether to start your Agent?'):
    //   t('Confirm whether to exit the Agent?')) as string)) {
    //   return
    // }
    trackEvent('open_prompt_flow_collapsed')

    const newState = !isChatMode()
    setChatMode(newState)
    setWorkFlowingDisable(newState)
    if (newState){
      resetConversation()
    }

    setAgentReset(true)
    props.resetConversation()

    setStore("flow_node", "")
    setStore("flow_edge", "")
    setResponseType("");
  }, [props])

  async function createNewAgentInGame(agentName: string) {
    setRealYamlKey(agentName)
    // duplicate agent name not save.
    if (getPromptValue(agentName) == undefined) {
      await saveLocalPrompt({
        id: uuid(),
        title: agentName,
        prompt: "#TODO: defined your Agent structure for:" + getPlayerMark() + "\n" + getGameVilleYaml(),
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
    setGameWindow(false)
  }

  const openFlowEditor = useCallback(async () => {
    setGameFloatVisible(false)

    const isGameMode = isGameWindow()
    const player_mark = getPlayerMark()
    const yamlMark = getPromptValue(player_mark)

    if ((isGameMode && yamlMark) || !isGameMode) {

      if (isGameMode && getRealYaml() == undefined) {
        setRealYaml("#TODO: defined your Agent structure for:" + getPlayerMark() + "\n" + getGameVilleYaml())
      }

      setEditorPrompt("Action_Prompt_Template");

      setEditorPromptTimes(editorPromptTimes + 1)
      setShowEditor(true)
      setEditorStatus(true)

      const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
      setEditorYamlTimes(editorYamlTimes)
      setStore("editorYamlTimes", editorYamlTimes)

      setShowAssistant(false)

      // setGameModeEnable(false)
      // setGameWindow(false)
      toast.success('You are editing ' + getRealYamlKey(), {
        position: "bottom-right"
      })
    } else {
      await createNewAgentInGame(player_mark)
      // toastCustom(t('Here is undefined, Create a new Agent for ' + player_mark), ()=> createNewAgentInGame(player_mark), "Create")
    }
    trackEvent('open_editor_prompt_flow')
  }, [])

  const closeFlowEditor = useCallback(() => {
    setShowEditor(false)
    setEditorStatus(false)
    trackEvent('close_editor_prompt_flow')

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

  const openYourAgent = useCallback(() => {
    finishEditorGenerate()
    setStore("prompt_edit", "")
    setIsPromptLibraryDialogOpen(true)
    setGameFloatVisible(false)
    trackEvent('open_prompt_library')
  }, [])

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
              <SwitchBotDropdown selectedBotId={props.botId} onChange={props.onSwitchBot} type={"extension"}/>
            )}
          </div>
          {!showEditor && <div className="flex flex-row items-center gap-2 shrink-0 cursor-pointer group">
           <div className="flex flex-row items-center gap-2">
              <img src={gameIcon} className="w-5 h-5 cursor-pointer"/>

              <Tooltip content={cx(isGameMode ? t('Chat Window') : t('Game Window'))}>
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
          </div>}

          {showEditor && <div className="pl-3 pr-3 rounded-[10px] bg-secondary flex flex-row items-center">
            <Tooltip content={"Agent Name"}>
              <span className="font-semibold text-primary-text text-sm cursor-default ml-2 mr-1">{getRealYamlKey()}</span>
            </Tooltip>
            <img src={!showEditor?editIcon:closeIcon} className="w-4 h-4 object-contain rounded-full" onClick={!showEditor?openFlowEditor:closeFlowEditor} />
          </div>}

          <div className="flex flex-row items-center gap-3">
            <Tooltip content={t('Clear conversation')}>
              <img src={clearIcon} className="w-5 h-5 cursor-pointer" onClick={resetConversation} />
            </Tooltip>
            <Tooltip content={t('View history')}>
              <img src={historyIcon} className="w-5 h-5 cursor-pointer" onClick={openHistoryDialog} />
            </Tooltip>
              <Menu as="div" className="relative inline-block text-left h-5">
                <Menu.Button>
                  <img src={workFlowingDisable?flowIcon:flowBlueIcon} className="w-5 h-5 cursor-pointer" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                <Menu.Items className="absolute right-0 z-10 mt-2 rounded-md bg-secondary shadow-lg focus:outline-none">
                  <Menu.Item >
                    <div
                      className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                      onClick={newAgentButton}
                    >
                      <div className="w-4 h-4">
                        <img src={addIcon} className="w-4 h-4 cursor-pointer"  />
                      </div>
                      <p className="text-sm whitespace-nowrap">{t('New Agent')}</p>
                    </div>
                  </Menu.Item>
                  <Menu.Item >
                    <div
                      className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                      onClick={!showEditor?openFlowEditor:closeFlowEditor}
                    >
                      <div className="w-4 h-4">
                        <img src={!showEditor?editIcon:closeIcon} className="w-4 h-4 cursor-pointer" />
                      </div>
                      <p className="text-sm whitespace-nowrap">{cx(showEditor ? t('Exit') : (t('Edit') + " " + t('Agent')))}</p>
                    </div>
                  </Menu.Item>
                  <Menu.Item >
                    <div
                      className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                      onClick={openYourAgent}
                    >
                      <div className="w-4 h-4">
                        <img src={libraryIcon} className="w-4 h-4 cursor-pointer"  />
                      </div>
                      <p className="text-sm whitespace-nowrap">{t('Your Agent')}</p>
                    </div>
                  </Menu.Item>
                  <Menu.Item >
                    <div
                      className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                      onClick={openAssistant}
                    >
                      <div className="w-4 h-4">
                        <img src={assistantIcon} className="w-4 h-4 cursor-pointer"  />
                      </div>
                      <p className="text-sm whitespace-nowrap">{t('Agent Community')}</p>
                    </div>
                  </Menu.Item>
                  <Menu.Item >
                    <div
                      className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                      onClick={openDataSets}
                    >
                      <div className="w-4 h-4">
                        <img src={datasetsIcon} className="w-4 h-4 cursor-pointer"  />
                      </div>
                      <p className="text-sm whitespace-nowrap">{t('Knowledge')}</p>
                    </div>
                  </Menu.Item>
                  <Menu.Item >
                    <div
                      className="px-4 py-2 ui-active:bg-primary-blue ui-active:text-white ui-not-active:text-secondary-text cursor-pointer flex flex-row items-center gap-3 pr-8"
                      onClick={setAgentSwitch}
                    >
                      <p className="text-sm whitespace-nowrap">{workFlowingDisable? t('Switch to Agent Mode...'): t('Switch to Chat Mode...')}</p>
                    </div>
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        <LocalPrompts className={cx(showEditor?"":"hidden")}/>
        <div className={"hidden"} key={changeTime}>{propsMessageCheck(props)}</div>

        <div id={"chatdev-game-container"} className={cx("chatdev-game-container overflow-hidden h-full " + cx(showEditor ? "hidden" : ""))}>
          <ChatMessageList botId={props.botId} messages={props.messages}/>
          {isGameMode && <div id="loading">
            <div id="loading-wrapper">
              <img src={loadingImg} alt=""/>
              <span>{t('Ensure you are logged in to the LLM website to access all features, When using the default Webapp Mode, no tokens will be consumed.')}</span>
            </div>
          </div>}
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
