import * as ReactTooltip from '@radix-ui/react-tooltip'
import {FC, PropsWithChildren, useCallback} from 'react'
import React, { useState, useEffect } from 'react';
import {GoBook} from "react-icons/go";
import store from "store2";
import Tooltip from "~app/components/Tooltip";
import editIcon from "~assets/icons/edit_blue.svg";
import historyIcon from "~assets/icons/history_mark.svg";
import {useTranslation} from "react-i18next";
import {trackEvent} from "~app/plausible";
import {useAtom} from "jotai/index";
import {
  editorPromptAtom,
  editorPromptTimesAtom, editorYamlAtom, editorYamlTimesAtom, floatTipsOpen, promptLibraryDialogOpen,
  showEditorAtom,
  showHistoryAtom
} from "~app/state";
import {BotId} from "~app/bots";
import {loadHistoryMessagesByMark} from "~services/chat-history";
import {getStore, setStore} from "~services/prompts";
import {toBase64} from "js-base64";

interface IMousePositionModal {
  visible: boolean;
  content: string;
  botId: BotId
  defaultPosition: {
    x: number,
    y: number
  }
}

const GameButton = (props: IMousePositionModal) => {
  const { visible, content, defaultPosition } = props;
  const { x, y } = defaultPosition;
  const { t } = useTranslation()

  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useAtom(promptLibraryDialogOpen)
  const [editorPrompt, setEditorPrompt] = useAtom(editorPromptAtom)

  const [editorPromptTimes, setEditorPromptTimes] = useAtom(editorPromptTimesAtom)
  const [showEditor, setShowEditor] = useAtom(showEditorAtom)
  const [gameFloatVisible, setGameFloatVisible] = useAtom(floatTipsOpen);
  const [editorYamlTimes, setEditorYamlTimes] = useAtom(editorYamlTimesAtom)

  const openFlowEditor = useCallback(() => {
    // setIsPromptLibraryDialogOpen(true)
    setStore("real_yaml", getStore(("prompt_edit")))
    if (getStore("prompts")[getStore("real_yaml", "Default_Flow_Dag_Yaml")] == undefined) {
      getStore("prompts")[getStore("real_yaml", "Default_Flow_Dag_Yaml")] = "#" + getStore("pointer_tips", "TODO") + "\n" + getStore("prompts")["Action_YAML_Template"]
    }
    setEditorPrompt("Action_Prompt_Template");
    // setEditorPrompt(getStore("prompt_edit"));
    setShowEditor(true);
    setStore("editor_show", true)
    setGameFloatVisible(false)

    const editorYamlTimes = getStore("editorYamlTimes", 0) + 1
    setEditorYamlTimes(editorYamlTimes)
    setStore("editorYamlTimes", editorYamlTimes)

    trackEvent('open_editor_profile')
  }, [])

  const [showHistory, setShowHistory] = useAtom(showHistoryAtom)

  const openHistoryDialog = useCallback(() => {
    setShowHistory(true)
    trackEvent('open_mark_history_dialog', { botId: props.botId })
  }, [props.botId])

  return (
      <div id="mouse-position-modal"
          className="mouse-position-modal"
          style={{left: `${x}px`, top: `${y}px`, visibility: `${visible ? 'visible' : 'hidden'}`}}>
        <div className="mouse-position-modal-content">
          <img src={("./assets/profile/" + getStore("pointerover_name", "Ryan_Park") + ".png")} className="w-5 h-5"/>{content}
          <div className="flex flex-row items-center float-right">
            <Tooltip content={t('View history')}>
              <img src={historyIcon} className="w-6 h-6 cursor-pointer float-right" onClick={openHistoryDialog}/>
            </Tooltip>
            <Tooltip content={t('Edit')}>
              <img src={editIcon} className="w-5 h-5 cursor-pointer float-right" onClick={openFlowEditor}/>
            </Tooltip>
          </div>
        </div>
      </div>
  );
};

export default GameButton;
