import * as ReactTooltip from '@radix-ui/react-tooltip'
import { FC, PropsWithChildren } from 'react'
import React, { useState, useEffect } from 'react';

interface IMousePositionModal {
  visible: boolean;
  content: string;
  defaultPosition: {
    x: number,
    y: number
  }
}

const GameButton = (props: IMousePositionModal) => {
  const { visible, content, defaultPosition } = props;
  const { x, y } = defaultPosition;

  return (
      <div
          id="mouse-position-modal"
          className="mouse-position-modal"
          style={{ left: `${x}px`, top: `${y}px`, visibility: `${visible ? 'visible' : 'hidden'}` }}
      >
        <div className="mouse-position-modal-content">{content}</div>
      </div>
  );
};

export default GameButton;