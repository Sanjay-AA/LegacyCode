import React from 'react';

const EDGE_COLORS = {
  IMPORTS: '#38bdf8',
  CALLS: '#c084fc',
  DEPENDS_ON: '#94a3b8',
  REFERENCES: '#f59e0b',
  USES: '#ec4899',
  RENDERS: '#10b981',
  API_REQUEST: '#14b8a6'
};

export default function ArchitectureEdge({ edge, sourceX, sourceY, targetX, targetY, isHighlighted }) {
  if (sourceX === undefined || sourceY === undefined || targetX === undefined || targetY === undefined) {
    return null;
  }

  const color = EDGE_COLORS[edge.type] || '#64748b';
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Bezier curve calculation
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const cx1 = sourceX + dx * 0.4;
  const cy1 = sourceY;
  const cx2 = sourceX + dx * 0.6;
  const cy2 = targetY;

  const pathString = `M ${sourceX} ${sourceY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetX} ${targetY}`;

  return (
    <g className="group">
      {/* Outer hover glow */}
      <path
        d={pathString}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? 4 : 2}
        strokeOpacity={isHighlighted ? 0.9 : 0.4}
        className="transition-all duration-200 group-hover:stroke-white group-hover:stroke-opacity-80"
      />

      {/* Label Badge */}
      {edge.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x="-30"
            y="-9"
            width="60"
            height="18"
            rx="5"
            fill="#0c1219"
            stroke={color}
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill={color}
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
            className="select-none uppercase"
          >
            {edge.label.length > 9 ? edge.label.substring(0, 8) + '…' : edge.label}
          </text>
        </g>
      )}
    </g>
  );
}
