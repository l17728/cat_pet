/**
 * 👥 扩展社交系统 - 跨用户互动
 * Extended Social System - Cross-User Interaction
 * 
 * 功能:
 * - 拜访其他用户的猫窝
 * - 猫咪之间的社交互动
 * - 社交关系网络
 * - 拜访记录与回忆
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');
const CATS_DIR = path.join(DATA_DIR, '..', 'cats');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CATS_DIR)) {
    fs.mkdirSync(CATS_DIR, { recursive: true });
  }
}

// ============================================
// 🏠 猫窝系统
// ============================================

// 获取用户猫窝数据
function getCatHouse(userId) {
  const filePath = path.join(CATS_DIR, `${userId}_house.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  // 默认猫窝
  return {
    ownerId: userId,
    name: '温馨小家',
    description: '一个温暖舒适的小窝',
    level: 1,
    rooms: {
      'living': {
        name: '客厅',
        items: ['猫窝', '食盆', '水碗'],
        unlocked: true
      }
    },
    decorations: [],
    visitors: [],
    visitCount: 0,
    createdAt: Date.now()
  };
}

// 保存猫窝数据
function saveCatHouse(userId, house) {
  const filePath = path.join(CATS_DIR, `${userId}_house.json`);
  fs.writeFileSync(filePath, JSON.stringify(house, null, 2), 'utf-8');
}

// 装饰猫窝
function decorateHouse(userId, decoration) {
  const house = getCatHouse(userId);
  
  if (!house.decorations) {
    house.decorations = [];
  }
  
  house.decorations.push({
    name: decoration.name,
    type: decoration.type,
    placedAt: Date.now()
  });
  
  saveCatHouse(userId, house);
  
  return {
    success: true,
    message: `✨ 添加了装饰"${decoration.name}"！`,
    decorationCount: house.decorations.length
  };
}

// ============================================
// 🚪 拜访系统
// ============================================

// 获取所有可用猫窝 (用于拜访)
function listAvailableHouses(currentUserId) {
  ensureDataDir();
  
  const files = fs.readdirSync(CATS_DIR);
  const houses = [];
  
  for (const file of files) {
    if (file.endsWith('_house.json') && !file.startsWith(currentUserId)) {
      const filePath = path.join(CATS_DIR, file);
      try {
        const house = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        houses.push({
          userId: house.ownerId,
          name: house.name,
          level: house.level,
          visitCount: house.visitCount,
          decorationCount: house.decorations?.length || 0
        });
      } catch (e) {
        // 跳过无效文件
      }
    }
  }
  
  return houses;
}

// 拜访其他用户的猫窝
function visitHouse(visitorUserId, hostUserId) {
  ensureDataDir();
  
  const visitorHouse = getCatHouse(visitorUserId);
  const hostHouse = getCatHouse(hostUserId);
  
  if (!hostHouse || hostHouse.ownerId === hostUserId) {
    // 获取主人的猫咪
    const hostCats = getCatsByUser(hostUserId);
    
    if (hostCats.length === 0) {
      return {
        success: false,
        error: '该用户还没有猫咪',
        message: '主人还没有养猫咪，下次再来吧~'
      };
    }
    
    // 记录拜访
    hostHouse.visitors.push({
      visitorId: visitorUserId,
      visitTime: Date.now(),
      duration: 0 // 拜访时长，离开时更新
    });
    hostHouse.visitCount += 1;
    
    // 保存拜访记录
    saveCatHouse(hostUserId, hostHouse);
    
    // 增加社交值
    const visitorCat = getActiveCat(visitorUserId);
    if (visitorCat) {
      applySocialBonus(visitorCat.id, 'visit');
    }
    
    return {
      success: true,
      house: {
        name: hostHouse.name,
        level: hostHouse.level,
        decorationCount: hostHouse.decorations?.length || 0
      },
      cats: hostCats.map(cat => ({
        id: cat.id,
        name: cat.name,
        personality: cat.personality,
        mood: cat.stats?.mood || 50
      })),
      message: `🚪 你来到了${hostHouse.name}！这里有${hostCats.length}只猫咪在等着你~`
    };
  }
  
  return {
    success: false,
    error: '无法拜访'
  };
}

// 离开猫窝
function leaveHouse(visitorUserId, hostUserId) {
  const hostHouse = getCatHouse(hostUserId);
  
  // 找到拜访记录并更新时长
  const visit = hostHouse.visitors.find(
    v => v.visitorId === visitorUserId && v.duration === 0
  );
  
  if (visit) {
    visit.duration = Date.now() - visit.visitTime;
    saveCatHouse(hostUserId, hostHouse);
    
    return {
      success: true,
      duration: visit.duration,
      message: '👋 下次再来玩哦！'
    };
  }
  
  return {
    success: false,
    error: '没有找到拜访记录'
  };
}

// ============================================
// 🐱 猫咪社交互动
// ============================================

// 猫咪之间的互动类型
const CAT_INTERACTIONS = {
  friendly: {
    name: '友好互动',
    icon: '💕',
    effects: { mood: 15, social: 20 },
    messages: [
      '互相闻了闻，成为了朋友！',
      '一起玩耍了好开心！',
      '互相舔毛，关系更好了！',
      '分享了最喜欢的玩具！'
    ]
  },
  playful: {
    name: '玩耍互动',
    icon: '🎾',
    effects: { mood: 20, exercise: 15, social: 10 },
    messages: [
      '追逐打闹玩得不亦乐乎！',
      '一起玩逗猫棒太开心了！',
      '比赛谁跳得更高！',
      '发现了新玩具一起探索！'
    ]
  },
  cautious: {
    name: '谨慎接触',
    icon: '👀',
    effects: { mood: 5, social: 5 },
    messages: [
      '远远地观察对方...',
      '小心翼翼地靠近闻了闻',
      '保持距离但表示友好',
      '需要更多时间熟悉'
    ]
  },
  dominant: {
    name: '领地宣示',
    icon: '😼',
    effects: { mood: -5, social: -5 },
    messages: [
      '哈气表示不满',
      '争夺领地发生了小冲突',
      '互相瞪眼谁也不服谁',
      '需要主人调解'
    ]
  }
};

// 决定互动类型
function determineInteractionType(cat1, cat2) {
  const personality1 = cat1.personality || '温顺';
  const personality2 = cat2.personality || '温顺';
  const mood1 = cat1.stats?.mood || 50;
  const mood2 = cat2.stats?.mood || 50;
  
  // 高冷 + 高冷 = 谨慎
  if (personality1 === '高冷' && personality2 === '高冷') {
    return 'cautious';
  }
  
  // 霸道 + 霸道 = 冲突
  if (personality1 === '霸道' && personality2 === '霸道') {
    return 'dominant';
  }
  
  // 心情好更可能友好
  if (mood1 > 70 && mood2 > 70) {
    return Math.random() > 0.5 ? 'friendly' : 'playful';
  }
  
  // 活泼性格更爱玩
  if (personality1 === '活泼' || personality2 === '活泼') {
    return 'playful';
  }
  
  // 默认友好
  return 'friendly';
}

// 执行猫咪社交
function catSocialize(cat1Id, cat2Id) {
  const cat1 = loadCatData(cat1Id);
  const cat2 = loadCatData(cat2Id);
  
  if (!cat1 || !cat2) {
    return { error: '猫咪不存在' };
  }
  
  const interactionType = determineInteractionType(cat1, cat2);
  const interaction = CAT_INTERACTIONS[interactionType];
  
  const message = interaction.messages[Math.floor(Math.random() * interaction.messages.length)];
  
  // 应用效果
  applyStatBonus(cat1Id, interaction.effects);
  applyStatBonus(cat2Id, interaction.effects);
  
  // 记录互动
  recordSocialInteraction(cat1Id, cat2Id, interactionType);
  
  // 更新关系
  updateRelationship(cat1Id, cat2Id, interactionType);
  
  return {
    success: true,
    interaction: {
      type: interactionType,
      name: interaction.name,
      icon: interaction.icon
    },
    message: message,
    effects: interaction.effects
  };
}

// 应用属性加成
function applyStatBonus(catId, effects) {
  const cat = loadCatData(catId);
  if (!cat) return;
  
  if (effects.mood !== undefined) {
    cat.stats.mood = Math.max(0, Math.min(100, cat.stats.mood + effects.mood));
  }
  if (effects.social !== undefined) {
    if (!cat.wellness) cat.wellness = {};
    cat.wellness.social = Math.max(0, Math.min(100, (cat.wellness.social || 50) + effects.social));
  }
  if (effects.exercise !== undefined) {
    if (!cat.wellness) cat.wellness = {};
    cat.wellness.exercise = Math.max(0, Math.min(100, (cat.wellness.exercise || 50) + effects.exercise));
  }
  
  saveCatData(catId, cat);
}

// 记录社交互动
function recordSocialInteraction(cat1Id, cat2Id, type) {
  const cat1 = loadCatData(cat1Id);
  if (!cat1) return;
  
  if (!cat1.socialLog) {
    cat1.socialLog = [];
  }
  
  cat1.socialLog.push({
    with: cat2Id,
    type: type,
    timestamp: Date.now()
  });
  
  // 保留最近 20 条
  if (cat1.socialLog.length > 20) {
    cat1.socialLog.shift();
  }
  
  saveCatData(cat1Id, cat1);
}

// 更新关系
function updateRelationship(cat1Id, cat2Id, type) {
  // 简化版：只记录好友
  const cat1 = loadCatData(cat1Id);
  if (!cat1) return;
  
  if (!cat1.relationships) {
    cat1.relationships = {};
  }
  
  if (!cat1.relationships[cat2Id]) {
    cat1.relationships[cat2Id] = {
      meetings: 0,
      friendship: 50,
      lastInteraction: Date.now()
    };
  }
  
  const rel = cat1.relationships[cat2Id];
  rel.meetings += 1;
  rel.lastInteraction = Date.now();
  
  // 根据互动类型调整好感度
  const friendshipChange = {
    friendly: 10,
    playful: 8,
    cautious: 2,
    dominant: -5
  };
  
  rel.friendship = Math.max(0, Math.min(100, rel.friendship + (friendshipChange[type] || 0)));
  
  saveCatData(cat1Id, cat1);
}

// ============================================
// 📊 社交应用加成
// ============================================

function applySocialBonus(catId, activityType) {
  const bonuses = {
    visit: { social: 15, mood: 10 },
    host: { social: 10, mood: 5 },
    play: { social: 20, mood: 15 },
    share: { social: 10, mood: 10 }
  };
  
  const bonus = bonuses[activityType];
  if (!bonus) return;
  
  const cat = loadCatData(catId);
  if (!cat) return;
  
  if (!cat.wellness) cat.wellness = {};
  cat.wellness.social = Math.max(0, Math.min(100, (cat.wellness.social || 50) + bonus.social));
  cat.stats.mood = Math.max(0, Math.min(100, cat.stats.mood + bonus.mood));
  
  saveCatData(catId, cat);
}

// ============================================
// 💾 数据操作
// ============================================

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

function getCatsByUser(userId) {
  ensureDataDir();
  
  const files = fs.readdirSync(DATA_DIR);
  const cats = [];
  
  for (const file of files) {
    if (file.startsWith('cat_') && file.endsWith('.json')) {
      const filePath = path.join(DATA_DIR, file);
      try {
        const cat = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (cat.ownerId === userId) {
          cats.push(cat);
        }
      } catch (e) {
        // 跳过无效文件
      }
    }
  }
  
  return cats;
}

function getActiveCat(userId) {
  const cats = getCatsByUser(userId);
  return cats.length > 0 ? cats[0] : null;
}

// ============================================
// 📤 导出 API
// ============================================

module.exports = {
  // 猫窝系统
  getCatHouse,
  saveCatHouse,
  decorateHouse,
  
  // 拜访系统
  listAvailableHouses,
  visitHouse,
  leaveHouse,
  
  // 社交互动
  catSocialize,
  determineInteractionType,
  applySocialBonus,
  
  // 关系系统
  updateRelationship,
  recordSocialInteraction,
  
  // 数据操作
  loadCatData,
  saveCatData,
  getCatsByUser,
  getActiveCat,
  
  // 互动类型
  CAT_INTERACTIONS
};
