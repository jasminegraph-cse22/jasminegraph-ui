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
  nodeId: string; // e.g. "master-0", "worker-0"
  role: NodeRole;
  podName?: string; // e.g. "jasminegraph-master-0"
  namespace?: string; // e.g. "jasminegraph"
  containerName?: string; // e.g. "jg-master"
  network?: string; // e.g. "jasminenet"
  ipAddress: string; // e.g. "10.42.0.14"
  status: NodeHealthStatus;
  cpuPercent: number; // e.g. 38
  memoryPercent: number; // e.g. 51
  uptime: string; // e.g. "14d 6h"
  restarts?: number;
  age?: string; // e.g. "14d", "2h"
}

export interface INetworkLinkMetric {
  id: string;
  source: string; // e.g. "master-0"
  target: string; // e.g. "worker-0"
  packetsPerSec: number; // e.g. 842
  packetsPerSecFormatted?: string; // e.g. "842 pkt/s" or "1.3k pkt/s"
  usedBandwidthMbps: number; // e.g. 210
  capacityBandwidthMbps: number; // e.g. 1000
  utilizationPercent: number; // e.g. 21
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
  unitsReadyText: string; // e.g. "4 / 4" or "2 / 3"
  unitsSubText: string; // e.g. "0 restarts (24h)" or "1 exited (see below)"
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

export interface ILogEntry {
  id?: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG" | string;
  node: string;
  msg: string;
}
