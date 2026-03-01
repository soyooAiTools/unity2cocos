import React from 'react';
import { Layout, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import ParsePage from './pages/ParsePage';

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function App() {
  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={220} theme="dark" style={{ borderRight: '1px solid #303030' }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SwapOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>Unity2Cocos</Title>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 24, color: '#666', fontSize: 12 }}>
          试玩广告工程转换工具 v1.0
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: 24, overflow: 'auto' }}>
          <ParsePage />
        </Content>
      </Layout>
    </Layout>
  );
}
