# Unity2Cocos 🔄

Unity → Cocos Creator 试玩广告工程转换工具。

将 Unity 工程（场景、脚本、模型、贴图、材质、音频）一键转换为 Cocos Creator 3.8 工程结构，支持 AI 智能脚本转换。

## 功能

- **工程解析** — 扫描 Unity 工程，识别场景、C# 脚本、模型(FBX/OBJ)、贴图、材质、音频等资源
- **场景转换** — Unity .scene(YAML) → Cocos .scene(JSON)，保留节点树、Transform、组件引用
- **脚本转换** — C# MonoBehaviour → TypeScript @ccclass，映射属性和生命周期
- **AI 智能转换** — 可选：用 AI 将 C# 逻辑完整翻译为 TypeScript（而非仅生成骨架）
- **资源复制** — FBX/OBJ/贴图/音频原样复制，自动生成 .meta 文件
- **材质映射** — Unity Standard/URP → Cocos builtin-standard
- **转换记录** — 历史任务查看、详情浏览
- **Electron 桌面版** — 可打包为 .exe 独立运行

## 架构

```
前端 (React + Ant Design + Vite)
  ↕ HTTP API
后端 (Go / Gin) — soyooplatform
  ↕ 文件系统
Unity 工程 → Cocos 工程
```

| 模块 | 技术栈 |
|------|--------|
| 前端 | React 19 + Ant Design 6 + Vite 7 |
| 后端 | Go + Gin + SQLite |
| 桌面 | Electron 40 |
| AI | 可选，OpenAI/Anthropic API |

## 快速开始

### 前提

- Node.js ≥ 18
- Go ≥ 1.21（后端）
- 后端服务运行在 `localhost:8080`

### 启动前端

```bash
npm install
npm run dev        # Vite 开发模式 (localhost:5173)
```

### 启动后端

```bash
cd ../soyooplatform
go run ./cmd/server/
```

### Electron 桌面模式

```bash
npm run dev        # 同时启动 Vite + Electron
npm run build      # 打包 .exe
```

## 项目结构

```
unity2cocos-app/
├── src/
│   ├── App.jsx              # 路由 + 布局
│   ├── main.jsx             # 入口
│   ├── api.js               # API 封装
│   ├── pages/
│   │   ├── ParsePage.jsx    # 工程解析 + 转换主页
│   │   ├── TasksPage.jsx    # 转换记录
│   │   └── SettingsPage.jsx # AI 配置
│   └── styles/
│       └── global.css       # 全局样式（暗色主题）
├── main.js                  # Electron 主进程
├── preload.js               # Electron preload
├── vite.config.js           # Vite 配置
├── index.html               # HTML 入口
└── package.json
```

## API 端点（后端）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/unity2cocos/parse` | 解析 Unity 工程 |
| POST | `/api/unity2cocos/convert` | 执行转换 |
| POST | `/api/unity2cocos/ai-config` | 设置 AI 配置 |
| POST | `/api/unity2cocos/convert-scripts-ai` | AI 脚本转换 |
| GET | `/api/unity2cocos/tasks` | 转换记录列表 |
| GET | `/api/unity2cocos/tasks/:id` | 任务详情 |
| DELETE | `/api/unity2cocos/tasks/:id` | 删除任务 |

## 转换映射

### 场景节点
- `GameObject` → `cc.Node`
- `Transform` → `cc.Node` position/rotation/scale
- `Camera` → `cc.Camera`
- `Light` → `cc.DirectionalLight / cc.PointLight`
- `MeshRenderer` → `cc.MeshRenderer`
- `Canvas/RectTransform` → `cc.UITransform`

### 脚本
- `MonoBehaviour` → `Component`
- `[SerializeField]` / `public` → `@property()`
- `Start()` → `start()`
- `Update()` → `update(dt)`
- `OnDestroy()` → `onDestroy()`
- `OnEnable/OnDisable()` → `onEnable()/onDisable()`

## License

MIT
