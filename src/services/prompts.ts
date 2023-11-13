import i18next from 'i18next'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import store from "store2";
import promptsLocal from '~/assets/prompts.json'
import {getVersion, uuid} from "~utils";

export interface Prompt {
  id: string
  title: string
  prompt: string
}

export async function loadLocalPrompts() {
  const { prompts: value } = await Browser.storage.local.get('prompts')
  let prompts_result = (value || []) as Prompt[]
  if (store.get("prompts") === undefined || store.get("prompts") === null || store.get("prompts") === "" || getVersion() !== store.get("version")){
    const prompts_json = promptsLocal
    prompts_json.forEach(item => {
      // @ts-ignore
      item.id = uuid()
    });
    store.set("version", getVersion())
    const prompt_dict = {};
    prompts_json.forEach(item => {
      // @ts-ignore
      prompt_dict[item.title] = item.prompt;
    });
    store.set("prompts", prompt_dict)
    prompts_result = <Prompt[]>prompts_json
    await Browser.storage.local.set({ prompts: prompts_result })
  }
  return prompts_result
}

export async function saveLocalPrompt(prompt: Prompt) {
  const prompts = await loadLocalPrompts()
  let existed = false
  for (const p of prompts) {
    if (p.id === prompt.id) {
      p.title = prompt.title
      p.prompt = prompt.prompt
      existed = true
      break
    }
  }
  if (!existed) {
    prompts.unshift(prompt)
  }
  await Browser.storage.local.set({ prompts })

  const { prompts: prompts_value } = await Browser.storage.local.get('prompts')
  const prompt_dict = {};
  // @ts-ignore
  prompts_value.forEach(item => {
    // @ts-ignore
    prompt_dict[item.title] = item.prompt;
  });
  store.set("prompts", prompt_dict)
  return existed
}

export async function removeLocalPrompt(id: string) {
  const prompts = await loadLocalPrompts()
  await Browser.storage.local.set({ prompts: prompts.filter((p) => p.id !== id) })

  const { prompts: prompts_value } = await Browser.storage.local.get('prompts')
  const prompt_dict = {};
  // @ts-ignore
  prompts_value.forEach(item => {
    // @ts-ignore
    prompt_dict[item.title] = item.prompt;
  });
  store.set("prompts", prompt_dict)
}

export async function loadRemotePrompts() {
  return ofetch<PromptLab[]>('https://chatdev.toscl.com/api/community-prompts', {
    params: { language: i18next.language, languages: i18next.languages },
  }).catch((err) => {
    console.error('Failed to load remote prompts', err)
    return []
  })
}
