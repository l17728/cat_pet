/**
 * 🐱 猫咪养成系统 - 纯工具函数
 * Cat Pet Tools - Pure Business Logic
 * 
 * 不包含任何 LLM 调用，只提供业务逻辑工具
 * 由 OpenClaw Agent 的 LLM 决定何时调用这些工具
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(
  process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace',
  'cat-pet',
  'data'
);

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ============================================
// 📦 数据操作工具
// ============================================

/**
 * 加载猫咪数据
 */
function loadCatData(catId) {
  const filePath = path.join(DATA_DIR, `cat_${catId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

/**
 * 保存猫咪数据
 */
function saveCatData(catId, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `cat_${catId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 加载用户数据
 */
function loadUserData(userId) {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

/**
 * 保存用户数据
 */
function saveUserData(userId, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================
// 🎮 核心互动工具
// ============================================

/**
 * 创建猫咪
 */
function createCat(userId, options = {}) {
  ensureDataDir();
  
  const catId = `cat_${userId}_${Date.now()}`;
  const cat = {
    id: catId,
    userId,
    name: options.name || '咪咪',
    personality: options.personality || getRandomPersonality(),
    breed: options.breed || '中华田园猫',
    color: options.color || '随机',
    gender: options.gender || 'female',
    ageStage: 'kitten',
    stats: {
      energy: 80,
      mood: 80,
      hunger: 70,
      cleanliness: 70
    },
    wellness: {
      hydration: 70,
      social: 50,
      exercise: 50,
      mental: 50
    },
    createdAt: Date.now(),
    interactions: 0,
    achievements: []
  };
  
  saveCatData(catId, cat);
  
  // 更新用户数据
  const userData = loadUserData(userId) || { userId, cats: [] };
  userData.cats.push(catId);
  saveUserData(userId, userData);
  
  return {
    success: true,
    cat: {
      id: cat.id,
      name: cat.name,
      personality: cat.personality,
      breed: cat.breed,
      stats: cat.stats
    },
    message: `创建了猫咪"${cat.name}"`
  };
}

/**
 * 喂食
 */
function feed(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  // 检查冷却
  const cooldown = cat.cooldowns?.feed || 0;
  if (Date.now() < cooldown) {
    const waitMinutes = Math.ceil((cooldown - Date.now()) / 60000);
    return { 
      error: '还在消化中',
      waitMinutes
    };
  }
  
  // 应用效果
  cat.stats.hunger = Math.min(100, cat.stats.hunger + 30);
  cat.stats.cleanliness = Math.max(0, cat.stats.cleanliness - 5);
  cat.interactions = (cat.interactions || 0) + 1;
  cat.feedCount = (cat.feedCount || 0) + 1;
  
  // 设置冷却 (2 小时)
  if (!cat.cooldowns) cat.cooldowns = {};
  cat.cooldowns.feed = Date.now() + 2 * 60 * 60 * 1000;
  
  saveCatData(catId, cat);
  
  return {
    success: true,
    cat: { name: cat.name, personality: cat.personality },
    stats: cat.stats,
    reaction: getReaction(cat, 'feed'),
    cooldown: 120
  };
}

/**
 * 玩耍
 */
function play(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const cooldown = cat.cooldowns?.play || 0;
  if (Date.now() < cooldown) {
    const waitMinutes = Math.ceil((cooldown - Date.now()) / 60000);
    return { error: '刚玩过，需要休息', waitMinutes };
  }
  
  cat.stats.mood = Math.min(100, cat.stats.mood + 20);
  cat.stats.energy = Math.max(0, cat.stats.energy - 15);
  cat.interactions = (cat.interactions || 0) + 1;
  cat.playCount = (cat.playCount || 0) + 1;
  cat.cooldowns.play = Date.now() + 1 * 60 * 60 * 1000;
  
  saveCatData(catId, cat);
  
  return {
    success: true,
    cat: { name: cat.name, personality: cat.personality },
    stats: cat.stats,
    reaction: getReaction(cat, 'play'),
    cooldown: 60
  };
}

/**
 * 查看状态
 */
function getStatus(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const avg = (
    cat.stats.energy +
    cat.stats.mood +
    cat.stats.hunger +
    cat.stats.cleanliness
  ) / 4;
  
  let status = '完美 ✨';
  if (avg < 80) status = '开心 😊';
  if (avg < 60) status = '一般 😐';
  if (avg < 40) status = '需要关心 😟';
  if (avg < 20) status = '危险 😷';
  
  return {
    success: true,
    cat: {
      name: cat.name,
      personality: cat.personality,
      breed: cat.breed,
      ageStage: cat.ageStage
    },
    stats: cat.stats,
    wellness: cat.wellness,
    status,
    interactions: cat.interactions
  };
}

// ============================================
// 🎭 规则系统反应生成
// ============================================

const PERSONALITY_REACTIONS = {
  '活泼': {
    feed: ['上蹿下跳地吃！', '兴奋地转圈圈吃饭！', '喵呜喵呜边叫边吃！'],
    play: ['疯了一样追逗猫棒！', '跳到空中抓玩具！', '玩到停不下来！'],
    pet: ['蹭蹭蹭个不停！', '翻肚皮求继续！', '呼噜声像小马达！']
  },
  '温顺': {
    feed: ['乖乖地吃饭', '优雅地舔食', '安静地享受美食'],
    play: ['温和地玩玩具', '轻轻地抓逗猫棒', '很配合你的互动'],
    pet: ['满足地呼噜', '眯着眼睛享受', '轻轻蹭你的手']
  },
  '高冷': {
    feed: ['瞥了你一眼才开始吃', '勉强赏脸吃了一点', '哼，还算满意'],
    play: ['勉强陪你玩一下', '用爪子拨弄玩具', '看似不在意但其实很享受'],
    pet: ['尾巴轻轻摆动', '假装躲开但没真走', '...还行吧']
  },
  '粘人': {
    feed: ['边吃边看你', '吃完就蹭你求抱抱', '喵呜~主人别走'],
    play: ['一直跟着玩具跑', '玩完就赖在你身上', '喵呜~再来一次嘛'],
    pet: ['一直蹭你的手', '求摸摸不要停', '喵呜~最喜欢主人了']
  }
};

/**
 * 获取性格反应（规则系统）
 */
function getReaction(cat, action) {
  const reactions = PERSONALITY_REACTIONS[cat.personality];
  if (!reactions || !reactions[action]) {
    return '喵~';
  }
  const options = reactions[action];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * 随机性格
 */
function getRandomPersonality() {
  const personalities = ['活泼', '温顺', '高冷', '粘人', '独立', '好奇', '胆小', '霸道'];
  return personalities[Math.floor(Math.random() * personalities.length)];
}

// ============================================
// 📤 导出 API (工具函数)
// ============================================

module.exports = {
  // 数据操作
  loadCatData,
  saveCatData,
  loadUserData,
  saveUserData,
  
  // 核心工具
  createCat,
  feed,
  play,
  getStatus,
  
  // 辅助函数
  getReaction,
  getRandomPersonality,
  
  // 常量
  PERSONALITY_REACTIONS
};
