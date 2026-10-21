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
import { ITimeSeriesPoint } from "@/types/observability-types";

interface MetricAreaChartProps {
  title: string;
  currentValue: number;
  data: ITimeSeriesPoint[];
  strokeColor?: string;
  gradientId: string;
}

export default function MetricAreaChart({
  title,
  currentValue,
  data,
  strokeColor = "#2563eb",
  gradientId,
}: MetricAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 500;
  const height = 140;
  const paddingX = 12;
  const paddingTop = 16;
  const paddingBottom = 20;

  // Compute points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    // Scale 0 - 100 to y
    const chartHeight = height - paddingTop - paddingBottom;
    const y = paddingTop + (1 - d.value / 100) * chartHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const createSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${
          height - paddingBottom
        } Z`
      : "";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex-1">
      {/* Title & Current Percentage Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800 tracking-tight">
          {title}
        </h4>
        <span className="text-sm font-semibold text-slate-500">
          {currentValue}%
        </span>
      </div>

      {/* Area Chart Container */}
      <div className="relative w-full h-[140px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Background horizontal guide lines */}
          <line
            x1={paddingX}
            y1={paddingTop + (height - paddingTop - paddingBottom) * 0.5}
            x2={width - paddingX}
            y2={paddingTop + (height - paddingTop - paddingBottom) * 0.5}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Filled Area */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3}
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-0.5 px-2 rounded pointer-events-none shadow-md z-10 whitespace-nowrap"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
            }}
          >
            {points[hoveredIndex].timeLabel}: {points[hoveredIndex].value}%
          </div>
        )}
      </div>

      {/* Bottom Timeline Labels */}
      <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
        <span>30m ago</span>
        <span>15m ago</span>
        <span>now</span>
      </div>
    </div>
  );
}
