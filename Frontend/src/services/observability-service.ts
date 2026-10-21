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

import {
  IClusterObservabilityData,
  INodeMetric,
  INetworkLinkMetric,
  IDeploymentSummary,
  IAggregateResourceMetrics,
  ILogEntry,
} from "@/types/observability-types";
import { getMockObservabilityByClusterId } from "@/data/mock-observability-data";
import { authApi } from "./axios";

/**
 * Service to fetch cluster observability metrics.
 * Calls live backend API under /backend/clusters/:id/observability and
 * transparently falls back to mock data if the API is unreachable or cluster is simulated.
 */

export async function getClusterObservabilityMetrics(
  clusterId: string | number,
  token?: string | null
): Promise<IClusterObservabilityData> {
  try {
    const config: any = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await authApi.get(`/backend/clusters/${clusterId}/observability`, config);
    if (res?.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn(`[Observability] Live API unavailable for cluster ${clusterId}, using mock data:`, err);
  }
  return getMockObservabilityByClusterId(clusterId);
}

export async function getNodeMetrics(
  clusterId: string | number,
  token?: string | null
): Promise<{ masterNodes: INodeMetric[]; workerNodes: INodeMetric[] }> {
  try {
    const config: any = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await authApi.get(`/backend/clusters/${clusterId}/observability/nodes`, config);
    if (res?.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    // Fall back to overview metrics
  }
  const data = await getClusterObservabilityMetrics(clusterId, token);
  return {
    masterNodes: data.masterNodes,
    workerNodes: data.workerNodes,
  };
}

export async function getNetworkTopologyMetrics(
  clusterId: string | number,
  token?: string | null
): Promise<INetworkLinkMetric[]> {
  try {
    const config: any = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await authApi.get(`/backend/clusters/${clusterId}/observability/network`, config);
    if (res?.data?.data?.links) {
      return res.data.data.links;
    }
  } catch (err) {
    // Fall back to overview metrics
  }
  const data = await getClusterObservabilityMetrics(clusterId, token);
  return data.networkLinks;
}

export async function getDeploymentMetrics(
  clusterId: string | number,
  token?: string | null
): Promise<{
  summary: IDeploymentSummary;
  aggregate: IAggregateResourceMetrics;
  nodes: INodeMetric[];
}> {
  try {
    const config: any = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    const res = await authApi.get(`/backend/clusters/${clusterId}/observability/deployment`, config);
    if (res?.data?.data) {
      return {
        summary: res.data.data.summary,
        aggregate: res.data.data.aggregateMetrics,
        nodes: res.data.data.nodes,
      };
    }
  } catch (err) {
    // Fall back to overview metrics
  }
  const data = await getClusterObservabilityMetrics(clusterId, token);
  return {
    summary: data.deploymentSummary,
    aggregate: data.aggregateMetrics,
    nodes: [...data.masterNodes, ...data.workerNodes],
  };
}

export async function getClusterLogs(
  clusterId: string | number,
  token?: string | null,
  node?: string,
  level?: string
): Promise<ILogEntry[]> {
  try {
    const config: any = { params: {} };
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    if (node && node !== "all") config.params.node = node;
    if (level && level !== "all") config.params.level = level;

    const res = await authApi.get(`/backend/clusters/${clusterId}/observability/logs`, config);
    if (res?.data?.data?.logs) {
      return res.data.data.logs;
    }
  } catch (err) {
    console.warn(`[Observability] Logs API unavailable for cluster ${clusterId}, using default logs:`, err);
  }
  return [
    { timestamp: "2026-10-15T07:10:02Z", level: "INFO", node: "master-0", msg: "JasmineGraph Master service started on port 7777" },
    { timestamp: "2026-10-15T07:10:05Z", level: "INFO", node: "worker-0", msg: "Worker node registered with master at 10.42.0.15" },
    { timestamp: "2026-10-15T07:10:06Z", level: "INFO", node: "worker-1", msg: "Worker node registered with master at 10.42.0.16" },
    { timestamp: "2026-10-15T07:10:08Z", level: "INFO", node: "worker-2", msg: "Worker node registered with master at 10.42.0.17" },
    { timestamp: "2026-10-15T07:12:30Z", level: "INFO", node: "master-0", msg: "Partition distribution verified across 3 workers" },
    { timestamp: "2026-10-15T07:15:42Z", level: "WARN", node: "worker-2", msg: "High CPU threshold reached: 88% utilization on partition 7" },
    { timestamp: "2026-10-15T07:18:10Z", level: "INFO", node: "master-0", msg: "Heartbeat response received from worker-0, worker-1, worker-2" },
  ];
}
