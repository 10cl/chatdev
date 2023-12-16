import i18next from 'i18next'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import chatdev_prompt_flow from '~/assets/chatdev_gpts_all.json'
import chatdev_prompt_overwrite from '~/assets/chatdev_gpts_overwrite.json'
import {getVersion, uuid} from "~utils";
import {trackEvent} from "~app/plausible";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";

export interface Prompt {
  id: string
  title: string
  prompt: string
  type?: string
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
  const historyPrompts = getStore("prompts", {});
  const historyVersion = getStore("version", "")

  if (historyPrompts['Action_Target_Dialogue_Npc'] == undefined || getVersion() !== historyVersion) {
    const user_history_prompts = [] as Prompt[]
    if (historyPrompts != null){
      for (const [key, value] of Object.entries(historyPrompts)) {
        const item = {
          id: uuid(),
          title: key,
          prompt: value
        } as Prompt;
        user_history_prompts.push(item)
      }
    }

    // handle for chatdev_gpts_all
    for (const [key, value] of Object.entries(chatdev_prompt_flow)) {
      const p = {
        id: uuid(),
        title: key,
        prompt: value
      } as Prompt

      if (!isPromptJsonContain(p, user_history_prompts)) {
        user_history_prompts.push(p);
      } else {
        // old version should overwrite user's GPTs.
        if (historyVersion.startsWith("1.0") || historyVersion.startsWith("1.1") || historyVersion.startsWith("1.2")) {
          const index = user_history_prompts.findIndex(item => item.title === p.title);
          user_history_prompts[index].prompt = p.prompt;
        }
      }
    }

    // handle for chatdev_gpts_overwrite
    for (const [key, value] of Object.entries(chatdev_prompt_overwrite)) {
      const p = {
        id: uuid(),
        title: key,
        prompt: value
      } as Prompt

      if (!isPromptJsonContain(p, user_history_prompts)) {
        user_history_prompts.push(p);
      } else {
        const index = user_history_prompts.findIndex(item => item.title === p.title);
        user_history_prompts[index].prompt = p.prompt;
      }
    }

    // write to local
    const prompt_dict: { [key: string]: string } = {};
    user_history_prompts.forEach(item => {
      prompt_dict[item.title] = item.prompt;
    });
    setStore("prompts", prompt_dict);
    console.log("updateLocalPrompts")
    await Browser.storage.local.set({ prompts: user_history_prompts });
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
      p.type = prompt.type
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

function getPromptFlow() {
  const prompts = getStore("prompts", {})
  const promptFlowYaml = prompts[getStore("real_yaml", "Default_Flow_Dag_Yaml")]
  if (promptFlowYaml == undefined) {
    return
  }
  const exportPrompts: { [key: string]: string } = {};
  exportPrompts['Flow_Dag_Yaml'] = promptFlowYaml;
  const yamlLines = promptFlowYaml.split("\n")

  let targetPath = '';
  const functionPath = 'func:';
  const promptPath = 'path:';
  const regexFunc = /func:\s*([\w_]+)\s*/
  const regexPath = /path:\s*([\w_]+)\s*/

  for (let i = 0; i < yamlLines.length; i++) {
    const line = yamlLines[i];
    const matchFunc = line.match(regexFunc)
    const matchPath = line.match(regexPath)
    if (matchFunc || matchPath) {
      let prompt;

      let pathIndex = 0;
      if (matchFunc){
        prompt = matchFunc[1];
        pathIndex = line.indexOf(functionPath);
        targetPath = functionPath
      }else if (matchPath){
        prompt = matchPath[1];
        pathIndex = line.indexOf(promptPath);
        targetPath = promptPath
      }

      if (prompt) {
        prompt = prompt.replace(/\s+/g, "")
        if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
          exportPrompts[prompt] = prompts[prompt]
        }
      }
    }
  }
  console.log(exportPrompts)

  return exportPrompts
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

export async function uploadToShareGPT(json: { [p: string]: File | string }) {
  const resp = await ofetch('https://chatdev.toscl.com/api/upload', {
    method: 'POST',
    body: {
      title: json.title,
      intro: json.intro,
      yaml: getPromptFlow(),
      author: getStore("player_name", ""),
      fp: getStore("fp", ""),
      lang: i18next.language
    }
  })
  return resp.share as string
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

export function isURL(str: string) {
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
  return urlPattern.test(str);
}