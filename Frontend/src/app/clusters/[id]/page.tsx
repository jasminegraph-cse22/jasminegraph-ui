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
import { useAppSelector } from "@/redux/hook";
import { useDispatch } from "react-redux";
import { set_Selected_Cluster } from "@/redux/features/clusterData";
import { getCluster, getClusterProperties } from "@/services/cluster-service";
import { getClusterObservabilityMetrics } from "@/services/observability-service";
import useAccessToken from "@/hooks/useAccessToken";
import { IClusterObservabilityData, INodeMetric } from "@/types/observability-types";
import StatusBadge from "@/components/observability/StatusBadge";
import ObservabilityProgressBar from "@/components/observability/ObservabilityProgressBar";

export default function ClusterDetails({ params }: { params: { id: string } }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedCluster } = useAppSelector((state) => state.clusterData);
  const [observabilityData, setObservabilityData] = useState<IClusterObservabilityData | null>(null);
  const { getSrvAccessToken } = useAccessToken();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const metrics = await getClusterObservabilityMetrics(params.id);
        if (isMounted) setObservabilityData(metrics);

        // Try to fetch live cluster details if token available
        const token = getSrvAccessToken();
        if (token) {
          const res = await getCluster(params.id, token).catch(() => null);
          if (res?.data && isMounted) {
            dispatch(set_Selected_Cluster(res.data));
          }
          await getClusterProperties(params.id).catch(() => null);
        }
      } catch (err) {
        console.error("Failed to load cluster details: ", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [params.id, dispatch, getSrvAccessToken]);

  const clusterTitle =
    selectedCluster?.id === Number(params.id)
      ? selectedCluster.name
      : observabilityData?.clusterName || `cluster-${params.id}`;

  const clusterDesc =
    selectedCluster?.id === Number(params.id) && selectedCluster.description
      ? selectedCluster.description
      : observabilityData?.description || "High-performance distributed graph analytics cluster.";

  // Table columns matching Page 1 UI design
  const nodeColumns: TableProps<INodeMetric>["columns"] = [
    {
      title: "Node ID",
      dataIndex: "nodeId",
      key: "nodeId",
      render: (nodeId: string) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          {nodeId}
        </span>
      ),
    },
    {
      title: "Pod / Namespace",
      key: "podNamespace",
      render: (_, record: INodeMetric) => (
        <div className="font-mono text-xs">
          {record.podName ? (
            <>
              <span className="font-medium text-slate-700">{record.podName}</span>
              <span className="text-slate-400 mx-1.5">/</span>
              <span className="text-slate-400">{record.namespace}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-slate-700">{record.containerName}</span>
              <span className="text-slate-400 mx-1.5">/</span>
              <span className="text-slate-400">{record.network}</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip: string) => (
        <span className="font-mono text-xs text-slate-600">{ip}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge status={status} size="small" />,
    },
    {
      title: "CPU",
      dataIndex: "cpuPercent",
      key: "cpu",
      width: 170,
      render: (val: number) => (
        <ObservabilityProgressBar value={val} height={6} barWidth={85} />
      ),
    },
    {
      title: "Memory",
      dataIndex: "memoryPercent",
      key: "memory",
      width: 170,
      render: (val: number) => (
        <ObservabilityProgressBar value={val} height={6} barWidth={85} />
      ),
    },
    {
      title: "Uptime",
      dataIndex: "uptime",
      key: "uptime",
      render: (text: string) => (
        <span className="text-xs text-slate-600 font-medium">{text}</span>
      ),
    },
  ];

  if (loading && !observabilityData) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cluster Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          {clusterTitle}
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          {clusterDesc}
        </p>
      </div>

      {/* Cluster Meta Key-Value Grid */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-medium mb-1">Cluster ID</div>
            <div className="font-mono font-semibold text-slate-800 text-sm">
              {observabilityData?.clusterId || params.id}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium mb-1">Host</div>
            <div className="font-mono text-slate-800 text-xs truncate" title={observabilityData?.host}>
              {observabilityData?.host || "jasminegraph-master-service"}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium mb-1">JasmineGraph Version</div>
            <div className="font-mono text-slate-800 text-xs">
              {observabilityData?.version || "v1.21.101"}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium mb-1">Platform</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{observabilityData?.platform || "Kubernetes"}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium mb-1">Number of Workers</div>
            <div className="font-semibold text-slate-800 text-sm">
              {observabilityData?.workerCount ?? 3}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium mb-1">Number of Partitions</div>
            <div className="font-semibold text-slate-800 text-sm">
              {observabilityData?.partitionCount ?? 12}
            </div>
          </div>
        </div>
      </div>

      {/* Master Nodes Section */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 tracking-tight">
          Master Nodes
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <Table
            columns={nodeColumns}
            dataSource={observabilityData?.masterNodes || []}
            rowKey="nodeId"
            pagination={false}
            size="middle"
          />
        </div>
      </div>

      {/* Worker Nodes Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-semibold text-slate-800 tracking-tight">
          Worker Nodes
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <Table
            columns={nodeColumns}
            dataSource={observabilityData?.workerNodes || []}
            rowKey="nodeId"
            pagination={false}
            size="middle"
          />
        </div>
      </div>
    </div>
  );
}
