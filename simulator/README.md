# 🐱 猫咪模拟器

将 **cat-pet** 技能的状态实时同步到 **Star-Office** 可视化界面。

**完整功能：**
- ✅ 状态可视化（实时同步到 Star-Office）
- ✅ 手动互动（喂食/玩耍/洗澡/睡觉/摸摸）
- ✅ 状态衰减（每小时自动下降）
- ✅ 自主行为（规则模式或 LLM 模式）
- ⚙️ LLM 支持（OpenAI / Ollama / 自定义 API）

## 快速开始

### 方式一：一键启动

**Windows:**
```bash
start.bat
```

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

**1. 启动 Star-Office 后端:**

```bash
cd Star-Office-UI-master
pip install flask pillow
cp state.sample.json state.json
cd backend && python app.py
```

**2. 启动模拟器:**

```bash
cd simulator
node index.js
```

模拟器会自动:
1. 创建一只默认猫咪 (如果没有)
2. 每 3 秒同步一次状态到 Star-Office
3. 每小时执行状态衰减
4. 每 30 分钟执行自主行为决策

## 命令说明

```bash
# 启动自动同步 (默认)
node index.js

# 查看猫咪详细状态
node index.js status

# 互动命令
node index.js feed     # 喂食
node index.js play     # 玩耍
node index.js bathe    # 洗澡
node index.js sleep    # 睡觉
node index.js pet      # 摸摸

# 访客模式 (作为独立 Agent 加入办公室)
node index.js --guest

# 启用 LLM (需要配置环境变量)
LLM_PROVIDER=ollama node index.js
```

## 后台任务

模拟器包含两个后台任务：

### 状态衰减 (每小时)

```
饱食度: -3/小时
精力: -2/小时
清洁度: -2/小时
水分: -5/小时
社交: -3/小时
```

### 自主行为 (每 30 分钟)

猫咪会根据状态自动决策：
- 饿了 → 请求食物
- 累了 → 睡觉
- 脏了 → 自我清洁
- 无聊 → 玩玩具 / 探索

## LLM 支持

启用 LLM 后，猫咪可以获得智能决策能力。

### 方式一：配置文件（推荐）

编辑 `simulator/llm-config.json`：

```json
{
  "provider": "anthropic",
  "apiKey": "your-api-key",
  "baseUrl": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages",
  "model": "glm-5",
  "generation": {
    "temperature": 0.8,
    "maxTokens": 500
  },
  "systemPrompt": "你是一只可爱的虚拟猫咪..."
}
```

### 方式二：环境变量

**OpenAI:**
```bash
export LLM_PROVIDER=openai
export LLM_API_KEY=sk-xxx
export LLM_MODEL=gpt-3.5-turbo
```

**Ollama (本地):**
```bash
export LLM_PROVIDER=ollama
export OLLAMA_URL=http://localhost:11434
export OLLAMA_MODEL=llama2
```

**阿里云 DashScope (Anthropic 兼容):**
```bash
export LLM_PROVIDER=anthropic
export ANTHROPIC_AUTH_TOKEN=sk-xxx
export ANTHROPIC_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages
export ANTHROPIC_MODEL=glm-5
```

### 验证配置

```bash
cd simulator
node -e "const LLMAdapter = require('./llm-adapter'); new LLMAdapter().printStatus()"
```

## 状态映射

猫咪状态会自动映射到 Star-Office 的办公室区域:

| 猫咪状态 | Star-Office 区域 | 触发条件 |
|---------|-----------------|---------|
| 饿了 | 🐛 Bug 区 | 饱食度 < 30 |
| 脏了 | 🐛 Bug 区 | 清洁度 < 30 |
| 累了 | 🛋 休息区 | 精力 < 20 |
| 开心 | 💻 工作区 (同步中) | 心情 > 80 且 精力 > 50 |
| 饱足 | 💻 工作区 (执行中) | 饱食 > 80 且 精力 > 40 |
| 健康 | 💻 工作区 (写作中) | 平均状态 ≥ 60 |
| 其他 | 🛋 休息区 | 默认 |

## 环境变量

```bash
# 基础配置
OFFICE_URL=http://127.0.0.1:19000  # Star-Office 地址
USER_ID=my_user                     # 用户 ID
SYNC_INTERVAL=3000                  # 同步间隔 (毫秒)
DECAY_INTERVAL=3600000              # 状态衰减间隔 (毫秒)
AUTO_ACTION_INTERVAL=1800000        # 自主行为间隔 (毫秒)

# 访客模式
JOIN_KEY=ocj_cat_simulator
AGENT_NAME=我的猫咪

# LLM 配置
LLM_PROVIDER=openai                 # openai/ollama/custom/openclaw
LLM_API_KEY=sk-xxx
LLM_API_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo

# Ollama 专用
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## 与 OpenClaw 的关系

| 功能 | OpenClaw Agent | 独立模拟器 |
|------|---------------|-----------|
| 用户输入理解 | LLM 理解自然语言 | CLI 命令 |
| 响应格式化 | LLM 生成 | 预设模板 |
| 状态衰减 | Cron 定时任务 | 内置调度器 |
| 自主行为 | LLM 决策 | 规则 + 可选 LLM |
| 进化系统 | LLM 创造 | 需要 LLM |

**模拟器可以完全独立运行，不需要 OpenClaw 平台。**

## 项目结构

```
simulator/
├── index.js              # CLI 入口
├── bridge.js             # 桥接服务核心
├── background-scheduler.js # 后台任务调度
├── llm-adapter.js        # LLM 适配器
├── state-mapper.js       # 状态映射逻辑
├── office-client.js      # Star-Office API 客户端
├── config.js             # 配置
├── test.js               # 单元测试
├── package.json
└── README.md
```

## 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                    模拟器架构                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │              BackgroundScheduler                 │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│   │  │ 状态衰减  │  │ 自主行为  │  │ 状态同步  │       │  │
│   │  │ (1小时)  │  │ (30分钟) │  │ (3秒)    │       │  │
│   │  └──────────┘  └────┬─────┘  └────┬─────┘       │  │
│   └─────────────────────┼────────────┼──────────────┘  │
│                         │            │                  │
│                    ┌────┴────┐       │                  │
│                    │LLMAdapter│◄──────┘ (可选)          │
│                    └────┬────┘                          │
│                         │                               │
│   ┌─────────────────────┼───────────────────────────┐  │
│   │                 bridge.js                        │  │
│   │    require           │          HTTP             │  │
│   │        ↓             │            ↓              │  │
│   │  ┌──────────┐       │      ┌──────────┐        │  │
│   │  │ cat-pet  │       │      │Star-Office│        │  │
│   │  │(Node.js) │       │      │ (Python) │        │  │
│   │  └──────────┘       │      └──────────┘        │  │
│   └─────────────────────┼───────────────────────────┘  │
│                         │                               │
│                    浏览器访问                            │
│               http://127.0.0.1:19000                   │
└─────────────────────────────────────────────────────────┘
```

## 自定义状态映射

编辑 `state-mapper.js` 中的 `MAPPING_RULES` 数组:

```javascript
const MAPPING_RULES = [
  {
    name: 'hungry',
    condition: (cat) => cat.stats.hunger < 30,
    state: 'error',
    detail: (cat) => `${cat.name} 饿了喵！`
  },
  // 添加你自己的规则...
];
```

规则从上到下匹配，第一个满足条件的规则生效。