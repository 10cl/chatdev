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
  editorPromptTimesAtom,
  promptLibraryDialogOpen,
  showEditorAtom,
  showHistoryAtom
} from "~app/state";
import {BotId} from "~app/bots";
import {loadHistoryMessagesByMark} from "~services/chat-history";

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

  const openFlowEditor = useCallback(() => {
    // setEditorPrompt("Profile_" + store.get("pointerover_name"))
    setIsPromptLibraryDialogOpen(true)
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
          <img src={("./assets/profile/" + (store.get("pointerover_name") == null? "Ryan_Park":store.get("pointerover_name")) + ".png")} className="w-5 h-5"/>{content}
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