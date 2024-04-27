import { ChatGPTMode, getUserConfig } from '~/services/user-config'
import { ChatError, ErrorCode } from '~utils/errors'
import { AsyncAbstractBot, MessageParams } from '../abstract-bot'
import { ChatGPTApiBot } from '../chatgpt-api'
import { ChatGPTWebBot } from '../chatgpt-webapp'

export class ChatGPTBot extends AsyncAbstractBot {
  async initializeBot() {
    const { chatgptMode, ...config } = await getUserConfig()
    if (chatgptMode === ChatGPTMode.API) {
      if (!config.openaiApiKey) {
        throw new ChatError('OpenAI API key not set', ErrorCode.API_KEY_NOT_SET)
      }
      return new ChatGPTApiBot({
        openaiApiKey: config.openaiApiKey,
        openaiApiHost: config.openaiApiHost,
        chatgptApiModel: config.chatgptApiModel,
        chatgptApiTemperature: config.chatgptApiTemperature,
        chatgptApiSystemMessage: config.chatgptApiSystemMessage,
      })
    }
    return new ChatGPTWebBot(config.chatgptWebappModelName)
  }

  async sendMessage(params: MessageParams) {
    return this.doSendMessageGenerator(params)
  }
}
