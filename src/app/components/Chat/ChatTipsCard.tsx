import cx from 'classnames'
import React, {FC, memo, useState} from 'react'
import Markdown from '../Markdown'
import MessageBubble from './MessageBubble'
import Button, {Props as ButtonProps} from "~app/components/Button";
import {useTranslation} from "react-i18next";
import {
  getStore,
  getRealYaml,
  setRealYaml,
  setRealYamlKey,
  setStore, getRealYamlKey, setPendingMessage, setHookedMessage
} from "~services/storage/memory-store";import {useAtom} from "jotai/index";
import {floatTipsOpen, messageTimesTimesAtom, promptFlowDesc, promptFlowTips} from "~app/state";
import {BotId} from "~app/bots";
import {ChatMessageModel} from "~types";
import ChatMessageList from "~app/components/Chat/ChatMessageList";

interface Props {
  botId: BotId
  messages: ChatMessageModel[]
  className?: string
}

const ChatTipsCard: FC<Props> = (props) => {
  const [isLoading, setLoading] = useState(false)
  const [isAction, setAction] = useState("")
  const { t } = useTranslation()
  const [desc, setDesc] = useAtom(promptFlowDesc);
  const [tips, setTips] = useAtom(promptFlowTips);

  const ActionButton: FC<ButtonProps> = (props) => {
    return <Button {...props} size="small" className="drop-shadow-lg" color="primary" />
  }

  function tipClick(value: string) {
    setHookedMessage(value)
  }

  return (
    <div className={cx('group flex gap-3 w-full', 'flex-row')}>
      <div className="flex flex-col w-11/12  max-w-fit items-start gap-2 mt-5">
        <MessageBubble color={'flat'}>
          {<div><Markdown type={1}>{desc != ""? desc: getRealYamlKey()}</Markdown>
            {/*{tips && tips.length > 0 && tips.map((item: string, index: any) => {
              return <div><span key={index} className="agent-action"
                                onClick={() => tipClick(item)}>{index + 1}. {item}</span></div>
            })}*/}
          </div>}
        </MessageBubble>
        {isAction && (
            <a href="https://bing.com" target="_blank" rel="noreferrer">
              <ActionButton text={t('Login at bing.com')} />
            </a>
        )}
      </div>
    </div>
  )
}
export default ChatTipsCard
