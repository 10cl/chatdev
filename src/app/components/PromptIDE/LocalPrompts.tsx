import {FC, LegacyRef, useCallback, useRef, useState} from 'react'
import cx from 'classnames'
import '../../main.css'
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
    editorFocusAtom, editorHeightAtom,
    editorPromptAtom,
    editorPromptTimesAtom, editorRightAtom, editorWidthAtom,
    editorYamlTimesAtom,
    showShareAtom
} from "~app/state";
import store from "store2";
import {Ace, EditSession, Range} from "ace-builds";
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/snippets/javascript';

import uploadIcon from '~/assets/icons/share.svg'
import exportIcon from '~/assets/icons/export.svg'
import importIcon from '~/assets/icons/import.svg'

import {NumberSize, Resizable} from 're-resizable';

import Browser from "webextension-polyfill";
import {BiCloudUpload, BiExport, BiImport, BiShareAlt, BiUpload} from "react-icons/bi";
import {exportData, exportAgentAll, exportPromptFlow, importData, importPromptFlow} from "~app/utils/export";
import {uuid} from "~utils";
import Tooltip from "~app/components/Tooltip";
import discordIcon from "~assets/icons/discord.svg";
import {requestHostPermission} from "~app/utils/permissions";
import {ChatError, ErrorCode} from "~utils/errors";
import layoutBottomIcon from "~assets/icons/editor-layout-bottom.svg";
import layoutRightIcon from "~assets/icons/editor-layout-right.svg";
import {Direction} from "re-resizable/lib/resizer";

interface Props {
    setShowEditor: (show: boolean) => void;
    className?: string
}


function PromptForm(props: {setShowEditor: (show: boolean) => void;  }) {
    const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
    const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
    const [resizeKey, setResizeKey] = useState(0)
    const { t } = useTranslation()
    const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), { suspense: true})
    const confirmTips = t('Are you sure you want to import the Agent?')
    const successTips = t('Imported Agent successfully')
    const [shareViewShow, setShowShareView] = useAtom(showShareAtom)
    const [editorFocus, setEditorFocus] = useAtom(editorFocusAtom)

    const [editorWidth, setEditorWidth] = useAtom(editorWidthAtom)
    const [editorHeight, setEditorHeight] = useAtom(editorHeightAtom)
    const [editorRight, setEditorRightAtom] = useAtom(editorRightAtom)

    const [yamlResizableRef, setYamlResizableRef] = useState<Resizable | null>(null);
    const [funcResizableRef, setFuncResizableRef] = useState<Resizable | null>(null);
    const [promptIDERef, setPromptIDERef] = useState<HTMLDivElement | null>(null);

    interface Enable {
        top?: boolean;
        right?: boolean;
        bottom?: boolean;
        left?: boolean;
        topRight?: boolean;
        bottomRight?: boolean;
        bottomLeft?: boolean;
        topLeft?: boolean;
    }

    let resizeEnableYaml = {
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
    } as Enable

    const resizeEnableFunc = {
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
    } as Enable

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
        update(editorRight)
        const prompts = getStore("prompts", null);
        if (prompts !== null && prompts[getStore("real_yaml", "Default_Flow_Dag_Yaml")]){
            return prompts[getStore("real_yaml", "Default_Flow_Dag_Yaml")]
        }
        setEditorStatus('Yaml')
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
        setEditorStatus('Yaml')

        if (event.type == "focus" && getStore("generate_content", "") == ""){
            setEditorStatus('')
        }
    }

    function onFocusPrompt(event: any, editor: Ace.Editor | undefined){
        console.log("onFocus", event)
        const promptType = getStore("editor_prompt_type", "func:")
        if (promptType == "func:"){
            setEditorStatus('Prompt')
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
                                setStore("editor_prompt_type", targetPath)
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
        // setEditorStatus("Yaml")
        setStore("editor_prompt_type", "path:")
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

    const update = useCallback((editorRight: boolean) => {
        console.log("editor right: " + editorRight)

        if (promptIDERef && promptIDERef.offsetWidth>0) {
            const width = promptIDERef.offsetWidth
            const height = promptIDERef.offsetHeight

            if (editorRight){
                let yamlWidth = editorWidth
                if (yamlWidth == 0){
                    yamlWidth = width/2
                }else if (width == yamlWidth){
                    yamlWidth = width - 20
                }

                if (yamlResizableRef) {

                    yamlResizableRef.updateSize({width: yamlWidth, height: height});
                }

                if (funcResizableRef) {
                    let funcWidth = width - yamlWidth
                    if (funcWidth == 0){
                        funcWidth = width/2
                    }
                    console.log("update size func: " + funcWidth + ", " + height)
                    funcResizableRef.updateSize({width: funcWidth, height: height});
                }
            }else{
                let yamlHeight = editorHeight
                if (yamlHeight == 0){
                    yamlHeight = height/2
                }else if (yamlHeight == height){
                    yamlHeight = height - 20
                }

                if (yamlResizableRef) {
                    yamlResizableRef.updateSize({width: width, height: yamlHeight});
                }

                if (funcResizableRef) {
                    let funcHeight = height - yamlHeight
                    if (funcHeight == 0){
                        funcHeight = width/2
                    }
                    console.log("update size func: " + width + ", " + funcHeight)
                    funcResizableRef.updateSize({width: width, height: funcHeight});
                }
            }

        }

    },[resizeEnableFunc, resizeEnableYaml])

    function onResizeYaml(event: MouseEvent | TouchEvent, direction: Direction, elementRef: HTMLElement, delta: NumberSize){
        console.log("onResizeYaml")
        if (yamlResizableRef){
            const yamlWidth = elementRef.offsetWidth
            const yamlHeight = elementRef.offsetHeight
            setEditorWidth(yamlWidth)
            setEditorHeight(yamlHeight)
        }
        update(editorRight)
    }

    function onResizeFunc(event: MouseEvent | TouchEvent, direction: Direction, elementRef: HTMLElement, delta: NumberSize){
        console.log("onResizeFunc")
    }

    const layoutChange = useCallback(() => {
        const newState = !editorRight
        if (promptIDERef) {
            if (!newState) {
                setEditorWidth(promptIDERef.offsetWidth)
                setEditorHeight(promptIDERef.offsetHeight / 2)
            } else {
                setEditorWidth(promptIDERef.offsetWidth / 2)
                setEditorHeight(promptIDERef.offsetHeight)
            }
            setEditorRightAtom(newState)
            update(newState)
        }
        setResizeKey(resizeKey+1)
    }, [editorRight, resizeEnableFunc, resizeKey, setResizeKey])

    return (
        <div className="h-full flex flex-col promptide" ref={c => { setPromptIDERef(c); }}>
            <div className="flex items-left mx-3 margin-5">
                <div className="flex flex-row gap-3">
                    <button type="button" className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')} onClick={layoutChange}>
                        <div className="flex flex-row items-center gap-1 min-w-max">
                            <img src={editorRight?layoutBottomIcon:layoutRightIcon}/>
                        </div>
                    </button>
                    {/*<Button size="small" text={t('Export ALL')} icon={<BiExport />} onClick={exportAgentAll} />*/}
                    <Tooltip content={t('Export: Exporting the Current Agent')}>
                        <button type="button" className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')} onClick={exportPromptFlow}>
                            <div className="flex flex-row items-center gap-1 min-w-max">
                                <img src={exportIcon}/>
                            </div>
                        </button>
                    </Tooltip>
                    <Tooltip content={t('Import: Import Agents from file')}>
                        <button type="button" className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')} onClick={importYaml}>
                            <div className="flex flex-row items-center gap-1 min-w-max">
                                <img src={importIcon}/>
                            </div>
                        </button>
                    </Tooltip>
                    <Tooltip content={t('Upload: Generate a link that details the Agent')}>
                        <button type="button" className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')} onClick={shareGpts}>
                            <div className="flex flex-row items-center gap-1 min-w-max">
                                <img src={uploadIcon}/>
                            </div>
                        </button>
                    </Tooltip>
                </div>
            </div>
            <div className={"h-full flex " + (editorRight?"flex-cow":"flex-col")} key={editorYamlTimes}>

                <Resizable
                    className="editor-yaml-margin"
                    ref={c => { setYamlResizableRef(c); }}
                    enable={resizeEnableYaml}
                    defaultSize={promptIDERef?{
                        width: editorRight?promptIDERef.offsetWidth/2:promptIDERef.offsetWidth,
                        height: editorRight?promptIDERef.offsetHeight: promptIDERef.offsetHeight/2,
                    }:undefined}
                    size={yamlResizableRef ? { width: yamlResizableRef.state?.width, height: yamlResizableRef.state?.height } : undefined}
                    onResizeStop={onResizeYaml}>
                    <AceEditor
                        mode="yaml"
                        theme="github"
                        name="prompt"
                        width="100%"
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
                </Resizable>
                <Resizable
                    key={resizeKey}
                    className="editor-func-border"
                    defaultSize={promptIDERef?{
                        width: editorRight?promptIDERef.offsetWidth/2:promptIDERef.offsetWidth,
                        height: editorRight?promptIDERef.offsetHeight: promptIDERef.offsetHeight/2,
                    }:undefined}
                    ref={c => { setFuncResizableRef(c); }}
                    enable={resizeEnableFunc}
                    size={funcResizableRef ? { width: funcResizableRef.state?.width, height: funcResizableRef.state?.height } : undefined}
                    onResizeStop={onResizeFunc}>
                    <AceEditor
                        key={editorPromptTimes}
                        mode="javascript"
                        theme="github"
                        name="prompt-func"
                        width="100%"
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
                </Resizable>
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
