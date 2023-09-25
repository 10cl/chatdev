import {FC, useCallback} from 'react'
import cx from 'classnames'
import './main.css'
import React from "react";
import {useTranslation} from "react-i18next";
import useSWR from "swr";
import {loadLocalPrompts, Prompt, saveLocalPrompt} from "~services/prompts";
import {trackEvent} from "~app/plausible";
import AceEditor from "react-ace";
import Button from "~app/components/Button";

interface Props {
    setShowEditor: (show: boolean) => void;
    className?: string
}


function PromptForm(props: { initialData: Prompt[];onSubmit: (data: Prompt) => void; setShowEditor: (show: boolean) => void;  }) {
    const { t } = useTranslation()
    function getFlowYaml() {
        for (let i = 0; i < props.initialData.length; i++) {
            if (props.initialData[i].title == "Flow_Dag_Yaml") {
                return props.initialData[i].prompt;
            }
        }
        return "";
    }

    function onChange(value: string) {
        let prompt = null

        for (let i = 0; i < props.initialData.length; i++) {
            if (props.initialData[i].title == "Flow_Dag_Yaml") {
                prompt = props.initialData[i];
            }
        }
        if (prompt !== null){
            prompt.prompt = value
        }
    }

    function onSubmitInfo() {
        let prompt = null
        for (let i = 0; i < props.initialData.length; i++) {
            if (props.initialData[i].title == "Flow_Dag_Yaml") {
                prompt = props.initialData[i];
            }
        }
        if (prompt !== null){
            props.onSubmit(prompt)
        }
        props.setShowEditor(false)
    }

    return (
        <div className="overflow-auto h-full flex flex-col ">
            <AceEditor
                mode="yaml"
                theme="github"
                name="prompt"
                width="100%"
                height="100%"
                onChange={onChange}
                defaultValue={getFlowYaml()}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                    useWorker: false,
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true
                }}
            />
            <div className="flex flex-row-reverse items-center mx-10 gap-3">
                <Button color="primary" text={t('Save')} className="w-fit" size="small" onClick={onSubmitInfo}/>
                <Button color="flat" text={t('Cancel')} className="w-fit" size="small" onClick={() => props.setShowEditor(false)} />
            </div>
        </div>
    )
}

const LocalPrompts: FC<Props> = (props) => {
    const { t } = useTranslation()
    const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), { suspense: true })

    const savePrompt = useCallback(
        async (prompt: Prompt) => {
            const existed = await saveLocalPrompt(prompt)
            await localPromptsQuery.mutate()
            trackEvent(existed ? 'edit_local_prompt' : 'add_local_prompt')
        },
        [localPromptsQuery],
    )

    return (
        <div className={cx("overflow-hidden h-full ", props.className)}>
            <PromptForm initialData={localPromptsQuery.data} onSubmit={savePrompt} setShowEditor={props.setShowEditor}/>
        </div>
    )
}

export default LocalPrompts
