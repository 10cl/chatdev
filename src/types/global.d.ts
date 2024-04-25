import {ChatDevLocalTransformersEmbeddings} from "~embedding/chatdev_local_transformers";
import {Readability} from "@mozilla/readability";
import {Terminal} from "xterm";

interface DevInfoPersist {
  prompts: any;
  botid: string;
  player_pos: string;
  player_name: string;
  player_init: string; // game mode: step.
  editor_yaml: JSON;  // default editor Size.
  editor_func: JSON;  // default editor Size.
  editor_layout_right: boolean;
  workFlowingDisable: boolean;
  gameModeEnable: boolean;
  flow_edges: any;
  flow_nodes: any;
  version: string;
  real_yaml: string;
  embedding_msg_list: [];
  embedding_doc_list: [];
}

interface DevInfo {
  prompts?: any;
  botid: string;
  prompt_welcome?: any;
  prompt_welcome_intro?: any;
  prompt_flow_open?: any;
  prompt_flow_close?: any;
  prompt_flow_done?: any;
  response_type?: string;
  editor_yaml?: JSON;
  editor_func?: JSON;
  editor_layout_right: boolean;
  flow_node?: any;
  flow_edge?: any;
  player_pos?: string;
  i18nextLng?: string;
  player_name?: string;
  player_init?: any;
  workFlowingDisable?: boolean;
  gameModeEnable?: boolean;
  flow_edges?: any;
  flow_nodes?: any;
  version?: string;
  real_yaml?: string;
  editor_show?: boolean;
  embedding_msg_list?: [];
  embedding_doc_list?: [];
}

declare global {
  interface Window {
    $: JQueryStatic;
    Readability: typeof Readability;

    /* npc movement data of generative agent dev*/
    movement?: JSON;
    player: PlayerGlobal

    /* store of chatdev status */
    dev_info?: any;

    /* tools of langchain */
    retriever?: TimeWeightedVectorStoreRetriever;
    chat_retriever?: TimeWeightedVectorStoreRetriever;
    vectorStore?: MemoryVectorStore;
    embedding?: ChatDevLocalTransformersEmbeddings;
    CharacterTextSplitter?: typeof CharacterTextSplitter;
    RecursiveCharacterTextSplitter?: typeof RecursiveCharacterTextSplitter;
    TokenTextSplitter?: typeof TokenTextSplitter;
    HuggingFaceTransformersEmbeddings?: typeof HuggingFaceTransformersEmbeddings;
    MemoryVectorStore?: typeof MemoryVectorStore;
    TimeWeightedVectorStoreRetriever?: typeof TimeWeightedVectorStoreRetriever;
  }
}
