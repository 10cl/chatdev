import cx from 'classnames'
import {FC, Suspense, useCallback, useMemo, useState} from 'react'
import { useTranslation } from 'react-i18next'
import clearIcon from '~/assets/icons/clear.svg'
import historyIcon from '~/assets/icons/history.svg'
import libraryIcon from '~/assets/icons/library.svg'
import editIcon from '~/assets/icons/edit.svg'
import shareIcon from '~/assets/icons/share.svg'
import assistantIcon from '~/assets/icons/assistant.svg'
import { CHATBOTS } from '~app/consts'
import { ConversationContext, ConversationContextValue } from '~app/context'
import { trackEvent } from '~app/plausible'
import { ChatMessageModel } from '~types'
import { BotId, BotInstance } from '../../bots'
import Button from '../Button'
import HistoryDialog from '../History/Dialog'
import ShareDialog from '../Share/Dialog'
import SwitchBotDropdown from '../SwitchBotDropdown'
import Tooltip from '../Tooltip'
import ChatMessageInput from './ChatMessageInput'
import ChatMessageList from './ChatMessageList'
import LocalPrompts from './LocalPrompts'
import store from 'store2'
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";
import React, { useEffect  } from 'react';
import GameButton from '../GameButtom';
import {useAtom, useAtomValue} from "jotai/index";
import {
  chatInList, floatTipsOpen,
  followArcThemeAtom, promptEdit,
  promptLibraryDialogOpen,
  showEditorAtom,
  sidebarRightCollapsedAtom
} from "~app/state";
import {BeatLoader} from "react-spinners";
import {loadLocalPrompts, Prompt, saveLocalPrompt} from "~services/prompts";
import {Input} from "~app/components/Input";
import AceEditor from "react-ace";
import useSWR from "swr";

import "ace-builds/src-noconflict/theme-github";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import {toBase64} from "js-base64";
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
  const [showHistory, setShowHistory] = useState(false)

  const [showEditor, setShowEditor] = useAtom(showEditorAtom)

  const [showShareDialog, setShowShareDialog] = useState(false)

  function setTimer(props: Props){
    console.log("id:" + props.botId)
    setTimeout(function (){
      updateSendMessage(props)
    }, 5000)
    return true;
  }

  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: props.resetConversation,
    }
  }, [props.resetConversation])

  const onSubmit = useCallback(
    async (input: string) => {
      let isGameMode = store.get("gameModeEnable")
      if (isGameMode == null){
        isGameMode = true
      }

      let isWorkFlowingDisable = store.get("workFlowingDisable")
      if (isWorkFlowingDisable == null){
        isWorkFlowingDisable = false
      }

      console.error("isGameMode: " + isGameMode + ", props: " + props.botId)
      setShowEditor(false)
      /*Game Mode*/if (isGameMode || !isWorkFlowingDisable){
        store.set("input_text_pending", input)
        store.set("start_page", props.botId)

        setTimeout(function (){
          updateSendMessage(props)
        }, 500)
      }/*Chat Mode*/else{
        props.onUserSendMessage(input as string, props.botId)
      }
    },
    [props],
  )

  function updateSendMessage(sendProp: Props) {
    const botId = sendProp.botId
    const value = store.get("input_text") ? store.get("input_text") : ""
    if (value != "") {
      console.log("timer sendMessage " + botId)

      sendProp.onUserSendMessage(value, botId)
      store.set("input_text", "")
    }

    if (isPromptLibraryDialogOpen){
      setGameFloatVisible(false)
    }

    //  game update
    if(store.get("workFlowingDisable") != null){
      setWorkFlowingDisable(store.get("workFlowingDisable"))
    }

    if (store.get("task_refresh") == true){
      setShowWebPreviewDialog(true)
      trackEvent('open_web_preview', { botId: botId })
      store.set("task_refresh", false)
    }
  }

  const resetConversation = useCallback(() => {
    if (!props.generating) {
      props.resetConversation()
    }
  }, [props])

  const openHistoryDialog = useCallback(() => {
    setShowHistory(true)
    trackEvent('open_history_dialog', { botId: props.botId })
  }, [props.botId])

  const openShareDialog = useCallback(() => {
    setShowShareDialog(true)
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

  const [visible, setVisible] = useAtom(floatTipsOpen);
  const [gameContent, setGameContent] = useState("");
  const [defaultPosition, setDefaultPosition] = useState({
    x: 32,
    y: 32
  })
  useEffect(() => {
    setVisible(false)
    const ele = document.getElementById('game-container') as HTMLElement;
    // ele.addEventListener('mouseenter', show)
    ele.addEventListener('mousemove', mouseMove)
    // ele.addEventListener('mouseleave', hide)
    return () => {
      // ele.removeEventListener('mouseenter', show)
      ele.removeEventListener('mousemove', mouseMove)
      // ele.removeEventListener('mouseleave', hide)
    }
  }, [])

  const show = () => {
    setVisible(true)
  }

  const hide = () => {
    setVisible(false)
  }
  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useAtom(promptLibraryDialogOpen)
  const [promptEditValue, setPromptEdit] = useAtom(promptEdit)

  const mouseMove = (e: MouseEvent) => {
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
      const prompts = store.get("prompts")
      const pointerover = store.get("pointerover")
      const pointerover_pos = store.get("pointerover_pos")
      if (prompts !== undefined){
        if (pointerover){
          const promptKey = "Profile_" + store.get("pointerover_name")
          setPromptEdit(promptKey)
          setGameContent(prompts[promptKey])

        }else if (pointerover_pos){
          const promptKey  = 'Position_' + toBase64(store.get("pointerover_pos_name"))
          setPromptEdit(promptKey)
          setGameContent(prompts[promptKey] != undefined ?prompts[promptKey]: store.get("pointerover_pos_name"))
        }
        setVisible(pointerover || pointerover_pos)
        setDefaultPosition({ x, y });
      }
    }
  }

  function setCollapsedAndUpdate() {
    trackEvent('switch_map_and_chat')
    setShowEditor(false)
    setCollapsed((c) => !c)
  }

  const openAssistant = useCallback(() => {
    setGameFloatVisible(false)

    setShowAssistant(true)
    // setShowEditor(false)
    trackEvent('open_assistant')
  },[])
  const [collapsed, setCollapsed] = useAtom(chatInList)
  const closeAssistant = useCallback(() => {
    setShowAssistant(false)
    trackEvent('close_assistant')
  },[])
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
            {setTimer(props) && props.messages.length > 0 && !props.messages[props.messages.length-1].text && !props.messages[props.messages.length-1].error && <BeatLoader size={10} className="leading-tight" color="rgb(var(--primary-text))" />}
            {props.messages.length > 0 && props.messages[props.messages.length-1].error && <span className="text-red-500">{getLastMessage()}</span>}
            {mode === 'compact' && props.onSwitchBot && (
              <SwitchBotDropdown selectedBotId={props.botId} onChange={props.onSwitchBot} />
            )}
          </div>
          <div className="flex flex-row items-center gap-2 shrink-0 cursor-pointer group">
            <div className="flex flex-row items-center gap-2">
              <button
                  className={cx("bg-secondary relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out", collapsed ? '' : 'button-rotate-180')}
                  id="headlessui-switch-:rd:" role="switch" type="button"  aria-checked="false"
                  onClick={() => setCollapsedAndUpdate()}
                  data-headlessui-state="" aria-labelledby="headlessui-label-:re:">
                <span className={cx('translate-x-0 pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')}></span>
              </button>
              <label className="text-[13px] whitespace-nowrap text-light-text font-medium select-none"
                     id="headlessui-label-:re:" htmlFor="headlessui-switch-:rd:">{cx(collapsed ? t('Chat Mode') : t('Game Mode'))}</label>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3">
            <Tooltip content={t('Share Prompt Library')}>
              <img src={shareIcon} className="w-5 h-5 cursor-pointer" onClick={openShareDialog} />
            </Tooltip>
            <Tooltip content={t('Clear conversation')}>
              <img src={clearIcon} className="w-5 h-5 cursor-pointer" onClick={resetConversation} />
            </Tooltip>
            <Tooltip content={t('View history')}>
              <img src={historyIcon} className="w-5 h-5 cursor-pointer" onClick={openHistoryDialog} />
            </Tooltip>
            <Tooltip content={t('Open Prompt Library')}>
              <img src={libraryIcon} className="w-5 h-5 cursor-pointer" onClick={openPromptLibrary} />
            </Tooltip>
            <Tooltip content={cx(t('GPTs'))}>
              <img src={assistantIcon} className="w-5 h-5 cursor-pointer" onClick={openAssistant} />
            </Tooltip>
          </div>
        </div>

        <LocalPrompts className={cx(showEditor?"":"hidden")} setShowEditor={setShowEditor}/>

        <div className={cx("overflow-hidden h-full " + cx(showEditor ? "hidden" : ""))}>
          {inputText && setTimer(props)}
          <ChatMessageList botId={props.botId} messages={props.messages}/>
          <div id="loading">
            <div id="loading-wrapper">
              <img src={loadingImg} alt=""/>
              <span>Loading...</span>
            </div>
          </div>
          <div id="game-container" className={cx("game-container", isGameMode ? "" : "hidden")}></div>
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
            visible={visible}
            content={gameContent}
            defaultPosition={defaultPosition}
        />
      </div>
      {showHistory && <HistoryDialog botId={props.botId} open={true} onClose={() => setShowHistory(false)} />}
      {showShareDialog && (
        <ShareDialog open={true} onClose={() => setShowShareDialog(false)} messages={props.messages} />
      )}
      {showAssistant && (
          <PromptLabDialog open={true} onClose={() => setShowAssistant(false)} messages={props.messages} />
      )}
    </ConversationContext.Provider>
  )
}

export default ConversationPanel
