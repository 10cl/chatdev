import { FC, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'
import { chatGPTClient } from '~app/bots/chatgpt-webapp/client'
import { ConversationContext } from '~app/context'
import { ChatError, ErrorCode } from '~utils/errors'
import Button from '../Button'
import MessageBubble from './MessageBubble'
import store from "store2";

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
      <Button color="primary" text={t('Login to ChatGPT')} onClick={fixChatGPT} isLoading={fixing} size="small" />
      <span className="text-sm text-primary-text">OR</span>
      <a
        href={Browser.runtime.getURL('app.html#/setting')}
        target={isSidePanel ? '_blank' : undefined}
        rel="noreferrer"
      >
        <Button color="primary" text={t('Switch to API mode')} size="small" />
      </a>
    </div>
  )
}

const ErrorAction: FC<{ error: ChatError }> = ({ error }) => {
  const conversation = useContext(ConversationContext)
  const { t } = useTranslation()

  if (error.code === ErrorCode.BING_UNAUTHORIZED) {
    store.set("input_text_message", t('Login at bing.com'))

    return (
      <a href="https://bing.com" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Login at bing.com')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.BING_FORBIDDEN) {
    store.set("input_text_message", "Join new Bing waitlist")

    return (
      <a href="https://bing.com/new" target="_blank" rel="noreferrer">
        <Button color="primary" text="Join new Bing waitlist" size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.POE_UNAUTHORIZED) {
    store.set("input_text_message", t('Login at poe.com'))

    return (
      <a href="https://poe.com" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Login at poe.com')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.XUNFEI_UNAUTHORIZED) {
    store.set("input_text_message", t('Login at xfyun.cn'))

    return (
      <a href="https://xinghuo.xfyun.cn" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Login at xfyun.cn')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.GPT4_MODEL_WAITLIST) {
    store.set("input_text_message", t('Join the waitlist'))

    return (
      <a href="https://openai.com/waitlist/gpt-4-api" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Join the waitlist')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.CHATGPT_AUTH) {
    store.set("input_text_message", t('Login to ChatGPT'))

    return (
      <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Login to ChatGPT')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.CLAUDE_WEB_UNAUTHORIZED) {
    return (
      <a href="https://claude.ai" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Login to Claude.ai')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.CHATGPT_CLOUDFLARE || error.code === ErrorCode.CHATGPT_UNAUTHORIZED) {
    store.set("input_text_message", 'ChatGPT Auth Error')

    return <ChatGPTAuthErrorAction />
  }
  if (error.code === ErrorCode.CONVERSATION_LIMIT) {
    store.set("input_text_message", "Conversation limit!")

    return <Button color="primary" text="Restart" size="small" onClick={() => conversation?.reset()} />
  }
  if (error.code === ErrorCode.BARD_EMPTY_RESPONSE) {
    store.set("input_text_message", "Visit bard.google.com")

    return (
      <a href="https://bard.google.com" target="_blank" rel="noreferrer">
        <Button color="primary" text="Visit bard.google.com" size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.BING_CAPTCHA) {
    store.set("input_text_message", t('Verify') + " bard.google.com")

    return (
      <a href="https://www.bing.com/turing/captcha/challenge" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Verify')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.LMSYS_SESSION_EXPIRED) {
    store.set("input_text_message", t('Refresh session'))

    return (
      <a href="https://chat.lmsys.org" target="_blank" rel="noreferrer">
        <Button color="primary" text={t('Refresh session')} size="small" />
      </a>
    )
  }
  if (error.code === ErrorCode.CHATGPT_INSUFFICIENT_QUOTA) {
    store.set("input_text_message", t('This usually mean you need to add a payment method to your OpenAI account, checkout: '))

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
    store.set("input_text_message", t('Please check your network connection'))

    return <p className="ml-2 text-secondary-text text-sm">{t('Please check your network connection')}</p>
  }
  if (error.code === ErrorCode.POE_MESSAGE_LIMIT) {
    store.set("input_text_message", t('This is a limitation set by poe.com'))

    return <p className="ml-2 text-secondary-text text-sm">{t('This is a limitation set by poe.com')}</p>
  }

  return null
}

export default ErrorAction
