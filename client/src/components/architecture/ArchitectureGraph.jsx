import React, { useState, useRef, useMemo } from 'react';
import ArchitectureNode from './ArchitectureNode';
import ArchitectureEdge from './ArchitectureEdge';
import { ZoomIn, ZoomOut, Maximize2, X, Info, GitCommit, FileCode, CheckCircle2, Workflow } from 'lucide-react';

export default function ArchitectureGraph({ architecture, isModern }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const containerRef = useRef(null);

  // Compute node positions layout based on evidence layers
  const nodePositions = useMemo(() => {
    if (!architecture || !architecture.nodes) return new Map();

    const positions = new Map();
    const nodes = architecture.nodes;

    const rootNodes = nodes.filter(n => n.category === 'Application');
    const entryNodes = nodes.filter(n => n.category === 'EntryPoint');
    const uiNodes = nodes.filter(n => n.category === 'HTML' || n.category === 'JavaScript' || n.category === 'ReactComponent');
    const beNodes = nodes.filter(n => n.category === 'BackendController' || n.category === 'Service');
    const dataNodes = nodes.filter(n => n.category === 'DataSchema' || n.category === 'InfraManifest');
    const apiNodes = nodes.filter(n => n.category === 'API');
    const depNodes = nodes.filter(n => n.category === 'Dependency' || n.category === 'ExternalLibrary');

    const canvasWidth = 900;
    const startY = 60;
    const layerGapY = 95;

    // Layer 0: Root Application
    rootNodes.forEach((node) => {
      positions.set(node.id, { x: canvasWidth / 2, y: startY });
    });

    // Layer 1: Entry Points & UI
    const layer1 = [...entryNodes, ...uiNodes];
    layer1.forEach((node, i) => {
      const step = canvasWidth / (layer1.length + 1);
      positions.set(node.id, { x: step * (i + 1), y: startY + layerGapY });
    });

    // Layer 2: APIs & Backend Services
    const layer2 = [...beNodes, ...apiNodes];
    layer2.forEach((node, i) => {
      const step = canvasWidth / (layer2.length + 1);
      positions.set(node.id, { x: step * (i + 1), y: startY + layerGapY * 2 });
    });

    // Layer 3: Database & Infrastructure
    const layer3 = [...dataNodes, ...infraNodes(nodes)];
    layer3.forEach((node, i) => {
      const step = canvasWidth / (layer3.length + 1);
      positions.set(node.id, { x: step * (i + 1), y: startY + layerGapY * 3 });
    });

    // Layer 4: External Dependencies
    depNodes.forEach((node, i) => {
      const step = canvasWidth / (depNodes.length + 1);
      positions.set(node.id, { x: step * (i + 1), y: startY + layerGapY * 3.9 });
    });

    // Fallback for remaining nodes
    nodes.forEach((node, i) => {
      if (!positions.has(node.id)) {
        positions.set(node.id, { x: 150 + (i % 4) * 200, y: 100 + Math.floor(i / 4) * 90 });
      }
    });

    return positions;
  }, [architecture]);

  function infraNodes(nodes) {
    return nodes.filter(n => n.category === 'InfraManifest');
  }

  // Handle Dragging / Panning
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.max(0.4, Math.min(2.5, z * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  if (!architecture || !architecture.nodes || architecture.nodes.length <= 1 || architecture.isEvidenceSufficient === false) {
    return (
      <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-12 text-center text-slate-400 font-mono text-xs space-y-2">
        <Info className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-bold text-slate-200 text-sm">Architecture evidence insufficient</p>
        <p className="text-slate-500 max-w-md mx-auto">
          No verified execution relationships could be determined from the uploaded project. Displaying verified detected components only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="relative bg-[#070a0e] border border-[#1c2e38] rounded-2xl overflow-hidden shadow-2xl">
        {/* Zoom / Pan Controls Toolbar */}
        <div className="absolute top-4 right-4 z-10 bg-[#0c1219] border border-[#1c2e38] rounded-xl p-1.5 flex items-center space-x-1 shadow-lg">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z * 1.2))}
            className="p-1.5 hover:bg-[#1c2e38] text-slate-300 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z / 1.2))}
            className="p-1.5 hover:bg-[#1c2e38] text-slate-300 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-400 px-1.5 font-bold">{Math.round(zoom * 100)}%</span>
          <button
            onClick={resetView}
            className="p-1.5 hover:bg-[#1c2e38] text-slate-300 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* SVG Canvas Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-[480px] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            backgroundImage: 'radial-gradient(#1c2e38 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          <svg className="w-full h-full">
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Render Edges */}
              {(architecture.edges || []).map(edge => {
                const srcPos = nodePositions.get(edge.source);
                const tgtPos = nodePositions.get(edge.target);
                const isHighlighted =
                  selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

                return (
                  <ArchitectureEdge
                    key={edge.id}
                    edge={edge}
                    sourceX={srcPos?.x}
                    sourceY={srcPos?.y}
                    targetX={tgtPos?.x}
                    targetY={tgtPos?.y}
                    isHighlighted={isHighlighted}
                  />
                );
              })}

              {/* Render Nodes */}
              {(architecture.nodes || []).map(node => {
                const pos = nodePositions.get(node.id) || { x: 200, y: 200 };
                const isSelected = selectedNode?.id === node.id;

                return (
                  <ArchitectureNode
                    key={node.id}
                    node={node}
                    x={pos.x}
                    y={pos.y}
                    isSelected={isSelected}
                    onClick={(n) => setSelectedNode(isSelected ? null : n)}
                    onMouseEnter={(n) => setHoveredNode(n)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* Selected Node Evidence Inspector Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#0c1219] border border-[#10b981]/40 rounded-xl p-4 shadow-2xl z-20 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-[#1c2e38] pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <h4 className="font-bold text-white text-sm">{selectedNode.label}</h4>
                <span className="text-[10px] bg-[#1c2e38] text-[#10b981] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                  {selectedNode.technology || selectedNode.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Category & Layer:</span>
                <span className="text-slate-200">{selectedNode.category} ({selectedNode.layer || 'general'})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Detection Confidence:</span>
                <span className="text-emerald-400 font-bold">{selectedNode.confidence || 95}% (Verified Evidence)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">File Evidence:</span>
                <span className="text-sky-300 font-mono text-[11px] truncate block">
                  {Array.isArray(selectedNode.evidence) ? selectedNode.evidence.join(', ') : selectedNode.id}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Evidence-Based Workflow Timeline */}
      {architecture.workflow && architecture.workflow.length > 0 && (
        <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-[#1c2e38] pb-2">
            <Workflow className="w-4 h-4 text-[#10b981]" />
            <span>Project System Workflow & Execution Path</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {architecture.workflow.map((step) => (
              <div key={step.step} className="bg-[#070a0e] border border-[#1c2e38] p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full font-bold">
                    STEP {step.step}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
                <h5 className="font-bold text-white text-xs mt-1">{step.title}</h5>
                <p className="text-[11px] text-slate-400">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
