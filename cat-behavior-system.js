/**
 * 🐱 猫咪动态行为系统
 * Cat Pet - Dynamic Behavior System
 * 
 * AI 驱动的猫咪自主行为，根据性格、习惯、环境生成独特行为
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');

// ============================================
// 🧠 AI 行为生成器
// ============================================

// 生成行为 Prompt
function generateBehaviorPrompt(cat, house, context) {
  const room = context.currentRoom || '客厅';
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  // 获取房间物品
  const roomData = house.rooms[room] || { items: [] };
  const availableItems = roomData.items.map(item => {
    const itemDb = ITEMS_DB[item];
    return itemDb ? itemDb.name : item;
  }).join(', ');
  
  // 获取其他猫咪
  const otherCats = context.otherCats || [];
  
  // 获取最近记忆
  const recentMemories = (cat.memories || [])
    .slice(-5)
    .map(m => `• ${m.description}`)
    .join('\n');
  
  return `你是一只名叫${cat.name}的猫咪，正在${room}里。

【你的状态】
- 精力：${cat.stats.energy}/100 ${cat.stats.energy < 30 ? '(很困)' : cat.stats.energy > 70 ? '(充沛)' : ''}
- 心情：${cat.stats.mood}/100 ${cat.stats.mood < 30 ? '(低落)' : cat.stats.mood > 70 ? '(开心)' : ''}
- 饱食：${cat.stats.hunger}/100 ${cat.stats.hunger < 30 ? '(饿)' : cat.stats.hunger > 80 ? '(饱)' : ''}
- 清洁：${cat.stats.cleanliness}/100

【你的性格】
${cat.personality} - ${getPersonalityDescription(cat.personality)}

【你的习惯】
- 最喜欢的玩具：${cat.favoriteToy || '还没特别喜欢的'}
- 睡觉时间：${cat.sleepTime || '不固定'}
- 喜好：${cat.likes || '各种互动'}
- 讨厌：${cat.dislikes || '洗澡'}

【当前环境】
- 时间：${time}
- 地点：${room}
- 可用的物品：${availableItems || '没什么特别的'}
- 主人在附近：${context.ownerNearby ? '是' : '否'}
- 其他猫咪：${otherCats.length > 0 ? otherCats.map(c => c.name).join(', ') : '没有'}

【最近的记忆】
${recentMemories || '没有什么特别的记忆'}

【任务】
请根据以上信息，决定接下来要做什么，并输出一段猫咪的内心独白或行为描述。

要求：
1. 行为要符合猫咪的天性和你的性格
2. 考虑当前状态和需求（如饥饿<30 优先找吃的）
3. 语言要符合猫咪的特点（喵~、蹭蹭、呼噜等）
4. 如果有紧急需求，优先表达
5. 输出 JSON 格式：
{
  "action": "行为名称",
  "target": "目标物品/猫/人",
  "intensity": "low/medium/high",
  "duration": "预计持续时间",
  "message": "内心独白或行为描述（第一人称，20-50 字）",
  "needOwner": true/false,
  "urgency": "low/medium/high"
}`;
}

// 性格描述
function getPersonalityDescription(personality) {
  const descriptions = {
    '活泼': '精力充沛，喜欢玩耍，总是闲不住',
    '温顺': '性格温和，容易相处，喜欢安静',
    '高冷': '独立高傲，不太粘人，但有自己的一套',
    '粘人': '喜欢粘着主人，需要关注和陪伴',
    '独立': '自主性强，可以自己玩得开心',
    '好奇': '对什么都感兴趣，喜欢探索',
    '胆小': '容易受惊，需要安全感',
    '霸道': '领地意识强，喜欢掌控'
  };
  return descriptions[personality] || '普通的猫咪';
}

// 调用 AI 生成行为
async function generateBehaviorWithAI(cat, house, context) {
  const prompt = generateBehaviorPrompt(cat, house, context);
  
  // TODO: 调用实际的大模型 API
  // 这里先返回模拟结果
  return simulateBehavior(cat, context);
}

// 模拟行为生成（临时）
function simulateBehavior(cat, context) {
  const behaviors = [];
  
  // 根据状态生成行为
  if (cat.stats.hunger < 30) {
    behaviors.push({
      action: 'eating',
      target: '食盆',
      intensity: cat.stats.hunger < 15 ? 'high' : 'medium',
      duration: '5-10 分钟',
      message: getPersonalityMessage(cat.personality, 'hungry'),
      needOwner: cat.stats.hunger < 15,
      urgency: cat.stats.hunger < 15 ? 'high' : 'medium'
    });
  }
  
  if (cat.stats.mood < 40 && cat.stats.energy > 50) {
    behaviors.push({
      action: 'playing',
      target: cat.favoriteToy || '玩具',
      intensity: 'high',
      duration: '10-15 分钟',
      message: getPersonalityMessage(cat.personality, 'bored'),
      needOwner: cat.personality === '粘人',
      urgency: 'medium'
    });
  }
  
  if (cat.stats.energy < 30) {
    behaviors.push({
      action: 'sleeping',
      target: '猫窝',
      intensity: 'low',
      duration: '2-4 小时',
      message: getPersonalityMessage(cat.personality, 'tired'),
      needOwner: false,
      urgency: 'low'
    });
  }
  
  if (context.ownerNearby && cat.stats.mood < 60) {
    behaviors.push({
      action: 'seeking_attention',
      target: '主人',
      intensity: 'medium',
      duration: '5 分钟',
      message: getPersonalityMessage(cat.personality, 'wants_attention'),
      needOwner: true,
      urgency: 'medium'
    });
  }
  
  // 如果没有紧急行为，生成一个日常行为
  if (behaviors.length === 0) {
    behaviors.push({
      action: 'exploring',
      target: '家里',
      intensity: 'low',
      duration: '15-30 分钟',
      message: getPersonalityMessage(cat.personality, 'normal'),
      needOwner: false,
      urgency: 'low'
    });
  }
  
  // 返回优先级最高的行为
  return behaviors.sort((a, b) => {
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  })[0];
}

// 根据性格生成消息
function getPersonalityMessage(personality, situation) {
  const messages = {
    '活泼': {
      hungry: '饿死啦！快给本喵好吃的！喵呜~',
      bored: '好无聊啊！快来陪我玩！不然我自己找乐子咯~',
      tired: '玩累了...先睡一会儿，等下继续！',
      wants_attention: '主人主人！看我！快看我！喵~',
      normal: '今天天气不错，到处逛逛吧~'
    },
    '温顺': {
      hungry: '有点饿了...主人方便的话可以加点饭吗？喵~',
      bored: '安静的待着也不错...不过有人陪更好~',
      tired: '困了呢，去睡个午觉吧',
      wants_attention: '主人~ 可以摸摸我吗？',
      normal: '家里很安静，很舒服呢'
    },
    '高冷': {
      hungry: '哼，食盆空了，铲屎的还不快来',
      bored: '无聊...这些玩具都配不上本喵',
      tired: '困了，别打扰我',
      wants_attention: '...（瞥了你一眼）...也不是不能让你摸一下',
      normal: '巡视一下领地，一切正常'
    },
    '粘人': {
      hungry: '主人主人！我饿啦！要饿死啦！喵呜~',
      bored: '主人呢？主人去哪了？快来陪我嘛~',
      tired: '要抱着主人睡觉...不然睡不着',
      wants_attention: '主人主人！摸摸我！抱抱我！',
      normal: '主人到哪里我就跟到哪里~'
    },
    '独立': {
      hungry: '饿了，自己去吃吧',
      bored: '自己找点乐子',
      tired: '困了，去睡觉',
      wants_attention: '...主人来了，打个招呼吧',
      normal: '自己的时间，很自在'
    },
    '好奇': {
      hungry: '嗯？这是什么味道？哦，是饭啊',
      bored: '这个盒子是什么？让我看看！',
      tired: '探索累了，休息一下',
      wants_attention: '主人主人！我发现了一个好东西！',
      normal: '家里每个角落都要检查一下！'
    },
    '胆小': {
      hungry: '那个...我饿了...可以加点饭吗...',
      bored: '有点害怕...想找个地方躲起来',
      tired: '想睡觉，但要找个安全的地方',
      wants_attention: '主人...可以陪陪我吗...',
      normal: '外面有声音...是我想多了吧？'
    },
    '霸道': {
      hungry: '铲屎的！饭呢！还不快给本喵准备！',
      bored: '无聊！快来伺候本喵！',
      tired: '困了，这个位置归我了！',
      wants_attention: '你！过来！摸我！现在！',
      normal: '这个家是本喵的！'
    }
  };
  
  return messages[personality]?.[situation] || '喵~';
}

// ============================================
// ⏰ 定时任务系统
// ============================================

// 检查猫咪需求
function checkCatNeeds(cat, house) {
  const needs = [];
  
  // 饥饿检查
  if (cat.stats.hunger < 20) {
    needs.push({
      type: 'hunger',
      urgency: 'high',
      message: `${cat.name}很饿了！食盆已经空了！`,
      action: 'addFood'
    });
  } else if (cat.stats.hunger < 40) {
    needs.push({
      type: 'hunger',
      urgency: 'medium',
      message: `${cat.name}有点饿了，想吃东西~`,
      action: 'addFood'
    });
  }
  
  // 口渴检查
  const kitchen = house.rooms.kitchen;
  if (kitchen && (kitchen.waterLevel || 0) < 20) {
    needs.push({
      type: 'thirst',
      urgency: 'high',
      message: `${cat.name}没有水喝了！水盆空了！`,
      action: 'addWater'
    });
  }
  
  // 心情检查
  if (cat.stats.mood < 30) {
    needs.push({
      type: 'attention',
      urgency: 'medium',
      message: `${cat.name}心情不太好，想要主人陪伴~`,
      action: 'play'
    });
  }
  
  // 健康检查
  if (cat.health && cat.health.status === 'sick') {
    needs.push({
      type: 'health',
      urgency: 'high',
      message: `${cat.name}生病了！需要治疗！`,
      action: 'treat'
    });
  }
  
  // 猫砂盆检查
  const bathroom = house.rooms.bathroom;
  if (bathroom && bathroom.items.includes('litter_box')) {
    // TODO: 实现猫砂盆清洁度检查
  }
  
  return needs.sort((a, b) => {
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  });
}

// 生成行为推送
function generateBehaviorPush(cat, behavior) {
  const templates = {
    eating: `🍽️ ${cat.name}正在${behavior.target}吃饭："${behavior.message}"`,
    drinking: `💧 ${cat.name}在喝水："${behavior.message}"`,
    sleeping: `💤 ${cat.name}在${behavior.target}睡觉："${behavior.message}"`,
    playing: `🎾 ${cat.name}在玩${behavior.target}："${behavior.message}"`,
    seeking_attention: `💕 ${cat.name}想要关注："${behavior.message}"`,
    exploring: `🔍 ${cat.name}在巡视领地："${behavior.message}"`,
    toileting: `🚽 ${cat.name}去上厕所了`,
    greeting: `👋 ${cat.name}在迎接："${behavior.message}"`
  };
  
  return templates[behavior.action] || `${cat.name}：${behavior.message}`;
}

// ============================================
// 📊 行为历史与记忆
// ============================================

// 记录行为
function recordBehavior(catId, behavior) {
  const cat = loadCatData(catId);
  if (!cat) return false;
  
  // 添加到行为历史
  if (!cat.behaviorHistory) cat.behaviorHistory = [];
  
  cat.behaviorHistory.push({
    timestamp: new Date().toISOString(),
    ...behavior
  });
  
  // 限制历史记录数量
  if (cat.behaviorHistory.length > 100) {
    cat.behaviorHistory = cat.behaviorHistory.slice(-100);
  }
  
  // 重要的行为添加到记忆
  if (behavior.urgency === 'high' || behavior.intensity === 'high') {
    addMemory(catId, {
      type: 'behavior',
      description: behavior.message,
      important: true
    });
  }
  
  saveCatData(catId, cat);
  return true;
}

// 获取行为历史
function getBehaviorHistory(catId, options = {}) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  let history = cat.behaviorHistory || [];
  
  // 筛选
  if (options.type) {
    history = history.filter(h => h.action === options.type);
  }
  if (options.date) {
    const date = new Date(options.date).toDateString();
    history = history.filter(h => new Date(h.timestamp).toDateString() === date);
  }
  
  // 排序（最新的在前）
  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 分页
  const limit = options.limit || 20;
  const offset = options.offset || 0;
  
  return {
    history: history.slice(offset, offset + limit),
    total: history.length
  };
}

// ============================================
// 📱 推送系统
// ============================================

// 推送消息给主人
function pushToOwner(userId, message, urgency) {
  // TODO: 实现实际推送
  // 可以通过 QQ Bot、Telegram 等渠道推送
  
  console.log(`📱 推送给${userId} [${urgency}]: ${message}`);
  
  return {
    success: true,
    message,
    urgency,
    timestamp: new Date().toISOString()
  };
}

// 批量推送
function batchPush(userId, behaviors) {
  if (behaviors.length === 0) return;
  
  const summary = behaviors
    .map(b => `• ${b.message}`)
    .join('\n');
  
  pushToOwner(userId, `📝 猫咪动态汇总（过去 1 小时）:\n${summary}`, 'normal');
}

// ============================================
// 工具函数
// ============================================

// 从 cat-core.js 导入（这里简化实现）
function loadCatData(catId) {
  const filePath = path.join(DATA_DIR, `cat_${catId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

function saveCatData(catId, data) {
  const filePath = path.join(DATA_DIR, `cat_${catId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function addMemory(catId, memory) {
  const cat = loadCatData(catId);
  if (!cat) return false;
  
  if (!cat.memories) cat.memories = [];
  memory.date = new Date().toISOString();
  cat.memories.push(memory);
  
  if (cat.memories.length > 100) {
    cat.memories = cat.memories.slice(-100);
  }
  
  saveCatData(catId, cat);
  return true;
}

// 物品数据库（简化版）
const ITEMS_DB = {
  'food_bowl': { name: '食盆' },
  'water_bowl': { name: '水盆' },
  'cat_bed': { name: '猫窝' },
  'toy_wand': { name: '逗猫棒' },
  'toy_yarn': { name: '毛线球' }
};

// ============================================
// 导出 API
// ============================================

module.exports = {
  // 行为生成
  generateBehaviorWithAI,
  generateBehaviorPrompt,
  simulateBehavior,
  
  // 需求检查
  checkCatNeeds,
  
  // 推送
  generateBehaviorPush,
  pushToOwner,
  batchPush,
  
  // 历史记录
  recordBehavior,
  getBehaviorHistory,
  
  // 工具
  loadCatData,
  saveCatData,
  addMemory
};
