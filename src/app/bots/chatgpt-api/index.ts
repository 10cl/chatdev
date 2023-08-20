import { DEFAULT_CHATGPT_SYSTEM_MESSAGE } from '~app/consts'
import { UserConfig } from '~services/user-config'
import { ChatError, ErrorCode } from '~utils/errors'
import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { ChatMessage } from './consts'
import { updateTokenUsage } from './usage'

interface ConversationContext {
  messages: ChatMessage[]
}

const CONTEXT_SIZE = 10

export abstract class AbstractChatGPTApiBot extends AbstractBot {
  private conversationContext?: ConversationContext

  buildMessages(): ChatMessage[] {
    const currentDate = new Date().toISOString().split('T')[0]
    const systemMessage = this.getSystemMessage().replace('{current_date}', currentDate)
    return [
      { role: 'system', content: systemMessage },
      ...this.conversationContext!.messages.slice(-(CONTEXT_SIZE + 1)),
    ]
  }

  getSystemMessage() {
    return DEFAULT_CHATGPT_SYSTEM_MESSAGE
  }

  async doSendMessage(params: SendMessageParams) {
    if (!this.conversationContext) {
      this.conversationContext = { messages: [] }
    }
    this.conversationContext.messages.push({ role: 'user', content: params.prompt })

    const resp = await this.fetchCompletionApi(params.signal)

    let done = false
    const result: ChatMessage = { role: 'assistant', content: '' }

    const finish = () => {
      done = true
      params.onEvent({ type: 'DONE' })
      const messages = this.conversationContext!.messages
      messages.push(result)
      updateTokenUsage(messages).catch(console.error)
    }

    await parseSSEResponse(resp, (message) => {
      console.debug('chatgpt sse message', message)
      if (message === '[DONE]') {
        finish()
        return
      }
      let data
      try {
        data = JSON.parse(message)
      } catch (err) {
        console.error(err)
        return
      }
      if (data?.choices?.length) {
        const delta = data.choices[0].delta
        if (delta?.content) {
          result.content += delta.content
          params.onEvent({
            type: 'UPDATE_ANSWER',
            data: { text: result.content },
          })
        }
      }
    })

    if (!done) {
      finish()
    }
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  abstract fetchCompletionApi(signal?: AbortSignal): Promise<Response>
}

export class ChatGPTApiBot extends AbstractChatGPTApiBot {
  constructor(
    private config: Pick<
      UserConfig,
      'openaiApiKey' | 'openaiApiHost' | 'chatgptApiModel' | 'chatgptApiTemperature' | 'chatgptApiSystemMessage'
    >,
  ) {
    super()
  }

  getSystemMessage() {
    return this.config.chatgptApiSystemMessage || DEFAULT_CHATGPT_SYSTEM_MESSAGE
  }

  async fetchCompletionApi(signal?: AbortSignal) {
    const { openaiApiKey, openaiApiHost, chatgptApiModel } = this.config
    const resp = await fetch(`${openaiApiHost}/v1/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.getModelName(),
        messages: this.buildMessages(),
        stream: true,
      }),
    })
    if (!resp.ok && resp.status === 404 && chatgptApiModel.includes('gpt-4')) {
      throw new ChatError(`You don't have API access to ${chatgptApiModel} model`, ErrorCode.GPT4_MODEL_WAITLIST)
    }
    if (!resp.ok) {
      const error = await resp.text()
      if (error.includes('insufficient_quota')) {
        throw new ChatError('Insufficient ChatGPT API usage quota', ErrorCode.CHATGPT_INSUFFICIENT_QUOTA)
      }
    }
    return resp
  }

  private getModelName() {
    const { chatgptApiModel } = this.config
    if (chatgptApiModel === 'gpt-3.5-turbo') {
      return 'gpt-3.5-turbo-0613'
    }
    if (chatgptApiModel === 'gpt-4') {
      return 'gpt-4-0613'
    }
    if (chatgptApiModel === 'gpt-4-32k') {
      return 'gpt-4-32k-0613'
    }
    return chatgptApiModel
  }

  get name() {
    return `ChatGPT (API/${this.config.chatgptApiModel})`
  }
}
