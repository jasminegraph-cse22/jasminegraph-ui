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

import React from "react";

interface ObservabilityProgressBarProps {
  value: number; // 0 to 100
  label?: string; // e.g. "CPU" or "MEM"
  showPercentage?: boolean;
  barWidth?: string | number; // e.g. "100px" or default 100%
  height?: number; // default 6px
}

export default function ObservabilityProgressBar({
  value,
  label,
  showPercentage = true,
  barWidth,
  height = 6,
}: ObservabilityProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Threshold colors:
  // <65% normal (green)
  // 65–85% elevated (amber / orange)
  // >85% saturated / down (red / coral)
  let fillColor = "#22c55e"; // green-500
  if (clampedValue > 85) {
    fillColor = "#ef4444"; // red-500
  } else if (clampedValue >= 65) {
    fillColor = "#f59e0b"; // amber-500
  }

  return (
    <div className="flex items-center gap-2.5 w-full select-none">
      {label && (
        <span className="text-xs font-semibold tracking-wider text-slate-500 w-9 uppercase flex-shrink-0">
          {label}
        </span>
      )}

      <div
        className="relative flex-1 bg-slate-100 rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          maxWidth: barWidth ? (typeof barWidth === "number" ? `${barWidth}px` : barWidth) : "100%",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>

      {showPercentage && (
        <span className="text-xs text-slate-500 font-medium w-8 text-right flex-shrink-0">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
