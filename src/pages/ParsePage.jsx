import React, { useState } from 'react';
import {
  Card, Button, Input, Space, Typography, Spin, Statistic, Row, Col,
  Tree, Table, Tabs, Tag, message, Empty, Divider, Steps, Progress,
  Switch, Alert, List, Radio,
} from 'antd';
import {
  FolderOpenOutlined, ThunderboltOutlined, FileOutlined,
  CodeOutlined, PictureOutlined, SoundOutlined, AppstoreOutlined,
  NodeIndexOutlined, BgColorsOutlined, RocketOutlined, RobotOutlined,
  CheckCircleOutlined, ExportOutlined, SearchOutlined, PlayCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { scanProject, parseProject, getTask, convertProject, convertScriptsAI, fixMeshRefs } from '../api';

const { Title, Text } = Typography;

export default function ParsePage() {
  const [projectPath, setProjectPath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0=idle, 1=scanned, 2=parsed, 3=converting, 4=done
  const [scenes, setScenes] = useState([]); // scan result
  const [selectedScene, setSelectedScene] = useState(null); // user-chosen scene
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [useAI, setUseAI] = useState(true);
  const [aiProgress, setAiProgress] = useState(null);
  const [convertResult, setConvertResult] = useState(null);

  const handleSelectDir = async () => {
    if (window.electronAPI) {
      const dir = await window.electronAPI.selectDirectory();
      if (dir) setProjectPath(dir);
    } else {
      message.info('请在 Electron 环境中运行以使用目录选择');
    }
  };

  const handleSelectOutput = async () => {
    if (window.electronAPI) {
      const dir = await window.electronAPI.selectOutputDirectory();
      if (dir) setOutputPath(dir);
    } else {
      message.info('请在 Electron 环境中运行以使用目录选择');
    }
  };

  // Step 1: Scan — quick scene list
  const handleScan = async () => {
    if (!projectPath) {
      message.warning('请先选择 Unity 工程目录');
      return;
    }
    setLoading(true);
    setScenes([]);
    setSelectedScene(null);
    setResult(null);
    setSummary(null);
    setStep(0);
    try {
      const data = await scanProject(projectPath);
      setScenes(data.scenes || []);
      if (data.scenes?.length === 1) {
        setSelectedScene(data.scenes[0].path);
      }
      setStep(1);
      message.success(`发现 ${data.scenes?.length || 0} 个场景`);
    } catch (err) {
      message.error('扫描失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Parse selected scene
  const handleParse = async () => {
    if (!selectedScene) {
      message.warning('请先选择要转换的场景');
      return;
    }
    setLoading(true);
    setResult(null);
    setSummary(null);
    try {
      const data = await parseProject(projectPath, selectedScene);
      setSummary(data.summary);
      setTaskId(data.taskId);
      const full = await getTask(data.taskId);
      setResult(full.parseResult);
      setStep(2);
      if (!outputPath) {
        setOutputPath(projectPath.replace(/[/\\]?$/, '') + '_cocos');
      }
      message.success('解析完成');
    } catch (err) {
      message.error('解析失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Convert
  const handleConvert = async () => {
    if (!outputPath) {
      message.warning('请选择输出目录');
      return;
    }
    setLoading(true);
    setStep(3);
    try {
      const data = await convertProject(projectPath, outputPath, selectedScene);
      setConvertResult(data);

      if (useAI && taskId) {
        setAiProgress({ current: 0, total: summary?.scripts || 0 });
        try {
          const aiResult = await convertScriptsAI(taskId, outputPath);
          setAiProgress(null);
          const aiDone = aiResult.results?.filter(r => r.status === 'done').length || 0;
          const aiFallback = aiResult.results?.filter(r => r.status === 'fallback').length || 0;
          message.success(`AI 转换完成: ${aiDone} 个脚本成功, ${aiFallback} 个回退骨架`);
        } catch (aiErr) {
          setAiProgress(null);
          message.warning('AI 脚本转换失败，已使用骨架代码: ' + (aiErr.response?.data?.error || aiErr.message));
        }
      }

      setStep(4);
      message.success('转换完成！');
    } catch (err) {
      message.error('转换失败: ' + (err.response?.data?.error || err.message));
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>🔄 Unity → Cocos 转换</Title>

      <Steps
        current={step}
        style={{ marginBottom: 24 }}
        items={[
          { title: '选择工程', icon: <FolderOpenOutlined /> },
          { title: '选择场景', icon: <AppstoreOutlined /> },
          { title: '解析完成', icon: <FileOutlined /> },
          { title: '转换中', icon: <RocketOutlined /> },
          { title: '完成', icon: <CheckCircleOutlined /> },
        ]}
      />

      {/* Input Section */}
      <Card title="工程路径" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Unity 工程目录（包含 Assets 文件夹）</Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                size="large"
                placeholder="C:\path\to\unity\project"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                prefix={<FolderOpenOutlined />}
              />
              <Button size="large" onClick={handleSelectDir}>浏览</Button>
              <Button
                size="large"
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleScan}
                loading={loading && step === 0}
              >
                扫描
              </Button>
            </Space.Compact>
          </div>
        </Space>
      </Card>

      {/* Scene Selection */}
      {step >= 1 && scenes.length > 0 && (
        <Card
          title={`选择要转换的场景（共 ${scenes.length} 个）`}
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleParse}
              loading={loading && step === 1}
              disabled={!selectedScene}
            >
              解析选中场景
            </Button>
          }
        >
          <Radio.Group
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value)}
            style={{ width: '100%' }}
          >
            <List
              dataSource={scenes}
              renderItem={(scene) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: selectedScene === scene.path ? '#177ddc15' : 'transparent',
                    borderRadius: 8,
                    padding: '12px 16px',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => setSelectedScene(scene.path)}
                >
                  <Radio value={scene.path}>
                    <Space>
                      <PlayCircleOutlined style={{ fontSize: 18, color: '#177ddc' }} />
                      <div>
                        <Text strong style={{ fontSize: 15 }}>{scene.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{scene.path}</Text>
                      </div>
                    </Space>
                  </Radio>
                </List.Item>
              )}
            />
          </Radio.Group>
        </Card>
      )}

      {/* Post-parse: output path + convert button */}
      {step >= 2 && (
        <Card title="转换设置" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Cocos 工程输出目录</Text>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="C:\path\to\output\cocos_project"
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                  prefix={<ExportOutlined />}
                />
                <Button size="large" onClick={handleSelectOutput}>浏览</Button>
              </Space.Compact>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Space>
                <RobotOutlined />
                <Text>AI 智能脚本转换</Text>
                <Switch checked={useAI} onChange={setUseAI} />
              </Space>
              {useAI && (
                <Text type="secondary">使用 AI 将 C# 逻辑完整转换为 TypeScript（而非仅生成骨架）</Text>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={handleConvert}
              loading={loading && step === 3}
              block
              style={{ height: 48, fontSize: 16 }}
            >
              开始转换
            </Button>
          </Space>
        </Card>
      )}

      {/* Converting progress */}
      {step === 3 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              {aiProgress ? (
                <>
                  <Text>AI 正在转换脚本... {aiProgress.current}/{aiProgress.total}</Text>
                  <Progress percent={Math.round((aiProgress.current / aiProgress.total) * 100)} style={{ marginTop: 8 }} />
                </>
              ) : (
                <Text>正在转换资源和场景...</Text>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Done */}
      {step === 4 && (
        <Alert
          type="success"
          message="转换完成！"
          description={
            <div>
              <div>{`Cocos Creator 3.8 工程已输出到: ${outputPath}`}</div>
              <div style={{ marginTop: 8, color: '#666' }}>
                ⚠️ 请先用 Cocos Creator 打开工程等待资源导入完成，然后点击下方按钮修复模型引用
              </div>
            </div>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Fix Mesh Refs button - show after conversion */}
      {step === 4 && outputPath && (
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">
              Cocos Creator 导入资源后，模型的 Mesh 子资源 ID 会重新生成。点击此按钮自动修复场景中的 Mesh 引用。
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<ToolOutlined />}
              block
              style={{ height: 48, fontSize: 16 }}
              onClick={async () => {
                try {
                  const res = await fixMeshRefs(outputPath);
                  message.success(`修复完成！${res.fixed}/${res.total} 个 Mesh 引用已更新`);
                } catch (err) {
                  message.error('修复失败: ' + (err.response?.data?.error || err.message));
                }
              }}
            >
              🔧 修复 Mesh 引用（Cocos 导入后点击）
            </Button>
          </Space>
        </Card>
      )}

      {/* Parse Results */}
      {summary && step >= 2 && (
        <>
          <Divider />
          <Title level={4}>📊 工程概览</Title>
          <Row gutter={[16, 16]}>
            <Col span={4}><Card><Statistic title="场景" value={summary.scenes} prefix={<AppstoreOutlined />} /></Card></Col>
            <Col span={4}><Card><Statistic title="脚本" value={summary.scripts} prefix={<CodeOutlined />} /></Card></Col>
            <Col span={4}><Card><Statistic title="模型" value={summary.models} prefix={<NodeIndexOutlined />} /></Card></Col>
            <Col span={4}><Card><Statistic title="贴图" value={summary.textures} prefix={<PictureOutlined />} /></Card></Col>
            <Col span={4}><Card><Statistic title="材质" value={summary.materials} prefix={<BgColorsOutlined />} /></Card></Col>
            <Col span={4}><Card><Statistic title="音频" value={summary.audio} prefix={<SoundOutlined />} /></Card></Col>
          </Row>
        </>
      )}

      {result && step >= 2 && (
        <>
          <Divider />
          <Tabs
            defaultActiveKey="scenes"
            items={[
              {
                key: 'scenes',
                label: `场景 (${result.scenes?.length || 0})`,
                children: <ScenesTab scenes={result.scenes || []} />,
              },
              {
                key: 'scripts',
                label: `脚本 (${result.scripts?.length || 0})`,
                children: <ScriptsTab scripts={result.scripts || []} />,
              },
              {
                key: 'assets',
                label: '资源清单',
                children: <AssetsTab assets={result.assets || {}} />,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

// ========== Sub-components ==========

function ScenesTab({ scenes }) {
  const [selected, setSelected] = useState(scenes.length === 1 ? scenes[0] : null);

  const buildTreeData = (nodes) => {
    return (nodes || []).map((node, idx) => ({
      title: (
        <span>
          {node.name}
          {!node.active && <Tag color="red" style={{ marginLeft: 4 }}>隐藏</Tag>}
          {node.components?.map((c, i) => (
            <Tag key={i} color="blue" style={{ marginLeft: 2 }}>{c.type}</Tag>
          ))}
        </span>
      ),
      key: `${node.fileID || idx}`,
      children: buildTreeData(node.children),
    }));
  };

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card title="场景列表" size="small" style={{ height: 500, overflow: 'auto' }}>
          {scenes.map((s) => (
            <div
              key={s.name}
              onClick={() => setSelected(s)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: selected?.name === s.name ? '#177ddc22' : 'transparent',
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              <FileOutlined style={{ marginRight: 8 }} />
              {s.name}
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {s.nodes?.length || 0} 根节点
              </Text>
            </div>
          ))}
        </Card>
      </Col>
      <Col span={18}>
        <Card title={selected ? `${selected.name} — 节点树` : '选择一个场景'} size="small" style={{ height: 500, overflow: 'auto' }}>
          {selected ? (
            <Tree
              treeData={buildTreeData(selected.nodes)}
              defaultExpandedKeys={selected.nodes?.slice(0, 3).map((n) => n.fileID || '0')}
              showLine
            />
          ) : (
            <Empty description="点击左侧场景查看节点树" />
          )}
        </Card>
      </Col>
    </Row>
  );
}

function ScriptsTab({ scripts }) {
  const columns = [
    { title: '类名', dataIndex: 'name', key: 'name', width: 180, sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: '基类', dataIndex: 'baseClass', key: 'baseClass', width: 150,
      render: (v) => v ? <Tag color="purple">{v}</Tag> : '-',
    },
    { title: '字段', key: 'fields', width: 60, render: (_, r) => r.fields?.length || 0 },
    { title: '方法', key: 'methods', width: 60, render: (_, r) => r.methods?.length || 0 },
    {
      title: '依赖',
      key: 'deps',
      render: (_, r) => (r.dependencies || []).slice(0, 5).map((d) => <Tag key={d} color="cyan">{d}</Tag>),
    },
    { title: '文件', dataIndex: 'file', key: 'file', ellipsis: true },
  ];

  return (
    <Table
      dataSource={scripts}
      columns={columns}
      rowKey="name"
      size="small"
      pagination={{ pageSize: 20 }}
      scroll={{ y: 400 }}
    />
  );
}

function AssetsTab({ assets }) {
  const categories = [
    { key: 'models', label: '模型', data: assets.models },
    { key: 'textures', label: '贴图', data: assets.textures },
    { key: 'materials', label: '材质', data: assets.materials },
    { key: 'animations', label: '动画', data: assets.animations },
    { key: 'audio', label: '音频', data: assets.audio },
    { key: 'prefabs', label: 'Prefab', data: assets.prefabs },
    { key: 'shaders', label: 'Shader', data: assets.shaders },
  ];

  const columns = [
    { title: '文件名', dataIndex: 'name', key: 'name', width: 250, sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: '路径', dataIndex: 'path', key: 'path', ellipsis: true },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100,
      render: (v) => v > 1024 * 1024 ? `${(v / 1024 / 1024).toFixed(1)} MB` : `${(v / 1024).toFixed(1)} KB`,
      sorter: (a, b) => a.size - b.size,
    },
  ];

  return (
    <Tabs
      tabPosition="left"
      items={categories.map((cat) => ({
        key: cat.key,
        label: `${cat.label} (${cat.data?.length || 0})`,
        children: (
          <Table
            dataSource={cat.data || []}
            columns={columns}
            rowKey={(r) => r.path || r.name}
            size="small"
            pagination={{ pageSize: 15 }}
            scroll={{ y: 400 }}
          />
        ),
      }))}
    />
  );
}
