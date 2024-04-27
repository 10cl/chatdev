import cx from "classnames";
import React, {FC, MouseEventHandler, PropsWithChildren, useState} from "react";
import {useAtom, useAtomValue} from "jotai/index";
import {editorPromptAtom, floatTipsOpen, gameModeEnable} from "~app/state";
import {
  getMouseAgent,
  getPromptLib, getRealYaml,
  getStore,
  setStore,
} from "~services/storage/memory-store";
import GameAgentObjectModal from "~app/components/GameAgentObjectModal";
import {BotId} from "~app/bots";
import * as yamlParser from "js-yaml";
import {PromptFlowDag} from "promptflowx";

const GameModeView: FC<PropsWithChildren<{ botId: BotId }>> = (props) => {
  const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
  const [gameFloatVisible, setGameFloatVisible] = useAtom(floatTipsOpen);
  const [tipsContent, setTipsContent] = useState("")
  const [mouseAgentYaml, setMouseAgentYaml] = useState("")
  const [timeout, setTime] = useState(0)
  const [tipsPosition, setTipsPosition] = useState({x: 0, y: 0})
  let timeoutId;

  const getOffsetX = (e: any) => {
    const event = e || window.event;
    const srcObj = e.target || e.srcElement;
    if (event.offsetX) {
      return event.offsetX;
    } else {
      const rect = srcObj.getBoundingClientRect();
      const clientx = event.clientX;
      return clientx - rect.left;
    }
  }

  const getOffsetY = (e: any) => {
    const event = e || window.event;
    const srcObj = e.target || e.srcElement;
    if (event.offsetY) {
      return event.offsetY;
    } else {
      const rect = srcObj.getBoundingClientRect();
      const clientx = event.clientY;
      return clientx - rect.top;
    }
  }

  const updateTipsContent = (e: any) => {
    const event = e || window.event;
    const srcObj = e.target || e.srcElement;
    if (event.offsetY) {
      return event.offsetY;
    } else {
      const rect = srcObj.getBoundingClientRect();
      const clientx = event.clientY;
      return clientx - rect.top;
    }
  }

  const mouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    let offsetX = 0
    let offsetY = 0
    if (window.innerWidth - 500 < getOffsetX(e)) {
      offsetX = -315
    } else {
      offsetX = 90
    }
    if (window.innerHeight - 350 < getOffsetY(e)) {
      offsetY = 0 + 50
      offsetX = 50
    } else {
      offsetY = 50 + 30
      offsetX = 50
    }


    const x = getOffsetX(e) + offsetX;
    const y = getOffsetY(e) + offsetY;
    const prompts = getPromptLib()
    const mouseAgent = getMouseAgent()

    if (gameFloatVisible && tipsPosition && x > tipsPosition.x && x  < tipsPosition.x + 200 && y > tipsPosition.y && y < tipsPosition.y + 200){
      setTime(new Date().getTime())
      if (prompts !== null && mouseAgent != "") {
        if (mouseAgent !== mouseAgentYaml){
          setMouseAgentYaml(mouseAgent)
          const yaml = getPromptLib()[mouseAgent]
          if (yaml){
            const dag = yamlParser.load(yaml) as PromptFlowDag;
            setTipsContent(dag.desc ? dag.desc : mouseAgent)
          }else{
            setTipsContent(mouseAgent)
          }
        }
        setStore("prompt_edit", mouseAgent);
      }
      return
    }

    const current = new Date().getTime()
    if (current - timeout > 1000){
      setGameFloatVisible(false)
    }

    timeoutId = setTimeout(function (){
      setGameFloatVisible(false)
    }, 1000);

    //console.log("modal visible: " + gameFloatVisible + ", tipsPosition: " + tipsPosition.x + "," + tipsPosition.y + ", mouse: x: " + x + ", y: " +y);


    if (y < window.innerHeight - 250) {
      if (prompts !== null && mouseAgent != "") {

        if (mouseAgent !== mouseAgentYaml){
          const yaml = getPromptLib()[mouseAgent]
          if (yaml){
            const dag = yamlParser.load(yaml) as PromptFlowDag;
            setTipsContent(dag.desc ? dag.desc : mouseAgent)
          }else{
            setTipsContent(mouseAgent)
          }
        }
        setStore("prompt_edit", mouseAgent);
        setTime(new Date().getTime())
        clearTimeout(timeoutId)
        setGameFloatVisible(mouseAgent != "")
        setTipsPosition({x, y});
      }
    }
  }

  return <div>
    <div id="game-container" className={cx("game-container", isGameMode ? "" : "hidden")}
         onMouseMove={mouseMove}></div>
    {gameFloatVisible && <GameAgentObjectModal
      botId={props.botId}
      yaml={mouseAgentYaml}
      visible={gameFloatVisible}
      content={tipsContent}
      defaultPosition={tipsPosition}/>}</div>
}

export default GameModeView
