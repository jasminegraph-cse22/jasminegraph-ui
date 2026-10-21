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

"use client";
import React from "react";
import PageWrapper from "@/layouts/page-wrapper";
import { Layout, Menu, theme } from "antd";
import type { MenuProps } from "antd";
import { ClusterTopMenu } from "@/data/menu-data";
import * as Routes from "@/routes/page-routes";
import { usePathname, useRouter } from "next/navigation";
import ClusterHeaderSelector from "@/components/observability/ClusterHeaderSelector";

const { Content } = Layout;

export default function ClusterLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { id: string };
}>) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();

  // Determine current active tab based on URL pathname
  const getCurrentTabKey = () => {
    if (pathname.includes("/instance")) return Routes.CLUSTER_PAGE_ROUTES.instance;
    if (pathname.includes("/deployment")) return Routes.CLUSTER_PAGE_ROUTES.deployment;
    if (pathname.includes("/access-management")) return Routes.CLUSTER_PAGE_ROUTES.accessManagement;
    if (pathname.includes("/logs")) return Routes.CLUSTER_PAGE_ROUTES.logs;
    return Routes.CLUSTER_PAGE_ROUTES.clusterDetails;
  };

  const onClick: MenuProps["onClick"] = (e) => {
    const routeSuffix = e.key === "/" ? "" : e.key;
    router.push(`${Routes.SIDE_MENU_ROUTES.clusterPage}/${params.id}${routeSuffix}`);
  };

  return (
    <PageWrapper>
      <Layout style={{ padding: "24px 24px", height: "92vh" }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          {/* Cluster Switcher Pills: prod-graph-01, staging-graph-02 */}
          <ClusterHeaderSelector currentClusterId={params.id} />

          {/* Sub Navigation Tabs */}
          <Menu
            onClick={onClick}
            selectedKeys={[getCurrentTabKey()]}
            mode="horizontal"
            items={ClusterTopMenu}
            className="mb-6 font-medium text-slate-700"
          />

          {children}
        </Content>
      </Layout>
    </PageWrapper>
  );
}
