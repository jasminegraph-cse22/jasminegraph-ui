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

import { getClusterByIdRepo, Cluster } from "../repository/cluster.repository";
import {
  IClusterObservabilityData,
  INodeMetric,
  INetworkLinkMetric,
  IDeploymentResponseData,
  IDeploymentSummary,
  IAggregateResourceMetrics,
  IClusterLogEntry,
  IClusterLogsFilter,
  ClusterPlatformType,
} from "../models/observability.model";

/**
 * Detects cluster platform mode (Kubernetes vs Docker) based on cluster metadata.
 */
function detectPlatform(cluster: Cluster): ClusterPlatformType {
  const normalizedHost = cluster.host.toLowerCase();
  const normalizedName = cluster.name.toLowerCase();
  if (
    normalizedHost.includes("docker") ||
    normalizedName.includes("docker") ||
    cluster.id === 8
  ) {
    return "Docker";
  }
  return "Kubernetes";
}

/**
 * Generates baseline compute node metrics for a cluster.
 */
function generateNodeMetrics(
  cluster: Cluster,
  platform: ClusterPlatformType
): { masterNodes: INodeMetric[]; workerNodes: INodeMetric[] } {
  if (platform === "Docker") {
    return {
      masterNodes: [
        {
          nodeId: "jg-master",
          role: "Master",
          containerName: "jg-master",
          network: "jasminenet",
          ipAddress: "172.28.5.1",
          status: "Healthy",
          cpuPercent: 29,
          memoryPercent: 44,
          uptime: "6d 2h",
          restarts: 0,
          age: "6d 2h",
        },
      ],
      workerNodes: [
        {
          nodeId: "jg-worker-0",
          role: "Worker",
          containerName: "jg-worker-0",
          network: "jasminenet",
          ipAddress: "172.28.5.2",
          status: "Healthy",
          cpuPercent: 47,
          memoryPercent: 58,
          uptime: "6d 2h",
          restarts: 1,
          age: "6d 2h",
        },
        {
          nodeId: "jg-worker-1",
          role: "Worker",
          containerName: "jg-worker-1",
          network: "jasminenet",
          ipAddress: "172.28.5.3",
          status: "Down",
          cpuPercent: 0,
          memoryPercent: 0,
          uptime: "—",
          restarts: 5,
          age: "—",
        },
      ],
    };
  }

  // Kubernetes mode
  return {
    masterNodes: [
      {
        nodeId: "master-0",
        role: "Master",
        podName: "jasminegraph-master-0",
        namespace: "jasminegraph",
        ipAddress: "10.42.0.14",
        status: "Healthy",
        cpuPercent: 38,
        memoryPercent: 51,
        uptime: "14d 6h",
        restarts: 0,
        age: "14d",
      },
    ],
    workerNodes: [
      {
        nodeId: "worker-0",
        role: "Worker",
        podName: "jasminegraph-worker-0",
        namespace: "jasminegraph",
        ipAddress: "10.42.0.15",
        status: "Healthy",
        cpuPercent: 61,
        memoryPercent: 70,
        uptime: "14d 6h",
        restarts: 0,
        age: "14d",
      },
      {
        nodeId: "worker-1",
        role: "Worker",
        podName: "jasminegraph-worker-1",
        namespace: "jasminegraph",
        ipAddress: "10.42.0.16",
        status: "Healthy",
        cpuPercent: 55,
        memoryPercent: 66,
        uptime: "14d 6h",
        restarts: 0,
        age: "14d",
      },
      {
        nodeId: "worker-2",
        role: "Worker",
        podName: "jasminegraph-worker-2",
        namespace: "jasminegraph",
        ipAddress: "10.42.0.17",
        status: "Degraded",
        cpuPercent: 88,
        memoryPercent: 74,
        uptime: "2h 10m",
        restarts: 2,
        age: "2h",
      },
    ],
  };
}

/**
 * Generates network link metrics between cluster nodes.
 */
function generateNetworkLinks(platform: ClusterPlatformType): INetworkLinkMetric[] {
  if (platform === "Docker") {
    return [
      {
        id: "link-jgm-jgw0",
        source: "jg-master",
        target: "jg-worker-0",
        packetsPerSec: 512,
        packetsPerSecFormatted: "512 pkt/s",
        usedBandwidthMbps: 120,
        capacityBandwidthMbps: 1000,
        utilizationPercent: 12,
      },
      {
        id: "link-jgm-jgw1",
        source: "jg-master",
        target: "jg-worker-1",
        packetsPerSec: 0,
        packetsPerSecFormatted: "0 pkt/s",
        usedBandwidthMbps: 0,
        capacityBandwidthMbps: 1000,
        utilizationPercent: 0,
      },
    ];
  }

  return [
    {
      id: "link-m0-w0",
      source: "master-0",
      target: "worker-0",
      packetsPerSec: 842,
      packetsPerSecFormatted: "842 pkt/s",
      usedBandwidthMbps: 210,
      capacityBandwidthMbps: 1000,
      utilizationPercent: 21,
    },
    {
      id: "link-m0-w1",
      source: "master-0",
      target: "worker-1",
      packetsPerSec: 1320,
      packetsPerSecFormatted: "1.3k pkt/s",
      usedBandwidthMbps: 640,
      capacityBandwidthMbps: 1000,
      utilizationPercent: 64,
    },
    {
      id: "link-m0-w2",
      source: "master-0",
      target: "worker-2",
      packetsPerSec: 2140,
      packetsPerSecFormatted: "2.1k pkt/s",
      usedBandwidthMbps: 880,
      capacityBandwidthMbps: 1000,
      utilizationPercent: 88,
    },
    {
      id: "link-w0-w1",
      source: "worker-0",
      target: "worker-1",
      packetsPerSec: 410,
      packetsPerSecFormatted: "410 pkt/s",
      usedBandwidthMbps: 95,
      capacityBandwidthMbps: 1000,
      utilizationPercent: 9,
    },
    {
      id: "link-w1-w2",
      source: "worker-1",
      target: "worker-2",
      packetsPerSec: 690,
      packetsPerSecFormatted: "690 pkt/s",
      usedBandwidthMbps: 310,
      capacityBandwidthMbps: 1000,
      utilizationPercent: 31,
    },
  ];
}

/**
 * Generates deployment workload summary and aggregate time-series metrics.
 */
function generateDeploymentSummary(
  platform: ClusterPlatformType
): { summary: IDeploymentSummary; aggregateMetrics: IAggregateResourceMetrics } {
  if (platform === "Docker") {
    return {
      summary: {
        platform: "Docker",
        dockerNetwork: "jasminenet",
        dockerNetworkType: "bridge network",
        composeProject: "jasminegraph",
        composeContainersSummary: "1 master + 2 worker containers",
        imageTag: "jasminegraph:2.4.1",
        imageSource: "built locally",
        unitsReadyText: "2 / 3",
        unitsSubText: "1 exited (see below)",
      },
      aggregateMetrics: {
        cpuCurrent: 29,
        cpuHistory: [
          { timeLabel: "30m ago", value: 20 },
          { timeLabel: "25m ago", value: 28 },
          { timeLabel: "20m ago", value: 22 },
          { timeLabel: "15m ago", value: 33 },
          { timeLabel: "10m ago", value: 25 },
          { timeLabel: "5m ago", value: 31 },
          { timeLabel: "now", value: 29 },
        ],
        memoryCurrent: 44,
        memoryHistory: [
          { timeLabel: "30m ago", value: 38 },
          { timeLabel: "25m ago", value: 46 },
          { timeLabel: "20m ago", value: 41 },
          { timeLabel: "15m ago", value: 50 },
          { timeLabel: "10m ago", value: 42 },
          { timeLabel: "5m ago", value: 47 },
          { timeLabel: "now", value: 44 },
        ],
      },
    };
  }

  return {
    summary: {
      platform: "Kubernetes",
      namespace: "jasminegraph",
      namespaceDescription: "default cluster namespace",
      workloadKind: "StatefulSet",
      workloadReplicasSummary: "1 master + 3 worker replicas",
      imageTag: "jasminegraph:2.4.1",
      imageSource: "pulled from ghcr.io",
      unitsReadyText: "4 / 4",
      unitsSubText: "0 restarts (24h)",
    },
    aggregateMetrics: {
      cpuCurrent: 42,
      cpuHistory: [
        { timeLabel: "30m ago", value: 34 },
        { timeLabel: "25m ago", value: 30 },
        { timeLabel: "20m ago", value: 45 },
        { timeLabel: "15m ago", value: 37 },
        { timeLabel: "10m ago", value: 50 },
        { timeLabel: "5m ago", value: 44 },
        { timeLabel: "now", value: 42 },
      ],
      memoryCurrent: 58,
      memoryHistory: [
        { timeLabel: "30m ago", value: 52 },
        { timeLabel: "25m ago", value: 60 },
        { timeLabel: "20m ago", value: 54 },
        { timeLabel: "15m ago", value: 67 },
        { timeLabel: "10m ago", value: 59 },
        { timeLabel: "5m ago", value: 65 },
        { timeLabel: "now", value: 58 },
      ],
    },
  };
}

/**
 * Service API: Returns full cluster overview for Page 1 (Cluster Details).
 */
export async function getClusterOverviewService(
  clusterId: number
): Promise<IClusterObservabilityData | null> {
  const cluster = await getClusterByIdRepo(clusterId);
  if (!cluster) return null;

  const platform = detectPlatform(cluster);
  const { masterNodes, workerNodes } = generateNodeMetrics(cluster, platform);
  const networkLinks = generateNetworkLinks(platform);
  const { summary, aggregateMetrics } = generateDeploymentSummary(platform);

  return {
    clusterId: cluster.id,
    clusterName: cluster.name,
    description: cluster.description || "Distributed graph analytics cluster.",
    host: cluster.host,
    version: "v1.21.101",
    platform,
    workerCount: workerNodes.length,
    partitionCount: workerNodes.length * 4,
    masterNodes,
    workerNodes,
    networkLinks,
    deploymentSummary: summary,
    aggregateMetrics,
  };
}

/**
 * Service API: Returns compute node metrics for Page 2 (Instance Node Details).
 */
export async function getNodeMetricsService(
  clusterId: number
): Promise<{ masterNodes: INodeMetric[]; workerNodes: INodeMetric[] } | null> {
  const cluster = await getClusterByIdRepo(clusterId);
  if (!cluster) return null;

  const platform = detectPlatform(cluster);
  return generateNodeMetrics(cluster, platform);
}

/**
 * Service API: Returns network topology links for Page 3 (Network Connectivity).
 */
export async function getNetworkTopologyService(
  clusterId: number
): Promise<INetworkLinkMetric[] | null> {
  const cluster = await getClusterByIdRepo(clusterId);
  if (!cluster) return null;

  const platform = detectPlatform(cluster);
  return generateNetworkLinks(platform);
}

/**
 * Service API: Returns deployment information for Page 4 & 5 (Deployment).
 */
export async function getDeploymentMetricsService(
  clusterId: number
): Promise<IDeploymentResponseData | null> {
  const cluster = await getClusterByIdRepo(clusterId);
  if (!cluster) return null;

  const platform = detectPlatform(cluster);
  const { summary, aggregateMetrics } = generateDeploymentSummary(platform);
  const { masterNodes, workerNodes } = generateNodeMetrics(cluster, platform);

  return {
    clusterId: cluster.id,
    platform,
    summary,
    aggregateMetrics,
    nodes: [...masterNodes, ...workerNodes],
  };
}

/**
 * Service API: Returns queryable cluster logs.
 */
export async function getClusterLogsService(
  clusterId: number,
  filters?: IClusterLogsFilter
): Promise<IClusterLogEntry[] | null> {
  const cluster = await getClusterByIdRepo(clusterId);
  if (!cluster) return null;

  const sampleLogs: IClusterLogEntry[] = [
    { timestamp: "2026-10-21T11:10:02Z", level: "INFO", node: "master-0", msg: "JasmineGraph Master service started on port 7777" },
    { timestamp: "2026-10-21T11:10:05Z", level: "INFO", node: "worker-0", msg: "Worker node registered with master at 10.42.0.15" },
    { timestamp: "2026-10-21T11:10:06Z", level: "INFO", node: "worker-1", msg: "Worker node registered with master at 10.42.0.16" },
    { timestamp: "2026-10-21T11:10:08Z", level: "INFO", node: "worker-2", msg: "Worker node registered with master at 10.42.0.17" },
    { timestamp: "2026-10-21T11:12:30Z", level: "INFO", node: "master-0", msg: "Partition distribution verified across workers" },
    { timestamp: "2026-10-21T11:15:42Z", level: "WARN", node: "worker-2", msg: "Elevated CPU threshold: 88% utilization on partition 7" },
    { timestamp: "2026-10-21T11:18:10Z", level: "INFO", node: "master-0", msg: "Heartbeat response received from all workers" },
  ];

  return sampleLogs.filter((log) => {
    if (filters?.node && filters.node !== "all" && log.node !== filters.node) return false;
    if (filters?.level && filters.level !== "all" && log.level !== filters.level) return false;
    if (filters?.search && !log.msg.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
