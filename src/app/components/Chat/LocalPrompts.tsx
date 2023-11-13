import {FC, useCallback, useState} from 'react'
import cx from 'classnames'
import './main.css'
import React from "react";
import {useTranslation} from "react-i18next";
import useSWR from "swr";
import {loadLocalPrompts, Prompt, saveLocalPrompt, saveLocalPromptTitle} from "~services/prompts";
import {trackEvent} from "~app/plausible";
import AceEditor from "react-ace";
import Button from "~app/components/Button";
import {useAtom} from "jotai/index";
import {editorPromptAtom, editorPromptTimesAtom, editorYamlTimesAtom, showEditorAtom} from "~app/state";
import store from "store2";
import {Ace, EditSession, Range} from "ace-builds";
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-javascript';

import Browser from "webextension-polyfill";
import {BiExport, BiImport} from "react-icons/bi";
import {exportData, exportPromptFlow, importData, importPromptFlow} from "~app/utils/export";

interface Props {
    setShowEditor: (show: boolean) => void;
    className?: string
}


function PromptForm(props: {setShowEditor: (show: boolean) => void;  }) {
    const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
    const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
    const { t } = useTranslation()
    const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), { suspense: true})

    async function savePrompt(prompt: Prompt) {
        const existed = await saveLocalPromptTitle(prompt)
        await localPromptsQuery.mutate()
        store.set("edit_" + prompt.title, true)
        trackEvent(existed ? 'edit_local_prompt' : 'add_local_prompt')
    }

    function getEditYaml() {
        const prompts = store.get("prompts");
        if (prompts !== null && prompts['Flow_Dag_Yaml']){
            return prompts['Flow_Dag_Yaml']
        }
        return "";
    }

    function getEditPrompt() {
        const prompts = store.get("prompts");
        if (prompts !== null && prompts[editorPrompt]){
            return prompts[editorPrompt]
        }
        return "";
    }

    function onChangeYaml(value: string) {
        let prompt = null

        for (let i = 0; i < localPromptsQuery.data.length; i++) {
            if (localPromptsQuery.data[i].title == "Flow_Dag_Yaml") {
                prompt = localPromptsQuery.data[i];
            }
        }
        if (prompt !== null){
            prompt.prompt = value
            savePrompt(prompt)
        }
    }

    type SelectionValue = {
        anchor: {
            row: number;
            column: number;
            document: {
                $lines: string[];
            };
        };
        cursor: {
            row: number;
            column: number;
        };
        session: Ace.EditSession;
    };
    let markers = [];

    function onSelectionChange(selectionValue: SelectionValue) {
        const { anchor, cursor } = selectionValue;
        const { row, column, document } = anchor;

        const start = Math.min(cursor.column, column);
        const end = Math.max(cursor.column, column);

        markers = [];
        let targetPath = '';
        const functionPath = 'func:';
        const promptPath = 'path:';
        const prompts = store.get("prompts")
        onChangeYaml(document.$lines.join("\n"))
        for (let i = 0; i < document.$lines.length; i++) {
            const line = document.$lines[i];
            if (line.includes(promptPath) || line.includes(functionPath)) {
                if (!line.includes(promptPath)){
                    targetPath = functionPath
                }else{
                    targetPath = promptPath
                }
                const pathIndex = line.indexOf(targetPath);
                const pathValue = line.substring(pathIndex + targetPath.length);
                let prompt = line.substring(pathIndex + targetPath.length);

                if (pathValue && prompt) {
                    const highlightMarker = {
                        prompt: prompt,
                        startRow: i,
                        startCol: pathIndex + targetPath.length,
                        endRow: i,
                        endCol: pathIndex + targetPath.length + prompt.length,
                        className: 'path-marker',
                        type: 'text'
                    }
                    prompt = prompt.replace(/\s+/g, "")
                    if (cursor.row == highlightMarker.startRow
                        && highlightMarker.startCol <= start
                        && highlightMarker.endCol >= start){
                        if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
                            if (editorPrompt != prompt){
                                setEditorPrompt(prompt)
                                setEditorPromptTimes(editorPromptTimes + 1);
                            }
                        }

                    }
                    if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
                        markers.push(highlightMarker);
                    }

                }
            }
        }
        const currentMarkers = selectionValue.session.getMarkers(true);
        for (const i in currentMarkers) {
            selectionValue.session.removeMarker(currentMarkers[i].id);
        }

        // add new markers
        markers.forEach(
            ({
                 startRow,
                 startCol,
                 endRow,
                 endCol,
                 className,
             }) => {
                const range = new Range(startRow, startCol, endRow, endCol);
                selectionValue.session.addMarker(range, className, "text", true);
            }
        );
    }

    React.useEffect(() => {
        // data stub:
        const sqlTables = [
            { name: 'roles', description: 'Defining the various agents in your company, such as the ``Chief Executive Officer``.' },
            { name: 'nodes', description: 'Defining your own node of GPTs process.' },
            { name: 'prompt', description: 'Node type(support various)' },
            { name: 'string', description: 'Node type(text content)' },
            { name: 'npc', description: 'Choose npc in Game Moe' },
            { name: 'Hailey Johnson', description: 'NPC' },
            { name: 'Tom Moreno', description: 'NPC' },
            { name: 'Eddy Lin', description: 'NPC' },
            { name: 'John Lin', description: 'NPC' },
            { name: 'Yuriko Yamamoto', description: 'NPC' },
            { name: 'Sam Moore', description: 'NPC' },
            { name: 'Mei Lin', description: 'NPC' },
            { name: 'Adam Smith', description: 'NPC' },
            { name: 'Giorgio Rossi', description: 'NPC' },
            { name: 'Carlos Gomez', description: 'NPC' },
            { name: 'Wolfgang Schulz', description: 'NPC' },
            { name: 'Jennifer Moore', description: 'NPC' },
            { name: 'Klaus Mueller', description: 'NPC' },
            { name: 'Ayesha Khan', description: 'NPC' },
            { name: 'Isabella Rodriguez', description: 'NPC' },
            { name: 'Abigail Chen', description: 'NPC' },
            { name: 'Carmen Ortiz', description: 'NPC' },
            { name: 'Francisco Lopez', description: 'NPC' },
            { name: 'Jane Moreno', description: 'NPC' },
            { name: 'Latoya Williams', description: 'NPC' },
            { name: 'Arthur Burton', description: 'NPC' },
            { name: 'Rajiv Patel', description: 'NPC' },
            { name: 'Tamara Taylor', description: 'NPC' },
            { name: 'Ryan Park', description: 'NPC' },
            { name: 'Maria Lopez', description: 'NPC' },
        ];
        const prompts = store.get("prompts")
        if (prompts != null){
            for (const [key, value] of Object.entries(store.get("prompts"))) {
                if (key.indexOf("Position_") === -1){
                    sqlTables.push({ name: key, description: "path" });
                }
            }
        }
        const sqlTablesCompleter = {
            getCompletions: (
                editor: Ace.Editor,
                session: Ace.EditSession,
                pos: Ace.Point,
                prefix: string,
                callback: Ace.CompleterCallback
            ): void => {
                callback(
                    null,
                    sqlTables.map((table) => ({
                        caption: `${table.name}: ${table.description}`,
                        value: table.name,
                        meta: 'prompt',
                    } as Ace.Completion))
                );
            },
        };
        addCompleter(sqlTablesCompleter);
    }, []);

    function onChangePrompt(value: string) {
        let prompt = null
        for (let i = 0; i < localPromptsQuery.data.length; i++) {
            if (localPromptsQuery.data[i].title == editorPrompt) {
                prompt = localPromptsQuery.data[i] as Prompt
            }
        }
        if (prompt !== null){
            prompt.prompt = value
            savePrompt(prompt)
        }
    }
    async function importYaml(){
        importPromptFlow().then(() => {
            localPromptsQuery.mutate()
            // setEditorYamlTimes(editorYamlTimes + 1)
            setEditorPromptTimes(editorPromptTimes + 1)
        })
    }

    return (
        <div className="overflow-auto h-full flex flex-col ">
            <div className="flex items-left mx-10 margin-5">
                <div className="flex flex-row gap-3">
                    <Button size="small" text={t('Export')} icon={<BiExport />} onClick={exportPromptFlow} />
                    <Button size="small" text={t('Import')} icon={<BiImport />} onClick={importYaml} />
                </div>
            </div>
            <div className="overflow-auto h-full flex flex-cow ">
                <AceEditor
                    key={editorYamlTimes}
                    mode="yaml"
                    theme="github"
                    name="prompt"
                    width="50%"
                    height="100%"
                    onChange={onChangeYaml}
                    onSelectionChange={onSelectionChange}
                    defaultValue={getEditYaml()}
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                        useWorker: false,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true
                    }}
                />
                <AceEditor
                    key={editorPromptTimes}
                    mode="javascript"
                    theme="github"
                    name="prompt-func"
                    width="50%"
                    height="100%"
                    onChange={onChangePrompt}
                    defaultValue={getEditPrompt()}
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                        useWorker: false,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true
                    }}
                />
            </div>
        </div>
    )
}

const LocalPrompts: FC<Props> = (props) => {
    return (
        <div className={cx("overflow-hidden h-full ", props.className)}>
            <PromptForm setShowEditor={props.setShowEditor}/>
        </div>
    )
}

export default LocalPrompts
