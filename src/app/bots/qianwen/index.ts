import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { requestHostPermission } from '~app/utils/permissions'
import { ChatError, ErrorCode } from '~utils/errors'
import { createConversation, getCsrfToken } from './api'
import { uuid } from '~utils'

function generateMessageId() {
  return uuid().replace(/-/g, '')
}

interface ConversationContext {
  conversationId: string
  csrfToken: string
  lastMessageId?: string
}

export class QianwenWebBot extends AbstractBot {
  private conversationContext?: ConversationContext

  async doSendMessage(params: SendMessageParams) {
    if (!(await requestHostPermission('https://qianwen.aliyun.com/'))) {
      throw new ChatError('Missing qianwen.aliyun.com permission', ErrorCode.MISSING_HOST_PERMISSION)
    }

    if (!this.conversationContext) {
      const csrfToken = await getCsrfToken()
      const conversationId = await createConversation(params.prompt, csrfToken)
      this.conversationContext = { conversationId, csrfToken }
    }

    const resp = await fetch('https://qianwen.aliyun.com/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': 'pc_tongyi',
        'X-Xsrf-Token': this.conversationContext.csrfToken,
      },
      body: JSON.stringify({
        action: 'next',
        msgId: generateMessageId(),
        parentMsgId: this.conversationContext.lastMessageId || '0',
        contents: [{ contentType: 'text', content: params.prompt }],
        sessionId: this.conversationContext.conversationId,
        sessionType: 'text_chat',
        model: '',
        modelType: '',
        openSearch: true,
        timeout: 120,
      }),
    })

    let done = false

    await parseSSEResponse(resp, (message) => {
      console.debug('qianwen sse', message)
      const data = JSON.parse(message)
      const text = data.content[0]
      if (text) {
        params.onEvent({ type: 'UPDATE_ANSWER', data: { text } })
      }
      if (data.stopReason === 'stop') {
        this.conversationContext!.lastMessageId = data.msgId
        done = true
        params.onEvent({ type: 'DONE' })
      }
    })

    if (!done) {
      params.onEvent({ type: 'DONE' })
    }
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name() {
    return '通义千问'
  }
}
