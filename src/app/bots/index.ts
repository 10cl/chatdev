import { BaichuanWebBot } from './baichuan'
import { BardBot } from './bard'
import { BingWebBot } from './bing'
import { ChatGPTBot } from './chatgpt'
import { ClaudeBot } from './claude'
import { LMSYSBot } from './lmsys'
import { PiBot } from './pi'
import { QianwenWebBot } from './qianwen'
import { XunfeiBot } from './xunfei'
import {LlaMa2Bot} from "~app/bots/llama2";
import {OllamaBot} from "~app/bots/ollama";

export type BotId =
  | 'chatgpt'
  | 'bing'
  | 'gemini'
  | 'claude'
  | 'xunfei'
  | 'vicuna'
  | 'mistral'
  | 'yi'
  | 'llama'
  | 'pi'
  | 'gemma'
  | 'qianwen'
  | 'baichuan'
  | 'ollama'

export type ChatPage =
  | 'side'
  | 'page'
  | 'extension'

export function createBotInstance(botId: BotId) {
  switch (botId) {
    case 'ollama':
      return new OllamaBot()
    case 'chatgpt':
      return new ChatGPTBot()
    case 'bing':
      return new BingWebBot()
    case 'claude':
      return new ClaudeBot()
    case 'xunfei':
      return new XunfeiBot()
    case 'vicuna':
      return new LMSYSBot('vicuna-33b')
    case 'yi':
      return new LMSYSBot('yi-34b-chat')
    case 'llama':
      return new LlaMa2Bot()
    case 'gemma':
      return new LMSYSBot('gemma-7b-it')
    case 'mistral':
      return new LMSYSBot('mixtral-8x7b-instruct-v0.1')
    case 'pi':
      return new PiBot()
    case 'qianwen':
      return new QianwenWebBot()
    case 'baichuan':
      return new BaichuanWebBot()
    case 'gemini':
      return new BardBot()
  }
}

export type BotInstance = ReturnType<typeof createBotInstance>
