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

import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import type { TableProps } from "antd";
import { AppstoreOutlined, PartitionOutlined } from "@ant-design/icons";
import { getClusterObservabilityMetrics } from "@/services/observability-service";
import {
  IClusterObservabilityData,
  INetworkLinkMetric,
  INodeMetric,
} from "@/types/observability-types";
import NodeCard from "@/components/observability/NodeCard";
import NetworkTopologyGraph from "@/components/observability/NetworkTopologyGraph";
import ObservabilityProgressBar from "@/components/observability/ObservabilityProgressBar";
import useAccessToken from "@/hooks/useAccessToken";

type SubViewType = "nodes" | "network";

export default function InstancePage({ params }: { params: { id: string } }) {
  const [activeSubView, setActiveSubView] = useState<SubViewType>("nodes");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IClusterObservabilityData | null>(null);
  const { getSrvAccessToken } = useAccessToken();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const token = getSrvAccessToken();
        const result = await getClusterObservabilityMetrics(params.id, token);
        if (isMounted) setData(result);
      } catch (err) {
        console.error("Failed to load instance metrics: ", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const allNodes: INodeMetric[] = [
    ...(data?.masterNodes || []),
    ...(data?.workerNodes || []),
  ];

  // Table columns for Network Links (Page 3)
  const linkColumns: TableProps<INetworkLinkMetric>["columns"] = [
    {
      title: "Link",
      key: "link",
      render: (_, record: INetworkLinkMetric) => (
        <span className="font-mono text-xs font-medium text-slate-800">
          {record.source} <span className="text-slate-400 mx-1">↔</span> {record.target}
        </span>
      ),
    },
    {
      title: "Packets / sec",
      dataIndex: "packetsPerSec",
      key: "packetsPerSec",
      render: (val: number) => (
        <span className="font-mono text-xs text-slate-700">
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Bandwidth (used / capacity)",
      key: "bandwidth",
      render: (_, record: INetworkLinkMetric) => (
        <span className="font-mono text-xs text-slate-700">
          {record.usedBandwidthMbps} <span className="text-slate-400">/</span> {record.capacityBandwidthMbps} Mbps
        </span>
      ),
    },
    {
      title: "Utilization",
      dataIndex: "utilizationPercent",
      key: "utilization",
      width: 200,
      render: (val: number) => (
        <ObservabilityProgressBar value={val} height={6} barWidth={110} />
      ),
    },
  ];

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const clusterName = data?.clusterName || `prod-graph-${params.id}`;

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Node Details
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Every compute unit backing {clusterName}, at a glance.
        </p>
      </div>

      {/* Sub-navigation Segmented Control / Pills */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubView("nodes")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSubView === "nodes"
              ? "bg-slate-100 text-slate-900 font-semibold shadow-xs border border-slate-200"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
          }`}
        >
          <AppstoreOutlined className="text-sm" />
          <span>Node Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView("network")}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSubView === "network"
              ? "bg-slate-100 text-slate-900 font-semibold shadow-xs border border-slate-200"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
          }`}
        >
          <PartitionOutlined className="text-sm" />
          <span>Network Connectivity</span>
        </button>
      </div>

      {/* Sub-view 1: Node Cards Grid (Page 2) */}
      {activeSubView === "nodes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allNodes.map((node) => (
            <NodeCard key={node.nodeId} node={node} />
          ))}
        </div>
      )}

      {/* Sub-view 2: Network Connectivity (Page 3) */}
      {activeSubView === "network" && (
        <div className="space-y-6">
          {/* Topology Diagram */}
          <NetworkTopologyGraph
            masterNodes={data?.masterNodes || []}
            workerNodes={data?.workerNodes || []}
            links={data?.networkLinks || []}
          />

          {/* Links Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <Table
              columns={linkColumns}
              dataSource={data?.networkLinks || []}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </div>
        </div>
      )}
    </div>
  );
}
