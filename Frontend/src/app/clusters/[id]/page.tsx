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

'use client';
import React, { useEffect, useState } from "react";
import { Descriptions, Input, Row, Col, Divider, Progress } from 'antd';
import type { DescriptionsProps } from 'antd';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { IClusterDetails, IClusterProperties, INodeDetails, NodeStatus } from "@/types/cluster-types";
import { useAppSelector } from "@/redux/hook";
import { useDispatch } from "react-redux";
import { set_Selected_Cluster } from "@/redux/features/clusterData";
import { getCluster, getClusterProperties, getClusterNodes } from "@/services/cluster-service";
import useAccessToken from '@/hooks/useAccessToken';

const STATUS_COLORS: Record<NodeStatus, string> = {
  Healthy: 'green',
  Degraded: 'orange',
  Down: 'volcano',
};

// Same thresholds as the usage legend: <65 normal, 65-85 elevated, >85 saturated
const usageColor = (percent: number) => {
  if (percent > 85) return '#fa541c';
  if (percent >= 65) return '#faad14';
  return '#52c41a';
};

const columns: TableProps<INodeDetails>['columns'] = [
  {
    title: 'Node ID',
    dataIndex: 'nodeId',
    key: 'nodeId',
  },
  {
    title: 'IP Address',
    dataIndex: 'ipAddress',
    key: 'ip',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, { status }) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>,
  },
  {
    title: 'CPU',
    dataIndex: 'cpu',
    key: 'cpu',
    render: (cpu: number) => <Progress percent={cpu} size="small" strokeColor={usageColor(cpu)} />,
  },
  {
    title: 'Memory',
    dataIndex: 'memory',
    key: 'memory',
    render: (memory: number) => <Progress percent={memory} size="small" strokeColor={usageColor(memory)} />,
  }
];

export default function ClusterDetails({ params }: { params: { id: string } }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedCluster } = useAppSelector(state => state.clusterData)
  const [clusterDetails, setClusterDetails] = useState<IClusterDetails | null>(selectedCluster);
  const [clusterProperties, setClusterProperties] = useState<IClusterProperties | null>(null);
  const [nodes, setNodes] = useState<INodeDetails[]>([]);
  const { getSrvAccessToken } = useAccessToken();

  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'Cluster ID',
      children: clusterDetails?.id || "-",
    },
    {
      key: '2',
      label: 'Host',
      children: clusterDetails?.host || "-",
    },
    {
      key: '3',
      label: 'JasmineGraph Version',
      children: clusterProperties?.version || "-",
    },
    {
      key: '4',
      label: 'Platform',
      children: clusterProperties?.platform === 'kubernetes' ? 'Kubernetes' : 'Docker',
    },
    {
      key: '5',
      label: 'Number of Workers',
      children: clusterProperties?.workersCount || "-",
    },{
      key: '6',
      label: 'Number of Partitions',
      children: clusterProperties?.partitionCount || "-",
    },
  ];

  const fetchClusterDetails = async () => {
    try{
      const token = getSrvAccessToken() || "";
      const res = await getCluster(params.id, token);
      if(res.data){
        setClusterDetails(res.data)
      }
      dispatch(set_Selected_Cluster(res.data))
    }catch(err){
      console.log("Failed to fetch cluster: ", err)
    }
  }

   const fetchClusterProperties = async () => {
    try{
      const res = await getClusterProperties(params.id);
      if(res.data){
        setClusterProperties(res.data)
      }
    }catch(err){
      console.log("Failed to fetch cluster properties: ", err)
    }
  }

  const fetchClusterNodes = async () => {
    try{
      const token = getSrvAccessToken() || "";
      const res = await getClusterNodes(params.id, token);
      if(res.data){
        setNodes(res.data)
      }
    }catch(err){
      console.log("Failed to fetch cluster nodes: ", err)
    }
  }

  useEffect(()=> {
    fetchClusterDetails()
    fetchClusterProperties()
    fetchClusterNodes()
  }, [])

  const filterMasterNodeData = (nodes: INodeDetails[]) => {
    return nodes.filter((node) => node.role === "Master");
  }

  const filterWorkerNodeData = (nodes: INodeDetails[]) => {
    return nodes.filter((node) => node.role === "Worker");
  }

  return (
    <div className="">
      <Row style={{justifyContent: "space-between", marginTop: "20px"}}>
        <Col span={10}>
        <h1 style={{fontSize: "xx-large", fontWeight: "600", lineHeight: "1.5", marginBottom: "20px"}}>{clusterDetails?.name}</h1>
        <p><strong>Description: </strong>{clusterDetails?.description}</p>
        </Col>
        <Col span={12}>
          <Descriptions title="Cluster Information" items={items} column={1} />
        </Col>
      </Row>
      <Divider>Master Nodes</Divider>
      <Table columns={columns} dataSource={filterMasterNodeData(nodes)} rowKey="nodeId" pagination={false} />
      <Divider>Worker Nodes</Divider>
      <Table columns={columns} dataSource={filterWorkerNodeData(nodes)} rowKey="nodeId" pagination={false} />
    </div>
  );
}
