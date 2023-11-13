import {FC} from 'react'
import cx from 'classnames'
import ScrollToBottom from 'react-scroll-to-bottom'
import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import ChatMessageCard from './ChatMessageCard'
import './main.css'
import loadingImg from '~/assets/loading.png'
import {useAtom} from "jotai/index";
import {chatInList} from "~app/state";
import React from "react";
import PromptLab from "~app/components/PromptLibrary/PromptLab";

interface Props {
  botId: BotId
  messages: ChatMessageModel[]
  className?: string
}

const ChatMessageList: FC<Props> = (props) => {
    // console.error(props.messages)
    const [collapsed, setCollapsed] = useAtom(chatInList)

    return (
        <div className={cx("overflow-hidden h-full", props.className)}>
        <ScrollToBottom className={cx('overflow-auto h-full', isGameMode?"hidden":"")}>
            <div className={cx('flex flex-col gap-3 h-full mx-5')}>
                {props.messages.length > 0 && props.messages.map((message, index) => {
                    return <ChatMessageCard key={message.id} message={message} className={index === 0 ? 'mt-5' : undefined} />
                })}
                {props.messages.length <= 0 && <PromptLab />}
            </div>
        </ScrollToBottom>

            <div id="loading">
                <div id="loading-wrapper">
                    <img src={loadingImg} alt="" />
                        <span>Loading...</span>
                </div>
            </div>
            <div id="game-container" className={cx("game-container", collapsed?"":"hidden")}></div>
        </div>
    )
}

export default ChatMessageList
