import i18next from 'i18next'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import store from "store2";
import promptsLocal from '~/assets/prompts.json'
import chatdev_prompt_flow from '~/assets/chatdev_prompt_flow.json'
import {getVersion, uuid} from "~utils";
import {trackEvent} from "~app/plausible";
import {useCallback} from "react";
import {importFromText} from "~app/utils/export";
import {SWRResponse} from "swr";

export interface Prompt {
  id: string
  title: string
  prompt: string
}

export interface PromptLab {
  id: string
  title: string
  intro: string
  yaml: JSON
}

export interface PromptVersion {
  id: string
  version: string
  intro: string
}

export async function loadLocalPrompts() {
  const { prompts: value } = await Browser.storage.local.get('prompts')
  return (value || []) as Prompt[]
}


function isPromptJsonContain(prompt: Prompt, prompts: Prompt[]): boolean {
  return prompts.some(p => p.title === prompt.title);
}

export async function updateLocalPrompts()  {
  const prePrompts = store.get("prompts");

  if (prePrompts === undefined || prePrompts === null || prePrompts === "" || getVersion() !== store.get("version")) {
    const user_prompts = [] as Prompt[]
    const prompts = store.get("prompts")
    if (prompts != null){
      for (const [key, value] of Object.entries(prompts)) {
        const item = {
          id: uuid(),
          title: key,
          prompt: value
        } as Prompt;
        user_prompts.push(item)
      }
    }

    const prompts_json = promptsLocal.map(item => ({ ...item, id: uuid() }));
    prompts_json.forEach(item => {
      if (!isPromptJsonContain(item, user_prompts)) {
        user_prompts.push(item)
      }else{
        if (store.get("edit_" + item.title) == true) {
          // console.log("edit_" + item.title);
        }else{
          const index = user_prompts.findIndex(findItem => findItem.title === item.title);
          user_prompts[index].prompt = item.prompt
        }
      }
    });

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
    store.set("prompts", prompt_dict);

    await Browser.storage.local.set({ prompts: user_prompts });
    store.set("version", getVersion());
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
  store.set("prompts", prompt_dict);

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
  store.set("prompts", prompt_dict);

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

export async function getPromptVersion() {
  return ofetch<PromptVersion>('https://chatdev.toscl.com/api/prompt_version', {
    params: { language: i18next.language, languages: i18next.languages },
  }).catch((err) => {
    console.error('Failed to load remote prompts', err)
    return {} as PromptVersion
  })
}

export async function loadTheLatestPrompt() {
  return ofetch<PromptLab>('https://chatdev.toscl.com/api/prompts', {
    params: { language: i18next.language, languages: i18next.languages },
  }).catch((err) => {
    console.error('Failed to load remote prompts', err)
    return {} as PromptLab
  })
}