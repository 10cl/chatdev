import i18next from 'i18next'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import chatdev_prompt_flow from '~/assets/chatdev_gpts_all.json'
import {getVersion, uuid} from "~utils";
import {trackEvent} from "~app/plausible";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";

export interface Prompt {
  id: string
  title: string
  prompt: string
}

export interface PromptLab {
  id: string
  title: string
  intro: string
  author: string
  share: string
}

export interface PromptYAML {
  id: string
  title: string
  intro: string
  author: string
  yaml: string
}

export interface PromptVersion {
  id: string
  version: string
  intro: string
}

interface Window {
  dev_info?: any;
}

export async function loadLocalPrompts() {
  const { prompts: value } = await Browser.storage.local.get('prompts')
  return (value || []) as Prompt[]
}


function isPromptJsonContain(prompt: Prompt, prompts: Prompt[]): boolean {
  return prompts.some(p => p.title === prompt.title);
}

export async function updateLocalPrompts()  {
  const prePrompts = getStore("prompts", {});
  if (prePrompts['Action_Target_Dialogue_Npc'] == undefined || getVersion() !== getStore("version", "")) {
    const user_prompts = [] as Prompt[]
    if (prePrompts != null){
      for (const [key, value] of Object.entries(prePrompts)) {
        const item = {
          id: uuid(),
          title: key,
          prompt: value
        } as Prompt;
        user_prompts.push(item)
      }
    }

    // handle for chatdev_prompt_flow
    for (const [key, value] of Object.entries(chatdev_prompt_flow)) {
      const p = {
        id: uuid(),
        title: key,
        prompt: value
      } as Prompt

      if (!isPromptJsonContain(p, user_prompts)) {
        user_prompts.push(p);
      } else {
        const index = user_prompts.findIndex(item => item.title === p.title);
        user_prompts[index].prompt = p.prompt;
      }
    }

    // write to local
    const prompt_dict: { [key: string]: string } = {};
    user_prompts.forEach(item => {
      prompt_dict[item.title] = item.prompt;
    });
    setStore("prompts", prompt_dict);
    console.log("updateLocalPrompts")
    await Browser.storage.local.set({ prompts: user_prompts });
    setStore("version", getVersion());
    trackEvent('update_prompt_flow')
  }
}
export async function saveLocalPromptTitle(prompt: Prompt) {
  const prompts = await loadLocalPrompts()
  let existed = false
  for (const p of prompts) {
    if (p.title === prompt.title) {
      p.title = prompt.title
      p.prompt = prompt.prompt
      existed = true
      break
    }
  }

  if (!existed) {
    prompts.unshift(prompt)
  }

  const prompt_dict: { [key: string]: string } = {};
  ((prompts || []) as Prompt[]).forEach(item => {
    prompt_dict[item.title] = item.prompt;
  });
  setStore("prompts", prompt_dict);

  await Browser.storage.local.set({ prompts })

  return existed
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

  const prompt_dict: { [key: string]: string } = {};
  ((prompts || []) as Prompt[]).forEach(item => {
    prompt_dict[item.title] = item.prompt;
  });
  setStore("prompts", prompt_dict);

  await Browser.storage.local.set({ prompts })

  return existed
}

export async function removeLocalPrompt(id: string) {
  const prompts = await loadLocalPrompts()
  await Browser.storage.local.set({ prompts: prompts.filter((p) => p.id !== id) })

  const { prompts: prompts_value } = await Browser.storage.local.get('prompts')
  const prompt_dict: { [key: string]: string } = {};
  ((prompts_value || []) as Prompt[]).forEach(item => {
    prompt_dict[item.title] = item.prompt;
  });
  setStore("prompts", prompt_dict)
}

export async function loadRemotePrompts() {
  return ofetch<PromptLab[]>('https://chatdev.toscl.com/api/get_communities', {
    params: { language: i18next.language, languages: i18next.languages, version: getVersion(), fp: getStore("fp", "") },
  }).catch((err) => {
    console.error('Failed to load remote prompts', err)
    return []
  })
}
export async function loadYaml(share: string) {
  return ofetch<PromptYAML>('https://chatdev.toscl.com/api/get_yaml/' + share, {
    params: { language: i18next.language, languages: i18next.languages, version: getVersion() },
  }).catch((err) => {
    console.error('Failed to load remote prompts', err)
    return {} as PromptYAML
  })
}

// export async function getPromptVersion() {
//   return ofetch<PromptVersion>('https://chatdev.toscl.com/api/prompt_version', {
//     params: { language: i18next.language, languages: i18next.languages },
//   }).catch((err) => {
//     console.error('Failed to load remote prompts', err)
//     return {} as PromptVersion
//   })
// }
//
// export async function loadTheLatestPrompt() {
//   return ofetch<PromptLab>('https://chatdev.toscl.com/api/prompts', {
//     params: { language: i18next.language, languages: i18next.languages },
//   }).catch((err) => {
//     console.error('Failed to load remote prompts', err)
//     return {} as PromptLab
//   })
// }

export async function loadRemoteUrl(url : string) {
  return ofetch<string>(url, {
    params: { language: i18next.language, languages: i18next.languages },
  }).catch((err) => {
    alert('Failed to load remote html:' + err)
    return ""
  })
}

export function setStore(key:any, value:any){
  const win = window as Window
  if (win.dev_info === undefined){
    win.dev_info = {}
  }
  win.dev_info[key] = value
}

export function getStore(key:any, value?:any){
  const win = window as Window

  if (win.dev_info === undefined){
    win.dev_info = {}
  }
  const result =  win.dev_info[key]
  if (result === undefined || result === null){
    return value
  }
  return result
}
