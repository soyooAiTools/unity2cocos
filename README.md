# Unity2Cocos 🔄

> Unity → Cocos Creator 试玩广告工程一键转换工具

将 Unity 工程（场景、脚本、模型、贴图、材质、音频）转换为 Cocos Creator 3.8 工程，支持 AI 智能脚本转换和自动 Mesh 引用修复。

![Electron](https://img.shields.io/badge/Electron-40-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![Go](https://img.shields.io/badge/Go-Gin-00ADD8) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ 功能亮点

| 功能 | 说明 |
|------|------|
| 🎬 **场景选择** | 扫描 Unity 工程，列出所有 `.unity` 场景供选择，只转换需要的场景 |
| 🌳 **场景转换** | Unity `.scene`(YAML) → Cocos `.scene`(JSON)，完整保留节点树、Transform、组件 |
| 📝 **脚本转换** | C# MonoBehaviour → TypeScript @ccclass，自动映射生命周期和属性 |
| 🤖 **AI 智能转换** | 可选用 Gemini/OpenAI 将 C# 游戏逻辑完整翻译为 TypeScript（非仅骨架） |
| 📦 **资源处理** | FBX/OBJ/贴图/音频原样复制，自动生成 `.meta` 文件 |
| 🎨 **材质映射** | Unity Standard/URP → Cocos builtin-standard |
| 🔧 **Mesh 引用修复** | 转换时自动修复 Mesh UUID；Cocos 导入后可二次修复 |
| 🖥️ **桌面应用** | Electron 打包为 `.exe`，开箱即用 |

---

## 🚀 使用流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  选择 Unity  │ →  │  选择场景    │ →  │  开始转换    │ →  │  CC 打开工程 │
│  工程目录    │    │  (.unity)    │    │  (自动修复)   │    │  查看效果    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

1. **选择 Unity 工程目录** — 点击📂按钮，选择包含 `Assets/` 的 Unity 工程根目录
2. **扫描场景** — 自动列出工程中所有 `.unity` 场景文件
3. **选择目标场景** — 选择要转换的场景（避免解析无关内容）
4. **解析工程** — 分析场景结构、脚本依赖、资源引用，展示工程概览
5. **开始转换** — 一键执行：场景转换 + 脚本转换 + 资源复制 + Mesh 修复
6. **打开 Cocos 工程** — 用 Cocos Creator 3.8 打开输出目录，等待资源导入
7. **（可选）二次修复** — 如果模型引用仍有问题，点击 "Fix Mesh Refs" 按钮

---

## 🏗️ 架构

```
┌──────────────────────────────────────┐
│          Electron Desktop App        │
│  ┌────────────────────────────────┐  │
│  │   React 19 + Ant Design 6     │  │
│  │   ParsePage (单页完成全流程)    │  │
│  └────────────┬───────────────────┘  │
│               │ HTTP API             │
│  ┌────────────▼───────────────────┐  │
│  │   Go / Gin Backend             │  │
│  │   (soyooplatform 子模块)        │  │
│  │   ┌─────────────────────────┐  │  │
│  │   │  parser      → 工程解析  │  │  │
│  │   │  converter   → 场景转换  │  │  │
│  │   │  script_conv → 脚本转换  │  │  │
│  │   │  ai_conv     → AI 转换   │  │  │
│  │   │  mesh_fixer  → Mesh 修复 │  │  │
│  │   └─────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 📂 项目结构

```
unity2cocos-app/
├── src/
│   ├── App.jsx              # 单页布局
│   ├── main.jsx             # React 入口
│   ├── api.js               # 后端 API 封装
│   ├── pages/
│   │   └── ParsePage.jsx    # 全流程主页面（扫描→选场景→解析→转换→修复）
│   └── styles/
│       └── global.css       # 暗色主题
├── main.js                  # Electron 主进程
├── preload.js               # Electron preload (目录选择 API)
├── vite.config.js           # Vite 配置
├── index.html               # HTML 入口
└── package.json
```

**后端代码** 位于 [soyooplatform](https://github.com/soyooAiTools/soyooplatform) 仓库：

```
soyooplatform/internal/
├── api/unity2cocos.go           # API handlers
├── converter/
│   ├── parser.go                # Unity 工程解析（场景/脚本/资源扫描）
│   ├── converter.go             # 核心转换调度
│   ├── scene_converter.go       # .scene YAML → .scene JSON
│   ├── script_converter.go      # C# → TypeScript 骨架转换
│   ├── material_converter.go    # 材质映射 (Standard/URP → builtin)
│   ├── meta_generator.go        # .meta 文件生成（含 subMeta/Mesh UUID）
│   └── ai_converter.go          # AI 智能脚本转换
└── store/                       # SQLite 持久化
```

---

## 🔌 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/unity2cocos/scan` | 快速扫描工程，返回场景列表 |
| POST | `/api/unity2cocos/parse` | 解析选定场景（传 `scenePath`） |
| POST | `/api/unity2cocos/convert` | 执行完整转换（含自动 Mesh 修复） |
| POST | `/api/unity2cocos/fix-mesh-refs` | 二次修复 Mesh UUID 引用 |
| POST | `/api/unity2cocos/ai-config` | 配置 AI 转换参数 |
| POST | `/api/unity2cocos/convert-scripts-ai` | AI 智能脚本转换 |

---

## 🔄 转换映射

### 场景节点

| Unity | Cocos Creator |
|-------|---------------|
| `GameObject` | `cc.Node` |
| `Transform` | Node position / rotation / scale |
| `Camera` | `cc.Camera` |
| `Light` | `cc.DirectionalLight` / `cc.PointLight` |
| `MeshRenderer` | `cc.MeshRenderer` |
| `MeshFilter` | Mesh 资源引用 |
| `Canvas` / `RectTransform` | `cc.UITransform` |

### 脚本生命周期

| Unity C# | Cocos TypeScript |
|----------|-----------------|
| `Start()` | `start()` |
| `Update()` | `update(dt: number)` |
| `OnDestroy()` | `onDestroy()` |
| `OnEnable()` | `onEnable()` |
| `OnDisable()` | `onDisable()` |
| `[SerializeField]` / `public` | `@property()` |
| `MonoBehaviour` | `Component` |

### 材质

| Unity | Cocos |
|-------|-------|
| `Standard` | `builtin-standard` |
| `URP/Lit` | `builtin-standard` |
| `Unlit` | `builtin-unlit` |

---

## 🔧 Mesh 引用修复原理

Unity 和 Cocos 使用不同的资源引用机制：

- **Unity**: FBX 内的 Mesh 通过 `fileID` 引用（如 `fileID: 4300000`）
- **Cocos**: 需要在 `.meta` 文件的 `subMetas` 中定义 UUID 映射

转换时自动：
1. 解析 Unity 场景中的 MeshFilter/MeshRenderer 引用
2. 在 FBX 对应的 `.meta` 中生成 `subMetas` 条目
3. 将场景中的 Mesh 引用替换为 Cocos UUID

如果 Cocos Creator 导入后重新生成了 `.meta`（UUID 变化），可通过 **Fix Mesh Refs** 功能读取新 UUID 并更新场景引用。

---

## ⚡ 快速开始

### 前提条件

- Node.js ≥ 18
- Go ≥ 1.21
- Cocos Creator 3.8（用于打开转换后的工程）

### 开发模式

```bash
# 1. 启动后端
cd soyooplatform
go run ./cmd/server/

# 2. 启动前端 + Electron
cd unity2cocos-app
npm install
npm run dev
```

### 打包发布

```bash
# 打包 Electron .exe
cd unity2cocos-app
npm run build          # → release/ 目录
```

---

## 📋 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-03-04 | 场景选择、AI 脚本转换、Mesh 引用自动修复、Electron 桌面版 |

---

## License

MIT
