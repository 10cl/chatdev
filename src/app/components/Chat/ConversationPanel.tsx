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
import closeIcon from '~/assets/icons/close.svg'
import assistantIcon from '~/assets/icons/assistant.svg'
import settingsIcon from '~/assets/icons/setting_top.svg'

import { CHATBOTS } from '~app/consts'
import { ConversationContext, ConversationContextValue } from '~app/context'
import { trackEvent } from '~app/plausible'
import { ChatMessageModel } from '~types'
import { BotId, BotInstance } from '../../bots'
import Button from '../Button'
import HistoryDialog from '../History/Dialog'
import PreViewFrameDialog from '../Share/PreViewFrameDialog'
import SwitchBotDropdown from '../SwitchBotDropdown'
import Tooltip from '../Tooltip'
import ChatMessageInput from './ChatMessageInput'
import ChatMessageList from './ChatMessageList'
import LocalPrompts from './LocalPrompts'
import store from 'store2'
import React, { useEffect  } from 'react';
import GameButton from '../GameButtom';
import {useAtom, useAtomValue} from "jotai/index";
import {
  gameModeEnable,
  editorPromptTimesAtom,
  floatTipsOpen,
  promptLibraryDialogOpen,
  showEditorAtom,
  workFlowingDisableAtom,
  showHistoryAtom,
  showSettingsAtom,
  showGptsDialogAtom,
  messageTimesTimesAtom,
  editorYamlTimesAtom,
  editorYamlAtom,
  editorPromptAtom,
  showShareAtom,
  fpHashAtom, seminarDisableAtom,
} from "~app/state";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import "ace-builds/src-noconflict/theme-github";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import {toBase64} from "js-base64";
import PromptLabDialog from "~app/components/Chat/PromptLabDialog";
import loadingImg from "~assets/loading.png";
import {GoBook} from "react-icons/go";
import SettingsDialog from "~app/components/Settings/SettingsDialog";
import useSWR from "swr";
import {BeatLoader} from "react-spinners";
import Markdown from "~app/components/Markdown";
import {getStore, loadRemoteUrl, loadYaml, setStore} from "~services/prompts";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";
import {UserConfig} from "~services/user-config";
import ShareGPTView from "~app/components/Share/ShareGPTView";
import ShareGPTDialog from "~app/components/Share/ShareGPTDialog";
import {useNavigate} from "@tanstack/react-router";
import {importFromText} from "~app/utils/export";
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

  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [showAssistant, setShowAssistant] = useAtom(showGptsDialogAtom)
  const [showSettings, setShowSettings] = useAtom(showSettingsAtom)
  const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)

  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)

  const [isPreviewShow, setShowWebPreviewDialog] = useState(false)
  const [shareViewShow, setShowShareView] = useAtom(showShareAtom)

  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useAtom(promptLibraryDialogOpen)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)

  const [changeTime, setChangeTime] = useAtom(messageTimesTimesAtom)
  const [timerId, setTimerId] = useState<number | null>(null);

  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)
  const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)
  const [userConfig, setUserConfig] = useState<UserConfig | undefined>(undefined)
  const [isUrlReq, setUrlReq] = useState(false)
  const [fpHash, setFpHash] = useAtom(fpHashAtom);
  const navigate = useNavigate()

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

  function isURL(str: string) {
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    return urlPattern.test(str);
  }
  const confirmTips = t('Are you sure you want to import the GPTs?')
  const successTips = t('Imported GPTs successfully')

  const importToFlowYaml = useCallback(() => {
    setStore("real_yaml", getStore("editor_yaml", "Default_Flow_Dag_Yaml"))
    if (getStore("prompts")[getStore("real_yaml", "Default_Flow_Dag_Yaml")] == undefined) {
      getStore("prompts")[getStore("real_yaml", "Default_Flow_Dag_Yaml")] = getStore("prompts")["Action_YAML_Template"]
    }

    openFlowEditor()

    if (!window.confirm(confirmTips)) {
      return
    }

    loadYaml(getStore("share_current", "")).then(promptYaml => {
      try {
        closeFlowEditor()
        importFromText(JSON.parse(promptYaml.yaml)).then(() => {
          setShowAssistant(false)
          setSeminarDisable(false)
          setWorkFlowingDisable(false)
          alert(successTips)
          openFlowEditor()

          const botId = props.botId as BotId
          navigate({ to: '/chat/$botId', params: { botId } })
        })
      }catch (e) {
        alert(e)
      }
    })
  }, [props])

  useEffect(() => {
    console.log("init")
    // setShowEditor(false)
    // setShowAssistant(false)
    // setShowSettings(false)
    // setShowShareView(false)

    const setFp = async () => {
      const fp = await FingerprintJS.load();

      const { visitorId } = await fp.get();
      setStore("fp", visitorId)
      setFpHash(visitorId)
    };
    if (fpHash != ""){
      setStore("fp", fpHash)
    }else{
      setFp();
    }

    const regex = /(?:\?|&)share=([^&]+)/;
    const match = window.location.href.match(regex);
    if (match) {
      const shareValue = match[1];
      if(!getStore("share_" + shareValue)){
        setStore("share_" + shareValue, true)
        setStore("share_current", shareValue)
        importToFlowYaml()
      }
    }

    const id = setInterval(() => {
      const response_type = getStore("response_type", "")
      if (response_type == "url"){
        setStore("response_update_text", getStore("response_update_text", "") + ".")
      }

      const value = getStore("input_text", "")
      if (value != "") {
        console.log("input text null")
        const messageTimes = getStore("messageTimes", 0) + 1
        setChangeTime(messageTimes)
        setStore("messageTimes", messageTimes)
      }

    }, 1000)
    // @ts-ignore
    setTimerId(id);
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [props])


  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: props.resetConversation,
    }
  }, [props.resetConversation])

  const onSubmit = useCallback(
    async (input: string) => {
      // if in editor, send message as the GPTs.
      if (getStore("editor_show")){
        setShowEditor(false)
        setStore("editor_show", false)
        setGameModeEnable(false)
        setStore("gameModeEnable", false)
        setStore("workFlowingDisable", false)
        setWorkFlowingDisable(false)
      }

      const isGameMode = getStore("gameModeEnable", true)
      const isWorkFlowingDisable = getStore("workFlowingDisable", false)
      /*Game Mode*/if (isGameMode || !isWorkFlowingDisable){
        setStore("input_text_pending", input)
        updateConfigValue({ startupPage: props.botId })
        updateSendMessage(props)
      }/*Chat Mode*/else{
        props.onUserSendMessage(input as string, props.botId)
      }
    },
    [props],
  )

  async function updateSendMessage(sendProp: Props) {
    const botId = sendProp.botId
    const value = getStore("input_text", "")
    if (value != "") {
      console.log("timer sendMessage " + botId)
      setStore("input_text", "")
      if(isURL(value)){
        const url = value as string
        const urlObj = new URL(url);
        if (!(await requestHostPermission(urlObj.protocol + '//*.' + urlObj.hostname + "/"))) {
          alert("Please allow the host permission to use this feature.")
        }

        setStore("response_update_text", "⌛")
        setStore("response_type", "url")
        setUrlReq(true)
        loadRemoteUrl(url).then(html => {
            setStore("response_type", "")
            setStore("response_update_text", html)
            console.log("html:" + html)

            setTimeout(function (){
              setUrlReq(false)
              const messageTimes = getStore("messageTimes", 0) + 1
              setChangeTime(messageTimes)
              setStore("messageTimes", messageTimes)
            }, 3000)

            // sendProp.onUserSendMessage(html, botId)
        })
      }else{
        sendProp.onUserSendMessage(value, botId)
      }
    }

    if (isPromptLibraryDialogOpen){
      setGameFloatVisible(false)
    }

    //  game update
    setWorkFlowingDisable(getStore("workFlowingDisable", true))

    if (getStore("task_refresh", false)){
      store.set("task_html", getStore("task_html", ""))
      setShowWebPreviewDialog(true)
      trackEvent('open_web_preview', { botId: botId })
      setStore("task_refresh", false)
    }
  }

  const openHtmlDialog = useCallback(() => {
    setShowWebPreviewDialog(true)
    trackEvent('open_html_dialog')
  }, [])

  const resetConversation = useCallback(() => {
    if (!props.generating) {
      props.resetConversation()
    }
  }, [props])

  const openHistoryDialog = useCallback(() => {
    setStore("prompt_edit", "")
    setShowHistory(true)
    trackEvent('open_history_dialog', { botId: props.botId })
  }, [props.botId])

  const openShareDialog = useCallback(() => {
    setShowWebPreviewDialog(true)
    trackEvent('open_share_dialog', { botId: props.botId })
  }, [props.botId])

  const getOffsetX = (e: any) =>{
    const event = e || window.event;
    const srcObj = e.target || e.srcElement;
    if (event.offsetX){
      return event.offsetX;
    }else{
      const rect = srcObj.getBoundingClientRect();
      const clientx = event.clientX;
      return clientx - rect.left;
    }
  }


  const getOffsetY = (e: any) => {
    const event = e || window.event;
    const srcObj = e.target || e.srcElement;
    if (event.offsetY){
      return event.offsetY;
    }else{
      const rect = srcObj.getBoundingClientRect();
      const clientx = event.clientY;
      return clientx - rect.top;
    }
  }
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [gameFloatVisible, setGameFloatVisible] = useAtom(floatTipsOpen);
  const [gameContent, setGameContent] = useState("");
  const [defaultPosition, setDefaultPosition] = useState({
    x: 32,
    y: 32
  })
  useEffect(() => {
    setGameFloatVisible(false)
  }, [])

  const mouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    console.log("mouseMove")
    let offsetX = 0
    let offsetY = 0
    if (window.innerWidth - 500 < getOffsetX(e)){
      offsetX = -315
    }else{
      offsetX = 90
    }
    if (window.innerHeight - 350 < getOffsetY(e)){
      offsetY = 0
    }else{
      offsetY = 50
    }
    const x = getOffsetX(e) + offsetX;
    const y = getOffsetY(e) + offsetY;
    if (y < window.innerHeight - 250){
      const prompts = getStore("prompts", null)
      const pointerover = getStore("pointerover", false)
      const pointerover_pos = getStore("pointerover_pos", "")
      if (prompts !== null){
        if (pointerover){
          const promptKey = "Profile_" + getStore("pointerover_name", "")
          setStore("prompt_edit", promptKey)
          setGameContent(getStore("pointer_tips", ""))

        }else if (pointerover_pos){
          const promptKey  = 'Position_' + toBase64(getStore("pointerover_pos_name", ""))
          setStore("prompt_edit", promptKey)
          setGameContent(getStore("pointer_tips", "TODO"))
        }
        setGameFloatVisible(pointerover || pointerover_pos)
        setDefaultPosition({ x, y });
      }
    }
  }

  function setModeChange() {
    trackEvent('switch_map_and_chat')
    setShowEditor(false)
    setStore("editor_show", false)
    setGameFloatVisible(false)

    const newState = !getStore("gameModeEnable", false)
    setGameModeEnable(newState)
    setStore("gameModeEnable", newState)
    if (!newState){
     /* const prompts = getStore("prompts", {});
      if(prompts['Default_Flow_Dag_Yaml'] != undefined){
        prompts['Flow_Dag_Yaml'] = prompts['Default_Flow_Dag_Yaml']
        setStore("editor_yaml", "Default_Flow_Dag_Yaml")
        setStore("prompts", prompts);
      }*/
    }else{
      setStore("workFlowingDisable", false)
      setWorkFlowingDisable(false)
    }
  }

  function setWorkFlowingAndUpdate() {
    if (isGameMode){
      return
    }
    setGameFloatVisible(false)

    if (!window.confirm((workFlowingDisable?
        t('Confirm whether to start your GPTs?'):
        t('Confirm whether to exit the GPTs?')) as string)) {
      return
    }
    trackEvent('open_prompt_flow_collapsed')

    const newState = !getStore("workFlowingDisable", false)
    setStore("workFlowingDisable", newState)
    setWorkFlowingDisable(newState)

    setStore("flow_node", "")
    setStore("flow_edge", "")
    setStore("response_type", "");

  }

  const openFlowEditor = useCallback(() => {
    setGameFloatVisible(false)

    // setEditorPrompt("Flow_Dag_Yaml")
    setStore("real_yaml", getStore("editor_yaml", "Default_Flow_Dag_Yaml"))
    if (getStore("prompts")[getStore("real_yaml", "Default_Flow_Dag_Yaml")] == undefined) {
      getStore("prompts")[getStore("real_yaml", "Default_Flow_Dag_Yaml")] = getStore("prompts")["Action_YAML_Template"]
    }
    setEditorPrompt("Action_Prompt_Template");

    setEditorPromptTimes(editorPromptTimes + 1)
    setShowEditor(true)
    setStore("editor_show", true)

    const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
    setEditorYamlTimes(editorYamlTimes)
    setStore("editorYamlTimes", editorYamlTimes)

    setShowAssistant(false)
    trackEvent('open_editor_prompt_flow')
  },[])


  const closeFlowEditor = useCallback(() => {
    setShowEditor(false)
    setStore("editor_show", false)
    trackEvent('close_editor_prompt_flow')
  },[])


  const openAssistant = useCallback(async () => {
    if (!(await requestHostPermission('https://*.chatdev.toscl.com/'))) {
      throw new ChatError('Missing chatdev.toscl.com permission', ErrorCode.MISSING_HOST_PERMISSION)
    }
    setGameFloatVisible(false)

    setShowAssistant(true)
    // setShowEditor(false)
    trackEvent('open_assistant')
  },[])

  const openSettings = useCallback(() => {
    setShowSettings(true)
    trackEvent('open_settings')
  },[])

  const closeAssistant = useCallback(() => {
    setShowAssistant(false)
    trackEvent('close_assistant')
  },[])

  const openPromptLibrary = useCallback(() => {
    setStore("prompt_edit", "")
    setIsPromptLibraryDialogOpen(true)
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
            {(isUrlReq||
                (isGameMode
                    && props.messages.length > 0
                    && !props.messages[props.messages.length-1].text
                    && !props.messages[props.messages.length-1].error))
                && <BeatLoader size={10} className="leading-tight" color="rgb(var(--primary-text))" />}
            {isGameMode && props.messages.length > 0 && props.messages[props.messages.length-1].error && <span className="text-red-500">{getLastMessage()}</span>}
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

              {/*<label className="text-[13px] whitespace-nowrap text-light-text font-medium select-none"*/}
              {/*       id="headlessui-label-:re:" htmlFor="headlessui-switch-:rd:">{cx(isGameMode ? t('Chat Mode') : t('Game Mode'))}</label>*/}
            </div>
          </div>
          <div className="flex flex-row items-center gap-3">
            {/*<Tooltip content={t('Share Prompt Library')}>*/}
            {/*  <img src={shareIcon} className="w-5 h-5 cursor-pointer" onClick={openShareDialog} />*/}
            {/*</Tooltip>*/}
            {false && <Tooltip content={t('Open Web Preview')}>
              <img src={htmlIcon} className="w-5 h-5 cursor-pointer" onClick={openHtmlDialog} />
            </Tooltip>}
            <Tooltip content={t('Clear conversation')}>
              <img src={clearIcon} className="w-5 h-5 cursor-pointer" onClick={resetConversation} />
            </Tooltip>
            <Tooltip content={t('View history')}>
              <img src={historyIcon} className="w-5 h-5 cursor-pointer" onClick={openHistoryDialog} />
            </Tooltip>
            <Tooltip content={t('Open Prompt Library')}>
              <img src={libraryIcon} className="w-5 h-5 cursor-pointer" onClick={openPromptLibrary} />
            </Tooltip>
            <Tooltip content={cx(workFlowingDisable ? t('Start') : t('Stop')) + " " + t('GPTs')}>
              <button
                  className={cx("bg-secondary relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out", workFlowingDisable ? '' : 'button-rotate-180 ' + (isGameMode ? "":'flow-open'))}
                  id="headlessui-switch-:rd:" role="switch" type="button"  aria-checked="false"
                  onClick={() => setWorkFlowingAndUpdate()}
                  data-headlessui-state="" aria-labelledby="headlessui-label-:re:">
                <span className={cx('translate-x-0 pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')}></span>
              </button>
            </Tooltip>
            <Tooltip content={cx(showEditor ? t('Exit') : (t('Edit') + " " + t('GPTs')))}>
              <img src={!showEditor?editIcon:closeIcon} className="w-5 h-5 cursor-pointer" onClick={!showEditor?openFlowEditor:closeFlowEditor} />
            </Tooltip>
            <Tooltip content={cx(t('GPTs'))}>
              <img src={assistantIcon} className="w-5 h-5 cursor-pointer" onClick={openAssistant} />
            </Tooltip>
            <Tooltip content={cx(t('Settings'))}>
              <img src={settingsIcon} className="w-5 h-5 cursor-pointer" onClick={openSettings} />
            </Tooltip>
          </div>
        </div>

        <LocalPrompts className={cx(showEditor?"":"hidden")} setShowEditor={setShowEditor}/>
        <div className={"hidden"} key={changeTime}>{propsMessageCheck(props)}</div>

        <div className={cx("promptgame overflow-hidden h-full " + cx(showEditor ? "hidden" : ""))}>
          <ChatMessageList botId={props.botId} messages={props.messages}/>
          <div id="loading">
            <div id="loading-wrapper">
              <img src={loadingImg} alt=""/>
              <span>{t('Ensure you are logged in to the LLM website to access all features, When using the default Webapp Mode, no tokens will be consumed.')}</span>
            </div>
          </div>
          <div id="game-container" className={cx("game-container", isGameMode ? "" : "hidden")} onMouseMove={mouseMove}></div>
        </div>

        <div className={cx('mt-3 flex flex-col', marginClass, mode === 'full' ? 'mb-3' : 'mb-[5px]')}>
          <div className={cx('flex flex-row items-center gap-[5px]', mode === 'full' ? 'mb-3' : 'mb-0')}>
            {mode === 'compact' && <span className="font-medium text-xs text-light-text">Send to {botInfo.name}</span>}
            <hr className="grow border-primary-border" />
          </div>
          <ChatMessageInput
            mode={mode}
            disabled={props.generating}
            placeholder={mode === 'compact' ? '' : undefined}
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
                mode === 'full' && <Button text={t('Send')} color="primary" type="submit" />
              )
            }
          />
        </div>
      </div>
      <div id="mouse-position-demo" className="mouse-position-demo">
        <GameButton
            botId={props.botId}
            visible={gameFloatVisible}
            content={gameContent}
            defaultPosition={defaultPosition}
        />
      </div>
      {showHistory && <HistoryDialog botId={props.botId} open={true} onClose={() => setShowHistory(false)} />}
      {isPreviewShow && (
        <PreViewFrameDialog open={true} onClose={() => setShowWebPreviewDialog(false)} messages={props.messages} />
      )}
      {shareViewShow && (
          <ShareGPTDialog open={true} onClose={() => setShowShareView(false)} messages={props.messages} />
      )}
      {showAssistant && (
          <PromptLabDialog open={true} onClose={() => setShowAssistant(false)} messages={props.messages} />
      )}
      {showSettings && (
          <SettingsDialog open={true} onClose={() => setShowSettings(false)} />
      )}
    </ConversationContext.Provider>
  )
}

export default ConversationPanel
