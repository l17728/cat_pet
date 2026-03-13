# 🏗️ 猫咪养成系统架构重新设计

**核心原则**: Skill 不直接连接 LLM，通过 OpenClaw agent 机制间接使用

---

## 🎯 问题

当前实现中，skill 代码直接调用 LLM：
```javascript
// ❌ 不好的设计
const { sessions_spawn } = require('openclaw');
async function generateReaction(cat, action) {
  const result = await sessions_spawn({ task: prompt, ... });
  return result;
}
```

**问题**:
- 耦合了 LLM 调用逻辑
- 降低了代码通用性
- 增加了复杂性

---

## ✅ 更好的设计

### 架构思路

```
用户消息 → OpenClaw Agent → LLM → Skill 工具 → 返回结果
                ↑
           (LLM 决定调用哪个工具)
```

**Skill 职责**:
- 提供工具函数（纯业务逻辑）
- 管理数据持久化
- 返回结构化结果

**Agent 职责**:
- 理解用户意图
- 决定调用哪个工具
- 格式化输出

---

## 🔧 实现方案

### 方案 1: 工具函数模式 (推荐)

Skill 提供纯函数工具，由 Agent 的 LLM 决定何时调用：

```javascript
// ✅ 好的设计 - 纯工具函数
module.exports = {
  // 数据操作
  createCat(userId, options) { ... },
  feed(userId, catId) { ... },
  play(userId, catId) { ... },
  
  // 查询
  getStatus(userId, catId) { ... },
  getHealthReport(userId, catId) { ... },
  
  // 不需要 LLM，只是数据处理
};
```

**Agent 提示词** (由 OpenClaw 处理):
```
你是一个猫咪养成助手。你有以下工具：
- createCat: 创建猫咪
- feed: 喂食
- play: 玩耍
- getStatus: 查看状态

根据用户消息选择合适的工具。
```

**用户**: "给我的猫喂食"  
**Agent LLM**: 决定调用 `feed()` 工具  
**Skill**: 执行喂食逻辑，返回结果  
**Agent LLM**: 格式化结果为用户友好的消息

---

### 方案 2: 事件驱动模式

Skill 发布事件，Agent 订阅并响应：

```javascript
// Skill 发布事件
events.emit('cat:needs_attention', {
  catId,
  type: 'hungry',
  urgency: 'high'
});

// Agent 订阅并生成响应
events.on('cat:needs_attention', (event) => {
  // LLM 生成自然语言响应
  const message = llm.generate(`猫咪${event.catId}饿了，告诉主人`);
  sendMessage(message);
});
```

---

### 方案 3: 模板 + 数据模式

Skill 提供数据，Agent 用 LLM 格式化：

```javascript
// Skill 返回结构化数据
function feed(userId, catId) {
  return {
    success: true,
    cat: { name: '雪球', personality: '活泼' },
    action: 'feed',
    stats: { hunger: 90, mood: 85 },
    // 不提供文本，由 Agent 生成
  };
}

// Agent 用 LLM 生成响应
// "雪球开心地吃完了饭！现在饱食度 90，心情 85~"
```

---

## 📝 当前系统的调整

### 需要修改的部分

**当前** (直接 LLM 调用):
```javascript
// utils/llm-bridge.js
async function callLLM(prompt) {
  return await sessions_spawn({ task: prompt, ... });
}
```

**改为** (纯业务逻辑):
```javascript
// utils/cat-actions.js
function getReactionTemplate(cat, action) {
  // 返回模板和数据，不调用 LLM
  return {
    template: '{name}{reaction}',
    data: {
      name: cat.name,
      reaction: getFallbackReaction(cat, action)
    }
  };
}
```

### 保留的部分

以下部分可以保留（纯业务逻辑）：
- ✅ 数据持久化 (`cat-core.js`)
- ✅ 状态计算 (`cat-health-wellness.js`)
- ✅ 规则系统回退 (`FALLBACK_REACTIONS`)
- ✅ 缓存机制

### 移除的部分

以下部分需要移除或重构：
- ❌ `llm-bridge.js` (直接 LLM 调用)
- ❌ `llm-*-*.js` 中的 LLM 调用逻辑
- ❌ `sessions_spawn` 依赖

---

## 🎯 最佳实践

### 1. 工具函数设计

```javascript
/**
 * 喂食工具函数
 * @param {string} userId - 用户 ID
 * @param {string} catId - 猫咪 ID
 * @returns {object} 结构化结果
 */
function feed(userId, catId) {
  const cat = loadCatData(catId);
  
  // 业务逻辑
  cat.stats.hunger = Math.min(100, cat.stats.hunger + 30);
  saveCatData(catId, cat);
  
  // 返回数据（不是文本）
  return {
    success: true,
    cat: { name: cat.name, personality: cat.personality },
    stats: cat.stats,
    reaction: getReaction(cat, 'feed')  // 规则系统生成
  };
}
```

### 2. Agent 提示词示例

```markdown
# 猫咪养成助手

你是猫咪养成游戏的助手。你有以下能力：

## 可用工具
- `createCat(options)`: 创建猫咪
- `feed(catId)`: 喂食
- `play(catId)`: 玩耍
- `getStatus(catId)`: 查看状态

## 响应风格
- 使用可爱、活泼的语气
- 加入猫咪的拟声词（喵~、呼噜等）
- 根据猫咪性格调整语气

## 示例
用户："给我的猫喂食"
你：调用 feed(catId)，然后回复：
"雪球开心地吃完了饭！喵呜~ 现在饱食度 90，心情 85~"
```

### 3. 数据流

```
用户输入 → Agent LLM → 选择工具 → Skill 函数 → 返回数据 → Agent LLM → 用户响应
                        (纯逻辑)          (结构化)      (格式化)
```

---

## 🚀 实施步骤

### 阶段 1: 分离业务逻辑

1. 创建纯工具函数模块
2. 移除 LLM 调用代码
3. 保留规则系统回退

### 阶段 2: 定义 Agent 提示词

1. 编写工具说明文档
2. 定义响应风格
3. 提供示例

### 阶段 3: 测试验证

1. 测试工具函数
2. 测试 Agent 调用
3. 测试端到端流程

---

## 📊 对比

| 方面 | 直接 LLM 调用 | Agent 机制 |
|------|--------------|------------|
| 耦合度 | 高 | 低 |
| 通用性 | 低 | 高 |
| 维护成本 | 高 | 低 |
| LLM 切换 | 困难 | 容易 |
| 测试难度 | 高 | 低 |
| 推荐度 | ❌ | ✅ |

---

## ✅ 结论

**使用 Agent 机制的优势**:

1. **解耦**: Skill 不依赖 LLM 配置
2. **通用**: 可以在任何 OpenClaw 实例运行
3. **灵活**: LLM 配置由 Agent 管理
4. **简单**: Skill 只关注业务逻辑
5. **可测试**: 工具函数容易单元测试

**当前系统的调整**:
- 保留业务逻辑和数据管理
- 移除直接 LLM 调用
- 使用规则系统作为主要响应生成
- 让 Agent 的 LLM 负责格式化自然语言

这样设计后，猫咪养成系统就是一个**纯业务逻辑的 skill**，LLM 能力由 OpenClaw Agent 提供！
