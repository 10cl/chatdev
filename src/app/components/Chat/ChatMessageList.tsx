import {FC} from 'react'
import cx from 'classnames'
import ScrollToBottom from 'react-scroll-to-bottom'
import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import ChatMessageCard from './ChatMessageCard'
import './main.css'
import {useAtom} from "jotai/index";
import {gameModeEnable} from "~app/state";
import React from "react";
import AgentCommunity from "~app/components/Agent/AgentCommunity";

interface Props {
  botId: BotId
  messages: ChatMessageModel[]
  className?: string
}

const ChatMessageList: FC<Props> = (props) => {
    // console.error(props.messages)
    const [isGameMode] = useAtom(gameModeEnable)

    return (
        <ScrollToBottom className={cx('overflow-auto h-full', isGameMode?"hidden":"")}>
            <div className={cx('flex flex-col gap-3 h-full mx-5')}>
                {props.messages.length > 0 && props.messages.map((message, index) => {
                    return <ChatMessageCard key={message.id} message={message} className={index === 0 ? 'mt-5' : undefined} />
                })}
                {props.messages.length <= 0 && <AgentCommunity />}
            </div>
        </ScrollToBottom>
    )
}

export default ChatMessageList
