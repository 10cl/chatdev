import cx from 'classnames'
import {FC, Suspense, useCallback, useMemo, useState} from 'react'
import { useTranslation } from 'react-i18next'
import clearIcon from '~/assets/icons/clear.svg'
import historyIcon from '~/assets/icons/history.svg'
import editIcon from '~/assets/icons/edit.svg'
import shareIcon from '~/assets/icons/share.svg'
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
import {useAtom} from "jotai/index";
import {chatInList, sidebarRightCollapsedAtom} from "~app/state";
import {BeatLoader} from "react-spinners";
import {loadLocalPrompts, Prompt, saveLocalPrompt} from "~services/prompts";
import {Input} from "~app/components/Input";
import AceEditor from "react-ace";
import useSWR from "swr";

import "ace-builds/src-noconflict/theme-github";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
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
  const [showEditor, setShowEditor] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: props.resetConversation,
    }
  }, [props.resetConversation])

  const onSubmit = useCallback(
    async (input: string) => {
      setShowEditor(false)
      // chatDev begin
      // props.onUserSendMessage(input as string, props.botId)
      store.set("input_text_pending", input)
      store.set("start_page", props.botId)
      // chatDev end
    },
    [props],
  )

  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);

  const [count, setCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const startTimer = () => {
    const id = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
      const value = store.get("input_text") ? store.get("input_text") : ""
      if (value != "") {
        props.onUserSendMessage(value, props.botId)
        store.set("input_text", "")
      }
    }, 1000);

    // @ts-ignore
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resetConversation = useCallback(() => {
    if (!props.generating) {
      props.resetConversation()
    }
  }, [props])

  const openHistoryDialog = useCallback(() => {
    setShowHistory(true)
    trackEvent('open_history_dialog', { botId: props.botId })
  }, [props.botId])

  const openFlowEditor = useCallback(() => {
    setShowEditor(!showEditor)
    trackEvent('open_edit', { botId: props.botId })
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

  const [visible, setVisible] = useState(false);
  const [defaultPosition, setDefaultPosition] = useState({
    x: 32,
    y: 32
  })
  useEffect(() => {
    const ele = document.getElementById('game-container') as HTMLElement;
    // ele.addEventListener('mouseenter', show)
    // ele.addEventListener('mousemove', mouseMove)
    // ele.addEventListener('mouseleave', hide)
    return () => {
      // ele.removeEventListener('mouseenter', show)
      // ele.removeEventListener('mousemove', mouseMove)
      // ele.removeEventListener('mouseleave', hide)
    }
  }, [])

  const show = () => {
    setVisible(true)
  }

  const hide = () => {
    setVisible(false)
  }

  const mouseMove = (e: MouseEvent) => {
    const x = getOffsetX(e) + 18;
    const y = getOffsetY(e) + 18;
    setDefaultPosition({ x, y });
  }

  function setCollapsedAndUpdate() {
    trackEvent('switch_map_and_chat')
    setShowEditor(false)
    setCollapsed((c) => !c)
  }

  const [collapsed, setCollapsed] = useAtom(chatInList)

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
              <button
                  className={cx("bg-secondary relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out", collapsed ? '' : 'button-rotate-180')}
                  id="headlessui-switch-:rd:" role="switch" type="button"  aria-checked="false"
                  onClick={() => setCollapsedAndUpdate()}
                  data-headlessui-state="" aria-labelledby="headlessui-label-:re:">
                <span className={cx('translate-x-0 pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')}></span>
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3">
            <Tooltip content={t('Edit')}>
              <img src={editIcon} className="w-5 h-5 cursor-pointer" onClick={openFlowEditor} />
            </Tooltip>
            <Tooltip content={t('View history')}>
              <img src={historyIcon} className="w-5 h-5 cursor-pointer" onClick={openHistoryDialog} />
            </Tooltip>
          </div>
        </div>

        <LocalPrompts className={cx(showEditor?"":"hidden")} setShowEditor={setShowEditor}/>

        <ChatMessageList botId={props.botId} messages={props.messages} className={cx(showEditor?"hidden":"")} />

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
            content="Mouse follow"
            defaultPosition={defaultPosition}
        />
      </div>
      {showHistory && <HistoryDialog botId={props.botId} open={true} onClose={() => setShowHistory(false)} />}
      {showShareDialog && (
        <ShareDialog open={true} onClose={() => setShowShareDialog(false)} messages={props.messages} />
      )}
    </ConversationContext.Provider>
  )
}

export default ConversationPanel
