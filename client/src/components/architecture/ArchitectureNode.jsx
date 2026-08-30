import React from 'react';
import { FileCode, Globe, Server, Package, Layout, Sparkles, Code2, Database, Terminal, Cpu } from 'lucide-react';

const CATEGORY_COLORS = {
  Application: { bg: '#3b0764', border: '#a855f7', text: '#e9d5ff', icon: Layout },
  EntryPoint: { bg: '#451a03', border: '#f59e0b', text: '#fef3c7', icon: Sparkles },
  HTML: { bg: '#431407', border: '#f97316', text: '#ffedd5', icon: Globe },
  JavaScript: { bg: '#082f49', border: '#38bdf8', text: '#e0f2fe', icon: FileCode },
  ReactComponent: { bg: '#022c22', border: '#10b981', text: '#d1fae5', icon: Code2 },
  BackendController: { bg: '#2e1065', border: '#8b5cf6', text: '#ede9fe', icon: Server },
  Service: { bg: '#2e1065', border: '#8b5cf6', text: '#ede9fe', icon: Server },
  DataSchema: { bg: '#134e4a', border: '#14b8a6', text: '#ccfbf1', icon: Database },
  InfraManifest: { bg: '#1e1b4b', border: '#6366f1', text: '#e0e7ff', icon: Terminal },
  API: { bg: '#134e4a', border: '#14b8a6', text: '#ccfbf1', icon: Cpu },
  Dependency: { bg: '#4c0519', border: '#f43f5e', text: '#ffe4e6', icon: Package },
  ExternalLibrary: { bg: '#4c0519', border: '#ec4899', text: '#fce7f3', icon: Package },
  CSS: { bg: '#1e1b4b', border: '#6366f1', text: '#e0e7ff', icon: Layout }
};

export default function ArchitectureNode({ node, x, y, isSelected, onClick, onMouseEnter, onMouseLeave }) {
  const categoryConfig = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.JavaScript;
  const Icon = categoryConfig.icon;
  const width = 190;
  const height = 58;

  return (
    <g
      transform={`translate(${x - width / 2}, ${y - height / 2})`}
      onClick={() => onClick && onClick(node)}
      onMouseEnter={(e) => onMouseEnter && onMouseEnter(node, e)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      className="cursor-pointer group transition-all duration-200"
    >
      {/* Glow shadow for selected node */}
      {isSelected && (
        <rect
          x="-4"
          y="-4"
          width={width + 8}
          height={height + 8}
          rx="14"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          className="animate-pulse opacity-80"
        />
      )}

      {/* Main Node Box */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="10"
        fill={categoryConfig.bg}
        stroke={isSelected ? '#10b981' : categoryConfig.border}
        strokeWidth={isSelected ? '2.5' : '1.5'}
        className="filter drop-shadow-lg transition-colors group-hover:stroke-white"
      />

      {/* Node Header Badge */}
      <rect
        x="0"
        y="0"
        width={width}
        height="18"
        rx="10"
        fill={categoryConfig.border}
        opacity="0.25"
      />

      {/* Icon */}
      <g transform="translate(10, 20)">
        <foreignObject width="18" height="18">
          <div style={{ color: categoryConfig.border }}>
            <Icon className="w-4 h-4" />
          </div>
        </foreignObject>
      </g>

      {/* Label */}
      <text
        x="34"
        y="26"
        fill="#f8fafc"
        fontSize="11"
        fontWeight="bold"
        fontFamily="monospace"
        className="select-none"
      >
        {node.label.length > 20 ? node.label.substring(0, 18) + '…' : node.label}
      </text>

      {/* Category / Technology Badge Text */}
      <text
        x="34"
        y="44"
        fill={categoryConfig.border}
        fontSize="9"
        fontWeight="600"
        fontFamily="sans-serif"
        className="select-none uppercase tracking-wider"
      >
        {node.technology || node.category}
      </text>
    </g>
  );
}
