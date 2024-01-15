import React, {FC, useCallback, useState} from 'react'
import {ChatMessageModel} from '~types'
import Button from '../Button'
import {Input} from '../Input'
import {useTranslation} from "react-i18next";
import {Prompt, saveLocalPrompt} from "~services/prompts";
import {
  getPromptValue, getRealYaml,
  getStore, setEditorStatus,
  setRealYaml,
  setRealYamlKey,
  setStore
} from "~services/storage/memory-store";
import {trackEvent} from "~app/plausible";
import {uuid} from "~utils";
import {useAtom} from "jotai/index";
import {
  editorPromptAtom,
  editorPromptTimesAtom,
  editorYamlTimesAtom, gameModeEnable,
  isNewAgentShowAtom,
  showEditorAtom
} from "~app/state";
import {toast} from "react-hot-toast";

interface Props {
  messages: ChatMessageModel[]
  duplicate: boolean
}

const NewAgentView: FC<Props> = ({messages, duplicate}) => {
  const [creating, setCreating] = useState(false)
  const {t} = useTranslation()
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [isNewAgentShow, setNewAgentDialog] = useAtom(isNewAgentShowAtom)
  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)

  const createAgent = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const formdata = new FormData(e.currentTarget)
      const json = Object.fromEntries(formdata.entries())
      const agentName = json.agent_name as string
      if (agentName) {
        setCreating(true)
        try {
          // duplicate agent name not save.
          if (getPromptValue(agentName) == undefined) {
            if (duplicate){
              await saveLocalPrompt({
                id: uuid(),
                title: agentName,
                prompt: getRealYaml(),
                type: "yaml"
              })
            }else{
              await saveLocalPrompt({
                id: uuid(),
                title: agentName,
                prompt: "#TODO: defined your Agent structure for:" + agentName + "\n" + getPromptValue("Action_YAML_Template"),
                type: "yaml"
              })
            }
          }
          setRealYamlKey(agentName)
          if (!duplicate){
            setEditorPrompt("Action_Prompt_Template");

            setEditorPromptTimes(editorPromptTimes + 1)
            setShowEditor(true)
            setEditorStatus(true)

            const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
            setEditorYamlTimes(editorYamlTimes)
            setStore("editorYamlTimes", editorYamlTimes)

            setGameModeEnable(false)
            setStore("gameModeEnable", false)
          }
        } finally {
          setCreating(false)
          setNewAgentDialog(false)
          toast.success(agentName + ' Created successfully!', {
            position: "top-center"
          })
        }
      }
    },
    [messages, duplicate],
  )

  return (
    <div className="p-5 flex flex-col gap-5 h-full">
      <form className="flex flex-col gap-2 w-full" onSubmit={createAgent}>
        <div>
          <p className="font-bold mb-1 text-lg">{t('Agent Name')}</p>
          <div className="flex flex-row gap-3">
            <Input className="w-full" name="agent_name" id="agent_name"/>
          </div>
        </div>
        <div className="flex flex-row gap-3">
          <Button text={duplicate? t("Duplicate"): t("Create")} size="small" color="primary" type="submit" isLoading={creating}/>
        </div>
      </form>
    </div>
  )
}

export default NewAgentView
