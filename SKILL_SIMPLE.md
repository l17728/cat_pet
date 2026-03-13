# 🐱 猫咪养成系统 (Cat Pet)

**类型**: 纯工具函数 Skill  
**版本**: 3.0.0  
**架构**: Agent 工具模式

---

## 🎯 功能

在 OpenClaw 中创建并养育属于你的虚拟宠物猫！

**核心功能**:
- 🎲 创建猫咪 (随机品种/性格)
- 🎮 互动 (喂食/玩耍/洗澡/睡觉/摸摸)
- 📊 状态管理 (精力/心情/饱食/清洁)
- 🏆 成就系统
- 💾 数据持久化

---

## 🛠️ 工具函数

本 skill 提供以下工具函数供 Agent 调用：

### 猫咪管理

```javascript
createCat(userId, options)
// options: { name, personality, breed, gender }
// 返回：{ success, cat, message }

getUserCats(userId)
// 返回：{ cats, levelInfo, userData }

deleteCat(userId, catId)
// 返回：{ success, message }
```

### 互动

```javascript
feed(userId, catId)
// 返回：{ success, action, cat, reaction, stats, cooldown }

play(userId, catId)
// 返回：{ success, action, cat, reaction, stats, cooldown }

bathe(userId, catId)
// 返回：{ success, action, cat, reaction, stats, cooldown }

sleep(userId, catId)
// 返回：{ success, action, cat, reaction, stats, cooldown }

pet(userId, catId)
// 返回：{ success, action, cat, reaction, stats, cooldown }
```

### 查询

```javascript
getStatus(userId, catId)
// 返回：{ success, cat, stats, status, interactions }

getAchievements(userId, catId)
// 返回：{ success, achievements, unlocked, total }
```

---

## 📖 使用示例

### Agent 提示词示例

```markdown
你是一个猫咪养成助手。你有以下工具：

- createCat(options): 创建猫咪
- feed(userId, catId): 喂食
- play(userId, catId): 玩耍
- getStatus(userId, catId): 查看状态

根据用户消息选择合适的工具，并将返回的结构化数据格式化为自然语言。

响应风格：
- 使用可爱、活泼的语气
- 加入猫咪拟声词（喵~、呼噜等）
- 根据猫咪性格调整语气
- 使用 emoji
```

### 调用流程

```
用户："给我的猫喂食"
  ↓
Agent LLM: 理解意图，选择 feed 工具
  ↓
Skill: 执行 feed(userId, catId)
  ↓
返回数据：{ success: true, cat: {...}, reaction: "兴奋地转圈圈！" }
  ↓
Agent LLM: 格式化为"🍖 雪球兴奋地转圈圈吃饭！喵呜~"
  ↓
用户响应
```

---

## 🎭 性格系统

8 种性格，每种有独特的反应：

| 性格 | 反应示例 |
|------|----------|
| 活泼 | "上蹿下跳地吃！" |
| 温顺 | "乖乖地吃饭" |
| 高冷 | "瞥了你一眼才开始吃" |
| 粘人 | "边吃边看你" |
| 独立 | "自己安静地吃" |
| 好奇 | "先闻闻再吃" |
| 胆小 | "小心翼翼地靠近" |
| 霸道 | "命令你继续喂" |

---

## 📊 状态系统

| 状态 | 范围 | 说明 |
|------|------|------|
| ⚡ 精力 | 0-100 | 影响互动意愿 |
| 💖 心情 | 0-100 | 影响成长速度 |
| 🍖 饱食 | 0-100 | 归零会生病 |
| 🛁 清洁 | 0-100 | 太低会生病 |

---

## ⏱️ 冷却时间

| 互动 | 冷却时间 |
|------|----------|
| 喂食 | 2 小时 |
| 玩耍 | 1 小时 |
| 洗澡 | 4 小时 |
| 睡觉 | 6 小时 |
| 摸摸 | 30 分钟 |

---

## 🔧 技术说明

### 架构

```
用户 → Agent LLM → Skill 工具 → 数据 → Agent LLM → 响应
```

**特点**:
- ✅ Skill 只提供纯业务逻辑工具
- ✅ 不包含任何 LLM 调用
- ✅ 由 Agent 的 LLM 负责理解和格式化
- ✅ 完全符合 OpenClaw 标准架构

### 数据持久化

```
~/.openclaw/workspace/cat-pet/data/
├── {userId}.json        # 用户数据
├── cat_{catId}.json     # 猫咪数据
└── ...
```

---

## 🚀 安装

```bash
# 本地安装
cp -r /path/to/cat-pet ~/.openclaw/workspace/skills/

# 或通过 clawhub
clawhub install cat-pet
```

---

## 📝 快速开始

1. **创建猫咪**
   ```
   用户："创建一只猫咪"
   Agent: 调用 createCat(userId, {})
   ```

2. **查看状态**
   ```
   用户："看看我的猫"
   Agent: 调用 getStatus(userId, catId)
   ```

3. **互动**
   ```
   用户："喂食"
   Agent: 调用 feed(userId, catId)
   ```

---

## 🎯 最佳实践

### Agent 配置

```javascript
// 在 agent 配置中注册工具
{
  tools: {
    createCat: require('./skills/cat-pet').createCat,
    feed: require('./skills/cat-pet').feed,
    play: require('./skills/cat-pet').play,
    getStatus: require('./skills/cat-pet').getStatus
  }
}
```

### 响应格式化

```javascript
// Agent LLM 将结构化数据格式化为自然语言
function formatResponse(result) {
  if (result.action === 'feed') {
    return `🍖 ${result.cat.name}${result.reaction}\n` +
           `⚡ 精力：${result.stats.energy}\n` +
           `💖 心情：${result.stats.mood}`;
  }
}
```

---

## 📞 支持

- 文档：`AGENT_INSTRUCTIONS.md`
- 架构：`ARCHITECTURE_REDESIGN.md`
- 工具：`utils/cat-tools.js`

---

**开始你的养猫之旅吧！** 🐾
