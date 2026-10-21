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
import { NodeHealthStatus } from "@/types/observability-types";

interface StatusBadgeProps {
  status: NodeHealthStatus | string;
  size?: "small" | "default";
}

export default function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const isHealthy = status === "Healthy" || status === "Active";
  const isDegraded = status === "Degraded";
  const isDown = status === "Down" || status === "Inactive";

  let bgClass = "bg-emerald-50 text-emerald-700 border-emerald-300";
  let dotColor = "bg-emerald-500";
  let icon = null;

  if (isDegraded) {
    bgClass = "bg-amber-50 text-amber-700 border-amber-300";
    dotColor = "bg-amber-500";
    icon = (
      <svg
        className="w-3.5 h-3.5 mr-1 text-amber-600 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else if (isDown) {
    bgClass = "bg-rose-50 text-rose-700 border-rose-300";
    dotColor = "bg-rose-500";
    icon = (
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 flex-shrink-0" />
    );
  } else {
    // Healthy
    icon = (
      <svg
        className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  const paddingClass = size === "small" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${paddingClass} ${bgClass}`}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
}
