/**
Copyright 2024 JasmineGraph Team
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

import { Request, Response } from 'express';
import {
  createClusterRepo,
  getAllClustersRepo,
  getClusterByIdRepo,
  addUserToClusterRepo,
  removeUserFromClusterRepo,
  getMyClustersRepo
} from '../repository/cluster.repository';
import { ErrorCode } from '../constants/error.constants';
import { HTTP } from '../constants/constants';
import net from 'net';
import axios from 'axios';

// JasmineGraph master/workers push cpu_load_percentage and memory_usage_percentage to the
// Pushgateway (job = "Master" or "<worker host>:<port>"), which Prometheus scrapes.
const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';
const STALE_AFTER_SECONDS = 120;
const SATURATED_PERCENT = 85;

const queryPrometheusByJob = async (query: string): Promise<Record<string, number>> => {
  const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, { params: { query }, timeout: 3000 });
  const series: any[] = response.data?.data?.result ?? [];
  const values: Record<string, number> = {};
  series.forEach((s) => {
    values[s.metric.job] = Number(s.value[1]);
  });
  return values;
};

const addNewCluster = async (req: Request, res: Response) => {
  const { name, description, host, port } = req.body;
  const userId = (req as any).auth?.sub;
  if (!userId) {
    console.error("[addNewCluster] No userId in token");
    return res.status(HTTP[401]).json({ message: 'Unauthorized: User ID not found in token' });
  }
  try {
  const cluster = await createClusterRepo({
      name,
      description,
      host,
      port,
      user_ids: [],
      cluster_owner: userId
    });
    return res.status(HTTP[201]).json({ data: cluster });
  } catch (err) {
    if (err instanceof Error && (err as any).code === ErrorCode.UniqueViolation) {
      console.warn("[addNewCluster] Duplicate host and port combination:", { host, port });
      return res.status(HTTP[400]).json({
        errorCode: 'DUPLICATE_HOST_PORT',
        message: 'A cluster with the same host and port already exists. Please use a different combination.'
      });
    }
    console.error("[addNewCluster] Error:", err);
    return res.status(HTTP[500]).json({
      message: 'Internal Server Error: Unable to create the cluster.',
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
};

const getAllClusters = async (req: Request, res: Response) => {
  try {
  const clusters = await getAllClustersRepo();
    return res.status(HTTP[200]).json({ data: clusters });
  } catch (err) {
    console.error("[getAllClustersHandler] Error:", err);
    return res.status(HTTP[500]).json({
      message: 'Internal Server Error: Unable to fetch clusters.',
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
};

const getCluster = async (req: Request, res: Response) => {
  const { id } = req.params;
  const clusterId = Number(id);
  if (isNaN(clusterId)) {
    console.error("[getCluster] Invalid cluster ID:", id);
    return res.status(400).json({ message: 'Invalid cluster ID' });
  }
  try {
  const cluster = await getClusterByIdRepo(clusterId);
    if (!cluster) {
      console.warn(`[getCluster] Cluster with id "${id}" not found.`);
      return res.status(HTTP[404]).json({ message: `Cluster with id "${id}" not found.` });
    }
    return res.status(HTTP[200]).json({ data: cluster });
  } catch (err) {
    console.error("[getCluster] Error:", err);
    return res.status(HTTP[500]).json({
      message: 'Internal Server Error: Unable to get the cluster.',
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
};

const addUserToCluster = async (req: Request, res: Response) => {
  const { userID, clusterID } = req.body;
  try {
  const cluster = await addUserToClusterRepo(Number(clusterID), userID);
    if (!cluster) {
      console.warn(`[addUserToClusterHandler] Cluster with id "${clusterID}" not found.`);
      return res.status(HTTP[404]).json({ message: `Cluster with id "${clusterID}" not found.` });
    }
    return res.status(HTTP[200]).json({ data: cluster });
  } catch (err) {
    console.error("[addUserToClusterHandler] Error:", err);
    return res.status(HTTP[500]).json({
      message: 'Internal Server Error: Unable to add the user to the cluster.',
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    });
  }
};

const removeUserFromCluster = async (req: Request, res: Response) => {
  const { userID, clusterID } = req.body;
  try {
  const cluster = await removeUserFromClusterRepo(Number(clusterID), userID);
    if (!cluster) {
      console.warn(`[removeUserFromClusterHandler] Cluster with id "${clusterID}" not found.`);
      return res.status(HTTP[404]).json({ message: `Cluster with id "${clusterID}" not found.` });
    }
    return res.status(HTTP[200]).json({ data: cluster });
  } catch (err) {
    console.error("[removeUserFromClusterHandler] Error:", err);
    return res.status(HTTP[500]).json({
      message: 'Internal Server Error: Unable to remove the user from the cluster.',
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    });
  }
};

const getMyClusters = async (req: Request, res: Response) => {
  const userID = (req as any).auth?.sub;
  if (!userID) {
    console.error("[getMyClustersHandler] No userID in token");
    return res.status(HTTP[401]).json({ message: 'Unauthorized: User ID not found in token' });
  }
  try {
  const clusters = await getMyClustersRepo(userID);
    return res.status(HTTP[200]).json({ data: clusters });
  } catch (err) {
    console.error("[getMyClustersHandler] Error:", err);
    return res.status(HTTP[500]).json({
      message: 'Internal Server Error: Unable to fetch clusters for the user. Please try again later.',
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    });
  }
};

const getSelectedClustersStatus = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body; 
    if (!ids || !Array.isArray(ids)) {
      return res.status(HTTP[400]).json({ message: "Invalid cluster IDs" });
    }
    
    const clusters = await getAllClustersRepo();
    const filteredClusters = clusters.filter(c => ids.includes(c.id));

    const timeoutMs = 2000;

    const statusPromises = filteredClusters.map((cluster: any) => {
      return new Promise<{ id: number; connected: boolean }>((resolve) => {
        const socket = new net.Socket();
        let responded = false;

        const done = (connected: boolean) => {
          if (responded) return;
          responded = true;
          try { socket.destroy(); } catch {}
          resolve({ id: cluster.id, connected });
        };

        socket.setTimeout(timeoutMs, () => done(false));
        socket.on('error', () => done(false));
        socket.connect(cluster.port, cluster.host, () => done(true));
      });
    });

    const statuses = await Promise.all(statusPromises);
    return res.status(HTTP[200]).json({ clusters: statuses });
  } catch (err) {
    console.error('[getSelectedClustersStatus] Error:', err);
    return res.status(HTTP[500]).json({ message: 'Unable to fetch cluster statuses', error: (err as Error).message });
  }
};

const getClusterNodes = async (req: Request, res: Response) => {
  const clusterId = Number(req.params.id);
  if (isNaN(clusterId)) {
    return res.status(HTTP[400]).json({ message: 'Invalid cluster ID' });
  }
  try {
    const cluster = await getClusterByIdRepo(clusterId);
    if (!cluster) {
      return res.status(HTTP[404]).json({ message: `Cluster with id "${clusterId}" not found.` });
    }

    const [cpu, memory, pushTime] = await Promise.all([
      queryPrometheusByJob('cpu_load_percentage'),
      queryPrometheusByJob('memory_usage_percentage'),
      queryPrometheusByJob('push_time_seconds'),
    ]);

    const jobs = Object.keys(cpu).sort((a, b) => (a === 'Master' ? -1 : b === 'Master' ? 1 : a.localeCompare(b)));
    const nowSeconds = Date.now() / 1000;
    let workerIndex = 0;

    const nodes = jobs.map((job) => {
      const isMaster = job === 'Master';
      const cpuPercent = Math.round(cpu[job] || 0);
      const memoryPercent = Math.round(memory[job] || 0);
      const stale = pushTime[job] === undefined || nowSeconds - pushTime[job] > STALE_AFTER_SECONDS;
      const status = stale
        ? 'Down'
        : cpuPercent > SATURATED_PERCENT || memoryPercent > SATURATED_PERCENT
          ? 'Degraded'
          : 'Healthy';
      return {
        nodeId: isMaster ? 'master-0' : `worker-${workerIndex++}`,
        role: isMaster ? 'Master' : 'Worker',
        ipAddress: isMaster ? cluster.host : job.split(':')[0],
        status,
        cpu: cpuPercent,
        memory: memoryPercent,
      };
    });

    return res.status(HTTP[200]).json({ data: nodes });
  } catch (err) {
    console.error('[getClusterNodes] Error:', err);
    return res.status(HTTP[500]).json({
      message: 'Unable to fetch node metrics from Prometheus.',
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    });
  }
};

export { addNewCluster, getAllClusters, getCluster, addUserToCluster, removeUserFromCluster, getMyClusters, getSelectedClustersStatus, getClusterNodes };
