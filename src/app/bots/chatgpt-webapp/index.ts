import { get as getPath } from 'lodash-es'
import { v4 as uuidv4 } from 'uuid'
import { ChatGPTWebModel } from '~services/user-config'
import { ChatError, ErrorCode } from '~utils/errors'
import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { getArkoseToken } from './arkose'
import { chatGPTClient } from './client'
import { ImageContent, ResponseContent, ResponsePayload } from './types'

function removeCitations(text: string) {
  return text.replaceAll(/\u3010\d+\u2020source\u3011/g, '')
}

function parseResponseContent(content: ResponseContent): { text?: string; image?: ImageContent } {
  if (content.content_type === 'text') {
    return { text: removeCitations(content.parts[0]) }
  }
  if (content.content_type === 'code') {
    return { text: '_' + content.text + '_' }
  }
  if (content.content_type === 'multimodal_text') {
    for (const part of content.parts) {
      if (part.content_type === 'image_asset_pointer') {
        return { image: part }
      }
    }
  }
  return {}
}

interface ConversationContext {
  conversationId: string
  lastMessageId: string
}

export class ChatGPTWebBot extends AbstractBot {
  private accessToken?: string
  private conversationContext?: ConversationContext

  constructor(public model: ChatGPTWebModel) {
    super()
  }

  private async getModelName(): Promise<string> {
    if (this.model === ChatGPTWebModel['GPT-4']) {
      return 'gpt-4'
    }
    return 'text-davinci-002-render-sha'
  }

  private buildMessage(prompt: string, image?: ImageContent) {
    return {
      id: uuidv4(),
      author: { role: 'user' },
      content: image
        ? { content_type: 'multimodal_text', parts: [image, prompt] }
        : { content_type: 'text', parts: [prompt] },
    }
  }

  async doSendMessage(params: SendMessageParams) {
    if (!this.accessToken) {
      this.accessToken = await chatGPTClient.getAccessToken()
    }
    const modelName = await this.getModelName()
    console.debug('Using model:', modelName)

    const arkoseToken = await getArkoseToken()

    const image: ImageContent | undefined = undefined

    const resp = await chatGPTClient.fetch('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [this.buildMessage(params.prompt, image)],
        model: modelName,
        conversation_id: this.conversationContext?.conversationId || undefined,
        parent_message_id: this.conversationContext?.lastMessageId || uuidv4(),
        arkose_token: arkoseToken,
        conversation_mode: { kind: 'primary_assistant' },
      }),
    })

    const isFirstMessage = !this.conversationContext

    await parseSSEResponse(resp, (message) => {
      console.debug('chatgpt sse message', message)
      if (message === '[DONE]') {
        params.onEvent({ type: 'DONE' })
        return
      }
      let parsed: ResponsePayload | { message: null; error: string }
      try {
        parsed = JSON.parse(message)
      } catch (err) {
        console.error(err)
        return
      }
      if (!parsed.message && parsed.error) {
        params.onEvent({
          type: 'ERROR',
          error: new ChatError(parsed.error, ErrorCode.UNKOWN_ERROR),
        })
        return
      }

      const payload = parsed as ResponsePayload

      const role = getPath(payload, 'message.author.role')
      if (role !== 'assistant' && role !== 'tool') {
        return
      }

      const content = payload.message?.content as ResponseContent | undefined
      if (!content) {
        return
      }

      const { text } = parseResponseContent(content)
      if (text) {
        this.conversationContext = { conversationId: payload.conversation_id, lastMessageId: payload.message.id }
        params.onEvent({ type: 'UPDATE_ANSWER', data: { text } })
      }
    }).catch((err: Error) => {
      if (err.message.includes('token_expired')) {
        throw new ChatError(err.message, ErrorCode.CHATGPT_AUTH)
      }
      throw err
    })

    // auto generate title on first response
    if (isFirstMessage && this.conversationContext) {
      const c = this.conversationContext
      chatGPTClient.generateChatTitle(this.accessToken, c.conversationId, c.lastMessageId)
    }
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name() {
    return `ChatGPT (webapp/${this.model})`
  }
}
