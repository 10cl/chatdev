import cx from 'classnames'
import {useAtom} from "jotai/index";
import collapseIcon from '~/assets/icons/collapse.svg'
import {
  editorPromptAtom,
  editorPromptTimesAtom, embeddingEnableAtom, messageTimesTimesAtom,
  seminarDisableAtom,
  showEditorAtom,
  yamlExceptionAtom
} from '~app/state'
import React, {MouseEvent as ReactMouseEvent, useCallback, useEffect, useState} from 'react';
import ReactFlow, {addEdge, Background, EdgeTypes, useEdgesState, useNodesState,} from 'reactflow';

import 'reactflow/dist/style.css';
import store from "store2";
import CustomEdge from "~app/components/Sidebar/CustomEdge";
import {Prompt,} from "~services/prompts";
import {
  checkGameUpdate,
  getRealYaml,
  getStore, isHookedResponse, setEditorStatus,
  setRealYaml,
  setRealYamlKey,
  setStore
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

function PromptFlow() {
  const {t} = useTranslation()
  const welcomeStr = t('Welcome ChatDev IDE!  Here,  You can explore the map, interact with existing Agent, or customize your Agent.  first of all, How would you like us to call you?')
  const welcomeIntro = t("Welcome, {player_name}! You can now use the arrow keys to control the game character to start exploring the map, and ensure you are logged in to the LLM website to access all features")
  const promptFlowOpen = t("Agent is already open. Please enter your requirements in the input box. ChatDev will automatically disassemble them and open the relevant roundtable meeting on the map according to the Agent defined on the right.")
  const promptFlowClose = t("Agent is already closed. You can continue to explore freely on the map and look for NPCs to interact with.")
  const promptFlowDone = t("The Agent has been completed. You can continue to wait for other team members to join. Click the button above to switch to chat mode and view the project overview. When all members are present, you can start the roundtable meeting and approach the corresponding team member to continue the current project discussion.")
  const [timerId, setTimerId] = useState<number | null>(null);
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
  const [changeTime, setChangeTime] = useAtom(messageTimesTimesAtom)
  const [isEmbeddingEnable, setEmbeddingEnable] = useAtom(embeddingEnableAtom)

  const edgeTypes: EdgeTypes = {
    default: CustomEdge,
  };
  const threshold = 500;
  const [nodeBg, setNodeBg] = useState('#bbd9e9');

  const startTimer = () => {
    const id = setInterval(() => {
      const player_init = getStore("player_init", 0)

      if (player_init == 2) {
        setStore("player_init", 3)
        updateFlow()
        setSeminarDisable(false)
      } else if (getRealYaml != getStore("flow_yaml", undefined)) {
        setStore("flow_yaml", getRealYaml())
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

      if (getStore("flow_node") && getStore("flow_node") !== flowNode) {
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
      const exceptionNode = isHookedResponse("exception")
      if (exceptionNode)
        window.confirm(t('Agent') + " Exception: " + exceptionNode)

      // yaml check exception
      const yaml_exception = getStore("yaml_exception", "")
      setYamlException(yaml_exception)
      handlePersistentStorage()

      /*Handle panel refresh*/
      checkGameUpdate()
      setChangeTime(getStore("messageTimes", 0))

    }, 1000);
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
          setEditorPrompt(promptKey);
          setEditorPromptTimes(editorPromptTimes + 1);
          setShowEditor(true);
          setEditorStatus(true)
          trackEvent('open_editor_node');
        }
      }
    }
    setStore("chatdev_node_click_time", currentTime)
  }

  useEffect(() => {
    initEnv()

    /*Tips store*/
    setStore("prompt_welcome", welcomeStr)
    setStore("prompt_welcome_intro", welcomeIntro)
    setStore("prompt_flow_open", promptFlowOpen)
    setStore("prompt_flow_close", promptFlowClose)
    setStore("prompt_flow_done", promptFlowDone)
    setEditorStatus(showEditor)

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
    updateFlow()

    /* for chat embedding */
    initChatEmbedding(isEmbeddingEnable)

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
      setStore("yaml_changed", true)
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
