import cx from 'classnames'
import {useAtom} from "jotai/index";
import collapseIcon from '~/assets/icons/collapse.svg'
import {
    editorPromptAtom,
    editorPromptTimesAtom,
    showEditorAtom,
    seminarDisableAtom, promptVersionAtom, gameModeEnable, editorYamlAtom, yamlExceptionAtom
} from '~app/state'
import React, {MouseEvent as ReactMouseEvent, useCallback, useEffect, useState} from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    addEdge, EdgeTypes,
} from 'reactflow';

import 'reactflow/dist/style.css';
import store from "store2";
import CustomEdge from "~app/components/Sidebar/CustomEdge";
import {getStore,
    loadLocalPrompts,
    loadRemotePrompts,
    Prompt, PromptVersion, setStore,
    updateLocalPrompts,
} from "~services/prompts";
import {useTranslation} from "react-i18next";
import {Node} from "@reactflow/core/dist/esm/types/nodes";
import Tooltip from "~app/components/Tooltip";
import editIcon from "~assets/icons/edit.svg";
import {trackEvent} from "~app/plausible";
import {Connection} from "@reactflow/core/dist/esm/types/general";
import Dialog from "~app/components/Dialog";
import Button from "~app/components/Button";
import useSWR from "swr";
import {importFromText} from "~app/utils/export";
import {getVersion, uuid} from "~utils";
import Browser from "webextension-polyfill";
function PromptFlow() {

    interface DevInfoPersist {
        prompts: any;
        player_pos: string;
        player_name: string;
        player_init: string;
        workFlowingDisable: boolean;
        gameModeEnable: boolean;
        flow_edges: any;
        flow_nodes: any;
        version: string;
        prompt_version: string;
        real_yaml: string;
    }

    interface DevInfo {
        prompts: any;
        prompt_welcome: any;
        prompt_task_introduce: any;
        prompt_welcome_intro: any;
        prompt_flow_open: any;
        prompt_flow_close: any;
        prompt_flow_done: any;
        response_type: string;
        input_text: string;
        input_text_pending: string;
        flow_node: any;
        flow_edge: any;
        input_text_message: string;
        player_pos: string;
        i18nextLng: string;
        player_name: string;
        player_init: any;
        workFlowingDisable: boolean;
        response_update_text: string;
        gameModeEnable: boolean;
        flow_edges: any;
        flow_nodes: any;
        version: string;
        prompt_version: string;
        real_yaml: string;
        editor_show: boolean;
    }

    interface Window {
        dev_info?: DevInfo;
    }

    const { t } = useTranslation()
    const welcomeStr = t('Welcome ChatDev IDE!  Here,  You can explore the map, interact with existing Agent, or customize your Agent.  first of all, How would you like us to call you?')
    const welcomeIntro = t("Welcome, {player_name}! You can now use the arrow keys to control the game character to start exploring the map, and ensure you are logged in to the LLM website to access all features")
    const promptFlowOpen = t("Agent is already open. Please enter your requirements in the input box. ChatDev will automatically disassemble them and open the relevant roundtable meeting on the map according to the Agent defined on the right.")
    const promptFlowClose = t("Agent is already closed. You can continue to explore freely on the map and look for NPCs to interact with.")
    const promptFlowDone = t("The Agent has been completed. You can continue to wait for other team members to join. Click the button above to switch to chat mode and view the project overview. When all members are present, you can start the roundtable meeting and approach the corresponding team member to continue the current project discussion.")
    const promptTaskIntroduce = t('Introduce yourself')
    // const promptsVersionQuery = useSWR('latest-prompts-version', () => getPromptVersion(), {suspense: true})
    // const [promptVersion, setPromptVersion] = useAtom(promptVersionAtom)
    const [timerId, setTimerId] = useState<number | null>(null);
    const [count, setCount] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    let flowEdge = ""
    let flowNode = ""

    const initialNodes = [
        {id: '1', position: {x: 0, y: 0}, data: {label: '1'}},
        {id: '2', position: {x: 0, y: 100}, data: {label: '2'}},
    ];
    const initialEdges = [{id: 'e1-2', source: '1', target: '2', animated: true}];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
    const [yamlException, setYamlException] = useAtom(yamlExceptionAtom)

    const [showEditor, setShowEditor] = useAtom(showEditorAtom)
    const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)

    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)

    const edgeTypes: EdgeTypes = {
        default: CustomEdge,
    };
    const threshold = 500;
    const [nodeBg, setNodeBg] = useState('#bbd9e9');
    let devInfoPersist

    async function handlePersistentStorage() {
        const win = window as Window
        if (win.dev_info != undefined){
            devInfoPersist = {
                prompts: win.dev_info.prompts,
                player_pos: win.dev_info.player_pos,
                player_name: win.dev_info.player_name,
                player_init: win.dev_info.player_init,
                workFlowingDisable: win.dev_info.workFlowingDisable,
                gameModeEnable: win.dev_info.gameModeEnable,
                flow_edges: win.dev_info.flow_edges,
                flow_nodes: win.dev_info.flow_nodes,
                version: win.dev_info.version,
                prompt_version: win.dev_info.prompt_version,
                real_yaml: win.dev_info.real_yaml
            } as DevInfoPersist
            store.set("dev_info", devInfoPersist)

            const prompts = win.dev_info.prompts
            if (prompts != undefined && Object.keys(prompts).length > 1) {
                handleBrowserStorage(prompts)
            }
        }
    }

    async function handleBrowserStorage(prompts:any) {
        const { prompts: prompts_value } = await Browser.storage.local.get('prompts')
        const browser_prompt_dict: { [key: string]: string } = {};
        const add_prompts = [] as Prompt[]

        ((prompts_value || []) as Prompt[]).forEach(item => {
            if (prompts[item.title] == undefined){
                prompts[item.title] = item.prompt
            }
            browser_prompt_dict[item.title] = item.prompt
        });

        for (const [key, value] of Object.entries(prompts)) {
            if (browser_prompt_dict[key] == undefined){
                const item = {
                    id: uuid(),
                    title: key,
                    prompt: value
                } as Prompt;
                add_prompts.push(item)
            }
        }
        if (add_prompts.length > 0){
            ((add_prompts || []) as Prompt[]).forEach(item => {
                prompts_value.unshift(item)
            })
            await Browser.storage.local.set({ prompts_value })
        }
    }

    const startTimer = () => {
        const id = setInterval(() => {
            setCount((prevCount) => prevCount + 1);
            const prompts = getStore("prompts", {})
            const player_init = getStore("player_init", 0)

            if (player_init == 2){
                setStore("player_init", 3)
                updateFlow()
                setSeminarDisable(false)
            }else if (prompts['Flow_Dag_Yaml'] != getStore("flow_yaml", undefined)){
                setStore("flow_yaml", prompts['Flow_Dag_Yaml'])
                updateFlow()
                setStore("chat_reset", true)
            }

            if (getStore("flow_edge", "") !== flowEdge) {
                flowEdge = getStore("flow_edge", "")
                setEdges((prevNodes) =>
                    prevNodes.map((node) =>
                        node.id === flowEdge ? {...node, animated: true} : {...node, animated: false}
                    )
                );
            }

            if (getStore("flow_node") && getStore("flow_node") !== flowNode){
                flowNode = getStore("flow_node")
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === getStore("flow_node").id) {
                            // it's important that you create a new object here
                            // in order to notify react flow about the change
                            node.style = {...node.style, backgroundColor: nodeBg};
                        }

                        return node;
                    })
                );
            }

            // exception tips
            const exceptionNode = getStore("exception_nodes")
            if (exceptionNode != null && exceptionNode != "") {
                setStore("exception_nodes", "")
                window.confirm(t('Agent') + " Exception: " + exceptionNode)
            }

            // yaml exception
            const yaml_exception = getStore("yaml_exception", "")
            console.log("yaml: " + yaml_exception + ", store: " + yamlException)
            setYamlException(yaml_exception)

            handlePersistentStorage()

        }, 3000);
        // @ts-ignore
        setTimerId(id);
        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    };

    const onNodeClick = (event: ReactMouseEvent, node: Node) => {
        const currentTime = new Date().getTime();
        const lastClickTime = getStore("chatdev_node_click_time")
        if (lastClickTime !== null && lastClickTime !== undefined) {
            const timeInterval = currentTime - lastClickTime;
            if (timeInterval < threshold) {
                // @ts-ignore
                const promptKey = node.source ? node.source.path : "";
                if (promptKey != "") {
                    // setStore("real_yaml", getStore("editor_yaml", "Default_Flow_Dag_Yaml"))
                    setEditorPrompt(promptKey);
                    // setEditorYaml(getStore("editor_yaml", "Default_Flow_Dag_Yaml"));

                    setEditorPromptTimes(editorPromptTimes + 1);
                    setShowEditor(true);
                    setStore("editor_show", true)
                    trackEvent('open_editor_node');
                }
            }
        }
        setStore("chatdev_node_click_time", currentTime)
    }

    useEffect(() => {
        const links = document.querySelectorAll('a')

        const win = window as Window

        let devInfoPersist = store.get("dev_info") as DevInfoPersist
        if (devInfoPersist == null){
            devInfoPersist = {} as DevInfoPersist
        }
        let cacheDevInfo = win.dev_info
        if (cacheDevInfo == undefined){
            cacheDevInfo = {} as DevInfo
        }
        if (store.get("player_name") != null){
            cacheDevInfo.player_name = store.get("player_name")
            devInfoPersist.player_name = store.get("player_name")
        }

        win.dev_info = {
            prompts: devInfoPersist.prompts == undefined ? {} : devInfoPersist.prompts,
            prompt_welcome: cacheDevInfo.prompt_welcome !== undefined ? cacheDevInfo.prompt_welcome : welcomeStr,
            prompt_task_introduce: cacheDevInfo.prompt_task_introduce !== undefined ? cacheDevInfo.prompt_task_introduce : promptTaskIntroduce,
            prompt_welcome_intro: cacheDevInfo.prompt_welcome_intro !== undefined ? cacheDevInfo.prompt_welcome_intro : welcomeIntro,
            prompt_flow_open: cacheDevInfo.prompt_flow_open !== undefined ? cacheDevInfo.prompt_flow_open : promptFlowOpen,
            prompt_flow_close: cacheDevInfo.prompt_flow_close !== undefined ? cacheDevInfo.prompt_flow_close : promptFlowClose,
            prompt_flow_done: cacheDevInfo.prompt_flow_done !== undefined ? cacheDevInfo.prompt_flow_done : promptFlowDone,
            response_type: cacheDevInfo.response_type !== undefined ? cacheDevInfo.response_type : "",
            input_text: cacheDevInfo.input_text !== undefined ? cacheDevInfo.input_text : "",
            input_text_pending: cacheDevInfo.input_text_pending !== undefined ? cacheDevInfo.input_text_pending : "",
            flow_node: cacheDevInfo.flow_node !== undefined ? cacheDevInfo.flow_node : {},
            flow_edge: cacheDevInfo.flow_edge !== undefined ? cacheDevInfo.flow_edge : {},
            input_text_message: cacheDevInfo.input_text_message !== undefined ? cacheDevInfo.input_text_message : "",
            player_pos: cacheDevInfo.player_pos !== undefined ? cacheDevInfo.player_pos : devInfoPersist.player_pos,
            i18nextLng: store.get("i18nextLng") == null ? "en" : store.get("i18nextLng"),
            player_name: cacheDevInfo.player_name !== undefined ? cacheDevInfo.player_name : (devInfoPersist.player_name == undefined ? "ChatDev" : devInfoPersist.player_name),
            player_init: cacheDevInfo.player_init !== undefined ? cacheDevInfo.player_init : (devInfoPersist.player_init == undefined ? 0 : devInfoPersist.player_init),
            workFlowingDisable: cacheDevInfo.workFlowingDisable !== undefined ? cacheDevInfo.workFlowingDisable : (devInfoPersist.workFlowingDisable == undefined ? false : devInfoPersist.workFlowingDisable),
            response_update_text: cacheDevInfo.response_update_text !== undefined ? cacheDevInfo.response_update_text : "",
            gameModeEnable: cacheDevInfo.gameModeEnable !== undefined ? cacheDevInfo.gameModeEnable : (devInfoPersist.gameModeEnable == undefined ? true : devInfoPersist.gameModeEnable),
            flow_edges: cacheDevInfo.flow_edges !== undefined ? cacheDevInfo.flow_edges : devInfoPersist.flow_edges,
            flow_nodes: cacheDevInfo.flow_nodes !== undefined ? cacheDevInfo.flow_nodes : devInfoPersist.flow_nodes,
            version: cacheDevInfo.version !== undefined ? cacheDevInfo.version : (devInfoPersist.version == undefined ? getVersion() : devInfoPersist.version),
            prompt_version: cacheDevInfo.prompt_version !== undefined ? cacheDevInfo.prompt_version : (devInfoPersist.prompt_version == undefined ? getVersion() : devInfoPersist.prompt_version),
            real_yaml: cacheDevInfo.real_yaml !== undefined ? cacheDevInfo.real_yaml : (devInfoPersist.real_yaml == undefined ? "Default_Flow_Dag_Yaml" : devInfoPersist.real_yaml),
            editor_show: showEditor
        };
        const player_init = getStore("player_init", 0);
        if(player_init < 2){
            setStore("player_init", 0)
        }

        updateLocalPrompts()

        // const promptVersionLocal = getStore("prompt_version", getVersion())
        // const promptVersionRemote = promptsVersionQuery.data as PromptVersion
        /*if (promptVersionRemote.version != "" && promptVersionRemote.version != promptVersionLocal){
            setPromptVersion(promptVersionRemote.version)
            setStore("prompt_version", promptVersionRemote.version)
            loadTheLatestPrompt().then(r => {
                importFromText(r.yaml)
            })
        }*/
        links.forEach((link) => {
            if (link.href.includes('react')) {
                link.style.display = 'none';
            }
        });
        startTimer()
        updateFlow()
    }, []);

    function setCollapsedAndUpdate() {
        setSeminarDisable((c) => !c)
        updateFlow()
    }

    function updateFlow() {
        if (getStore("flow_edges", "") !== undefined && getStore("flow_edges", "") !== "") {

            setNodes((prevNodes) => prevNodes.filter((node) => node.id === ''));
            const nodesFlows = getStore("flow_nodes")
            // for (let i = 0; i < nodesFlows.length; i++) {
            //   setNodes((prevNodes) => [...prevNodes, nodesFlows[i]]);
            // }
            setNodes(() => [...nodesFlows]);

            setEdges((prevNodes) => prevNodes.filter((node) => node.id === ''));
            const edgesFlows = getStore("flow_edges")
            // for (let i = 0; i < edgesFlows.length; i++) {
            //   setEdges((prevNodes) => [...prevNodes, edgesFlows[i]]);
            // }
            setEdges(() => [...edgesFlows]);
        }
    }

    return (
        <aside
            className={cx(
                'flex flex-col bg-primary-background bg-opacity-40 overflow-hidden',
                seminarDisable ? 'items-center px-[15px]' : 'w-[330px] px-4',
            )}
        >
            <Tooltip content={t('Visualization of Agent structure')}>
                <img src={collapseIcon} className={cx('w-6 h-6 cursor-pointer my-5', seminarDisable ? 'self-end' : 'rotate-180')} onClick={() => setCollapsedAndUpdate()} />
            </Tooltip>
            <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">

            </div>
            <div className="h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    // connectionLineComponent={ConnectionLine}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    // edgeTypes={edgeTypes}
                >
                    {/*<MiniMap/>*/}
                    {/*<Controls/>*/}
                    <Background/>
                </ReactFlow>
            </div>
            {!seminarDisable && yamlException != "" && <div id="yaml-exception" className="group relative flex items-center space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400">{yamlException}</div>}
        </aside>
    )
}

export default PromptFlow
