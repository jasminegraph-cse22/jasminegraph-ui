/**
 * Copyright 2026 JasmineGraph Team
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from "react";
import { INetworkLinkMetric, INodeMetric } from "@/types/observability-types";

interface NetworkTopologyGraphProps {
  masterNodes: INodeMetric[];
  workerNodes: INodeMetric[];
  links: INetworkLinkMetric[];
}

export default function NetworkTopologyGraph({
  masterNodes,
  workerNodes,
  links,
}: NetworkTopologyGraphProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Layout node coordinates in a 700 x 360 SVG canvas
  // M0 at top center
  const masterCoord = { x: 350, y: 70, id: masterNodes[0]?.nodeId || "master-0", shortLabel: "M0" };

  // Place worker nodes horizontally below M0
  const workerCoords = workerNodes.map((w, idx) => {
    const totalWorkers = workerNodes.length || 1;
    // calculate x positions nicely spaced between 140 and 560
    const startX = 140;
    const endX = 560;
    const step = totalWorkers > 1 ? (endX - startX) / (totalWorkers - 1) : 0;
    const x = totalWorkers === 1 ? 350 : startX + idx * step;
    const y = 240;
    return {
      x,
      y,
      id: w.nodeId,
      shortLabel: `W${idx}`,
    };
  });

  const allNodeCoords = [masterCoord, ...workerCoords];

  const getNodePos = (nodeId: string) => {
    const found = allNodeCoords.find((n) => n.id === nodeId);
    if (found) return found;
    // fallback
    if (nodeId.includes("master")) return masterCoord;
    return workerCoords[0] || { x: 350, y: 240 };
  };

  // Helper for link styling based on utilization
  const getLinkAppearance = (utilization: number) => {
    if (utilization > 85) {
      return { stroke: "#f97316", strokeWidth: 4.5, colorClass: "text-orange-700 bg-orange-50 border-orange-200" };
    }
    if (utilization >= 65) {
      return { stroke: "#eab308", strokeWidth: 3, colorClass: "text-amber-700 bg-amber-50 border-amber-200" };
    }
    return { stroke: "#22c55e", strokeWidth: 2, colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-xs">
      {/* SVG Canvas for Topology */}
      <div className="relative w-full overflow-hidden flex justify-center">
        <svg
          viewBox="0 0 700 320"
          className="w-full max-w-[700px] h-auto select-none"
        >
          {/* Render Links */}
          {links.map((link) => {
            const p1 = getNodePos(link.source);
            const p2 = getNodePos(link.target);
            const { stroke, strokeWidth } = getLinkAppearance(link.utilizationPercent);
            const isHovered = hoveredLink === link.id;

            // Midpoint for badge label
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g
                key={link.id}
                onMouseEnter={() => setHoveredLink(link.id)}
                onMouseLeave={() => setHoveredLink(null)}
                className="cursor-pointer"
              >
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isHovered ? "#2563eb" : stroke}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />

                {/* Packet rate pill badge over link midpoint */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="22"
                    rx="11"
                    fill="#ffffff"
                    stroke={isHovered ? "#2563eb" : stroke}
                    strokeWidth="1.2"
                    className="shadow-xs transition-all duration-200"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="monospace"
                  >
                    {link.packetsPerSecFormatted || `${link.packetsPerSec} pkt/s`}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Master Node */}
          <g
            transform={`translate(${masterCoord.x}, ${masterCoord.y})`}
            onMouseEnter={() => setHoveredNode(masterCoord.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="cursor-pointer"
          >
            <circle
              r="24"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="2.5"
              className="transition-transform duration-150 hover:scale-105"
            />
            <text
              x="0"
              y="4.5"
              textAnchor="middle"
              fill="#1e40af"
              fontSize="13"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              {masterCoord.shortLabel}
            </text>
            <text
              x="0"
              y="38"
              textAnchor="middle"
              fill="#334155"
              fontSize="11"
              fontWeight="600"
              fontFamily="monospace"
            >
              {masterCoord.id}
            </text>
          </g>

          {/* Render Worker Nodes */}
          {workerCoords.map((w) => (
            <g
              key={w.id}
              transform={`translate(${w.x}, ${w.y})`}
              onMouseEnter={() => setHoveredNode(w.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <circle
                r="24"
                fill="#ffffff"
                stroke="#64748b"
                strokeWidth="2"
                className="transition-transform duration-150 hover:scale-105"
              />
              <text
                x="0"
                y="4.5"
                textAnchor="middle"
                fill="#334155"
                fontSize="13"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                {w.shortLabel}
              </text>
              <text
                x="0"
                y="38"
                textAnchor="middle"
                fill="#334155"
                fontSize="11"
                fontWeight="600"
                fontFamily="monospace"
              >
                {w.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend & Note Footer */}
      <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>&lt;65% normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>65–85% elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span>&gt;85% saturated / down</span>
          </div>
        </div>

        <div className="text-slate-400 italic mt-1 sm:mt-0 font-normal">
          Line thickness and color ∝ bandwidth utilization
        </div>
      </div>
    </div>
  );
}
