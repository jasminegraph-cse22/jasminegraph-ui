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

import { Request, Response } from "express";
import { HTTP } from "../constants/constants";
import {
  getClusterOverviewService,
  getNodeMetricsService,
  getNetworkTopologyService,
  getDeploymentMetricsService,
  getClusterLogsService,
} from "../services/observability.service";
import { IClusterLogsFilter } from "../models/observability.model";

/**
 * Helper to parse and validate cluster ID from request params.
 */
function parseClusterId(req: Request, res: Response): number | null {
  const { id } = req.params;
  const clusterId = Number(id);
  if (Number.isNaN(clusterId) || clusterId <= 0) {
    res.status(HTTP[400]).json({ message: `Invalid cluster ID: "${id}"` });
    return null;
  }
  return clusterId;
}

/**
 * Controller: GET /clusters/:id/observability
 * Returns complete cluster observability overview (Page 1: Cluster Details).
 */
export const getClusterOverview = async (req: Request, res: Response): Promise<Response> => {
  const clusterId = parseClusterId(req, res);
  if (clusterId === null) return res;

  try {
    const data = await getClusterOverviewService(clusterId);
    if (!data) {
      return res.status(HTTP[404]).json({ message: `Cluster with ID ${clusterId} not found.` });
    }
    return res.status(HTTP[200]).json({ data });
  } catch (err) {
    console.error(`[getClusterOverview] Error for cluster ${clusterId}:`, err);
    return res.status(HTTP[500]).json({
      message: "Internal Server Error: Unable to fetch cluster overview.",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Controller: GET /clusters/:id/observability/nodes
 * Returns compute unit nodes metrics (Page 2: Instance Node Details).
 */
export const getClusterNodes = async (req: Request, res: Response): Promise<Response> => {
  const clusterId = parseClusterId(req, res);
  if (clusterId === null) return res;

  try {
    const nodes = await getNodeMetricsService(clusterId);
    if (!nodes) {
      return res.status(HTTP[404]).json({ message: `Cluster with ID ${clusterId} not found.` });
    }
    return res.status(HTTP[200]).json({ data: nodes });
  } catch (err) {
    console.error(`[getClusterNodes] Error for cluster ${clusterId}:`, err);
    return res.status(HTTP[500]).json({
      message: "Internal Server Error: Unable to fetch node metrics.",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Controller: GET /clusters/:id/observability/network
 * Returns network connectivity & link metrics (Page 3: Instance Network Connectivity).
 */
export const getClusterNetwork = async (req: Request, res: Response): Promise<Response> => {
  const clusterId = parseClusterId(req, res);
  if (clusterId === null) return res;

  try {
    const links = await getNetworkTopologyService(clusterId);
    if (!links) {
      return res.status(HTTP[404]).json({ message: `Cluster with ID ${clusterId} not found.` });
    }
    return res.status(HTTP[200]).json({ data: { clusterId, links } });
  } catch (err) {
    console.error(`[getClusterNetwork] Error for cluster ${clusterId}:`, err);
    return res.status(HTTP[500]).json({
      message: "Internal Server Error: Unable to fetch network topology.",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Controller: GET /clusters/:id/observability/deployment
 * Returns deployment workload summary & aggregate 30-min metrics (Page 4 & 5: Deployment).
 */
export const getClusterDeployment = async (req: Request, res: Response): Promise<Response> => {
  const clusterId = parseClusterId(req, res);
  if (clusterId === null) return res;

  try {
    const deployment = await getDeploymentMetricsService(clusterId);
    if (!deployment) {
      return res.status(HTTP[404]).json({ message: `Cluster with ID ${clusterId} not found.` });
    }
    return res.status(HTTP[200]).json({ data: deployment });
  } catch (err) {
    console.error(`[getClusterDeployment] Error for cluster ${clusterId}:`, err);
    return res.status(HTTP[500]).json({
      message: "Internal Server Error: Unable to fetch deployment metrics.",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Controller: GET /clusters/:id/observability/logs
 * Returns filterable cluster logs.
 */
export const getClusterLogs = async (req: Request, res: Response): Promise<Response> => {
  const clusterId = parseClusterId(req, res);
  if (clusterId === null) return res;

  const filters: IClusterLogsFilter = {
    node: req.query.node ? String(req.query.node) : undefined,
    level: req.query.level ? String(req.query.level) : undefined,
    search: req.query.search ? String(req.query.search) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : 50,
  };

  try {
    const logs = await getClusterLogsService(clusterId, filters);
    if (!logs) {
      return res.status(HTTP[404]).json({ message: `Cluster with ID ${clusterId} not found.` });
    }
    return res.status(HTTP[200]).json({ data: { clusterId, logs } });
  } catch (err) {
    console.error(`[getClusterLogs] Error for cluster ${clusterId}:`, err);
    return res.status(HTTP[500]).json({
      message: "Internal Server Error: Unable to fetch cluster logs.",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
