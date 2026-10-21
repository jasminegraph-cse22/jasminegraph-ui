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
} from "@/types/observability-types";
import { getMockObservabilityByClusterId } from "@/data/mock-observability-data";

/**
 * Service to fetch cluster observability metrics.
 *
 * NOTE FOR FUTURE BACKEND / PROMETHEUS / GRAFANA INTEGRATION:
 * When connecting to live Prometheus metrics or backend microservices,
 * replace the simulated responses below with calls to:
 * - authApi.get(`/backend/clusters/${clusterId}/metrics/nodes`)
 * - authApi.get(`/backend/clusters/${clusterId}/metrics/network`)
 * - authApi.get(`/backend/clusters/${clusterId}/metrics/deployment`)
 */

export async function getClusterObservabilityMetrics(
  clusterId: string | number
): Promise<IClusterObservabilityData> {
  // Simulated async call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockObservabilityByClusterId(clusterId));
    }, 150);
  });
}

export async function getNodeMetrics(
  clusterId: string | number
): Promise<{ masterNodes: INodeMetric[]; workerNodes: INodeMetric[] }> {
  const data = await getClusterObservabilityMetrics(clusterId);
  return {
    masterNodes: data.masterNodes,
    workerNodes: data.workerNodes,
  };
}

export async function getNetworkTopologyMetrics(
  clusterId: string | number
): Promise<INetworkLinkMetric[]> {
  const data = await getClusterObservabilityMetrics(clusterId);
  return data.networkLinks;
}

export async function getDeploymentMetrics(
  clusterId: string | number
): Promise<{
  summary: IDeploymentSummary;
  aggregate: IAggregateResourceMetrics;
  nodes: INodeMetric[];
}> {
  const data = await getClusterObservabilityMetrics(clusterId);
  return {
    summary: data.deploymentSummary,
    aggregate: data.aggregateMetrics,
    nodes: [...data.masterNodes, ...data.workerNodes],
  };
}
