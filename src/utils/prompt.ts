import {getVersion, uuid} from "~utils/index";
import chatdev_prompt_flow from "~assets/chatdev_gpts_all.json";
import chatdev_prompt_overwrite from "~assets/chatdev_gpts_overwrite.json";
import Browser from "webextension-polyfill";
import {trackEvent} from "~app/plausible";
import {getStore, setPrompts, setStore} from "~services/storage/memory-store";
import {Prompt} from "~services/prompts";

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
        if (historyVersion.startsWith("1.0")
          || historyVersion.startsWith("1.1")
          || historyVersion.startsWith("1.2")
          || historyVersion.startsWith("1.3")
          || historyVersion.startsWith("1.4")) {
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
