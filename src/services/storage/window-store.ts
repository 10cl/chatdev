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
  initPromptFromFile,
  setResponseStream,
  setResponseType,
  setStore
} from "~services/storage/memory-store";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface DevInfoPersist {
  prompts: any;
  player_pos: string;
  player_name: string;
  player_init: string;
  workFlowingDisable: boolean;
  gameModeEnable: boolean;
  flow_edges: any;
  flow_nodes: any;
  version: string;
  prompt_version: string;
  real_yaml: string;
  embedding_msg_list: [];
  embedding_doc_list: [];
}

interface DevInfo {
  prompts: any;
  prompt_welcome: any;
  prompt_welcome_intro: any;
  prompt_flow_open: any;
  prompt_flow_close: any;
  prompt_flow_done: any;
  response_type: string;
  flow_node: any;
  flow_edge: any;
  player_pos: string;
  i18nextLng: string;
  player_name: string;
  player_init: any;
  workFlowingDisable: boolean;
  gameModeEnable: boolean;
  flow_edges: any;
  flow_nodes: any;
  version: string;
  prompt_version: string;
  real_yaml: string;
  editor_show: boolean;
  embedding_msg_list: [];
  embedding_doc_list: [];
}

interface Window {
  /* quick use for editor */
  retriever?: TimeWeightedVectorStoreRetriever;
  chat_retriever?: TimeWeightedVectorStoreRetriever;
  vectorStore?: MemoryVectorStore;
  embedding?: ChatDevLocalTransformersEmbeddings;
  dev_info?: DevInfo;
  /* global type for `window`. */
  CharacterTextSplitter?: typeof CharacterTextSplitter;
  RecursiveCharacterTextSplitter?: typeof RecursiveCharacterTextSplitter;
  TokenTextSplitter?: typeof TokenTextSplitter;
  HuggingFaceTransformersEmbeddings?: typeof HuggingFaceTransformersEmbeddings;
  MemoryVectorStore?: typeof MemoryVectorStore;
  TimeWeightedVectorStoreRetriever?: typeof TimeWeightedVectorStoreRetriever;
}

export async function initObjectFormTransforms() {
  const win = window as Window
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
  const win = window as Window
  await initObjectFormTransforms()

  let devInfoPersist = store.get("dev_info") as DevInfoPersist
  if (devInfoPersist == null) {
    devInfoPersist = {} as DevInfoPersist
  }
  let cacheDevInfo = win.dev_info
  if (cacheDevInfo == undefined) {
    cacheDevInfo = {} as DevInfo
  }
  if (store.get("player_name") != null) {
    cacheDevInfo.player_name = store.get("player_name")
    devInfoPersist.player_name = store.get("player_name")
  }

  setStore("prompts", devInfoPersist.prompts == undefined ? {} : devInfoPersist.prompts)
  setResponseType(cacheDevInfo.response_type !== undefined ? cacheDevInfo.response_type : "")
  setStore("flow_node", cacheDevInfo.flow_node !== undefined ? cacheDevInfo.flow_node : {})
  setStore("flow_edge", cacheDevInfo.flow_edge !== undefined ? cacheDevInfo.flow_edge : {})
  setStore("player_pos", cacheDevInfo.player_pos !== undefined ? cacheDevInfo.player_pos : devInfoPersist.player_pos)
  setStore("i18nextLng", store.get("i18nextLng") == null ? "en" : store.get("i18nextLng"))
  setStore("player_name", cacheDevInfo.player_name !== undefined ? cacheDevInfo.player_name : (devInfoPersist.player_name == undefined ? "ChatDev" : devInfoPersist.player_name))
  setStore("player_init", cacheDevInfo.player_init !== undefined ? cacheDevInfo.player_init : (devInfoPersist.player_init == undefined ? 0 : devInfoPersist.player_init))
  setStore("workFlowingDisable", cacheDevInfo.workFlowingDisable !== undefined ? cacheDevInfo.workFlowingDisable : (devInfoPersist.workFlowingDisable == undefined ? false : devInfoPersist.workFlowingDisable))
  setStore("gameModeEnable", cacheDevInfo.gameModeEnable !== undefined ? cacheDevInfo.gameModeEnable : (devInfoPersist.gameModeEnable == undefined ? true : devInfoPersist.gameModeEnable))
  setStore("flow_edges", cacheDevInfo.flow_edges !== undefined ? cacheDevInfo.flow_edges : devInfoPersist.flow_edges)
  setStore("flow_nodes", cacheDevInfo.flow_nodes !== undefined ? cacheDevInfo.flow_nodes : devInfoPersist.flow_nodes)
  setStore("version", cacheDevInfo.version !== undefined ? cacheDevInfo.version : (devInfoPersist.version == undefined ? getVersion() : devInfoPersist.version))
  setStore("prompt_version", cacheDevInfo.prompt_version !== undefined ? cacheDevInfo.prompt_version : (devInfoPersist.prompt_version == undefined ? getVersion() : devInfoPersist.prompt_version))
  setStore("real_yaml", cacheDevInfo.real_yaml !== undefined ? cacheDevInfo.real_yaml : (devInfoPersist.real_yaml == undefined ? "Default_Flow_Dag_Yaml" : devInfoPersist.real_yaml))
  setStore("embedding_msg_list", cacheDevInfo.embedding_msg_list !== undefined ? cacheDevInfo.embedding_msg_list : (devInfoPersist.embedding_msg_list == undefined ? [] : devInfoPersist.embedding_msg_list))
  setStore("embedding_doc_list", cacheDevInfo.embedding_doc_list !== undefined ? cacheDevInfo.embedding_doc_list : (devInfoPersist.embedding_doc_list == undefined ? [] : devInfoPersist.embedding_doc_list))

  await initPromptFromFile()
  setStore("yaml_update", true)
}

export async function handlePersistentStorage() {
  const storageTimes = getStore("storage_times", 0)
  const win = window as Window
  if (win.dev_info != undefined && storageTimes / 4 == 0) { // 4s check once
    store.set("dev_info", {
      prompts: win.dev_info.prompts,
      player_pos: win.dev_info.player_pos,
      player_name: win.dev_info.player_name,
      player_init: win.dev_info.player_init,
      workFlowingDisable: win.dev_info.workFlowingDisable,
      gameModeEnable: win.dev_info.gameModeEnable,
      flow_edges: win.dev_info.flow_edges,
      flow_nodes: win.dev_info.flow_nodes,
      version: win.dev_info.version,
      prompt_version: win.dev_info.prompt_version,
      real_yaml: win.dev_info.real_yaml,
      embedding_msg_list: win.dev_info.embedding_msg_list,
      embedding_doc_list: win.dev_info.embedding_doc_list
    } as DevInfoPersist)

    const prompts = win.dev_info.prompts
    if (prompts != undefined && Object.keys(prompts).length > 1) {
      await handleBrowserStorage(prompts)
    }
  }
  setStore("storage_times", storageTimes + 1)
}

export async function handleBrowserStorage(prompts: any) {
  const {prompts: prompts_value} = await Browser.storage.local.get('prompts')
  const browser_prompt_dict: { [key: string]: string } = {};
  const add_prompts = [] as Prompt[]

  ((prompts_value || []) as Prompt[]).forEach(item => {
    if (prompts[item.title] == undefined) {
      prompts[item.title] = item.prompt
    }
    browser_prompt_dict[item.title] = item.prompt
  });

  for (const [key, value] of Object.entries(prompts)) {
    if (browser_prompt_dict[key] == undefined) {
      const item = {
        id: uuid(),
        title: key,
        prompt: value
      } as Prompt;
      add_prompts.push(item)
    }
  }
  if (add_prompts.length > 0) {
    ((add_prompts || []) as Prompt[]).forEach(item => {
      prompts_value.unshift(item)
    })
    await Browser.storage.local.set({prompts_value})
  }
}
