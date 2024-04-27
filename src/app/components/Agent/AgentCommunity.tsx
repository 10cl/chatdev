import {FC, Suspense, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BeatLoader} from 'react-spinners'
import useSWR from 'swr'
import {loadRemotePrompts, loadYaml, PromptLab} from '~services/prompts'
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
import {getStore, setChatMode, setGameWindow, setRealYamlKey, setStore} from "~services/storage/memory-store";
import {BotId} from "~app/bots";
import {ChatMessageModel} from "~types";
import {ConversationContext} from "~app/context";

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
  intro: string
  author: string
  share: string
}) => {
  const {t} = useTranslation()
  const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
  const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)
  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
  const [showAssistant, setShowAssistant] = useAtom(showGptsDialogAtom)
  const confirmTips = t('Importing the Agent will overwrite the current one. Proceed?')
  const successTips = t('Imported Agent successfully')
  const successEditTips = t('Import succeeded. Do you need to edit?')
  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)
  const conversation = useContext(ConversationContext)

  const importToFlowYaml = useCallback(() => {
    if (!window.confirm(confirmTips)) {
        return
    }
    setShowAssistant(false)
    setSeminarDisable(false)
    setWorkFlowingDisable(false)
    setChatMode(false)
    setShowEditor(false)

    setGameModeEnable(false)
    setGameWindow(false)

    setRealYamlKey("Default_Flow_Dag_Yaml")

    toast.promise(
      loadYaml(props.share).then(async promptYaml => {
        try {
          await importFromText(JSON.parse(promptYaml.yaml))
        } catch (e) {
          alert(e)
        }
      }),
      {
        loading: t('Load Agent...'),
        success: <b>{t('Load success.')}</b>,
        error: <b>{t('Load failed.')}</b>,
      }, {
        position: "top-center"
      }
    );
    conversation?.reset()
  }, [props])

  const detailShow = useCallback(() => {
    trackEvent("detail_show")
  }, [props])

  return (
    <div /*onClick={importToFlowYaml}*/
      className="group relative flex items-center space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400">
      <div className="min-w-0 flex-1">
        <p title={props.title}
           className="truncate text-sm font-semibold text-primary-text italic pl-1">{props.title}</p>
        <div title={props.intro} className="text-primary-text line-clamp-1 prompt-intro">{props.intro}</div>
      </div>
      <div className="flex flex-row gap-1">
        <a target="_blank" href={"https://chatdev.toscl.com/s/" + props.share} rel="noreferrer">
          <ActionButton text={t('detail')} onClick={detailShow}/>
        </a>
      </div>
      <div className="flex flex-row gap-1">
        <ActionButton text={t('Use')} onClick={importToFlowYaml}/>
      </div>
    </div>
  )
}
interface Props {
    tab: string
}
const CommunityPrompts: FC<Props> = (props) => {
  const promptsQuery = useSWR('community-prompts', () => loadRemotePrompts(props.tab), {suspense: true})

  return (
    <>{promptsQuery.data.length > 0 && promptsQuery.data[0] && promptsQuery.data[0].title ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        {promptsQuery.data.map((promptLab, index) => (
          <PromptLabItem
            key={index}
            title={promptLab.title}
            intro={promptLab.intro}
            author={promptLab.author}
            share={promptLab.share}
          />
        ))}
      </div>) : (
      <div
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
        There is no agent.
      </div>
    )}
    </>
  )
}

const AgentCommunity = () => {
  const {t} = useTranslation()

  const tabs = useMemo<Tab[]>(
    () => [
      {name: t('All'), value: ''},
      // {name: t('Tools'), value: 'tools'},
      // {name: t('Learning'), value: 'learning'},
      // {name: t('Advice'), value: 'advice'},
      // {name: t('NPC'), value: 'npc'},
    ],
    [t],
  )

  return (<Tabs tabs={tabs} renderTab={(tab: (typeof tabs)[0]['value']) => {
    return (
      <Suspense fallback={<BeatLoader size={10} className="mt-5" color="rgb(var(--primary-text))"/>}>
        <CommunityPrompts tab={tab}/>
      </Suspense>
    )
    }}
    />
  )
}

export default AgentCommunity
