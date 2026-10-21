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

interface DeploymentStatCardProps {
  label: string;
  value: string;
  subText: string;
}

export default function DeploymentStatCard({
  label,
  value,
  subText,
}: DeploymentStatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      <div className="text-xs text-slate-500 font-medium mb-1.5">{label}</div>
      <div className="text-lg font-bold text-slate-900 tracking-tight mb-1 font-mono">
        {value}
      </div>
      <div className="text-xs text-slate-400">{subText}</div>
    </div>
  );
}
