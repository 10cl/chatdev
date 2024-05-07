import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";
import {getUserConfig, OllamaAPIModel} from "~services/user-config";
import {streamAsyncIterable} from "~utils/stream-async-iterable";

interface ConversationContext {
  initialized: boolean
}

export class OllamaBot extends AbstractBot {
  private conversationContext?: ConversationContext

  async doSendMessage(params: SendMessageParams) {
    const {ollamaApi, ollamaModel} = await getUserConfig()

    const urlObj = new URL(ollamaApi);
    if (!(await requestHostPermission(urlObj.protocol + '//*.' + urlObj.hostname + "/"))) {
      throw new ChatError('Missing ollama api url permission', ErrorCode.MISSING_HOST_PERMISSION)
    }

    const resp = await fetch(ollamaApi, {
      method: 'POST',
      signal: params.signal,
      body: JSON.stringify({
        "model": ollamaModel,
        "messages": [
          { "role": "user", "content": params.prompt  }
        ]
      })
    })

    const decoder = new TextDecoder()
    let result = ''

    for await (const uint8Array of streamAsyncIterable(resp.body!)) {
      const str = decoder.decode(uint8Array)
      console.debug('ollama stream', str)
      const lines = str.split('\n')
      for (const line of lines) {
        if (!line) {
          continue
        }
        const data = JSON.parse(line)
        const text = data.message.content
        if (text) {
          result += text
          params.onEvent({ type: 'UPDATE_ANSWER', data: { text: result } })
        }
      }
    }
    params.onEvent({ type: 'DONE' })
  }

  resetConversation() {
    this.conversationContext = undefined
  }
}
