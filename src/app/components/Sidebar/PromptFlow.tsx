import cx from 'classnames'
import {useAtom} from "jotai/index";
import collapseIcon from '~/assets/icons/collapse.svg'
import {
  editorPromptAtom,
  editorPromptTimesAtom, embeddingEnableAtom, messageTimesTimesAtom, promptFlowDesc, promptFlowTips,
  seminarDisableAtom,
  showEditorAtom,
  yamlExceptionAtom
} from '~app/state'
import React, {MouseEvent as ReactMouseEvent, useCallback, useEffect, useState} from 'react';
import ReactFlow, {addEdge, Background, Edge, EdgeTypes, useEdgesState, useNodesState,} from 'reactflow';
import * as yamlParser from 'js-yaml';

import 'reactflow/dist/style.css';
import store from "store2";
import CustomEdge from "~app/components/Sidebar/CustomEdge";
import {Prompt,} from "~services/prompts";
import {
  checkGameUpdate, getPromptLib,
  getRealYaml,
  getStore, isHookedResponse, isChatMode, isYamlChanged, setEditorStatus,
  setRealYaml,
  setRealYamlKey,
  setStore, setHookedMessage
} from "~services/storage/memory-store";
import {useTranslation} from "react-i18next";
import {Node} from "@reactflow/core/dist/esm/types/nodes";
import Tooltip from "~app/components/Tooltip";
import {trackEvent} from "~app/plausible";
import {Connection} from "@reactflow/core/dist/esm/types/general";
import {getVersion, uuid} from "~utils";
import Browser from "webextension-polyfill";
import {initChatEmbedding} from "~embedding/retrieve";
import {handlePersistentStorage, initForWinStore} from "~services/storage/window-store";
import {initEnv} from "~app/utils/env";
import {PromptFlowDag, promptflowx} from "promptflowx";

function PromptFlow() {
  const {t} = useTranslation()
  const welcomeStr = t('Welcome ChatDev IDE!  Here,  You can explore the map, interact with existing Agent, or customize your Agent.  first of all, How would you like us to call you?')
  const welcomeIntro = t("Welcome, {player_name}! You can now use the arrow keys to control the game character to start exploring the map, and ensure you are logged in to the LLM website to access all features")
  const promptFlowOpen = t("Agent is already open. Please enter your requirements in the input box. ChatDev will automatically disassemble them and open the relevant roundtable meeting on the map according to the Agent defined on the right.")
  const promptFlowClose = t("Agent is already closed. You can continue to explore freely on the map and look for NPCs to interact with.")
  const promptFlowDone = t("The Agent has been completed. You can continue to wait for other team members to join. Click the button above to switch to chat mode and view the project overview. When all members are present, you can start the roundtable meeting and approach the corresponding team member to continue the current project discussion.")
  const [timerId, setTimerId] = useState<NodeJS.Timeout>();
  let flowEdge = ""
  let flowNode = ""

  const initialNodes = [
    {id: 'inputs', position: {x: 0, y: 0}, data: {label: 'inputs'}},
    {id: 'outputs', position: {x: 0, y: 100}, data: {label: 'outputs'}},
  ];
  const initialEdges = [{id: 'inputs-outputs', source: 'inputs', target: 'outputs', animated: true}];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const [seminarDisable, setSeminarDisable] = useAtom(seminarDisableAtom)
  const [yamlException, setYamlException] = useAtom(yamlExceptionAtom)

  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)

  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [changeTime, setChangeTime] = useAtom(messageTimesTimesAtom)
  const [isEmbeddingEnable, setEmbeddingEnable] = useAtom(embeddingEnableAtom)
  const [nodeClickTime, setNodeClickTime] = useState(0)
  const [desc, setDesc] = useAtom(promptFlowDesc);
  const [tips, setTips] = useAtom(promptFlowTips);

  const edgeTypes: EdgeTypes = {
    default: CustomEdge,
  };
  const threshold = 500;
  const [nodeBg, setNodeBg] = useState('#bbd9e9');

  const startTimer = () => {
    const id = setInterval(async () => {
      await updateReactCanvasFlow()

      // exception tips
      const exceptionNode = isHookedResponse("exception")
      if (exceptionNode)
        window.confirm(t('Agent') + " Exception: " + exceptionNode)

      await handlePersistentStorage()

      /*Handle panel refresh*/
      checkGameUpdate()
      setChangeTime(getStore("messageTimes", 0))


    }, 1000);

    setTimerId(id);
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  };

  const onNodeClick = (event: ReactMouseEvent, node: Node) => {
    const currentTime = new Date().getTime();
    if (nodeClickTime) {
      const timeInterval = currentTime - nodeClickTime;
      if (timeInterval < threshold) {
        const promptKey = node.data ? node.data.source : "";
        if (promptKey != "") {
          setEditorPrompt(promptKey);
          setEditorPromptTimes(editorPromptTimes + 1);
          setShowEditor(true);
          setEditorStatus(true)
          trackEvent('open_editor_node');
        }
      }
    }
    setNodeClickTime(currentTime)
  }

  useEffect(() => {
    setEditorStatus(showEditor)
  }, [showEditor]);

  useEffect(() => {
    initEnv()

    /*Tips store*/
    setStore("prompt_welcome", welcomeStr)
    setStore("prompt_welcome_intro", welcomeIntro)
    setStore("prompt_flow_open", promptFlowOpen)
    setStore("prompt_flow_close", promptFlowClose)
    setStore("prompt_flow_done", promptFlowDone)

    /*Game Mode init status*/
    const player_init = getStore("player_init", 0);
    if (player_init < 2) {
      setStore("player_init", 0)
    }

    /*hide link*/
    const links = document.querySelectorAll('a')
    links.forEach((link) => {
      if (link.href.includes('react')) {
        link.style.display = 'none';
      }
    });

    startTimer()

    /*update flow structure*/
    updateReactCanvasFlow()

    /* for chat embedding */
    initChatEmbedding(isEmbeddingEnable)

  }, []);

  function setCollapsedAndUpdate() {
    setSeminarDisable((c) => !c)
    updateReactCanvasFlow()
  }

  async function updateReactCanvasFlow() {
    if (isYamlChanged() && getRealYaml() != undefined) {
      try{
        console.log("updateReactCanvasFlow yaml changed: " + getRealYaml());
        // Initialize variables
        const inputs = {
          id: "inputs",
          data: {label: "inputs"},
          position: {x: 100, y: 0},
        }
        const canvasEdges = [] as Edge[];
        const canvasNodes = [] as Node[]
        canvasNodes.push(inputs)

        let prevNodeName = "inputs"
        const nodes = await promptflowx.buildPath(getRealYaml(), getPromptLib())
        let distance = 0;
        const dag = yamlParser.load(getRealYaml()) as PromptFlowDag;

        if (dag.desc){
          setDesc(dag.desc)
        }else{
          setDesc("")
        }

        if (!isChatMode() && dag.tips){
          setTips(dag.tips)
        }else{
          setTips([])
        }

        const minX = 0;
        const maxX = 150;

        for (const node of nodes) {
          const xPos = Math.random() * (maxX - minX) + minX;

          distance += 70
          const canvasNode = {
            id: node.name,
            data: {label: node.name, source: node.source.path},
            position: {x: xPos, y: distance}
          } as Node

          const canvasEdge = {
            id: `${prevNodeName}-${node.name}`,
            source: prevNodeName,
            target: node.name
          } as Edge

          canvasNodes.push(canvasNode)
          canvasEdges.push(canvasEdge)
          prevNodeName = node.name
        }

        // endpoint to `outputs`.
        canvasNodes.push({
          id: "outputs",
          data: {label: "outputs"},
          position: {x: 100, y: distance + 70}
        })
        canvasEdges.push({
          id: `${prevNodeName}-outputs}`,
          source: prevNodeName,
          target: "outputs"
        })

        setNodes((prevNodes) => prevNodes.filter((node) => node.id === ''));
        setNodes(() => [...canvasNodes]);

        setEdges((prevNodes) => prevNodes.filter((node) => node.id === ''));
        setEdges(() => [...canvasEdges]);

        setYamlException("")
      }catch (e){
        if (e instanceof Error) {
          setYamlException(e.toString())
          setEdges(initialEdges)
          setNodes(initialNodes)
        }
      }
    }

    // highlight the node & edge.
    if (getStore("flow_edge", "") !== flowEdge) {
      flowEdge = getStore("flow_edge", "")
      setEdges((prevNodes) =>
        prevNodes.map((node) =>
          node.id === flowEdge ? {...node, animated: true} : {...node, animated: false}
        )
      );
    }

    if (getStore("flow_node", "") !== flowNode) {
      flowNode = getStore("flow_node")
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === flowNode) {
            // it's important that you create a new object here
            // in order to notify react flow about the change
            node.style = {...node.style, backgroundColor: nodeBg};
          }

          return node;
        })
      );
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
        <img src={collapseIcon}
             className={cx('w-6 h-6 cursor-pointer my-5', seminarDisable ? 'self-end' : 'rotate-180')}
             onClick={() => setCollapsedAndUpdate()}/>
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
      {!seminarDisable && yamlException != "" && <div id="yaml-exception"
                                                      className="group relative flex items-center space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400">{yamlException}</div>}
    </aside>
  )
}

export default PromptFlow
