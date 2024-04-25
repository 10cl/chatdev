import {PromptFlowNode} from "promptflowx";
import {useAtom, useAtomValue} from "jotai/index";

export function setStore(key: any, value: any) {
  if (key == "yaml_update"){
    console.trace("yaml_update")
  }
  const win = window
  if (win.dev_info === undefined) {
    win.dev_info = {}
  }
  win.dev_info[key] = value
}

export function getStore(key: any, value?: any) {
  const win = window

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


export function getPromptLib() {
  return getStore("prompts", {})
}

export function getRealYaml() {
  return getPromptLib()[getRealYamlKey()]
}

export function setRealYaml(value: any) {
  // console.trace("setRealYaml: " + value)
  getPromptLib()[getRealYamlKey()] = value
  setStore("yaml_update", true)
}

export function isYamlChanged() {
  const result = getStore("yaml_update", true)
  if (result){
    setStore("yaml_update", false)
  }
  return result
}

/*TaskInfo Storage*/
export function setTaskInfo(value: any) {
  if (!window.dev_info) {
    window.dev_info = {}
  }
  window.dev_info.task_info = value
}

export function getTaskInfo() {
  return window.dev_info.task_info
}

export function setTask(key: string, value: any) {
  const win = window
  if (win.dev_info.task_info === undefined) {
    win.dev_info.task_info = {}
  }
  win.dev_info.task_info[key] = value
}

export function getTask(key: string, value: any) {
  const win = window

  if (win.dev_info.task_info === undefined) {
    win.dev_info.task_info = {}
  }
  const result = win.dev_info.task_info[key]
  if (result === undefined) {
    return value
  }
  return result
}

export function getNpcTaskInfo(name: string, key: string, value = undefined) {
  const result = getTask(name, {})[key]
  if (result === undefined) {
    return value
  }
  return result
}

export function setMouseNotInGame(value: boolean) {
  setTask("mouseOverMenu", value)
}

export function getMouseNotInGame() {
  return getTask("mouseOverMenu", false)
}

export function setNpcTaskInfo(name: string, key: string, value: any) {
  getTask(name, {})[key] = value
}

export function setPromptFlowNode(value: PromptFlowNode | undefined) {
  setTask("flowing", value)
}

export function getPromptFlowNode() {
  return getTask("flowing", undefined) as PromptFlowNode
}

export function getObjectValue(object: any, key: string, value = undefined) {
  if (object === undefined) {
    return value
  }

  const result = object[key]
  if (result === undefined) {
    return value
  }
  return result;
}

export function setObjectValue(object: any, key: string, value: any) {
  return object[key] = value
}

export function getTaskNodeValue(name: string, key: string, value = undefined) {
  const result = getTask(name, {})[key]
  if (result === undefined) {
    return value
  }
  return getTask(name, {})[key]
}

export function setTaskNodeValue(name: string, key: string, value: any) {
  if (!getTask(name, undefined)) {
    setTask(name, {})
  }
  return getTask(name, undefined)[key] = value
}

export function getLayoutRight() {
  return getStore("editor_layout_right", false)
}

export function setRealYamlGenerating(value: any) {
  // console.trace("setRealYaml: " + value)
  getPromptLib()[getRealYamlKey()] = value
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
  return getStore("editor_focus", "Yaml")
}

export function setEditorGenerateEnable(value: boolean) {
  setStore("editor_generate_enable", value)
}

export function isEditorGenerateEnable() {
  return getStore("editor_generate_enable", false)
}

export function setDupAgentYaml(value: any) {
  setStore("duplicate_agent_yaml", value)
}

export function getDupAgentYaml() {
  return getStore("duplicate_agent_yaml", false)
}

export function resetHistory() {
  return setStore("history_reset", true)
}

export function isHookedResponse(type: string) {
  let result
  switch (type) {
    case "reset":
      result = getAgentReset()
      setAgentReset(false)
      break
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

export function getEditorGenerateContent() {
  return getStore("generate_content", "")
}

export function setEditorGenerateTime(value: any) {
  setStore("generate_content_time", value)
}

export function getEditorGenerateTime() {
  return getStore("generate_content_time", 0)
}

export function setEditorInstance(value: any) {
  setStore("generate_content_instance", value)
}

export function getEditorInstance() {
  return getStore("generate_content_instance", undefined)
}

export function finishEditorGenerate() {
  setEditorGenerateContent("")
  setStore("generate_refresh", false)
}

export function setFindTabTime(value: any) {
  setStore("proxy_find_time", value)
}

export function getFindTabTime() {
  return getStore("proxy_find_time", 0)
}

export function setPrompts(prompts: any) {
  // console.trace("setPrompts: " + prompts)
  setStore("prompts", prompts)
}

export function getGameVilleYaml() {
  return getPromptValue("the Ville")
}

export function getPromptValue(key: any) {
  return getPromptLib()[key]
}

export function setPromptValue(key: string, value: any) {
  getPromptLib()[key] = value
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

export function setResponseType(value: any) {
  setStore("response_type", value)
}

export function setResponseStream(value: any) {
  setStore("response_update_text", value)
  if (getEditorStatus() && isEditorGenerateEnable()){
    setEditorGenerateContent(value)
  }
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
  console.trace("setAgentReset")
  setStore("agent_reset", value)
  if (value) {
    setStore("yaml_update", true)
  }
}

export function getAgentReset() {
  return getStore("agent_reset", false)
}

export function isGameWindow() {
  return getStore("gameModeEnable", false)
}

export function setGameWindow(enable: boolean) {
  return setStore("gameModeEnable", enable)
}

export function getBotId() {
  return getStore("botid", "chatgpt")
}

export function setBotId(botid: string) {
  return setStore("botid", botid)
}

export function getStep() {
  return getStore("player_step", 0)
}

export function setStep(step: number) {
  return setStore("player_step", step)
}

export function getMouseAgent() {
  return getStore("mouse_agent", "")
}

export function setMouseAgent(value: string) {
  return setStore("mouse_agent", value)
}

export function getPlayerMark() {
  return getStore("player_mark", "")
}

export function setPlayerMark(value: string) {
  setStore("player_mark", value)
  setRealYamlKey(value)
}

export function isChatMode() {
  return getStore("workFlowingDisable", true)
}

export function setChatMode(enable: boolean) {
  return setStore("workFlowingDisable", enable)
}

export function isGamePause() {
  return getStore("game_pause", false)
}

export function setGamePause(value: boolean) {
  return setStore("game_pause", value)
}
