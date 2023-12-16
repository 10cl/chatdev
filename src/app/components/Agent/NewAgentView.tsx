import React, { FC, useCallback, useState } from 'react'
import { ChatMessageModel } from '~types'
import Button from '../Button'
import {Input} from '../Input'
import {useTranslation} from "react-i18next";
import {getStore, Prompt, saveLocalPrompt, setStore} from "~services/prompts";
import {trackEvent} from "~app/plausible";
import {uuid} from "~utils";
import {useAtom} from "jotai/index";
import {
    editorPromptAtom,
    editorPromptTimesAtom,
    editorYamlTimesAtom,
    isNewAgentShowAtom,
    showEditorAtom
} from "~app/state";

interface Props {
    messages: ChatMessageModel[]
}

const NewAgentView: FC<Props> = ({ messages }) => {
    const [creating, setCreating] = useState(false)
    const { t } = useTranslation()
    const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
    const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
    const [showEditor, setShowEditor] = useAtom(showEditorAtom)
    const [isNewAgentShow, setNewAgentDialog] = useAtom(isNewAgentShowAtom)

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
                    // setEditorPrompt("Flow_Dag_Yaml")
                    setStore("real_yaml", agentName)
                    // duplicate agent name not save.
                    if(getStore("prompts")[agentName] == undefined){
                        await saveLocalPrompt({ id: uuid(), title: agentName, prompt: getStore("prompts")["Action_YAML_Template"], type: "yaml" })
                    }
                    setEditorPrompt("Action_Prompt_Template");

                    setEditorPromptTimes(editorPromptTimes + 1)
                    setShowEditor(true)
                    setStore("editor_show", true)

                    const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
                    setEditorYamlTimes(editorYamlTimes)
                    setStore("editorYamlTimes", editorYamlTimes)

                } finally {
                    setCreating(false)
                    setNewAgentDialog(false)
                }
            }
        },
        [messages],
    )

    return (
        <div className="p-5 flex flex-col gap-5 h-full">
            <form className="flex flex-col gap-2 w-full" onSubmit={createAgent}>
                <div>
                    <p className="font-bold mb-1 text-lg">{t('Agent Name')}</p>
                    <div className="flex flex-row gap-3">
                        <Input className="w-full" name="agent_name" id="agent_name" />
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <Button text="Create" size="small" color="primary" type="submit" isLoading={creating}/>
                </div>
            </form>
        </div>
    )
}

export default NewAgentView
