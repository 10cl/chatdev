import {FC, useCallback, useState} from 'react'
import cx from 'classnames'
import './main.css'
import React from "react";
import {useTranslation} from "react-i18next";
import useSWR from "swr";
import {
    getStore,
    isURL,
    loadLocalPrompts,
    Prompt,
    saveLocalPrompt,
    saveLocalPromptTitle,
    setStore
} from "~services/prompts";
import AceEditor from "react-ace";
import Button from "~app/components/Button";
import {useAtom} from "jotai/index";
import {
    editorFocusAtom,
    editorPromptAtom,
    editorPromptTimesAtom,
    editorYamlTimesAtom,
    showShareAtom
} from "~app/state";
import store from "store2";
import {Ace, EditSession, Range} from "ace-builds";
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-javascript';
import shareIcon from '~/assets/icons/share.svg'

import Browser from "webextension-polyfill";
import {BiExport, BiImport, BiShareAlt} from "react-icons/bi";
import {exportData, exportAgentAll, exportPromptFlow, importData, importPromptFlow} from "~app/utils/export";
import {uuid} from "~utils";
import Tooltip from "~app/components/Tooltip";
import discordIcon from "~assets/icons/discord.svg";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";

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
    const confirmTips = t('Are you sure you want to import the Agent?')
    const successTips = t('Imported Agent successfully')
    const [shareViewShow, setShowShareView] = useAtom(showShareAtom)
    const [editorFocus, setEditorFocus] = useAtom(editorFocusAtom)
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

    async function savePrompt(prompt: Prompt) {
        const existed = await saveLocalPromptTitle(prompt)
        await localPromptsQuery.mutate()
        setStore("edit_" + prompt.title, true)
    }

    function getEditYaml() {
        const prompts = getStore("prompts", null);
        if (prompts !== null && prompts[getStore("real_yaml", "Default_Flow_Dag_Yaml")]){
            return prompts[getStore("real_yaml", "Default_Flow_Dag_Yaml")]
        }
        return "";
    }

    function getEditPrompt() {
        const prompts = getStore("prompts", null);
        if (prompts !== null && prompts[editorPrompt]){
            return prompts[editorPrompt]
        }
        return "// TODO for: " + editorPrompt;
    }

    function onChangeYaml(value: string) {
        let prompt = null
        const title = getStore("real_yaml", "Default_Flow_Dag_Yaml")

        for (let i = 0; i < localPromptsQuery.data.length; i++) {
            if (localPromptsQuery.data[i].title == title) {
                prompt = localPromptsQuery.data[i];
            }
        }
        if (prompt !== null){
            prompt.prompt = value
            savePrompt(prompt)
        }else{
            if (getStore("prompts", {})[title] != undefined){
                savePrompt({id:uuid(), title: title, prompt: value})
            }
        }
        // ensure dag yaml update.
        getStore("prompts", {})["Flow_Dag_Yaml"] += "\n"
    }

    function onFocusYaml(event: any, editor: Ace.Editor | undefined){
        console.log("onFocus", event)
        if (event.type == "blur"){
            setEditorStatus('Yaml')
        }else if (event.type == "focus"){
            setEditorStatus('')
        }
    }

    function onFocusPrompt(event: any, editor: Ace.Editor | undefined){
        console.log("onFocus", event)
        if (event.type == "blur"){
            setEditorStatus('Prompt')
        }else if (event.type == "focus"){
            setEditorStatus('')
        }
    }

    function setEditorStatus(value: string){
        setEditorFocus(value)
        setStore("editor_focus", value)
    }

    function onSelectionChange(selectionValue: SelectionValue) {
        const { anchor, cursor } = selectionValue;
        const { row, column, document } = anchor;

        const start = Math.min(cursor.column, column);
        const end = Math.max(cursor.column, column);

        markers = [];
        let targetPath = '';
        const functionPath = 'func:';
        const promptPath = 'path:';
        const regexFunc = /func:\s*([\w_]+)\s*/
        const regexPath = /path:\s*([\w_]+)\s*/

        onChangeYaml(document.$lines.join("\n"))
        for (let i = 0; i < document.$lines.length; i++) {
            const line = document.$lines[i];
            const matchFunc = line.match(regexFunc)
            const matchPath = line.match(regexPath)
            if (matchFunc || matchPath) {
                let prompt;

                let pathIndex = 0;
                if (matchFunc){
                    prompt = matchFunc[1];
                    pathIndex = line.indexOf(functionPath);
                    targetPath = functionPath
                }else if (matchPath){
                    prompt = matchPath[1];
                    pathIndex = line.indexOf(promptPath);
                    targetPath = promptPath
                }

                if (prompt) {
                    const highlightMarker = {
                        prompt: prompt,
                        startRow: i,
                        startCol: pathIndex + targetPath.length + 1,
                        endRow: i,
                        endCol: pathIndex + targetPath.length + prompt.length + 1,
                        className: 'path-marker',
                        type: 'text'
                    }
                    prompt = prompt.replace(/\s+/g, "")
                    if (cursor.row == highlightMarker.startRow
                        && highlightMarker.startCol <= start
                        && highlightMarker.endCol >= start){
                        // if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
                        prompt = prompt.replaceAll("'", "").replaceAll(" ", "")
                        if(!isURL(prompt)){
                            if (editorPrompt != prompt){
                                setEditorPrompt(prompt)
                                setEditorPromptTimes(editorPromptTimes + 1);
                            }
                        }
                    }
                    // if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
                    if(!isURL(prompt)){
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
            { name: 'nodes', description: 'Defining your own node of Agent process.' },
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
        const prompts = getStore("prompts", null)
        if (prompts != null){
            for (const [key, value] of Object.entries(getStore("prompts", {}))) {
                if (key.indexOf("Position_") === -1){
                    sqlTables.push({ name: key, description: "path" });
                }
            }
        }
        const promptTablesCompleter = {
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
        addCompleter(promptTablesCompleter);
    }, []);

    function onChangePrompt(value: string) {
        const title = editorPrompt
        let prompt = null
        for (let i = 0; i < localPromptsQuery.data.length; i++) {
            if (localPromptsQuery.data[i].title == title) {
                prompt = localPromptsQuery.data[i] as Prompt
            }
        }
        if (prompt !== null){
            prompt.prompt = value
            savePrompt(prompt)
        }else{
            savePrompt({id:uuid(), title: title, prompt: value})
        }
    }
    async function importYaml(){
        importPromptFlow(confirmTips, successTips).then(() => {
            localPromptsQuery.mutate()
            const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
            setEditorYamlTimes(editorYamlTimes)
            setStore("editorYamlTimes", editorYamlTimes)
        })
    }

    async function shareGpts() {
        if (!(await requestHostPermission('https://*.chatdev.toscl.com/'))) {
            throw new ChatError('Missing chatdev.toscl.com permission', ErrorCode.MISSING_HOST_PERMISSION)
        }
        setShowShareView(true)
    }

    return (
        <div className="overflow-auto h-full flex flex-col promptide">
            <div className="flex items-left mx-10 margin-5">
                <div className="flex flex-row gap-3">
                    <Button size="small" text={t('Export ALL')} icon={<BiExport />} onClick={exportAgentAll} />
                    <Button size="small" text={t('Export Current')} icon={<BiExport />} onClick={exportPromptFlow} />
                    <Button size="small" text={t('Import')} icon={<BiImport />} onClick={importYaml} />
                    <Tooltip content={t('Share')}>
                        <Button size="small" text={t('Share')} icon={<BiShareAlt />} onClick={shareGpts} />
                    </Tooltip>
                </div>
            </div>
            <div className="overflow-auto h-full flex flex-cow" key={editorYamlTimes}>
                <AceEditor
                    mode="yaml"
                    theme="github"
                    name="prompt"
                    width="50%"
                    height="100%"
                    onChange={onChangeYaml}
                    onSelectionChange={onSelectionChange}
                    onFocus={onFocusYaml}
                    onBlur={onFocusYaml}
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
                    onFocus={onFocusPrompt}
                    onBlur={onFocusPrompt}
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
