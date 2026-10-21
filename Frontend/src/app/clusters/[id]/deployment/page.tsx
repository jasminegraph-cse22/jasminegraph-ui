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
import { getClusterObservabilityMetrics } from "@/services/observability-service";
import {
  IClusterObservabilityData,
  INodeMetric,
} from "@/types/observability-types";
import DeploymentStatCard from "@/components/observability/DeploymentStatCard";
import MetricAreaChart from "@/components/observability/MetricAreaChart";
import StatusBadge from "@/components/observability/StatusBadge";
import ObservabilityProgressBar from "@/components/observability/ObservabilityProgressBar";

export default function DeploymentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IClusterObservabilityData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getClusterObservabilityMetrics(params.id);
        if (isMounted) setData(result);
      } catch (err) {
        console.error("Failed to load deployment metrics: ", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const isKubernetes = data?.platform === "Kubernetes";
  const clusterName = data?.clusterName || `prod-graph-${params.id}`;
  const summary = data?.deploymentSummary;
  const allNodes: INodeMetric[] = [
    ...(data?.masterNodes || []),
    ...(data?.workerNodes || []),
  ];

  // Kubernetes Pods Table Columns (Page 4)
  const k8sColumns: TableProps<INodeMetric>["columns"] = [
    {
      title: "Pod",
      dataIndex: "podName",
      key: "pod",
      render: (val: string, record: INodeMetric) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {val || record.nodeId}
        </span>
      ),
    },
    {
      title: "Namespace",
      dataIndex: "namespace",
      key: "namespace",
      render: (val: string) => (
        <span className="font-mono text-xs text-slate-600">{val || "jasminegraph"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge status={status} size="small" />,
    },
    {
      title: "Restarts",
      dataIndex: "restarts",
      key: "restarts",
      render: (restarts: number = 0) => (
        <span className="font-mono text-xs text-slate-700">{restarts}</span>
      ),
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
      title: "Age",
      dataIndex: "age",
      key: "age",
      render: (age: string, record: INodeMetric) => (
        <span className="text-xs text-slate-600 font-medium">
          {age || record.uptime || "14d"}
        </span>
      ),
    },
  ];

  // Docker Containers Table Columns (Page 5)
  const dockerColumns: TableProps<INodeMetric>["columns"] = [
    {
      title: "Container",
      dataIndex: "containerName",
      key: "container",
      render: (val: string, record: INodeMetric) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {val || record.nodeId}
        </span>
      ),
    },
    {
      title: "Network",
      dataIndex: "network",
      key: "network",
      render: (val: string) => (
        <span className="font-mono text-xs text-slate-600">{val || "jasminenet"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge status={status} size="small" />,
    },
    {
      title: "Restarts",
      dataIndex: "restarts",
      key: "restarts",
      render: (restarts: number = 0) => (
        <span className="font-mono text-xs text-slate-700">{restarts}</span>
      ),
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
      render: (uptime: string) => (
        <span className="text-xs text-slate-600 font-medium">{uptime}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Deployment
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          How and where {clusterName}&apos;s compute is actually running.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isKubernetes ? (
          <>
            <DeploymentStatCard
              label="Namespace"
              value={summary?.namespace || "jasminegraph"}
              subText={summary?.namespaceDescription || "default cluster namespace"}
            />
            <DeploymentStatCard
              label="Workload kind"
              value={summary?.workloadKind || "StatefulSet"}
              subText={summary?.workloadReplicasSummary || "1 master + 3 worker replicas"}
            />
            <DeploymentStatCard
              label="Image tag"
              value={summary?.imageTag || "jasminegraph:2.4.1"}
              subText={summary?.imageSource || "pulled from ghcr.io"}
            />
            <DeploymentStatCard
              label="Pods ready"
              value={summary?.unitsReadyText || "4 / 4"}
              subText={summary?.unitsSubText || "0 restarts (24h)"}
            />
          </>
        ) : (
          <>
            <DeploymentStatCard
              label="Docker network"
              value={summary?.dockerNetwork || "jasminenet"}
              subText={summary?.dockerNetworkType || "bridge network"}
            />
            <DeploymentStatCard
              label="Compose project"
              value={summary?.composeProject || "jasminegraph"}
              subText={summary?.composeContainersSummary || "1 master + 2 worker containers"}
            />
            <DeploymentStatCard
              label="Image tag"
              value={summary?.imageTag || "jasminegraph:2.4.1"}
              subText={summary?.imageSource || "built locally"}
            />
            <DeploymentStatCard
              label="Containers up"
              value={summary?.unitsReadyText || "2 / 3"}
              subText={summary?.unitsSubText || "1 exited (see below)"}
            />
          </>
        )}
      </div>

      {/* Aggregate Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MetricAreaChart
          title="Aggregate CPU — last 30 min"
          currentValue={data?.aggregateMetrics.cpuCurrent || 0}
          data={data?.aggregateMetrics.cpuHistory || []}
          strokeColor="#2563eb"
          gradientId="cpuGradient"
        />
        <MetricAreaChart
          title="Aggregate Memory — last 30 min"
          currentValue={data?.aggregateMetrics.memoryCurrent || 0}
          data={data?.aggregateMetrics.memoryHistory || []}
          strokeColor="#7c3aed"
          gradientId="memoryGradient"
        />
      </div>

      {/* Pods / Containers Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-semibold text-slate-800 tracking-tight">
          {isKubernetes ? "Pods" : "Containers"}
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <Table
            columns={isKubernetes ? k8sColumns : dockerColumns}
            dataSource={allNodes}
            rowKey="nodeId"
            pagination={false}
            size="middle"
          />
        </div>
      </div>
    </div>
  );
}
