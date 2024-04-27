import {FC, LegacyRef, useCallback, useRef, useState} from 'react'
import cx from 'classnames'
import '../../main.css'
import React from "react";
import {useTranslation} from "react-i18next";
import useSWR from "swr";
import {
  isURL,
  loadLocalPrompts,
  Prompt,
  saveLocalPrompt,
} from "~services/prompts";
import {
  getPromptValue,
  getRealYaml,
  getRealYamlKey,
  getStore,
  setAgentReset,
  setDupAgentYaml,
  setEditorGenerate,
  setPromptValue,
  setRealYaml,
  setRealYamlKey,
  setRealYamlGenerating,
  setStore,
  getLayoutRight,
  setEditorGenerateEnable,
  isEditorGenerateEnable,
  getEditorGenerateContent, setEditorInstance, getEditorInstance
} from "~services/storage/memory-store";
import AceEditor from "react-ace";
import {useAtom} from "jotai/index";
import {
  editorPromptAtom,
  editorPromptTimesAtom, editorYamlTimesAtom, generateEnableAtom, isNewAgentShowAtom, showEditorAtom,
  showShareAtom
} from "~app/state";
import store from "store2";
import {Ace, EditSession, Range} from "ace-builds";
import {addCompleter} from 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/snippets/javascript';

import uploadIcon from '~/assets/icons/share.svg'
import duplicateIcon from '~/assets/icons/duplicate.svg'
import generateIcon from '~/assets/icons/ai_generate.svg'
import generateEnableIcon from '~/assets/icons/ai_generate_enable.svg'
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
import {toast} from "react-hot-toast";

interface Props {
  className?: string
}

function PromptForm() {
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)
  const [resizeKey, setResizeKey] = useState(0)
  const [generateEnable, setGenerateEnable] = useAtom(generateEnableAtom)
  const {t} = useTranslation()
  const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), {suspense: true})
  const confirmTips = t('Are you sure you want to import the Agent?')
  const successTips = t('Imported Agent successfully')
  const [shareViewShow, setShowShareView] = useAtom(showShareAtom)
  const [yamlResizableRef, setYamlResizableRef] = useState<Resizable | null>(null);
  const [funcResizableRef, setFuncResizableRef] = useState<Resizable | null>(null);
  // const [promptIDERef, setPromptIDERef] = useState<HTMLDivElement | null>(null);
  const [isNewAgentShow, setNewAgentDialog] = useAtom(isNewAgentShowAtom)
  const gameRef = useRef<HTMLDivElement>(null);
  const [showEditor, setShowEditor] = useAtom(showEditorAtom)

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

  const resizeEnableYaml = {
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
    await saveLocalPrompt(prompt);
    await localPromptsQuery.mutate()
  }

  function getEditPrompt() {
    const prompts = getStore("prompts", null);
    if (prompts !== null && prompts[editorPrompt]) {
      return prompts[editorPrompt]
    }
    return "// TODO for: " + editorPrompt;
  }

  function onChangeYaml(value: string) {
    let prompt = null
    const title = getRealYamlKey()

    for (let i = 0; i < localPromptsQuery.data.length; i++) {
      if (localPromptsQuery.data[i].title == title) {
        prompt = localPromptsQuery.data[i];
      }
    }
    if (prompt !== null) {
      prompt.prompt = value
      savePrompt(prompt)
    } else {
      if (getPromptValue(title) != undefined) {
        savePrompt({id: uuid(), title: title, prompt: value})
      }
    }
    setAgentReset(true)
    setRealYamlGenerating(value)
  }

  function onFocusYaml(event: any, editor: Ace.Editor | undefined) {
    console.log("onFocus", event)
    if (generateEnable){
      setEditorGenerate('Yaml')
    }

    setEditorInstance(editor)

  }

  function onFocusPrompt(event: any, editor: Ace.Editor | undefined) {
    console.log("onFocus", event)
    const promptType = getStore("editor_prompt_type", "func:")
    if (generateEnable && promptType == "func:") {
      setEditorGenerate('Prompt')
    }
    setEditorInstance(editor)
  }

  function onSelectionChange(selectionValue: SelectionValue) {
    const {anchor, cursor} = selectionValue;
    const {row, column, document} = anchor;

    const start = Math.min(cursor.column, column);
    const end = Math.max(cursor.column, column);

    markers = [];
    let targetPath = '';
    const functionPath = 'func:';
    const promptPath = 'path:';
    const regexFunc = /func:\s*([^\s^'^"]+)\s*/
    const regexPath = /path:\s*([^\s^'^"]+)\s*/

    // onChangeYaml(document.$lines.join("\n"))
    for (let i = 0; i < document.$lines.length; i++) {
      const line = document.$lines[i];
      const matchFunc = line.match(regexFunc)
      const matchPath = line.match(regexPath)
      if (matchFunc || matchPath) {
        let prompt;

        let pathIndex = 0;
        if (matchFunc) {
          prompt = matchFunc[1];
          pathIndex = line.indexOf(functionPath);
          targetPath = functionPath
        } else if (matchPath) {
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
            && highlightMarker.endCol >= start) {
            // if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
            prompt = prompt.replaceAll("'", "").replaceAll(" ", "")
            if (!isURL(prompt)) {
              if (editorPrompt != prompt) {
                setStore("editor_prompt_type", targetPath)
                setEditorPrompt(prompt)
                setEditorPromptTimes(editorPromptTimes + 1);
              }
            }
          }
          // if (prompts !== null && prompts !== undefined && prompts[prompt] !== undefined) {
          if (!isURL(prompt)) {
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
    console.log("editor use effect")
    // setEditorStatus("Yaml")
    setStore("editor_prompt_type", "path:")
    // data stub:
    const sqlTables = [
      {
        name: 'roles',
        description: 'Defining the various agents in your company, such as the ``Chief Executive Officer``.'
      },
      {name: 'nodes', description: 'Defining your own node of Agent process.'},
      {name: 'prompt', description: 'Node type(support various)'},
      {name: 'string', description: 'Node type(text content)'},
      {name: 'npc', description: 'Choose npc in Game Moe'},
      {name: 'Hailey Johnson', description: 'NPC'},
      {name: 'Tom Moreno', description: 'NPC'},
      {name: 'Eddy Lin', description: 'NPC'},
      {name: 'John Lin', description: 'NPC'},
      {name: 'Yuriko Yamamoto', description: 'NPC'},
      {name: 'Sam Moore', description: 'NPC'},
      {name: 'Mei Lin', description: 'NPC'},
      {name: 'Adam Smith', description: 'NPC'},
      {name: 'Giorgio Rossi', description: 'NPC'},
      {name: 'Carlos Gomez', description: 'NPC'},
      {name: 'Wolfgang Schulz', description: 'NPC'},
      {name: 'Jennifer Moore', description: 'NPC'},
      {name: 'Klaus Mueller', description: 'NPC'},
      {name: 'Ayesha Khan', description: 'NPC'},
      {name: 'Isabella Rodriguez', description: 'NPC'},
      {name: 'Abigail Chen', description: 'NPC'},
      {name: 'Carmen Ortiz', description: 'NPC'},
      {name: 'Francisco Lopez', description: 'NPC'},
      {name: 'Jane Moreno', description: 'NPC'},
      {name: 'Latoya Williams', description: 'NPC'},
      {name: 'Arthur Burton', description: 'NPC'},
      {name: 'Rajiv Patel', description: 'NPC'},
      {name: 'Tamara Taylor', description: 'NPC'},
      {name: 'Ryan Park', description: 'NPC'},
      {name: 'Maria Lopez', description: 'NPC'},
    ];
    const prompts = getStore("prompts", null)
    if (prompts != null) {
      for (const [key, value] of Object.entries(getStore("prompts", {}))) {
        if (key.indexOf("Position_") === -1) {
          sqlTables.push({name: key, description: "path"});
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
    if (!getStore("editor_yaml", undefined)) {
      layoutChange(false)
    }
  }, []);

  React.useEffect(() => {
    setEditorGenerateEnable(generateEnable)
  }, [generateEnable]);

  React.useEffect(() => {
    setEditorPromptTimes(editorPromptTimes + 1)
  }, [showEditor]);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onChangePrompt(value: string) {
    const title = editorPrompt
    console.log("onChangePrompt title: " + title + ", value: " + value)

    let prompt = null
    for (let i = 0; i < localPromptsQuery.data.length; i++) {
      if (localPromptsQuery.data[i].title == title) {
        prompt = localPromptsQuery.data[i] as Prompt
      }
    }
    if (prompt !== null) {
      prompt.prompt = value
      savePrompt(prompt)
    } else {
      savePrompt({id: uuid(), title: title, prompt: value})
    }
    setRealYaml(getRealYaml())
  }

  async function importYaml() {
    toast.promise(
      importPromptFlow(confirmTips, successTips).then(() => {
        const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
        setEditorYamlTimes(editorYamlTimes)
        setStore("editorYamlTimes", editorYamlTimes)
      }), {
        loading: t('Load Agent...'),
        success: <b>{t('Load success.')}</b>,
        error: <b>{t('Load failed.')}</b>,
      }, {
        position: "top-center"
      }
    );
  }

  async function shareGpts() {
    if (!(await requestHostPermission('https://*.chatdev.toscl.com/'))) {
      throw new ChatError('Missing chatdev.toscl.com permission', ErrorCode.MISSING_HOST_PERMISSION)
    }
    setShowShareView(true)
  }

  async function duplicate() {
    setDupAgentYaml(true)
    setNewAgentDialog(true)
  }

  async function generate() {
    const newState = !generateEnable
    setGenerateEnable(newState)
  }

  const handleResize = () => {
      console.log("handleResize")
    const newState = getLayoutRight()
    const promptIDERef = gameRef.current;

    if (promptIDERef) {
      if (promptIDERef.offsetWidth == 0){
        return
      }
      if (!newState) {
        setStore("editor_yaml", {width: promptIDERef.offsetWidth, height: promptIDERef.offsetHeight / 2})
        setStore("editor_func", {width: promptIDERef.offsetWidth, height: promptIDERef.offsetHeight / 2})
      } else {
        setStore("editor_yaml", {width: promptIDERef.offsetWidth / 2, height: promptIDERef.offsetHeight})
        setStore("editor_func", {width: promptIDERef.offsetWidth / 2, height: promptIDERef.offsetHeight})
      }
      setStore("editor_layout_right", newState);
    }

    setEditorYamlTimes(editorYamlTimes + 1)
    setResizeKey(resizeKey + 1)
  };

  function onResizeYaml(event: MouseEvent | TouchEvent, direction: Direction, elementRef: HTMLElement, delta: NumberSize) {
    console.log("onResizeYaml")
    const yamlWidth = elementRef.offsetWidth
    const yamlHeight = elementRef.offsetHeight
    if (yamlWidth != 0){
      setStore("editor_yaml", {width: yamlWidth, height: yamlHeight})
      console.log("editor width " + yamlWidth + " height: " + yamlHeight)
      const promptIDERef = gameRef.current;
      if (promptIDERef) {
        const width = promptIDERef.offsetWidth
        const height = promptIDERef.offsetHeight

        if (width == 0) {
          return
        }
        if (getLayoutRight()) {
          let yamlWidth = getStore("editor_yaml", {}).width
          if (!yamlWidth) {
            yamlWidth = width / 2
          } else if (width == yamlWidth) {
            yamlWidth = width - 20
          }
          setStore("editor_yaml", {width: yamlWidth, height: height})
          let funcWidth = width - yamlWidth
          if (funcWidth == 0) {
            funcWidth = width / 2
          }
          console.log("update size func: " + funcWidth + ", " + height)
          setStore("editor_func", {width: funcWidth, height: height})
        } else {
          let yamlHeight = getStore("editor_yaml", {}).height
          if (!yamlHeight) {
            yamlHeight = height / 2
          } else if (yamlHeight == height) {
            yamlHeight = height - 20
          }
          setStore("editor_yaml", {width: width, height: yamlHeight})
          let funcHeight = height - yamlHeight
          if (funcHeight == 0) {
            funcHeight = width / 2
          }

          console.log("update size func: " + width + ", " + funcHeight)
          setStore("editor_func", {width: width, height: funcHeight})
        }
        setEditorYamlTimes(editorYamlTimes + 1)
        setResizeKey(resizeKey + 1)
      }
    }
  }

  function onResizeFunc(event: MouseEvent | TouchEvent, direction: Direction, elementRef: HTMLElement, delta: NumberSize) {
    console.log("onResizeFunc")
    const funcWidth = elementRef.offsetWidth
    const yamlHeight = elementRef.offsetHeight
    if (funcWidth != 0){
      setStore("editor_func", {width: funcWidth, height: yamlHeight})

    }
  }

  const layoutChange = useCallback((update: boolean) => {
    console.trace("layout change")
    const newState = !getLayoutRight()
    const promptIDERef = gameRef.current;

    if (promptIDERef) {
      if (promptIDERef.offsetWidth == 0){
        return
      }
      if (!newState) {
        setStore("editor_yaml", {width: promptIDERef.offsetWidth, height: promptIDERef.offsetHeight / 2})
        setStore("editor_func", {width: promptIDERef.offsetWidth, height: promptIDERef.offsetHeight / 2})
      } else {
        setStore("editor_yaml", {width: promptIDERef.offsetWidth / 2, height: promptIDERef.offsetHeight})
        setStore("editor_func", {width: promptIDERef.offsetWidth / 2, height: promptIDERef.offsetHeight})
      }
      setStore("editor_layout_right", newState);
    }
    if (update){
      setEditorYamlTimes(editorYamlTimes + 1)
      setResizeKey(resizeKey + 1)
    }
  }, [])

  return (
    <div className="h-full flex flex-col promptide" id="promptide">
      <div className="flex items-left mx-3 margin-5">
        <div className="flex flex-row gap-3">
          <button type="button"
                  className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')}
                  onClick={()=>layoutChange(true)}>
            <div className="flex flex-row items-center gap-1 min-w-max">
              <img className="w-5 h-5 cursor-pointer"
                   src={getLayoutRight() ? layoutBottomIcon : layoutRightIcon}/>
            </div>
          </button>
          {/*<Button size="small" text={t('Export ALL')} icon={<BiExport />} onClick={exportAgentAll} />*/}
          <Tooltip content={t('Export: Exporting the Current Agent')}>
            <button type="button"
                    className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')}
                    onClick={exportPromptFlow}>
              <div className="flex flex-row items-center gap-1 min-w-max">
                <img className="w-5 h-5 cursor-pointer" src={exportIcon}/>
              </div>
            </button>
          </Tooltip>
          <Tooltip content={t('Import: Import Agents from file')}>
            <button type="button"
                    className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')}
                    onClick={importYaml}>
              <div className="flex flex-row items-center gap-1 min-w-max">
                <img className="w-5 h-5 cursor-pointer" src={importIcon}/>
              </div>
            </button>
          </Tooltip>
          <Tooltip content={t('Upload: Generate a link that details the Agent')}>
            <button type="button"
                    className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')}
                    onClick={shareGpts}>
              <div className="flex flex-row items-center gap-1 min-w-max">
                <img className="w-5 h-5 cursor-pointer" src={uploadIcon}/>
              </div>
            </button>
          </Tooltip>
          <Tooltip content={t('Duplicate: Copy this agent locally')}>
            <button type="button"
                    className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')}
                    onClick={duplicate}>
              <div className="flex flex-row items-center gap-1 min-w-max">
                <img className="w-5 h-5 cursor-pointer" src={duplicateIcon}/>
              </div>
            </button>
          </Tooltip><
          Tooltip content={t('AI Generate: AI helper you generate.')}>
            <button type="button"
                    className={cx('rounded-xl', 'text-sm px-4 py-1', 'text-primary-text bg-secondary')}
                    onClick={generate}>
              <div className="flex flex-row items-center gap-1 min-w-max">
                <img className="w-5 h-5 cursor-pointer" src={generateEnable?generateEnableIcon:generateIcon}/>
              </div>
            </button>
          </Tooltip>
        </div>
      </div>
      <div className={"h-full flex " + (getLayoutRight() ? "flex-cow" : "flex-col")} ref={gameRef} >

        <Resizable
          key={resizeKey}
          className="editor-yaml-margin"
          enable={resizeEnableYaml}
          size={getStore("editor_yaml")}
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
            defaultValue={getRealYaml()}
            editorProps={{$blockScrolling: true}}
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
          enable={resizeEnableFunc}
          size={getStore("editor_func")}
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
            editorProps={{$blockScrolling: true}}
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
  const [editorYamlTimes] = useAtom(editorYamlTimesAtom)

  return (
    <div className={cx("overflow-hidden h-full ", props.className)}>
      <PromptForm key={editorYamlTimes}/>
    </div>
  )
}

export default LocalPrompts
