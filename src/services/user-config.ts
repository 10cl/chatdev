import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { BotId } from '~app/bots'
import { ALL_IN_ONE_PAGE_ID, CHATBOTS, CHATGPT_API_MODELS, DEFAULT_CHATGPT_SYSTEM_MESSAGE } from '~app/consts'

export enum BingConversationStyle {
  Creative = 'creative',
  Balanced = 'balanced',
  Precise = 'precise',
}

export enum ChatGPTMode {
  Webapp = 'webapp',
  API = 'api'
}

export enum ChatGPTWebModel {
  'GPT-3.5' = 'gpt-3.5',
  'GPT-4' = 'gpt-4',
}

export enum PoeGPTModel {
  'GPT-3.5' = 'chinchilla',
  'GPT-4' = 'beaver',
}

export enum PoeClaudeModel {
  'claude-instant' = 'a2',
  'claude-instant-100k' = 'a2_100k',
  'claude-2-100k' = 'a2_2',
}

export enum ClaudeMode {
  Webapp = 'webapp',
  API = 'api'
}

export enum ClaudeAPIModel {
  'claude-instant-1' = 'claude-instant-1.2',
  'claude-2' = 'claude-2.1',
  'claude-3-sonnet' = 'claude-3-sonnet-20240229',
  'claude-3-opus' = 'claude-3-opus-20240229'
}

export enum OllamaAPIModel {
  'Llama 3 8B ' = 'llama3',
  'Llama 3 70B' = 'llama3:70b',
  'Phi-3 3.8B ' = 'phi3',
  'Mistral 7B ' = 'mistral',
  'Neural Chat 7B ' = 'neural-chat',
  'Starling  7B ' = 'starling-lm',
  'Code Llama  7B ' = 'codellama',
  'Llama 2 Uncensored  7B ' = 'llama2-uncensored',
  'LLaVA 7B ' = 'llava',
  'Gemma 2B ' = 'gemma:2b',
  'Gemma 7B ' = 'gemma:7b',
  'Solar 10.7B' = 'solar'
}


export enum OpenRouterClaudeModel {
  'claude-2' = 'claude-2',
  'claude-instant-v1' = 'claude-instant-v1',
}

const userConfigWithDefaultValue = {
  openaiApiKey: '',
  openaiApiHost: 'https://api.openai.com',
  chatgptApiModel: CHATGPT_API_MODELS[0] as (typeof CHATGPT_API_MODELS)[number],
  chatgptApiTemperature: 1,
  chatgptApiSystemMessage: DEFAULT_CHATGPT_SYSTEM_MESSAGE,
  chatgptMode: ChatGPTMode.Webapp,
  chatgptWebappModelName: ChatGPTWebModel['GPT-3.5'],
  chatgptPoeModelName: PoeGPTModel['GPT-3.5'],
  bingConversationStyle: BingConversationStyle.Balanced,
  poeModel: PoeClaudeModel['claude-instant'],
  azureOpenAIApiKey: '',
  azureOpenAIApiInstanceName: '',
  azureOpenAIApiDeploymentName: '',
  enabledBots: Object.keys(CHATBOTS) as BotId[],
  claudeApiKey: '',
  claudeMode: ClaudeMode.API,
  claudeApiModel: ClaudeAPIModel['claude-2'],
  openrouterOpenAIModel: CHATGPT_API_MODELS[0] as (typeof CHATGPT_API_MODELS)[number],
  openrouterClaudeModel: OpenRouterClaudeModel['claude-2'],
  openrouterApiKey: '',
  ollamaApi: 'http://localhost:11434/api/chat',
  ollamaModel: 'llama3'
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.sync.get(Object.keys(userConfigWithDefaultValue))
  if (!result.chatgptMode && result.openaiApiKey) {
    result.chatgptMode = ChatGPTMode.API
  }
  if (result.chatgptWebappModelName === 'default') {
    result.chatgptWebappModelName = ChatGPTWebModel['GPT-3.5']
  } else if (result.chatgptWebappModelName === 'gpt-4-browsing') {
    result.chatgptWebappModelName = ChatGPTWebModel['GPT-4']
  } else if (result.chatgptWebappModelName === 'gpt-3.5-mobile') {
    result.chatgptWebappModelName = ChatGPTWebModel['GPT-3.5']
  } else if (result.chatgptWebappModelName === 'gpt-4-mobile') {
    result.chatgptWebappModelName = ChatGPTWebModel['GPT-4']
  }
  if (result.chatgptApiModel === 'gpt-3.5-turbo-16k') {
    result.chatgptApiModel = 'gpt-3.5-turbo'
  }
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  await Browser.storage.sync.set(updates)
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      await Browser.storage.sync.remove(key)
    }
  }
}
