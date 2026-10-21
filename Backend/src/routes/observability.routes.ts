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

import { Router } from "express";
import {
  getClusterOverview,
  getClusterNodes,
  getClusterNetwork,
  getClusterDeployment,
  getClusterLogs,
} from "../controllers/observability.controller";

/**
 * Observability router scoped to a cluster.
 * Uses mergeParams: true to inherit :id from the parent router.
 */
const observabilityRoute = (): Router => {
  const router = Router({ mergeParams: true });

  router.get("/", getClusterOverview);
  router.get("/nodes", getClusterNodes);
  router.get("/network", getClusterNetwork);
  router.get("/deployment", getClusterDeployment);
  router.get("/logs", getClusterLogs);

  return router;
};

export { observabilityRoute };
