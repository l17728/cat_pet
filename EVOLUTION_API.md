# 🧬 进化系统 API 参考

**版本**: 1.0.0  
**最后更新**: 2026-03-13

---

## 📋 目录

1. [核心类](#核心类)
2. [工具函数](#工具函数)
3. [使用示例](#使用示例)
4. [数据结构](#数据结构)

---

## 核心类

### EvolutionManager

进化管理器 - 统一管理所有进化系统

```javascript
const manager = new EvolutionManager(catId);
```

#### 方法

##### `registerSystem(name, system)`
注册新的进化系统

```javascript
manager.registerSystem('skills', new SkillSystem(catId));
```

##### `getSystem(name)`
获取指定的系统

```javascript
const actionSystem = manager.getSystem('actions');
```

##### `checkAllEvolutions(context)`
检查所有系统的进化可能

```javascript
const results = await manager.checkAllEvolutions({
  description: '猫咪刚吃完饭',
  actionType: 'feed'
});
```

##### `decideCreation(systemName, context)`
LLM 决定是否创建新内容

```javascript
const decision = await manager.decideCreation('actions', context);
```

##### `notifyOwner(evolution)`
生成通知主人的消息

```javascript
const message = manager.notifyOwner(evolutionResult);
```

---

### ActionSystem

动作系统 - 管理猫咪动作的进化

```javascript
const actionSystem = new ActionSystem(catId);
```

#### 方法

##### `getAvailableItems()`
获取当前可用动作

```javascript
const actions = actionSystem.getAvailableItems();
// 返回：{ instinct: [], personality: [], learned: [], custom: [] }
```

##### `selectItem(context)`
LLM 选择动作

```javascript
const action = await actionSystem.selectItem(context);
```

##### `needsNewItem(context)`
判断是否需要新动作

```javascript
const needs = await actionSystem.needsNewItem(context);
```

##### `createNewItem(context)`
创建新动作

```javascript
const newAction = await actionSystem.createNewItem(context);
```

##### `addItem(item)`
添加动作到猫咪

```javascript
actionSystem.addItem(newAction);
```

##### `checkEvolution(item)`
检查动作进化

```javascript
const evolution = await actionSystem.checkEvolution(action);
```

##### `evolve(item, evolution)`
执行动作进化

```javascript
actionSystem.evolve(action, evolution);
```

---

### ReactionSystem

反应系统 - 管理猫咪反应的进化

```javascript
const reactionSystem = new ReactionSystem(catId);
```

#### 方法

##### `getAvailableItems()`
获取当前可用反应

```javascript
const reactions = reactionSystem.getAvailableItems();
```

##### `getReactionForAction(actionType)`
获取特定动作的反应

```javascript
const reaction = reactionSystem.getReactionForAction('feed');
```

##### `selectItem(context)`
LLM 选择反应

```javascript
const reaction = await reactionSystem.selectItem(context);
```

##### `createNewItem(context)`
创建新反应

```javascript
const newReaction = await reactionSystem.createNewItem(context);
```

---

### ToySystem

玩具系统 - 管理玩具玩法的进化

```javascript
const toySystem = new ToySystem(catId);
```

#### 方法

##### `getAvailableItems()`
获取当前可用玩具和玩法

```javascript
const toys = toySystem.getAvailableItems();
```

##### `selectItem(context)`
LLM 选择玩具玩法

```javascript
const play = await toySystem.selectItem(context);
```

##### `recordPlay(toyId, playId)`
记录玩法使用

```javascript
toySystem.recordPlay(toyId, playId);
```

---

### FacilitySystem

设施系统 - 管理设施改造

```javascript
const facilitySystem = new FacilitySystem(catId);
```

#### 方法

##### `getAvailableItems()`
获取当前可用设施

```javascript
const facilities = facilitySystem.getAvailableItems();
```

##### `upgradeComfort(facilityId, amount)`
提升设施舒适度

```javascript
facilitySystem.upgradeComfort('cat_bed', 10);
```

---

## 工具函数

### loadCatData(catId)
加载猫咪数据

```javascript
const cat = loadCatData(catId);
```

### saveCatData(catId, data)
保存猫咪数据

```javascript
saveCatData(catId, cat);
```

### callLLM(prompt, options)
调用 LLM

```javascript
const result = await callLLM(prompt, { model: 'qwen3.5-plus' });
```

### parseLLMJson(content)
解析 LLM 的 JSON 输出

```javascript
const json = parseLLMJson(llmResult);
```

### generateId(prefix)
生成唯一 ID

```javascript
const id = generateId('action');
// 返回：action_1773395952011_xtms054qt
```

### rollRarity()
随机稀有度

```javascript
const rarity = rollRarity();
// 返回：'common'/'uncommon'/'rare'/'epic'/'legendary'
```

---

## 快捷函数

### checkAndProcessEvolution(catId, context)
检查并处理进化

```javascript
const evolution = require('./core/evolution-index');

const { results, messages } = await evolution.checkAndProcessEvolution(catId, context);
```

### selectAction(catId, context)
选择动作

```javascript
const action = await evolution.selectAction(catId, context);
```

### selectReaction(catId, context)
选择反应

```javascript
const reaction = await evolution.selectReaction(catId, context);
```

---

## 数据结构

### 猫咪数据扩展

```javascript
{
  "id": "cat_001",
  "name": "雪球",
  
  // 动作空间
  "actionSpace": {
    "learned": [],
    "custom": [
      {
        "id": "action_xxx",
        "name": "转圈圈讨食",
        "description": "转圈圈然后可怜地看着主人",
        "category": "社交",
        "rarity": "uncommon",
        "usageCount": 15,
        "story": "雪球发现这样更能让主人心软"
      }
    ]
  },
  
  // 反应空间
  "reactionSpace": {
    "custom": []
  },
  
  // 玩具系统
  "toys": {
    "owned": [],
    "plays": {},
    "customPlays": []
  },
  
  // 设施系统
  "facilities": {
    "owned": [],
    "modifications": []
  }
}
```

---

## 使用示例

### 完整流程

```javascript
const evolution = require('./core/evolution-index');

async function onInteraction(catId, actionType) {
  // 1. 执行互动
  const result = catPet.feed(userId, catId);
  
  // 2. 检查进化
  const { results, messages } = await evolution.checkAndProcessEvolution(catId, {
    description: `猫咪刚刚${actionType}`,
    actionType
  });
  
  // 3. 通知主人
  for (const message of messages) {
    sendQQMessage(message);
  }
  
  return { ...result, evolution: { results, messages } };
}
```

---

## 错误处理

```javascript
try {
  const result = await evolution.checkAndProcessEvolution(catId, context);
} catch (error) {
  console.error('进化检查失败:', error.message);
  // 返回空结果，不影响主流程
  return { results: [], messages: [] };
}
```

---

## 性能优化

### 1. 批量检查

```javascript
// 一次检查所有系统，而不是分别检查
const results = await manager.checkAllEvolutions(context);
```

### 2. 缓存 LLM 结果

```javascript
// LLM 调用已内置缓存（30 分钟）
// 相同上下文不会重复调用
```

### 3. 条件检查

```javascript
// 只在特定条件下检查进化
if (cat.stats.mood > 80 || cat.stats.mood < 30) {
  await evolution.checkAndProcessEvolution(catId, context);
}
```

---

**完整的 API 参考文档** 📖
