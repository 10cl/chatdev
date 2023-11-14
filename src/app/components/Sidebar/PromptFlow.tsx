import cx from 'classnames'
import {useAtom} from "jotai/index";
import collapseIcon from '~/assets/icons/collapse.svg'
import {
    editorPromptAtom,
    editorPromptTimesAtom,
    showEditorAtom,
    seminarDisableAtom, inputTextAtom, promptVersionAtom
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
import {
    getPromptVersion,
    loadLocalPrompts,
    loadRemotePrompts, loadTheLatestPrompt,
    Prompt, PromptVersion,
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
import {getVersion} from "~utils";

function PromptFlow() {
    function updateFlow() {
        if (store.get("flow_edges", "") !== undefined && store.get("flow_edges", "") !== "") {

            setNodes((prevNodes) => prevNodes.filter((node) => node.id === ''));
            const nodesFlows = store.get("flow_nodes")
            // for (let i = 0; i < nodesFlows.length; i++) {
            //   setNodes((prevNodes) => [...prevNodes, nodesFlows[i]]);
            // }
            setNodes(() => [...nodesFlows]);

            setEdges((prevNodes) => prevNodes.filter((node) => node.id === ''));
            const edgesFlows = store.get("flow_edges")
            // for (let i = 0; i < edgesFlows.length; i++) {
            //   setEdges((prevNodes) => [...prevNodes, edgesFlows[i]]);
            // }
            setEdges(() => [...edgesFlows]);
        }
    }
    const { t } = useTranslation()
    const welcomeStr = t('Welcome to our extension ChatDev! Here, you can explore the chat capabilities of multiple large models and create custom workflows using the visual prompt workflow editor. Through these GPTss, you can generate stunning in-game demos in real-time and ultimately achieve the results you desire. In the game, we may need to address you. How would you like us to call you?')
    const welcomeIntro = t("Welcome, {player_name}! We are thrilled to have you on board. When you open the right sidebar and input your requirements, our GPTs will allocate your requirements to the CEO, CTO, Product Manager, and Tester. They will collectively discuss them in a virtual roundtable meeting, gradually transforming your requirements into a feasible business plan. You can approach any NPC to continue the discussion or edit the visual GPTs to turn your ideas into reality!")
    const promptFlowOpen = t("GPTs is already open. Please enter your requirements in the input box. ChatDev will automatically disassemble them and open the relevant roundtable meeting on the map according to the GPTs defined on the right.")
    const promptFlowClose = t("GPTs is already closed. You can continue to explore freely on the map and look for NPCs to interact with.")
    const promptFlowDone = t("The GPTs has been completed. You can continue to wait for other team members to join. Click the button above to switch to chat mode and view the project overview. When all members are present, you can start the roundtable meeting and approach the corresponding team member to continue the current project discussion.")
    const promptTaskIntroduce = t('Introduce yourself')
    const promptsVersionQuery = useSWR('latest-prompts-version', () => getPromptVersion(), {suspense: true})
    const [promptVersion, setPromptVersion] = useAtom(promptVersionAtom)

    useEffect(() => {
        const links = document.querySelectorAll('a');
        updateLocalPrompts()

        let promptVersionLocal = store.get("prompt_version")
        if (promptVersionLocal == null){
            promptVersionLocal = getVersion()
        }
        const promptVersionRemote = promptsVersionQuery.data as PromptVersion
        if (promptVersionRemote.version != "" && promptVersionRemote.version != promptVersionLocal){
            setPromptVersion(promptVersionRemote.version)
            loadTheLatestPrompt().then(r => {
                importFromText(r.yaml)
            })
        }

        store.set("prompt_welcome", welcomeStr);
        store.set("prompt_task_introduce", promptTaskIntroduce);
        store.set("prompt_welcome_intro", welcomeIntro);
        store.set("prompt_flow_open", promptFlowOpen);
        store.set("prompt_flow_close", promptFlowClose);
        store.set("prompt_flow_done", promptFlowDone);
        const player_init = store.get("player_init");
        if(player_init !== undefined && player_init < 2){
            store.set("player_init", 0)
        }
        links.forEach((link) => {
            if (link.href.includes('react')) {
                link.style.display = 'none';
            }
        });
        stopTimer()
        startTimer()
        updateFlow()
    }, []);

    function setCollapsedAndUpdate() {
        setSeminarDisable((c) => !c)

        updateFlow()
        stopTimer()
        startTimer()
    }

    const [count, setCount] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    let flowEdge = ""
    let flowNode = ""
    let promptsCache = ""

    const startTimer = () => {
        const id = setInterval(() => {
            setCount((prevCount) => prevCount + 1);
            const prompts = store.get("prompts")
            const player_init = store.get("player_init");
            if (player_init !== undefined && player_init == 2){
                store.set("player_init", 3)
                updateFlow()
                setSeminarDisable(false)
            }
            if (prompts !== null && prompts['Flow_Dag_Yaml'] != promptsCache){
                promptsCache = prompts['Flow_Dag_Yaml']
                updateFlow()
            }
            if (store.get("flow_edge") && store.get("flow_edge", "") !== flowEdge) {
                flowEdge = store.get("flow_edge", "")

                setEdges((prevNodes) =>
                    prevNodes.map((node) =>
                        node.id === flowEdge ? {...node, animated: true} : {...node, animated: false}
                    )
                );

            }
            if (store.get("flow_node") && store.get("flow_node") !== flowNode){
                flowNode = store.get("flow_node")
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === store.get("flow_node").id) {
                            // it's important that you create a new object here
                            // in order to notify react flow about the change
                            node.style = {...node.style, backgroundColor: nodeBg};
                        }

                        return node;
                    })
                );
            }

            // exception tips
            const exceptionNode = store.get("exception_nodes")
            if (exceptionNode != null && exceptionNode != "") {
                store.set("exception_nodes", "")
                window.confirm(t('GPTs') + " Exception: " + exceptionNode)
            }

        }, 1000);

        // @ts-ignore
        setIntervalId(id);
    };

    // 停止定时器
    const stopTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const initialNodes = [
        {id: '1', position: {x: 0, y: 0}, data: {label: '1'}},
        {id: '2', position: {x: 0, y: 100}, data: {label: '2'}},
    ];
    const initialEdges = [{id: 'e1-2', source: '1', target: '2', animated: true}];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)

    const [showEditor, setShowEditor] = useAtom(showEditorAtom)
    const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
    const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)

    const edgeTypes: EdgeTypes = {
        default: CustomEdge,
    };

    const threshold = 500;

    const [nodeBg, setNodeBg] = useState('#bbd9e9');
    const onNodeClick = (event: ReactMouseEvent, node: Node) => {
        const currentTime = new Date().getTime();
        const lastClickTime = store.get("chatdev_node_click_time")
        if (lastClickTime !== null && lastClickTime !== undefined) {
            const timeInterval = currentTime - lastClickTime;
            if (timeInterval < threshold) {
                // @ts-ignore
                if (node.source && node.source.path) {
                    // @ts-ignore
                    setEditorPrompt(node.source.path);
                    setEditorPromptTimes(editorPromptTimes + 1);
                    setShowEditor(true);
                    trackEvent('open_editor_node');
                }
            }
        }
        store.set("chatdev_node_click_time", currentTime)
    }

    return (
        <aside
            className={cx(
                'flex flex-col bg-primary-background bg-opacity-40 overflow-hidden',
                seminarDisable ? 'items-center px-[15px]' : 'w-[430px] px-4',
            )}
        >
            <Tooltip content={'GPTs Flow'}>
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
        </aside>
    )
}

export default PromptFlow
