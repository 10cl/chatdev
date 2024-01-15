import cx from "classnames";
import React, {FC, MouseEventHandler, PropsWithChildren, useState} from "react";
import {useAtom, useAtomValue} from "jotai/index";
import {editorPromptAtom, floatTipsOpen, gameModeEnable} from "~app/state";
import {
    getStore,
    getTipsContent,
    getTipsPosition,
    setStore,
    setTipsContent,
    setTipsPosition
} from "~services/storage/memory-store";
import GameAgentObjectModal from "~app/components/GameAgentObjectModal";
import {BotId} from "~app/bots";

const GameModeView: FC<PropsWithChildren<{ botId: BotId }>> = (props) => {
    const [isGameMode, setGameModeEnable] = useAtom(gameModeEnable)
    const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)
    const [gameFloatVisible, setGameFloatVisible] = useAtom(floatTipsOpen);

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

    const mouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
        console.log("mouseMove")
        let offsetX = 0
        let offsetY = 0
        if (window.innerWidth - 500 < getOffsetX(e)) {
            offsetX = -315
        } else {
            offsetX = 90
        }
        if (window.innerHeight - 350 < getOffsetY(e)) {
            offsetY = 0
        } else {
            offsetY = 50
        }
        const x = getOffsetX(e) + offsetX;
        const y = getOffsetY(e) + offsetY;
        if (y < window.innerHeight - 250) {
            const prompts = getStore("prompts", null)
            const pointerover = getStore("pointerover", false)
            const pointerover_pos = getStore("pointerover_pos", "")
            if (prompts !== null) {
                if (pointerover) {
                    const promptKey = "Profile_" + getStore("pointerover_name", "")
                    setStore("prompt_edit", promptKey)
                    setTipsContent(getStore("pointer_tips", ""))

                } else if (pointerover_pos) {
                    setStore("prompt_edit", getStore("pointerover_pos_name", ""))
                    setTipsContent(getStore("pointer_tips", ""))
                }
                setGameFloatVisible(pointerover || pointerover_pos)
                setTipsPosition({x, y});
            }
        }
    }

    return <div><div id="game-container" className={cx("game-container", isGameMode ? "" : "hidden")}
             onMouseMove={mouseMove}></div>
        {gameFloatVisible && <GameAgentObjectModal
            botId={props.botId}
            visible={gameFloatVisible}
            content={getTipsContent()}
            defaultPosition={getTipsPosition()}/>}</div>
}

export default GameModeView
