import {Suspense, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BeatLoader} from 'react-spinners'
import useSWR from 'swr'
import closeIcon from '~/assets/icons/close.svg'
import {trackEvent} from '~app/plausible'
import {
  Prompt,
  loadLocalPrompts,
  removeLocalPrompt
} from '~services/prompts'
import {uuid} from '~utils'
import Button from '../Button'
import {Input, Textarea} from '../Input'
import Tabs, {Tab} from '../Tabs'
import {GoBook} from "react-icons/go";
import {useAtom} from "jotai/index";
import {
  editorPromptAtom,
  editorPromptTimesAtom,
  editorYamlTimesAtom, gameModeEnable,
  isNewAgentShowAtom, agentLocalDialogOpen,
  showEditorAtom
} from "~app/state";
import {getStore, setGameWindow, setRealYamlKey, setStore} from "~services/storage/memory-store";
import {toast} from "react-hot-toast";
import {ConversationContext} from "~app/context";
import {isAgentCanRemove} from "~utils/prompt";

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

const PromptItem = (props: {
  title: string
  prompt: string
  edit?: () => void
  remove?: () => void
  copyToLocal?: () => void
  insertPrompt: (text: string) => void
}) => {
  const {t} = useTranslation()
  const [saved, setSaved] = useState(false)

  const copyToLocal = useCallback(() => {
    props.copyToLocal?.()
    setSaved(true)
  }, [props])

  return (
    <div
      className="group relative flex items-center space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400">
      {props.title.indexOf("Profile_") != -1 && (
        <img src={("./assets/images/profile/" + props.title.replace("Profile_", "")) + ".png"} className="w-5 h-5"
             alt={props.title}/>
      )}
      {props.title.indexOf("Profile_") == -1 && (
        <GoBook size={22} color="#707070" className="cursor-pointer"/>
      )}
      <div className="min-w-0 flex-1">
        <p title={props.title + "\n" + props.prompt}
           className="truncate text-sm font-medium text-primary-text">{props.title}</p>
      </div>
      <div className="flex flex-row gap-1">
        {props.edit && <ActionButton text={t('Open')} onClick={props.edit}/>}
        {props.copyToLocal && <ActionButton text={t(saved ? 'Saved' : 'Save')} onClick={copyToLocal}/>}
      </div>
      {isAgentCanRemove(props.title)
        && props.remove && (
          <img
            src={closeIcon}
            className="hidden group-hover:block absolute right-[-8px] top-[-8px] cursor-pointer w-4 h-4 rounded-full bg-primary-background"
            onClick={props.remove}
          />
        )}
    </div>
  )
}

function LocalPrompts(props: { insertPrompt: (text: string) => void }) {
  const {t} = useTranslation()
  const [profile, setProfile] = useState(false)
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [isNewAgentShow, setNewAgentDialog] = useAtom(isNewAgentShowAtom)
  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useAtom(agentLocalDialogOpen)
  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)

  const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), {suspense: true})
  const conversation = useContext(ConversationContext)

  const removePrompt = useCallback(
    async (id: string) => {
      await removeLocalPrompt(id)
      localPromptsQuery.mutate()
      trackEvent('remove_local_prompt')
    },
    [localPromptsQuery],
  )

  const openAgent = useCallback(
    async (prompt: Prompt) => {
      setRealYamlKey(prompt.title)
      setEditorPrompt("Action_Prompt_Template");

      setIsPromptLibraryDialogOpen(false)
      setGameModeEnable(false)
      setGameWindow(false)
      setShowEditor(false)
      toast.success(t('Load success.'))
      conversation?.reset()
    },
    [localPromptsQuery],
  )

  return (
    <>
      {localPromptsQuery.data.length ? (
        <div className={"grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 "}>
          {localPromptsQuery.data.map((prompt) => ((prompt.type == "yaml" || prompt.prompt.indexOf("reference: ") != -1) &&
            <PromptItem
              key={prompt.id}
              title={prompt.title}
              prompt={prompt.prompt}
              edit={() => openAgent(prompt)}
              remove={() => removePrompt(prompt.id)}
              insertPrompt={props.insertPrompt}
            />
          ))}
        </div>
      ) : (
        <div
          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
          You have no prompts.
        </div>
      )}
    </>
  )
}

const AgentLocal = (props: { insertPrompt: (text: string) => void }) => {
  const {t} = useTranslation()

  const insertPrompt = useCallback(
    (text: string) => {
      props.insertPrompt(text)
      trackEvent('use_prompt')
    },
    [props],
  )

  return (
    <Suspense fallback={<BeatLoader size={10} className="mt-5" color="rgb(var(--primary-text))"/>}>
      <LocalPrompts insertPrompt={insertPrompt}/>
    </Suspense>
  )
}

export default AgentLocal
