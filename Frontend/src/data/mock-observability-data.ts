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

import { IClusterObservabilityData } from "@/types/observability-types";

export const MOCK_OBSERVABILITY_DATA: Record<number, IClusterObservabilityData> = {
  // Page 1, 2, 3, 4: prod-graph-01 · Kubernetes
  7: {
    clusterId: 7,
    clusterName: "prod-graph-01",
    description: "Primary analytics cluster — social graph, EU region.",
    host: "jasminegraph-master-service",
    version: "v1.21.101",
    platform: "Kubernetes",
    workerCount: 3,
    partitionCount: 12,
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
    networkLinks: [
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
    ],
    deploymentSummary: {
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
  },

  // Page 5: staging-graph-02 · Docker
  8: {
    clusterId: 8,
    clusterName: "staging-graph-02",
    description: "Staging cluster for integration tests — local docker compose.",
    host: "jasminegraph-docker-host",
    version: "v1.21.101",
    platform: "Docker",
    workerCount: 2,
    partitionCount: 8,
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
    networkLinks: [
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
    ],
    deploymentSummary: {
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
  },
};

export function getMockObservabilityByClusterId(id: string | number): IClusterObservabilityData {
  const numericId = Number(id);
  if (MOCK_OBSERVABILITY_DATA[numericId]) {
    return MOCK_OBSERVABILITY_DATA[numericId];
  }
  // Default fallback clone for newly added clusters
  return {
    ...MOCK_OBSERVABILITY_DATA[7],
    clusterId: numericId || 7,
    clusterName: `cluster-${id}`,
  };
}
