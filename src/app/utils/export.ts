import { fileOpen, fileSave } from 'browser-fs-access'
import Browser from 'webextension-polyfill'
import { trackEvent } from '~app/plausible'
import {getStore, Prompt, setStore} from "~services/prompts";
import store from "store2";
import {uuid} from "~utils";

export async function exportData() {
  const [syncData, localData] = await Promise.all([Browser.storage.sync.get(null), Browser.storage.local.get(null)])
  const data = {
    sync: syncData,
    local: localData,
    localStorage: { ...localStorage },
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  await fileSave(blob, { fileName: 'chatdev.json' })
  trackEvent('export_data')
}

export async function importData() {
  try{
      const blob = await fileOpen({ extensions: ['.json'] })
      const json = JSON.parse(await blob.text())
      if (!json.sync || !json.local) {
        throw new Error('Invalid data')
      }
    if (!window.confirm('Are you sure you want to import data? This will overwrite your current data')) {
      return
    }
      await Browser.storage.local.clear()
      await Browser.storage.local.set(json.local)
      await Browser.storage.sync.clear()
      await Browser.storage.sync.set(json.sync)

      if (json.localStorage) {
        for (const [k, v] of Object.entries(json.localStorage as Record<string, string>)) {
          localStorage.setItem(k, v)
        }
      }

      alert('Imported data successfully')
      trackEvent('import_data')
      location.reload()
    }catch (e) {
      alert(e)
    }
}

const functionPath = 'func:';
const promptPath = 'path:';
let targetPath = '';

export async function exportAgentAll() {
  const prompts = getStore("prompts", {})
  const blob = new Blob([JSON.stringify(prompts, null, 4)], {type: 'application/json'})
  await fileSave(blob, {fileName: 'chatdev_gpts_all.json'})
  trackEvent('export_gpts_all')
}

export async function exportPromptFlow() {
  const prompts = getStore("prompts", {})
  const promptFlowYaml = prompts[getStore("real_yaml", "Default_Flow_Dag_Yaml")]
  if (promptFlowYaml == undefined) {
    return
  }
  const exportPrompts: { [key: string]: string } = {};
  exportPrompts['Flow_Dag_Yaml'] = promptFlowYaml;
  const yamlLines = promptFlowYaml.split("\n")
  for (let i = 0; i < yamlLines.length; i++) {
    const line = yamlLines[i];

    if (line.includes(promptPath) || line.includes(functionPath)) {
      if (!line.includes(promptPath)) {
        targetPath = functionPath
      } else {
        targetPath = promptPath
      }
      const pathIndex = line.indexOf(targetPath);
      const pathValue = line.substring(pathIndex + targetPath.length);
      let prompt = line.substring(pathIndex + targetPath.length);

      if (pathValue && prompt) {
        prompt = prompt.replace(/\s+/g, "")
        if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
          exportPrompts[prompt] = prompts[prompt]
        }
      }
    }
  }
  const blob = new Blob([JSON.stringify(exportPrompts, null, 4)], {type: 'application/json'})
  await fileSave(blob, {fileName: 'chatdev_gpts.json'})
  trackEvent('export_prompt_flow')
}

function isPromptJsonContain(prompt: Prompt, prompts: Prompt[]): boolean {
  return prompts.some(p => p.title === prompt.title);
}

export async function importPromptFlow(confirmTips: string, successTips: string) {
  const blob = await fileOpen({ extensions: ['.json'] })
  if (!window.confirm(confirmTips)) {
    return
  }
  try {
    const json = JSON.parse(await blob.text())
    importFromText(json)
    alert(successTips)
  }catch (e) {
    alert(e)
  }
}

export async function importFromText(json: JSON){
  if (json == null){
    return
  }
  const user_prompts = [] as Prompt[]
  const prompts = getStore("prompts", {})
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

  for (const [key, value] of Object.entries(json)) {
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

  const prompt_dict: { [key: string]: string } = {};
  user_prompts.forEach(item => {
    prompt_dict[item.title] = item.prompt;
  });

  if(prompt_dict['Flow_Dag_Yaml'] !== undefined) {
    // prompt_dict[getStore("editor_yaml", "Default_Flow_Dag_Yaml")] = prompt_dict['Flow_Dag_Yaml']
    const isGameMode = getStore("gameModeEnable", true)
    if (!isGameMode) {
        prompt_dict[getStore("real_yaml", "Default_Flow_Dag_Yaml")] = prompt_dict['Flow_Dag_Yaml']
    } else {
        prompt_dict[getStore("editor_yaml", "Default_Flow_Dag_Yaml")] = prompt_dict['Flow_Dag_Yaml']
    }
    prompt_dict['Flow_Dag_Yaml'] = ""
    setStore("yaml_update", true)
  }

  setStore("prompts", prompt_dict);

  await Browser.storage.local.set({ prompts: user_prompts });

  trackEvent('import_prompt_flow')
}
