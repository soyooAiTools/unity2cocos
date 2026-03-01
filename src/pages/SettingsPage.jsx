import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space, Select, Divider } from 'antd';
import { ApiOutlined, SaveOutlined, RobotOutlined } from '@ant-design/icons';
import { setAIConfig } from '../api';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [apiBase, setApiBase] = useState(localStorage.getItem('u2c_api_base') || 'http://localhost:8080');
  const [aiEndpoint, setAiEndpoint] = useState(localStorage.getItem('u2c_ai_endpoint') || 'https://api.openai.com/v1/chat/completions');
  const [aiKey, setAiKey] = useState(localStorage.getItem('u2c_ai_key') || '');
  const [aiModel, setAiModel] = useState(localStorage.getItem('u2c_ai_model') || 'gpt-4o');
  const [saving, setSaving] = useState(false);

  const handleSaveBackend = () => {
    localStorage.setItem('u2c_api_base', apiBase);
    message.success('后端地址已保存，重启后生效');
  };

  const handleSaveAI = async () => {
    setSaving(true);
    try {
      await setAIConfig({
        apiEndpoint: aiEndpoint,
        apiKey: aiKey,
        model: aiModel,
      });
      localStorage.setItem('u2c_ai_endpoint', aiEndpoint);
      localStorage.setItem('u2c_ai_key', aiKey);
      localStorage.setItem('u2c_ai_model', aiModel);
      message.success('AI 配置已保存');
    } catch (err) {
      message.error('保存失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Title level={3}>⚙️ 设置</Title>

      <Card title={<><ApiOutlined /> 后端连接</>} style={{ maxWidth: 700, marginTop: 16 }}>
        <Form layout="vertical">
          <Form.Item label="API 地址">
            <Input
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="http://localhost:8080"
            />
          </Form.Item>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveBackend}>保存</Button>
        </Form>
      </Card>

      <Card title={<><RobotOutlined /> AI 脚本转换配置</>} style={{ maxWidth: 700, marginTop: 16 }}>
        <Form layout="vertical">
          <Form.Item label="API Endpoint" extra="兼容 OpenAI 格式的 API 地址">
            <Input
              value={aiEndpoint}
              onChange={(e) => setAiEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </Form.Item>
          <Form.Item label="API Key">
            <Input.Password
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="sk-..."
            />
          </Form.Item>
          <Form.Item label="模型">
            <Select
              value={aiModel}
              onChange={setAiModel}
              options={[
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
                { value: 'deepseek-chat', label: 'DeepSeek V3' },
                { value: 'deepseek-coder', label: 'DeepSeek Coder' },
              ]}
              style={{ width: 300 }}
              showSearch
              allowClear
            />
            <Input
              style={{ marginTop: 8 }}
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="或输入自定义模型名"
            />
          </Form.Item>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAI} loading={saving}>
            保存 AI 配置
          </Button>
        </Form>
      </Card>

      <Card title="关于" style={{ maxWidth: 700, marginTop: 16 }}>
        <Space direction="vertical">
          <Text>Unity2Cocos v1.0.0</Text>
          <Text type="secondary">Unity 试玩广告工程 → Cocos Creator 3.8.x 工程转换工具</Text>
          <Divider style={{ margin: '8px 0' }} />
          <Text type="secondary">后端: soyooplatform (Go + Gin) — 本地运行</Text>
          <Text type="secondary">前端: Electron + React + Ant Design</Text>
          <Text type="secondary">AI: 支持 OpenAI / Claude / DeepSeek 等兼容 API</Text>
        </Space>
      </Card>
    </div>
  );
}
