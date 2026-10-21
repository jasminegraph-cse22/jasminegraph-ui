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

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Select, Input, Button, Spin } from "antd";
import { ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { getClusterLogs } from "@/services/observability-service";
import { ILogEntry } from "@/types/observability-types";
import useAccessToken from "@/hooks/useAccessToken";

export default function LogsPage({ params }: { params: { id: string } }) {
  const [selectedNode, setSelectedNode] = useState<string>("all");
  const [logLevel, setLogLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [logs, setLogs] = useState<ILogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { getSrvAccessToken } = useAccessToken();

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = getSrvAccessToken();
      const data = await getClusterLogs(params.id, token, selectedNode, logLevel);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id, selectedNode, logLevel, getSrvAccessToken]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (selectedNode !== "all" && log.node !== selectedNode) return false;
    if (logLevel !== "all" && log.level !== logLevel) return false;
    if (searchQuery && !log.msg.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const logText = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.node}] ${l.msg}`)
      .join("\n");
    const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cluster-${params.id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Cluster Logs
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Real-time aggregated logs from master and worker instances.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={selectedNode}
            onChange={setSelectedNode}
            style={{ width: 150 }}
            options={[
              { value: "all", label: "All Nodes" },
              { value: "master-0", label: "master-0" },
              { value: "worker-0", label: "worker-0" },
              { value: "worker-1", label: "worker-1" },
              { value: "worker-2", label: "worker-2" },
            ]}
          />
          <Select
            value={logLevel}
            onChange={setLogLevel}
            style={{ width: 120 }}
            options={[
              { value: "all", label: "All Levels" },
              { value: "INFO", label: "INFO" },
              { value: "WARN", label: "WARN" },
              { value: "ERROR", label: "ERROR" },
            ]}
          />
          <Input.Search
            placeholder="Search log output..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={() => fetchLogs(true)}
            loading={refreshing}
          >
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div className="bg-slate-950 text-slate-200 rounded-lg p-4 font-mono text-xs border border-slate-800 shadow-inner h-[450px] overflow-y-auto space-y-1.5 relative">
        {loading && !refreshing ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="default" />
          </div>
        ) : (
          <>
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/60 px-1 rounded">
                <span className="text-slate-500 select-none">{log.timestamp}</span>
                <span
                  className={`font-semibold px-1.5 py-0.2 rounded text-[10px] select-none ${
                    log.level === "WARN"
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : log.level === "ERROR"
                      ? "bg-rose-950 text-rose-400 border border-rose-800"
                      : "bg-blue-950 text-blue-400 border border-blue-800"
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-emerald-400 font-semibold select-none">[{log.node}]</span>
                <span className="text-slate-300">{log.msg}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-slate-500 text-center py-12">
                No log entries match the selected filters.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
