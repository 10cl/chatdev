import claudeLogo from '~/assets/anthropic-logo.png'
import baichuanLogo from '~/assets/baichuan-logo.png'
import bardLogo from '~/assets/bard-logo.svg'
import bingLogo from '~/assets/bing-logo.svg'
import yiLogo from '~/assets/yi-logo.svg'
import chatgptLogo from '~/assets/chatgpt-logo.svg'
import ollamaLogo from '~/assets/ollama-logo.png'
import llamaLogo from '~/assets/llama-logo.png'
import mistralLogo from '~/assets/mistral-logo.png'
import piLogo from '~/assets/pi-logo.png'
import qianwenLogo from '~/assets/qianwen-logo.png'
import vicunaLogo from '~/assets/vicuna-logo.jpg'
import gemmaLogo from '~/assets/gemma-logo.png'
import xunfeiLogo from '~/assets/xunfei-logo.png'
import { BotId } from './bots'

export const CHATBOTS: Record<BotId, { name: string; avatar: string }> = {
  chatgpt: {
    name: 'ChatGPT',
    avatar: chatgptLogo,
  },
  gemini: {
    name: 'Gemini',
    avatar: bardLogo,
  },
  claude: {
    name: 'Claude',
    avatar: claudeLogo,
  },
  llama: {
    name: 'Llama 3 70B',
    avatar: llamaLogo,
  },
  ollama: {
    name: 'Ollama',
    avatar: ollamaLogo,
  },
  vicuna: {
    name: 'Vicuna',
    avatar: vicunaLogo,
  },
  mistral: {
    name: 'Mixtral',
    avatar: mistralLogo,
  },
  pi: {
    name: 'Pi',
    avatar: piLogo,
  },
  gemma: {
    name: 'Gemma',
    avatar: gemmaLogo,
  },
  yi: {
    name: 'Yi',
    avatar: yiLogo,
  },
  xunfei: {
    name: 'iFlytek Spark',
    avatar: xunfeiLogo,
  },
  qianwen: {
    name: 'Qianwen',
    avatar: qianwenLogo,
  },
  baichuan: {
    name: 'Baichuan',
    avatar: baichuanLogo,
  },
  bing: {
    name: 'Bing',
    avatar: bingLogo,
  },
}

export const CHATGPT_HOME_URL = 'https://chatgpt.com'
export const CHATGPT_API_MODELS = ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4'] as const
export const ALL_IN_ONE_PAGE_ID = 'all'

export const DEFAULT_CHATGPT_SYSTEM_MESSAGE =
  'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible. Knowledge cutoff: 2021-09-01. Current date: {current_date}'

export type Layout = 2 | 3 | 4 | 'imageInput' | 'twoVertical' | 'sixGrid' // twoVertical is deprecated
