import cx from 'classnames'
import {useAtom} from 'jotai'
import collapseIcon from '~/assets/icons/collapse.svg'
import {sidebarRightCollapsedAtom} from '~app/state'
import {useCallback, useEffect, useState} from 'react';
// @ts-ignore
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge, EdgeTypes,
} from 'reactflow';

import 'reactflow/dist/style.css';
import store from "store2";
import ConnectionLine from "~app/components/Sidebar/ConnectionLine";
import CustomEdge from "~app/components/Sidebar/CustomEdge";
import useSWR from "swr";
import {loadLocalPrompts} from "~services/prompts";
import {useTranslation} from "react-i18next";

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
    const welcomeStr = t('Welcome to our extension ChatDev! Here, you can explore the chat capabilities of multiple large models and create custom workflows using the visual prompt workflow editor. Through these prompt flows, you can generate stunning in-game demos in real-time and ultimately achieve the results you desire. In the game, we may need to address you. How would you like us to call you?')
    const welcomeIntro = t("Welcome, {player_name}! We are thrilled to have you on board. When you open the right sidebar and input your requirements, our Prompt Flow will allocate your requirements to the CEO, CTO, Product Manager, and Tester. They will collectively discuss them in a virtual roundtable meeting, gradually transforming your requirements into a feasible business plan. You can approach any NPC to continue the discussion or edit the visual Prompt Flow to turn your ideas into reality!")
    const promptFlowOpen = t("Prompt Flow is already open. Please enter your requirements in the input box. ChatDev will automatically disassemble them and open the relevant roundtable meeting on the map according to the Prompt Flow defined on the right.")
    const promptFlowClose = t("Prompt Flow is already closed. You can continue to explore freely on the map and look for NPCs to interact with.")
    const promptFlowDone = t("The Prompt Flow has been completed. You can continue to wait for other team members to join. Click the button above to switch to chat mode and view the project overview. When all members are present, you can start the roundtable meeting and approach the corresponding team member to continue the current project discussion.")
    useEffect(() => {
        const links = document.querySelectorAll('a');
        loadLocalPrompts()
        store.set("prompt_welcome", welcomeStr);
        store.set("prompt_welcome_intro", welcomeIntro);
        store.set("prompt_flow_open", promptFlowOpen);
        store.set("prompt_flow_close", promptFlowClose);
        store.set("prompt_flow_done", promptFlowDone);

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
        setCollapsed((c) => !c)

        updateFlow()
        stopTimer()
        startTimer()
    }

    const [count, setCount] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    let flowEdge = ""
    let flowNode = ""
    let promptsCache = ""
    // 开始定时器
    const startTimer = () => {
        const id = setInterval(() => {
            setCount((prevCount) => prevCount + 1);
            const prompts = store.get("prompts")
            if (store.get("player_init") !== undefined && store.get("player_init") == 2){
                store.set("player_init", 3)
                setCollapsed(true)
            }
            if (prompts !== undefined && prompts['Flow_Dag_Yaml'] != promptsCache){
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

    // @ts-ignore
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const [collapsed, setCollapsed] = useAtom(sidebarRightCollapsedAtom)

    const edgeTypes: EdgeTypes = {
        default: CustomEdge,
    };

    const [nodeBg, setNodeBg] = useState('#bbd9e9');


    return (
        <aside
            className={cx(
                'flex flex-col bg-primary-background bg-opacity-40 overflow-hidden',
                collapsed ? 'items-center px-[15px]' : 'w-[430px] px-4',
            )}
        >
            <img
                src={collapseIcon}
                className={cx('w-6 h-6 cursor-pointer my-5', collapsed ? 'self-end' : 'rotate-180')}
                onClick={() => setCollapsedAndUpdate()}
            />
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
