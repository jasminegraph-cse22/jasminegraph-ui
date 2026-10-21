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
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hook";
import { set_Selected_Cluster } from "@/redux/features/clusterData";
import { IClusterDetails } from "@/types/cluster-types";
import { getAllClusters } from "@/services/cluster-service";
import useAccessToken from "@/hooks/useAccessToken";

interface ClusterHeaderSelectorProps {
  currentClusterId: string | number;
}

export default function ClusterHeaderSelector({
  currentClusterId,
}: ClusterHeaderSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { getSrvAccessToken } = useAccessToken();
  const { selectedCluster } = useAppSelector((state) => state.clusterData);

  // Available clusters list
  const [clustersList, setClustersList] = useState<Array<{ id: number; name: string; platform: string }>>([
    { id: 7, name: "prod-graph-01", platform: "Kubernetes" },
    { id: 8, name: "staging-graph-02", platform: "Docker" },
  ]);

  useEffect(() => {
    async function loadClusters() {
      try {
        const token = getSrvAccessToken();
        if (!token) return;
        const res = await getAllClusters(token);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c: IClusterDetails) => ({
            id: c.id,
            name: c.name,
            platform: c.id === 8 ? "Docker" : "Kubernetes",
          }));
          // Ensure both 7 and 8 exist for mockup if not in backend yet
          const has7 = mapped.some((c: any) => c.id === 7);
          const has8 = mapped.some((c: any) => c.id === 8);
          if (!has7) mapped.unshift({ id: 7, name: "prod-graph-01", platform: "Kubernetes" });
          if (!has8) mapped.push({ id: 8, name: "staging-graph-02", platform: "Docker" });
          setClustersList(mapped);
        }
      } catch (e) {
        // Fallback to initial mockup list
      }
    }
    loadClusters();
  }, [getSrvAccessToken]);

  const handleSelectCluster = (targetCluster: { id: number; name: string; platform: string }) => {
    // Determine the current subpath: e.g. /clusters/7/instance -> /instance
    const pathParts = pathname.split("/");
    const subRoute = pathParts.slice(3).join("/"); // e.g. "instance" or "deployment" or ""

    const nextPath = subRoute
      ? `/clusters/${targetCluster.id}/${subRoute}`
      : `/clusters/${targetCluster.id}`;

    // Update Redux state
    const clusterObj: IClusterDetails = {
      id: targetCluster.id,
      name: targetCluster.name,
      description:
        targetCluster.id === 7
          ? "Primary analytics cluster — social graph, EU region."
          : "Staging cluster for integration tests — local docker compose.",
      host: targetCluster.id === 7 ? "jasminegraph-master-service" : "jasminegraph-docker-host",
      port: 7777,
      user_ids: [],
      cluster_owner: "admin",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
      status: true,
    };
    dispatch(set_Selected_Cluster(clusterObj));
    localStorage.setItem("selectedCluster", String(targetCluster.id));

    router.push(nextPath);
  };

  const activeId = Number(currentClusterId);

  return (
    <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-1 scrollbar-none">
      {clustersList.map((cluster) => {
        const isActive = cluster.id === activeId;
        return (
          <button
            key={cluster.id}
            type="button"
            onClick={() => handleSelectCluster(cluster)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
              isActive
                ? "bg-blue-50/70 border-blue-500 text-blue-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-blue-600" : "bg-blue-400"
              }`}
            />
            <span className="font-semibold">{cluster.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{cluster.platform}</span>
          </button>
        );
      })}
    </div>
  );
}
