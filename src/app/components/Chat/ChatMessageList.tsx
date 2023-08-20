import { FC } from 'react'
import cx from 'classnames'
import ScrollToBottom from 'react-scroll-to-bottom'
import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import ChatMessageCard from './ChatMessageCard'
import './main.css'
import loadingImg from '~/assets/loading.png'

interface Props {
  botId: BotId
  messages: ChatMessageModel[]
  className?: string
}

const ChatMessageList: FC<Props> = (props) => {
    // console.error(props.messages)

  //   return (
  //   <ScrollToBottom className="overflow-auto h-full">
  //     <div className={cx('flex flex-col gap-3 h-full', props.className)}>
  //       {props.messages.map((message, index) => {
  //         return <ChatMessageCard key={message.id} message={message} className={index === 0 ? 'mt-5' : undefined} />
  //       })}
  //     </div>
  //   </ScrollToBottom>
  // )
    return (
        <div className="overflow-hidden h-full">
            <div id="loading">
                <ScrollToBottom className="overflow-auto h-full hidden">
                    <div className={cx('flex flex-col gap-3 h-full', props.className)}>
                        {props.messages.map((message, index) => {
                            return <ChatMessageCard key={message.id} message={message} className={index === 0 ? 'mt-5' : undefined} />
                        })}
                    </div>
                </ScrollToBottom>
                <div id="loading-wrapper">
                    <img src={loadingImg} alt="" />
                        <span>Loading...</span>
                </div>
            </div>
            <div className="game-container" id="game-container"></div>
        </div>
    )
}

export default ChatMessageList
