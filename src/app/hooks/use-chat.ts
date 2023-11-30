import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { trackEvent } from '~app/plausible'
import { chatFamily } from '~app/state'
import { setConversationMessages } from '~services/chat-history'
import { ChatMessageModel } from '~types'
import { uuid } from '~utils'
import { ChatError } from '~utils/errors'
import { BotId } from '../bots'
import store from "store2"
import {getStore, setStore} from "~services/prompts";

export function useChat(botId: BotId) {
  const chatAtom = useMemo(() => chatFamily({ botId, page: 'singleton' }), [botId])
  const [chatState, setChatState] = useAtom(chatAtom)

  const updateMessage = useCallback(
    (messageId: string, updater: (message: ChatMessageModel) => void) => {
      setChatState((draft) => {
        const message = draft.messages.find((m) => m.id === messageId)
        if (message) {
          updater(message)
        }
      })
    },
    [setChatState],
  )

  const sendMessage = useCallback(
    async (input: string) => {
      trackEvent('send_message', { botId })
      const botMessageId = uuid()

        function getValidMark() {
            const isGameMode = getStore("gameModeEnable", true)
            if (!isGameMode) {
                return ""
            }
            return getStore("player_mark", "");
        }
      setChatState((draft) => {
        draft.messages.push({ id: uuid(), text: input, author: 'user', mark: getValidMark() }, { id: botMessageId, text: '', author: botId, mark: getValidMark()})
      })
      const abortController = new AbortController()
      setChatState((draft) => {
        draft.generatingMessageId = botMessageId
        draft.abortController = abortController
      })

      const resp = await chatState.bot.sendMessage({
          prompt: input,
          signal: abortController.signal,
      })

        try {
            setStore("input_text_message", "")
            for await (const answer of resp) {
                updateMessage(botMessageId, (message) => {
                    message.text = answer.text
                    setStore("response_update_text", message.text)
                })
            }
            setStore("input_text_message", "")
        } catch (err: unknown) {
            if (!abortController.signal.aborted) {
                abortController.abort()
            }
            const error = err as ChatError
            console.error('sendMessage error', error.code, error)
            updateMessage(botMessageId, (message) => {
                message.error = error
            })
            setChatState((draft) => {
                draft.abortController = undefined
                draft.generatingMessageId = ''
            })
        }

        setChatState((draft) => {
            draft.abortController = undefined
            draft.generatingMessageId = ''
        })
    },
      [botId, chatState.bot, setChatState, updateMessage],
  )

    const resetConversation = useCallback(() => {
    chatState.bot.resetConversation()
    setChatState((draft) => {
      draft.abortController = undefined
      draft.generatingMessageId = ''
      draft.messages = []
      draft.conversationId = uuid()
    })
  }, [chatState.bot, setChatState])

  const stopGenerating = useCallback(() => {
    chatState.abortController?.abort()
    if (chatState.generatingMessageId) {
      updateMessage(chatState.generatingMessageId, (message) => {
        if (!message.text && !message.error) {
          message.text = 'Cancelled'
        }
      })
    }
    setChatState((draft) => {
      draft.generatingMessageId = ''
    })
  }, [chatState.abortController, chatState.generatingMessageId, setChatState, updateMessage])

  useEffect(() => {
    if (chatState.messages.length) {
      setConversationMessages(botId, chatState.conversationId, chatState.messages)
    }
  }, [botId, chatState.conversationId, chatState.messages])

  const chat = useMemo(
    () => ({
      botId,
      bot: chatState.bot,
      messages: chatState.messages,
      sendMessage,
      resetConversation,
      generating: !!chatState.generatingMessageId,
      stopGenerating,
    }),
    [
      botId,
      chatState.bot,
      chatState.generatingMessageId,
      chatState.messages,
      resetConversation,
      sendMessage,
      stopGenerating,
    ],
  )

  return chat
}
