import {getVersion, uuid} from "~utils";
import chatdev_prompt_flow from "~assets/chatdev_gpts_all.json";
import chatdev_prompt_overwrite from "~assets/chatdev_gpts_overwrite.json";
import Browser from "webextension-polyfill";
import {trackEvent} from "~app/plausible";
import {Prompt} from "~services/prompts";

interface Window {
  dev_info?: any;
}

export function setStore(key: any, value: any) {
  const win = window as Window
  if (win.dev_info === undefined) {
    win.dev_info = {}
  }
  win.dev_info[key] = value
}

export function getStore(key: any, value?: any) {
  const win = window as Window

  if (win.dev_info === undefined) {
    win.dev_info = {}
  }
  const result = win.dev_info[key]
  if (result === undefined || result === null) {
    return value
  }
  return result
}

export function getNodeType() {
  return getStore("node_type", "url")
}

export function getEmbeddingDocs() {
  return getStore("node_docs", [])
}

export function setEmbeddingDocs(value: any) {
  setStore("node_docs", value)
}

export function getEmbeddingUrl() {
  return getStore("node_url", [])
}

export function setEmbeddingUrl(value: any) {
  setStore("node_url", value)
}

export function getRealYaml() {
  return getStore("prompts")[getRealYamlKey()]
}

export function setRealYaml(value: any) {
  // console.trace("setRealYaml: " + value)
  getStore("prompts")[getRealYamlKey()] = value
  setEditorGenerate('')
  setStore("yaml_update", true)
}

export function setRealYamlGenerating(value: any) {
  // console.trace("setRealYaml: " + value)
  getStore("prompts")[getRealYamlKey()] = value
  setStore("yaml_update", true)
}

export function setRealYamlKey(value: any) {
  setStore("real_yaml", value)
  setStore("yaml_update", true)
}

export function getRealYamlKey() {
  return getStore("real_yaml", "Default_Flow_Dag_Yaml")
}

export function setEditorGenerate(value: any) {
  setStore("editor_focus", value)
}

export function getEditorGenerate() {
  return getStore("editor_focus", "")
}

export function setDupAgentYaml(value: any) {
  setStore("duplicate_agent_yaml", value)
}

export function getDupAgentYaml() {
  return getStore("duplicate_agent_yaml", false)
}

export function isHookedResponse(type: string) {
  let result
  switch (type) {
    case "html":
      result = getStore("task_refresh", false)
      setStore("task_refresh", false)
      break
    case "generate":
      result = getStore("generate_refresh", false)
      setStore("generate_refresh", false)
      break
    case "exception":
      if (getStore("exception_nodes", "") != "") {
        result = getStore("exception_nodes", "")
        setStore("exception_nodes", "")
      }
      break
    case "message":
      result = getHookedMessage()
      if (result) {
        setHookedMessage("")
      }
      break
    case "duplicate":
      result = getDupAgentYaml()
      if (result) {
        setDupAgentYaml(false)
      }
      break
    case "history":
      result = getStore("history_reset", false)
      setStore("history_reset", false)
      break
  }
  return result
}

export function setNodeException(value: any) {
  setStore("exception_nodes", value)
}

export function setEditorGenerateContent(value: any) {
  setStore("generate_content", value)
}

export function finishEditorGenerate() {
  setEditorGenerateContent("")
  setStore("generate_refresh", false)
}

export function getEditorGenerateContent() {
  return getStore("generate_content", "")
}

export function setPrompts(prompts: any) {
  // console.trace("setPrompts: " + prompts)
  setStore("prompts", prompts)
}

export function getGameVilleYaml() {
  return getPromptValue("the Ville")
}

export function getPromptValue(key: any) {
  return getStore("prompts")[key]
}

export function setPromptValue(key: string, value: any) {
  getStore("prompts")[key] = value
}

export function getTipsPosition() {
  return getStore("tips_position", "")
}

export function setTipsPosition(value: any) {
  setStore("tips_position", value)
}

export function getHookedMessage() {
  return getStore("input_text", false)
}

export function setHookedMessage(value: any) {
  setStore("input_text", value)
}

export function getPendingMessage() {
  return getStore("input_text_pending", "")
}

export function setPendingMessage(value: any) {
  setStore("input_text_pending", value)
}

export function getResponseErrorMessage() {
  return getStore("input_text_message", "")
}

export function setResponseErrorMessage(value: any) {
  setStore("input_text_message", value)
}


export function getTipsContent() {
  return getStore("tips_content", "")
}

export function setTipsContent(value: any) {
  setStore("tips_content", value)
}

export function setResponseType(value: any) {
  setStore("response_type", value)
}

export function setResponseStream(value: any) {
  setStore("response_update_text", value)
}

export function getResponseStream() {
  return getStore("response_update_text", "")
}

export function setEditorStatus(value: any) {
  setStore("editor_show", value)
}

export function getEditorStatus() {
  return getStore("editor_show", false)
}

export function checkGameUpdate() {
  const response_type = getStore("response_type", "")
  if (response_type == "url") {
    setResponseStream(getResponseStream() + ".")
  }

  const task_refresh = getStore("task_refresh", false)
  const generate_refresh = getStore("generate_refresh", false)
  const generate_content = getEditorGenerateContent()
  const yaml_changed = getStore("yaml_changed", false)

  if (getHookedMessage() || task_refresh || generate_refresh || generate_content != "" || yaml_changed) {
    setStore("messageTimes", getStore("messageTimes", 0) + 1)
    setStore("yaml_changed", false)
  }

}

export function setAgentReset(value: boolean) {
  return setStore("agent_reset", value)
}

export function getAgentReset() {
  return getStore("agent_reset", false)
}

export function isAgentCanRemove(title: string) {
  return title.indexOf("Profile_") == -1
    && title.indexOf("Default_Flow_Dag_Yaml") == -1
    && title.indexOf("Action_YAML_Generate_Prompt") == -1
    && title.indexOf("Action_YAML_Generate_Yaml") == -1
    && title.indexOf("Action_YAML_Template") == -1
    && title.indexOf("Flow_Dag_Yaml") == -1
    && title.indexOf("the Ville") == -1
    && title.indexOf("Action_YAML_Generate_Yaml") == -1
}

export function updateEditorResizeInfo(editorRight: boolean, width: number, height: number) {
  if (editorRight) {
    let yamlWidth = getStore("editor_yaml", {}).width
    if (!yamlWidth) {
      yamlWidth = width / 2
    } else if (width == yamlWidth) {
      yamlWidth = width - 20
    }
    setStore("editor_yaml", {width: yamlWidth, height: height})
    let funcWidth = width - yamlWidth
    if (funcWidth == 0) {
      funcWidth = width / 2
    }
    console.log("update size func: " + funcWidth + ", " + height)
    setStore("editor_func", {width: funcWidth, height: height})
  } else {
    let yamlHeight = getStore("editor_yaml", {}).height
    if (!yamlHeight) {
      yamlHeight = height / 2
    } else if (yamlHeight == height) {
      yamlHeight = height - 20
    }
    setStore("editor_yaml", {width: width, height: yamlHeight})
    let funcHeight = height - yamlHeight
    if (funcHeight == 0) {
      funcHeight = width / 2
    }
    console.log("update size func: " + width + ", " + funcHeight)
    setStore("editor_func", {width: width, height: funcHeight})
  }
}

function isPromptJsonContain(prompt: Prompt, prompts: Prompt[]): boolean {
  return prompts.some(p => p.title === prompt.title);
}

export async function initPromptFromFile() {
  const historyPrompts = getStore("prompts", {});
  const historyVersion = getStore("version", "")

  if (historyPrompts['Action_Target_Dialogue_Npc'] == undefined || getVersion() !== historyVersion) {
    const user_history_prompts = [] as Prompt[]
    if (historyPrompts != null) {
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
    setPrompts(prompt_dict);
    await Browser.storage.local.set({prompts: user_history_prompts});
    setStore("version", getVersion());
    trackEvent('update_prompt_flow')
  }
}