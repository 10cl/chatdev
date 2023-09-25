import React, {ComponentType} from 'react';
import {ConnectionLineComponentProps} from "@reactflow/core/dist/esm/types/edges";

const ConnectionLine: ComponentType<ConnectionLineComponentProps> = ({
                                                                         fromX,
                                                                         fromY,
                                                                         fromPosition,
                                                                         toX,
                                                                         toY,
                                                                         toPosition,
                                                                         connectionLineType,
                                                                         connectionLineStyle,
                                                                     }) => {
    return (
        <g>
            <path
                fill="none"
                stroke="#222"
                strokeWidth={3}
                className="animated"
                d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
            />
            <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5}/>
        </g>
    );
};

export default ConnectionLine;
