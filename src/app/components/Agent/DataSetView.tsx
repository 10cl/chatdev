import {FC, ReactElement, Suspense, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BeatLoader} from 'react-spinners'
import useSWR from 'swr'
import {loadRemotePrompts, loadYaml, PromptLab, removeLocalPrompt} from '~services/prompts'
import {GoBook} from "react-icons/go";
import {importFromText} from "~app/utils/export";
import {useAtom} from "jotai/index";
import Tabs, {Tab} from '../Tabs'
import {Toaster, toast} from "react-hot-toast";

import {
  editorPromptAtom,
  editorPromptTimesAtom,
  editorYamlTimesAtom, gameModeEnable,
  seminarDisableAtom, showEditorAtom, showGptsDialogAtom,
  workFlowingDisableAtom
} from "~app/state";
import {trackEvent} from "~app/plausible";
import {getStore, setRealYamlKey, setStore} from "~services/storage/memory-store";
import {BotId} from "~app/bots";
import {ChatMessageModel} from "~types";
import {ConversationContext} from "~app/context";
import closeIcon from "~assets/icons/close.svg";
import {toBase64} from "js-base64";
import Browser from "webextension-polyfill";

const ActionButton = (props: { text: string; onClick: () => void }) => {
  return (
    <a
      className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
      onClick={props.onClick}
    >
      {props.text}
    </a>
  )
}

const PromptLabItem = (props: {
  title: string
  index: number
}) => {
  const {t} = useTranslation()
  const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
  const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)
  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
  const [showAssistant, setShowAssistant] = useAtom(showGptsDialogAtom)
  const confirmTips = t('Are you sure you want to import the Agent?')
  const successTips = t('Imported Agent successfully')
  const successEditTips = t('Import succeeded. Do you need to edit?')
  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)
  const conversation = useContext(ConversationContext)


  async function remove(){
    const url = props.title
    const embeddingKey = `embedding:${toBase64(url)}}`
    const docKey = `embedding_doc:${toBase64(url)}}`

    await Browser.storage.local.remove(embeddingKey)
    await Browser.storage.local.remove(docKey)

    const docList = getStore("embedding_doc_list", []) as string[]
    setStore("embedding_doc_list", docList.filter((doc) => doc != url))
  }

  return (
    <div
      className="group relative flex items-center space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400">
      <div className="min-w-0 flex-1">
        <p title={props.title}
           className="truncate text-sm font-semibold text-primary-text pl-1">{props.title}</p>
        {/*<div title={props.title} className="text-primary-text line-clamp-1 prompt-intro">{props.title}</div>*/}
      </div>
      <img
          src={closeIcon}
          className="hidden group-hover:block absolute right-[-8px] top-[-8px] cursor-pointer w-4 h-4 rounded-full bg-primary-background"
          onClick={remove}
      />
    </div>
  )
}
function EmbeddingDocs() {
  const docList = getStore("embedding_doc_list", []) as string[]
  const renderItems = () => {
    const items = [] as ReactElement[]
    docList.forEach((item, index) => {
      items.push(<PromptLabItem key={index} index={index} title={item}/>);
    });
    return items;
  };

  return (
    <>{docList.length > 0 && docList[0] ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        {renderItems()}
      </div>) : (
      <div
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
        There is no knowledge.
      </div>
    )}
    </>
  )
}

const DataSetView = () => {

  return (
      <Suspense fallback={<BeatLoader size={10} className="mt-5" color="rgb(var(--primary-text))"/>}>
        <EmbeddingDocs/>
      </Suspense>
  )
}

export default DataSetView
