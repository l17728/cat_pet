# 🧬 猫咪进化系统使用指南

**版本**: 1.0.0  
**更新日期**: 2026-03-13

---

## 📖 简介

猫咪进化系统允许你的猫咪在遊戲过程中**动态学习新动作、发明新玩法、创造独特反应**，让每只猫都独一无二。

---

## 🎯 核心特性

### 1. 动态动作系统
- 🎭 基础本能动作 (所有猫咪共有)
- 🎨 性格动作 (根据性格解锁)
- ✨ 习得动作 (通过游戏学习)
- 🌟 自创动作 (猫咪自己发明)

### 2. 动态反应系统
- 💬 基础性格反应
- 💝 独特反应 (根据情境创造)

### 3. 动态玩具系统
- 🎾 基础玩具库
- 🎮 基础玩法
- ✨ 自创玩法 (猫咪发明新玩法)
- 🌟 玩法进化 (熟练后进化)

---

## 🚀 快速开始

### 方式 1: 自动集成

进化系统已集成到 `cat-core.js`，每次互动后自动检查进化。

```javascript
const catPet = require('./cat-core');

// 喂食互动
const result = catPet.feed(userId, catId);

// 如果有进化，result.evolution 会包含信息
if (result.evolution?.triggered) {
  console.log('猫咪学会了新东西！');
  console.log(result.evolution.messages);
}
```

### 方式 2: 手动调用

```javascript
const evolution = require('./core/evolution-index');

// 创建管理器
const manager = new evolution.EvolutionManager(catId);

// 检查进化
const results = await manager.checkAllEvolutions({
  description: '猫咪刚吃完饭，很开心'
});

// 通知主人
for (const result of results) {
  const message = manager.notifyOwner(result);
  sendQQMessage(message);
}
```

---

## 📋 系统架构

### 核心模块

```
core/
├── evolvable.js          # 基础接口和工具
├── action-system.js      # 动作系统
├── reaction-system.js    # 反应系统
├── toy-system.js         # 玩具系统
├── evolution-manager.js  # 进化管理器
└── evolution-index.js    # 统一入口
```

### 数据流

```
互动事件
    ↓
进化检查 (checkAllEvolutions)
    ↓
┌─────────────────────────┐
│ 动作系统 │ 反应系统 │ 玩具系统 │
└─────────────────────────┘
    ↓
LLM 决策 (选择/创造/进化)
    ↓
添加到猫咪数据
    ↓
通知主人
```

---

## 🎮 使用示例

### 示例 1: 互动后自动检查

```javascript
const catPet = require('./cat-core');

async function playWithCat(userId, catId) {
  // 玩耍互动
  const result = await catPet.play(userId, catId);
  
  if (result.success) {
    console.log(`猫咪玩了很开心：${result.reaction}`);
    
    // 检查是否有进化
    if (result.evolution?.triggered) {
      console.log('🎉 猫咪学会了新动作！');
      for (const msg of result.evolution.messages) {
        console.log(msg);
      }
    }
  }
}
```

### 示例 2: 手动选择动作

```javascript
const evolution = require('./core/evolution-index');

async function catDecideAction(catId) {
  // LLM 选择动作
  const action = await evolution.selectAction(catId, {
    description: '猫咪很无聊，想找点事做'
  });
  
  console.log(`猫咪决定：${action.selectedAction}`);
  console.log(`理由：${action.reason}`);
  
  return action;
}
```

### 示例 3: 手动选择反应

```javascript
async function catReact(catId, actionType) {
  const reaction = await evolution.selectReaction(catId, {
    actionType: 'feed',
    description: '主人喂食了'
  });
  
  console.log(`猫咪反应：${reaction.selectedReaction}`);
  console.log(`情绪：${reaction.emotion}`);
  
  return reaction;
}
```

---

## 📊 数据结构

### 猫咪数据扩展

```javascript
{
  "id": "cat_001",
  "name": "雪球",
  "personality": "活泼",
  
  // 动作空间
  "actionSpace": {
    "learned": [],      // 习得动作
    "custom": [         // 自创动作
      {
        "id": "action_1773395952011_xtms054qt",
        "name": "转圈圈讨食",
        "description": "转圈圈然后可怜地看着主人",
        "category": "社交",
        "rarity": "uncommon",
        "createdAt": 1773395952011,
        "usageCount": 15,
        "story": "雪球发现这样更能让主人心软"
      }
    ]
  },
  
  // 反应空间
  "reactionSpace": {
    "custom": [         // 自创反应
      {
        "id": "reaction_1773395952012_abc123",
        "trigger": "feed",
        "reaction": "兴奋地原地蹦跳",
        "emotion": "兴奋",
        "rarity": "rare",
        "story": "今天特别开心"
      }
    ]
  },
  
  // 玩具系统
  "toys": {
    "owned": [],        // 拥有的玩具
    "plays": {},        // 玩具玩法
    "customPlays": []   // 自创玩法
  }
}
```

---

## 🌟 稀有度系统

| 稀有度 | 概率 | 倍率 | Emoji |
|--------|------|------|-------|
| common | 60% | 1.0x | ⚪ |
| uncommon | 25% | 1.2x | 🟢 |
| rare | 10% | 1.5x | 🔵 |
| epic | 4% | 2.0x | 🟣 |
| legendary | 1% | 3.0x | 🟡 |

---

## 🔄 进化条件

### 动作进化
- 使用次数 ≥ 50 次
- LLM 决定进化方向

### 玩法进化
- 使用次数 ≥ 30 次
- LLM 决定进化方向

### 新内容创造
- 心情极端 (>85 或 <30)
- 信任度大幅变化
- 现有内容无法满足需求

---

## ⚙️ API 参考

### EvolutionManager

```javascript
const manager = new EvolutionManager(catId);

// 检查所有系统进化
await manager.checkAllEvolutions(context);

// 获取系统
const actionSystem = manager.getSystem('actions');

// 通知主人
const message = manager.notifyOwner(result);
```

### 快捷函数

```javascript
const evolution = require('./core/evolution-index');

// 检查并处理进化
const { results, messages } = await evolution.checkAndProcessEvolution(catId, context);

// 选择动作
const action = await evolution.selectAction(catId, context);

// 选择反应
const reaction = await evolution.selectReaction(catId, context);
```

---

## 🎯 最佳实践

### 1. 每次互动后检查

```javascript
// 在 cat-core.js 的互动函数中
const evolution = checkEvolutionAfterInteraction(catId, actionType);
return { ..., evolution };
```

### 2. 通知主人

```javascript
if (result.evolution?.triggered) {
  for (const msg of result.evolution.messages) {
    sendQQMessage(msg);
  }
}
```

### 3. 记录历史

```javascript
// 在猫咪数据中记录进化历史
if (!cat.evolutionHistory) cat.evolutionHistory = [];
cat.evolutionHistory.push({
  type: 'action',
  from: 'basic_beg',
  to: 'custom_001',
  timestamp: Date.now()
});
```

---

## 📝 扩展示例

### 添加新系统

```javascript
// 1. 创建系统类
class FacilitySystem extends IEvolvable {
  getAvailableItems() { ... }
  selectItem(context) { ... }
  createNewItem(context) { ... }
  // ...
}

// 2. 注册到管理器
this.registerSystem('facilities', new FacilitySystem(catId));
```

---

## 🐛 故障排除

### 问题：进化不触发

**检查**:
1. 猫咪数据是否有 actionSpace/toys 字段
2. 互动后是否调用 checkEvolutionAfterInteraction
3. LLM 调用是否正常

### 问题：新动作不保存

**检查**:
1. saveCatData 是否成功
2. 动作 ID 是否唯一
3. 是否已存在相同动作

---

## 📞 支持

- 核心文档：`EVOLUTION_GUIDE.md`
- 测试脚本：`test-evolution.js`
- 示例代码：查看各系统实现

---

**让每只猫都独一无二！** 🐱✨
