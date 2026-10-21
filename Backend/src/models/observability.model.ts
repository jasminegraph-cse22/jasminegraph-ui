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

export type NodeRole = "Master" | "Worker";

export type NodeHealthStatus = "Healthy" | "Degraded" | "Down";

export type ClusterPlatformType = "Kubernetes" | "Docker";

export interface INodeMetric {
  nodeId: string;
  role: NodeRole;
  podName?: string;
  namespace?: string;
  containerName?: string;
  network?: string;
  ipAddress: string;
  status: NodeHealthStatus;
  cpuPercent: number;
  memoryPercent: number;
  uptime: string;
  restarts?: number;
  age?: string;
}

export interface INetworkLinkMetric {
  id: string;
  source: string;
  target: string;
  packetsPerSec: number;
  packetsPerSecFormatted?: string;
  usedBandwidthMbps: number;
  capacityBandwidthMbps: number;
  utilizationPercent: number;
}

export interface IDeploymentSummary {
  platform: ClusterPlatformType;
  // Kubernetes-specific
  namespace?: string;
  namespaceDescription?: string;
  workloadKind?: string;
  workloadReplicasSummary?: string;
  // Docker-specific
  dockerNetwork?: string;
  dockerNetworkType?: string;
  composeProject?: string;
  composeContainersSummary?: string;
  // Common
  imageTag: string;
  imageSource: string;
  unitsReadyText: string;
  unitsSubText: string;
}

export interface ITimeSeriesPoint {
  timeLabel: string;
  value: number;
}

export interface IAggregateResourceMetrics {
  cpuCurrent: number;
  cpuHistory: ITimeSeriesPoint[];
  memoryCurrent: number;
  memoryHistory: ITimeSeriesPoint[];
}

export interface IClusterObservabilityData {
  clusterId: number;
  clusterName: string;
  description: string;
  host: string;
  version: string;
  platform: ClusterPlatformType;
  workerCount: number;
  partitionCount: number;
  masterNodes: INodeMetric[];
  workerNodes: INodeMetric[];
  networkLinks: INetworkLinkMetric[];
  deploymentSummary: IDeploymentSummary;
  aggregateMetrics: IAggregateResourceMetrics;
}

export interface IDeploymentResponseData {
  clusterId: number;
  platform: ClusterPlatformType;
  summary: IDeploymentSummary;
  aggregateMetrics: IAggregateResourceMetrics;
  nodes: INodeMetric[];
}

export interface IClusterLogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  node: string;
  msg: string;
}

export interface IClusterLogsFilter {
  node?: string;
  level?: string;
  search?: string;
  limit?: number;
}

export interface IApiResponse<T> {
  data: T;
  message?: string;
}
