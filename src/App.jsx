import React, { useState } from 'react';
import { Layout, Menu, Typography, message } from 'antd';
import {
  SwapOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import ParsePage from './pages/ParsePage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: 'parse', icon: <SwapOutlined />, label: '工程解析' },
  { key: 'tasks', icon: <HistoryOutlined />, label: '转换记录' },
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('parse');

  const renderPage = () => {
    switch (currentPage) {
      case 'parse': return <ParsePage />;
      case 'tasks': return <TasksPage />;
      case 'settings': return <SettingsPage />;
      default: return <ParsePage />;
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={220} theme="dark" style={{ borderRight: '1px solid #303030' }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SwapOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>Unity2Cocos</Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => setCurrentPage(key)}
          items={menuItems}
        />
        <div style={{ position: 'absolute', bottom: 16, left: 24, color: '#666', fontSize: 12 }}>
          试玩广告工程转换工具 v1.0
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: 24, overflow: 'auto' }}>
          {renderPage()}
        </Content>
      </Layout>
    </Layout>
  );
}
