# 🐱 猫咪自主行为系统指南

**版本**: 1.0.0  
**更新日期**: 2026-03-13

---

## 📖 简介

猫咪自主行为系统让猫咪在**没有主人指令时也能自由活动**：

- 🏠 自由探索猫窝和设施
- 🎾 自己玩玩具
- 🌀 探索魔幻空间
- 📢 主动向主人请求（食物/水/玩耍）
- 🔔 关键事件同步给主人

---

## 🎯 核心特性

### 1. 自主行为决策

猫咪根据当前状态自主决定：
- 精力充沛 → 玩耍/探索
- 饿了 → 找吃的或向主人请求
- 渴了 → 找水或向主人请求
- 心情差 → 寻求关注
- 困了 → 睡觉

### 2. 猫窝探索

猫咪可以自由探索：
- 猫窝（休息）
- 食盆（自己找吃的）
- 水碗（自己找水喝）
- 猫抓板（磨爪）
- 猫爬架（攀爬）

### 3. 魔幻空间探索

猫咪可以：
- 进入已解锁的魔幻空间
- 自由探索空间内容
- 发现惊喜和秘密
- **同步探索经历给主人**

### 4. 主动向主人请求

当猫咪有需求时：
- 饿了 → "喵呜~ 饿了，给点吃的！"
- 渴了 → "喵... 口渴了..."
- 无聊 → "主人陪我玩嘛！"
- 求关注 → "想要主人摸摸~"

---

## 🚀 使用方式

### 方式 1: 定时检查（推荐）

```javascript
const evolution = require('./core/evolution-index');

// 每 30 分钟检查一次猫咪自主行为
async function checkAutoAction() {
  const action = await evolution.decideAutoAction(catId);
  
  if (action) {
    console.log(`猫咪自主行为：${action.description}`);
    
    // 如果需要通知主人
    if (action.notifyOwner) {
      sendQQMessage(action.notificationMessage);
    }
  }
}

// 设置定时器
setInterval(checkAutoAction, 30 * 60 * 1000); // 30 分钟
```

### 方式 2: 事件触发

```javascript
// 猫咪进入魔幻空间探索
async function onPortalEnter(catId, portalId) {
  const exploration = await evolution.explorePortal(catId, portalId);
  
  if (exploration) {
    // 发送探索报告给主人
    sendQQMessage({
      title: `🌀 ${exploration.title}`,
      content: exploration.content,
      discoveries: exploration.discoveries
    });
  }
}
```

### 方式 3: 与互动系统集成

```javascript
const catPet = require('./cat-core');

// 主人长时间未互动时
if (timeSinceLastInteraction > 60 * 60 * 1000) { // 1 小时
  const action = await evolution.decideAutoAction(catId);
  
  if (action.notifyOwner) {
    sendQQMessage(action.notificationMessage);
  }
}
```

---

## 📊 自主行为类型

| 行为类型 | 说明 | 触发条件 |
|----------|------|----------|
| `explore_house` | 探索猫窝 | 心情 > 60 |
| `explore_portal` | 探索魔幻空间 | 有可用空间 |
| `play_toy` | 玩玩具 | 有玩具，精力 > 50 |
| `request` | 向主人请求 | 需求未满足 |
| `rest` | 休息 | 精力 < 50 |
| `groom` | 自我清洁 | 清洁 < 60 |
| `sleep` | 睡觉 | 精力 < 30 |
| `eat` | 自己找吃的 | 饱食 < 40 |
| `drink` | 自己找水喝 | 水分 < 40 |

---

## 🔔 通知主人机制

### 何时通知

| 情况 | 通知 | 示例 |
|------|------|------|
| 探索魔幻空间 | ✅ 总是通知 | "雪球在星空花园发现了流星！" |
| 向主人请求 | ✅ 总是通知 | "喵呜~ 饿了！" |
| 发现稀有物品 | ✅ 总是通知 | "雪球发现了传说级玩具！" |
| 普通玩耍 | ❌ 不通知 | - |
| 休息/睡觉 | ❌ 不通知 | - |

### 通知格式

```json
{
  "type": "auto_action",
  "title": "🐱 雪球的自主行为",
  "content": "雪球正在魔幻空间里追逐发光的蝴蝶...",
  "discoveries": ["发现了一只发光蝴蝶", "找到了隐藏的水晶"],
  "timestamp": 1773399000000,
  "urgency": "low"
}
```

---

## 🎮 完整示例

### 示例 1: 定时自主行为检查

```javascript
const evolution = require('./core/evolution-index');

class CatAutoActionScheduler {
  constructor(catId) {
    this.catId = catId;
    this.checkInterval = 30 * 60 * 1000; // 30 分钟
    this.start();
  }
  
  async start() {
    console.log('启动猫咪自主行为调度器...');
    setInterval(() => this.check(), this.checkInterval);
  }
  
  async check() {
    try {
      const action = await evolution.decideAutoAction(this.catId);
      
      if (action) {
        console.log(`[${new Date().toLocaleString()}] ${action.description}`);
        
        // 通知主人
        if (action.notifyOwner && action.notificationMessage) {
          await this.notifyOwner(action);
        }
      }
    } catch (error) {
      console.error('自主行为检查失败:', error.message);
    }
  }
  
  async notifyOwner(action) {
    // 通过 QQ Bot 发送
    sendQQMessage({
      type: 'auto_action',
      title: '🐱 猫咪自主行为',
      content: action.notificationMessage
    });
  }
}

// 使用
const scheduler = new CatAutoActionScheduler(catId);
```

### 示例 2: 魔幻空间探索

```javascript
const evolution = require('./core/evolution-index');

async function onCatEnterPortal(catId, portalId) {
  console.log('猫咪进入魔幻空间，开始探索...');
  
  const exploration = await evolution.explorePortal(catId, portalId);
  
  if (exploration) {
    // 发送详细探索报告
    sendQQMessage({
      type: 'portal_exploration',
      title: `🌀 ${exploration.title}`,
      content: exploration.content,
      discoveries: exploration.discoveries,
      events: exploration.events
    });
    
    console.log('探索报告已发送给主人');
  }
}
```

### 示例 3: 主动请求处理

```javascript
const evolution = require('./core/evolution-index');

async function handleCatRequest(catId, requestType) {
  const cat = loadCatData(catId);
  const request = evolution.generateRequest(cat, requestType);
  
  if (request) {
    sendQQMessage({
      type: 'cat_request',
      message: request.message,
      urgency: request.urgency
    });
  }
}

// 使用
handleCatRequest(catId, 'food');  // 请求食物
handleCatRequest(catId, 'play');  // 请求玩耍
```

---

## 📝 数据结构

### 猫咪数据扩展

```javascript
{
  "id": "cat_001",
  "name": "雪球",
  
  // 自主行为历史
  "autoActionHistory": [
    {
      "action": "explore_portal",
      "target": "portal_001",
      "description": "在星空花园里追逐流星",
      "notifyOwner": true,
      "notificationMessage": "雪球在星空花园看到了流星！",
      "duration": 30,
      "effects": { "mood": 15, "energy": -10 },
      "timestamp": 1773399000000
    }
  ],
  
  // 魔幻空间探索历史
  "portalExplorations": [
    {
      "portalId": "portal_001",
      "portalName": "星空花园",
      "discoveries": ["流星", "发光花朵"],
      "events": ["追逐流星", "在花丛中打滚"],
      "timestamp": 1773399000000
    }
  ],
  
  // 位置
  "location": "客厅",
  
  // 主人是否在附近
  "ownerNearby": false
}
```

---

## ⚙️ 配置选项

### 创建管理器时的选项

```javascript
const manager = new EvolutionManager(catId, {
  enableAutoAction: true,    // 启用自主行为系统
  autoCheckInterval: 1800000, // 自动检查间隔（毫秒）
  notifyOnRequest: true,      // 请求时通知主人
  notifyOnExploration: true   // 探索时通知主人
});
```

---

## 🎯 最佳实践

### 1. 合理设置检查间隔

```javascript
// 推荐：30 分钟
const checkInterval = 30 * 60 * 1000;

// 不要太频繁（避免打扰主人）
// 也不要太稀疏（猫咪会无聊）
```

### 2. 过滤通知

```javascript
// 只通知重要事件
if (action.notifyOwner && action.urgency !== 'low') {
  sendQQMessage(action.notificationMessage);
}
```

### 3. 记录行为历史

```javascript
// 保留最近 20 条行为记录
if (cat.autoActionHistory.length > 20) {
  cat.autoActionHistory.shift();
}
```

---

## 🐛 故障排除

### 问题：猫咪不自主行动

**检查**:
1. 是否启用了自主行为系统
2. 猫咪状态是否正常
3. LLM 调用是否成功

### 问题：通知太多

**解决**:
```javascript
// 设置通知冷却
if (Date.now() - lastNotificationTime < 60 * 60 * 1000) {
  return; // 1 小时内不重复通知
}
```

---

## 📞 支持

- 核心文档：[AUTO_ACTION_GUIDE.md](AUTO_ACTION_GUIDE.md)
- API 参考：[EVOLUTION_API.md](EVOLUTION_API.md)
- 进化指南：[EVOLUTION_GUIDE.md](EVOLUTION_GUIDE.md)

---

**让猫咪真正活起来！** 🐱✨
