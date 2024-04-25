import {ChatDevLocalTransformersEmbeddings} from "~embedding/chatdev_local_transformers";
import {HuggingFaceTransformersEmbeddings} from "langchain/embeddings/hf_transformers";
import {TimeWeightedVectorStoreRetriever} from "langchain/retrievers/time_weighted";
import {MemoryVectorStore} from "langchain/vectorstores/memory";
import {CharacterTextSplitter, RecursiveCharacterTextSplitter, TokenTextSplitter} from "langchain/text_splitter";
import store from "store2";
import Browser from "webextension-polyfill";
import {Prompt} from "~services/prompts";
import {getVersion, uuid} from "~utils";
import {
  getStore,
  setResponseStream,
  setResponseType,
  setStore
} from "~services/storage/memory-store";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {initPromptFromFile} from "~utils/prompt";
import Jquery from "jquery";
import {Readability} from "@mozilla/readability";
import {DevInfo, DevInfoPersist} from "~types/global";

export async function initObjectFormTransforms() {
  const win = window
  // transformers.
  win.CharacterTextSplitter = CharacterTextSplitter
  win.RecursiveCharacterTextSplitter = RecursiveCharacterTextSplitter
  win.TokenTextSplitter = TokenTextSplitter

  // embedding.
  win.HuggingFaceTransformersEmbeddings = HuggingFaceTransformersEmbeddings

  const embedding = new ChatDevLocalTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
  });
  const vectorStore = new MemoryVectorStore(embedding)
  win.embedding = embedding

  win.retriever = new TimeWeightedVectorStoreRetriever({
    vectorStore,
    memoryStream: [],
    searchKwargs: 2,
    k: 2,
  });
  win.vectorStore = vectorStore

  // vector store.
  win.MemoryVectorStore = MemoryVectorStore

  // retriever.
  win.TimeWeightedVectorStoreRetriever = TimeWeightedVectorStoreRetriever
}

export async function initForWinStore() {
  await initObjectFormTransforms()

  let devInfoPersist = store.get("dev_info")
  if (devInfoPersist == null) {
    devInfoPersist = {} as DevInfoPersist
  }

  window.dev_info = devInfoPersist

  setStore("player_name", store.get("player_name") != null?"ChatDev": store.get("player_name"))
  setStore("i18nextLng", store.get("i18nextLng") == null ? "en" : store.get("i18nextLng"))

  window.$ = Jquery
  window.Readability = Readability

  await initPromptFromFile()
  setStore("yaml_update", true)
}

export async function initForWinStoreOfWeb() {
  let devInfoPersist = store.get("dev_info")
  if (devInfoPersist == null) {
    devInfoPersist = {} as DevInfoPersist
  }
  window.dev_info = devInfoPersist
}

export async function handlePersistentStorage() {
  const storageTimes = getStore("storage_times", 0)
  const win = window
  if (win.dev_info != undefined && storageTimes % 4 == 0) { // 4s check once
    store.set("dev_info", {
      prompts: win.dev_info.prompts,
      botId: win.dev_info.botId,
      player_pos: win.dev_info.player_pos,
      player_name: win.dev_info.player_name,
      player_init: win.dev_info.player_init,
      editor_yaml: win.dev_info.editor_yaml,
      editor_func: win.dev_info.editor_func,
      editor_layout_right: win.dev_info.editor_layout_right,
      workFlowingDisable: win.dev_info.workFlowingDisable,
      gameModeEnable: win.dev_info.gameModeEnable,
      flow_edges: win.dev_info.flow_edges,
      flow_nodes: win.dev_info.flow_nodes,
      version: win.dev_info.version,
      real_yaml: win.dev_info.real_yaml,
      embedding_msg_list: win.dev_info.embedding_msg_list,
      embedding_doc_list: win.dev_info.embedding_doc_list
    })

    const prompts = win.dev_info.prompts
    if (prompts != undefined && Object.keys(prompts).length > 1) {
      await writePromptsToBrowserStorage(prompts)
    }
  }
  setStore("storage_times", storageTimes + 1)
}

export async function writePromptsToBrowserStorage(windowStoragePrompts: any) {
  const {prompts: prompts_value} = await Browser.storage.local.get('prompts')

  const browser_storage_prompt_list: { [key: string]: string } = {};
  const new_browser_storage_prompt_list = [] as Prompt[]

  // if some prompt remove.
  ((prompts_value || []) as Prompt[]).forEach(item => {
    if (item.title in windowStoragePrompts){
      item.prompt = windowStoragePrompts[item.title]
      new_browser_storage_prompt_list.push(item)
    }
  });

  // if new prompt add.
  for (const [key, value] of Object.entries(windowStoragePrompts)) {
    if (browser_storage_prompt_list[key] == undefined) {
      const item = {
        id: uuid(),
        title: key,
        prompt: value
      } as Prompt;
      new_browser_storage_prompt_list.push(item)
    }
  }

  // update the browser storage.
  await Browser.storage.local.set({new_browser_storage_prompt_list})

}
