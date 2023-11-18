import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BeatLoader} from 'react-spinners'
import useSWR from 'swr'
import {loadRemotePrompts, PromptLab} from '~services/prompts'
import {GoBook} from "react-icons/go";
import {importFromText} from "~app/utils/export";
import {useAtom} from "jotai/index";
import {
    editorPromptTimesAtom,
    editorYamlTimesAtom,
    seminarDisableAtom, showGptsDialogAtom,
    sidebarCollapsedAtom,
    workFlowingDisableAtom
} from "~app/state";

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
    yaml: JSON
}) => {
    const {t} = useTranslation()
    const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
    const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)
    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
    const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
    const [showAssistant, setShowAssistant] = useAtom(showGptsDialogAtom)

    const importToFlowYaml = useCallback(() => {
        if (!window.confirm('Are you sure you want to import the GPTs?')) {
            return
        }
        importFromText(props.yaml).then(() => {
            setShowAssistant(false)
            setSeminarDisable(false)
            setWorkFlowingDisable(false)
            setEditorYamlTimes(editorYamlTimes + 1)
            alert('Imported GPTs successfully')
        })
    }, [props])

    return (
        <div
            className="group relative flex items-center space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400">
            <div className="min-w-0 flex-1">
                <p title={props.title}
                   className="truncate text-sm font-semibold text-primary-text italic pl-1">{props.title}</p>
                <div className="text-primary-text line-clamp-1 prompt-intro">{props.intro}</div>
            </div>
            <div className="flex flex-row gap-1">
                <ActionButton text={t('Import')} onClick={importToFlowYaml}/>
            </div>
        </div>
    )
}

function CommunityPrompts() {
    const promptsQuery = useSWR('community-prompts', () => loadRemotePrompts(), {suspense: true})

    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                {promptsQuery.data.map((promptLab, index) => (
                    <PromptLabItem
                        key={index}
                        title={promptLab.title}
                        intro={promptLab.intro}
                        yaml={promptLab.yaml}
                    />
                ))}
            </div>
        </>
    )
}

const PromptLab = () => {

    return (
        <Suspense fallback={<BeatLoader size={10} className="mt-5" color="rgb(var(--primary-text))"/>}>
            <CommunityPrompts/>
        </Suspense>
    )
}

export default PromptLab
