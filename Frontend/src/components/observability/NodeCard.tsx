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
import { INodeMetric } from "@/types/observability-types";
import StatusBadge from "./StatusBadge";
import ObservabilityProgressBar from "./ObservabilityProgressBar";

interface NodeCardProps {
  node: INodeMetric;
}

export default function NodeCard({ node }: NodeCardProps) {
  const isMaster = node.role === "Master";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-shadow">
      {/* Header Row: Node ID & Role Tag */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight font-mono">
          {node.nodeId}
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded border font-medium ${
            isMaster
              ? "border-blue-200 bg-blue-50 text-blue-600"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {node.role}
        </span>
      </div>

      {/* Node Metadata (Pod or Container) */}
      <div className="text-xs text-slate-500 space-y-1 mb-4">
        {node.podName && (
          <p className="truncate">
            <span className="text-slate-400">Pod: </span>
            <span className="text-slate-700 font-mono">{node.podName}</span>
          </p>
        )}
        {node.containerName && (
          <p className="truncate">
            <span className="text-slate-400">Container: </span>
            <span className="text-slate-700 font-mono">{node.containerName}</span>
          </p>
        )}
        <p className="flex items-center gap-2">
          <span>
            <span className="text-slate-400">IP: </span>
            <span className="font-mono text-slate-700">{node.ipAddress}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            <span className="text-slate-400">Uptime: </span>
            <span className="text-slate-700">{node.uptime}</span>
          </span>
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <StatusBadge status={node.status} size="small" />
      </div>

      {/* Resource Metrics */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <ObservabilityProgressBar
          label="CPU"
          value={node.cpuPercent}
          height={6}
        />
        <ObservabilityProgressBar
          label="MEM"
          value={node.memoryPercent}
          height={6}
        />
      </div>
    </div>
  );
}
