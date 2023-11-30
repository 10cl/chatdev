import { FC, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'
import { chatGPTClient } from '~app/bots/chatgpt-webapp/client'
import { ConversationContext } from '~app/context'
import { ChatError, ErrorCode } from '~utils/errors'
import Button, { Props as ButtonProps } from '../Button'
import MessageBubble from './MessageBubble'
import store from "store2"
import {setStore} from "~services/prompts";
const ActionButton: FC<ButtonProps> = (props) => {
  return <Button {...props} size="small" className="drop-shadow-lg" color="primary" />
}

const ChatGPTAuthErrorAction = () => {
  const { t } = useTranslation()
  const [fixing, setFixing] = useState(false)
  const [fixed, setFixed] = useState(false)
  const isSidePanel = useMemo(() => location.href.includes('sidepanel.html'), [])

  const fixChatGPT = useCallback(async () => {
    setFixing(true)
    try {
      await chatGPTClient.fixAuthState()
    } catch (e) {
      console.error(e)
      return
    } finally {
      setFixing(false)
    }
    setFixed(true)
  }, [])

  if (fixed) {
    return <MessageBubble color="flat">Fixed, please retry chat</MessageBubble>
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <ActionButton text={t('Login to ChatGPT')} onClick={fixChatGPT} isLoading={fixing} />
      <span className="text-sm text-primary-text">OR</span>
      <a
        href={Browser.runtime.getURL('app.html#/setting')}
        target={isSidePanel ? '_blank' : undefined}
        rel="noreferrer"
      >
        <ActionButton text={t('Switch to API mode')} />
      </a>
    </div>
  )
}

const ErrorAction: FC<{ error: ChatError }> = ({ error }) => {
  const conversation = useContext(ConversationContext)
  const { t } = useTranslation()

  if (error.code === ErrorCode.BING_UNAUTHORIZED) {
    setStore("input_text_message", t('Login at bing.com'))

    return (
      <a href="https://bing.com" target="_blank" rel="noreferrer">
        <ActionButton text={t('Login at bing.com')} />
      </a>
    )
  }
  if (error.code === ErrorCode.POE_UNAUTHORIZED) {
    setStore("input_text_message", t('Login at poe.com'))

    return (
      <a href="https://poe.com" target="_blank" rel="noreferrer">
        <ActionButton text={t('Login at poe.com')} />
      </a>
    )
  }
  if (error.code === ErrorCode.XUNFEI_UNAUTHORIZED) {
    setStore("input_text_message", t('Login at xfyun.cn'))

    return (
      <a href="https://xinghuo.xfyun.cn" target="_blank" rel="noreferrer">
        <ActionButton text={t('Login at xfyun.cn')} />
      </a>
    )
  }
  if (error.code === ErrorCode.QIANWEN_WEB_UNAUTHORIZED) {
    return (
      <a href="https://qianwen.aliyun.com" target="_blank" rel="noreferrer">
        <ActionButton text={t('Login at qianwen.aliyun.com')} />
      </a>
    )
  }
  if (error.code === ErrorCode.GPT4_MODEL_WAITLIST) {
    setStore("input_text_message", t('Join the waitlist'))

    return (
      <a href="https://openai.com/waitlist/gpt-4-api" target="_blank" rel="noreferrer">
        <ActionButton text={t('Join the waitlist')} />
      </a>
    )
  }
  if (error.code === ErrorCode.CHATGPT_AUTH) {
    setStore("input_text_message", t('Login to ChatGPT'))

    return (
      <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
        <ActionButton text={t('Login to ChatGPT')} />
      </a>
    )
  }
  if (error.code === ErrorCode.CLAUDE_WEB_UNAUTHORIZED) {
    return (
      <a href="https://claude.ai" target="_blank" rel="noreferrer">
        <ActionButton text={t('Login to Claude.ai')} />
      </a>
    )
  }
  if (error.code === ErrorCode.CHATGPT_CLOUDFLARE || error.code === ErrorCode.CHATGPT_UNAUTHORIZED) {
    setStore("input_text_message", 'ChatGPT Auth Error')

    return <ChatGPTAuthErrorAction />
  }
  if (error.code === ErrorCode.CONVERSATION_LIMIT) {
    setStore("input_text_message", "Conversation limit!")

    return <ActionButton color="primary" text="Restart" size="small" onClick={() => conversation?.reset()} />
  }
  if (error.code === ErrorCode.BARD_EMPTY_RESPONSE) {
    setStore("input_text_message", "Visit bard.google.com")

    return (
      <a href="https://bard.google.com" target="_blank" rel="noreferrer">
        <ActionButton text="Visit bard.google.com" />
      </a>
    )
  }
  if (error.code === ErrorCode.BING_CAPTCHA) {
    setStore("input_text_message", t('Verify') + " bard.google.com")

    return (
      <a href="https://www.bing.com/turing/captcha/challenge" target="_blank" rel="noreferrer">
        <ActionButton text={t('Verify')} />
      </a>
    )
  }
  if (error.code === ErrorCode.LMSYS_SESSION_EXPIRED) {
    setStore("input_text_message", t('Refresh session'))

    return (
      <a href="https://chat.lmsys.org" target="_blank" rel="noreferrer">
        <ActionButton text={t('Refresh session')} />
      </a>
    )
  }
  if (error.code === ErrorCode.CHATGPT_INSUFFICIENT_QUOTA) {
    setStore("input_text_message", t('This usually mean you need to add a payment method to your OpenAI account, checkout: '))

    return (
      <p className="ml-2 text-secondary-text text-sm">
        {t('This usually mean you need to add a payment method to your OpenAI account, checkout: ')}
        <a href="https://platform.openai.com/account/billing/" target="_blank" rel="noreferrer" className="underline">
          OpenAI billing
        </a>
      </p>
    )
  }
  if (
    error.code === ErrorCode.NETWORK_ERROR ||
    (error.code === ErrorCode.UNKOWN_ERROR && error.message.includes('Failed to fetch'))
  ) {
    setStore("input_text_message", t('Please check your network connection'))

    return (
      <div>
        <p className="ml-2 text-secondary-text text-sm">{t('Please check your network connection')}</p>
      </div>
    )
  }
  if (error.code === ErrorCode.POE_MESSAGE_LIMIT) {
    setStore("input_text_message", t('This is a limitation set by poe.com'))

    return <p className="ml-2 text-secondary-text text-sm">{t('This is a limitation set by poe.com')}</p>
  }

  return null
}

export default ErrorAction
