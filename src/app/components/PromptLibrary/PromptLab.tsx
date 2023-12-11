import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {BeatLoader} from 'react-spinners'
import useSWR from 'swr'
import {getStore, loadRemotePrompts, loadYaml, PromptLab, setStore} from '~services/prompts'
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
    author: string
    share: string
}) => {
    const {t} = useTranslation()
    const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
    const [workFlowingDisable, setWorkFlowingDisable] = useAtom(workFlowingDisableAtom)
    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
    const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
    const [showAssistant, setShowAssistant] = useAtom(showGptsDialogAtom)
    const confirmTips = t('Are you sure you want to import the GPTs?')
    const successTips = t('Imported GPTs successfully')

    const importToFlowYaml = useCallback(() => {
        if (!window.confirm(confirmTips)) {
            return
        }
        loadYaml(props.share).then(promptYaml => {
            try {
                importFromText(JSON.parse(promptYaml.yaml)).then(() => {
                    setShowAssistant(false)
                    setSeminarDisable(false)
                    setWorkFlowingDisable(false)

                    const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
                    setEditorYamlTimes(editorYamlTimes)
                    setStore("editorYamlTimes", editorYamlTimes)

                    alert(successTips)
                })
            }catch (e) {
                alert(e)
            }
        })
    }, [props])

    const detailShow = useCallback(() => {

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
                <a target="_blank" href={"https://chatdev.toscl.com/s/" + props.share} rel="noreferrer">
                    <ActionButton text={t('detail')} onClick={detailShow}/>
                </a>
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
            </div>): (
            <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
                You have no prompts.
            </div>
        )}
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
