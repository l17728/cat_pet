/**
 * 🛒 扩展玩具商店系统
 * Expanded Toy Store System
 * 
 * 功能:
 * - 更多玩具种类
 * - 玩具品质系统
 * - 玩具互动效果
 * - 收藏与成就
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');

// ============================================
// 🎾 玩具数据库
// ============================================

const TOY_DATABASE = {
  // ========== 基础玩具 ==========
  'ball_basic': {
    id: 'ball_basic',
    name: '基础小球',
    icon: '⚽',
    category: 'ball',
    price: 50,
    quality: 'basic',
    effects: {
      mood: 8,
      exercise: 10,
      mental: 5
    },
    description: '经典的小球，猫咪永远玩不腻',
    durability: 100,
    unlockLevel: 1
  },
  'feather_basic': {
    id: 'feather_basic',
    name: '羽毛逗猫棒',
    icon: '🪶',
    category: 'wand',
    price: 80,
    quality: 'basic',
    effects: {
      mood: 12,
      exercise: 15,
      mental: 8,
      social: 10
    },
    description: '主人手持的逗猫棒，互动必备',
    durability: 80,
    unlockLevel: 1
  },
  'mouse_basic': {
    id: 'mouse_basic',
    name: '毛绒老鼠',
    icon: '🐭',
    category: 'plush',
    price: 60,
    quality: 'basic',
    effects: {
      mood: 10,
      exercise: 8,
      mental: 10
    },
    description: '仿真老鼠，激发捕猎本能',
    durability: 70,
    unlockLevel: 1
  },
  
  // ========== 高级玩具 ==========
  'ball_led': {
    id: 'ball_led',
    name: 'LED 发光球',
    icon: '💡',
    category: 'ball',
    price: 150,
    quality: 'premium',
    effects: {
      mood: 18,
      exercise: 20,
      mental: 15
    },
    description: '会发光的球球，夜晚也能玩耍',
    durability: 90,
    unlockLevel: 5,
    special: '发光效果'
  },
  'feather_premium': {
    id: 'feather_premium',
    name: '豪华羽毛棒',
    icon: '🎋',
    category: 'wand',
    price: 200,
    quality: 'premium',
    effects: {
      mood: 22,
      exercise: 25,
      mental: 15,
      social: 15
    },
    description: '精选天然羽毛，猫咪的最爱',
    durability: 85,
    unlockLevel: 8,
    special: '天然羽毛'
  },
  'tunnel': {
    id: 'tunnel',
    name: '猫咪隧道',
    icon: '🕳️',
    category: 'structure',
    price: 300,
    quality: 'premium',
    effects: {
      mood: 20,
      exercise: 30,
      mental: 20
    },
    description: '可以钻来钻去的隧道，探索乐趣',
    durability: 95,
    unlockLevel: 10,
    special: '可折叠'
  },
  'laser': {
    id: 'laser',
    name: '激光笔',
    icon: '🔴',
    category: 'electronic',
    price: 180,
    quality: 'premium',
    effects: {
      mood: 25,
      exercise: 35,
      mental: 20
    },
    description: '红点追逐，永远抓不到但永远好玩',
    durability: 100,
    unlockLevel: 7,
    special: '自动模式'
  },
  
  // ========== 豪华玩具 ==========
  'cat_tree': {
    id: 'cat_tree',
    name: '豪华猫爬架',
    icon: '🌳',
    category: 'furniture',
    price: 800,
    quality: 'luxury',
    effects: {
      mood: 30,
      exercise: 40,
      mental: 25,
      social: 10
    },
    description: '多层猫爬架，睡觉玩耍一体化',
    durability: 100,
    unlockLevel: 15,
    special: '多功能'
  },
  'fountain': {
    id: 'fountain',
    name: '智能饮水机',
    icon: '⛲',
    category: 'electronic',
    price: 500,
    quality: 'luxury',
    effects: {
      hydration: 50,
      mood: 15,
      mental: 10
    },
    description: '循环过滤，让猫咪爱上喝水',
    durability: 100,
    unlockLevel: 12,
    special: '自动循环',
    passive: true
  },
  'puzzle_feeder': {
    id: 'puzzle_feeder',
    name: '益智喂食器',
    icon: '🧩',
    category: 'puzzle',
    price: 350,
    quality: 'luxury',
    effects: {
      mood: 20,
      mental: 35,
      hunger: 10
    },
    description: '边玩边吃，锻炼猫咪智商',
    durability: 90,
    unlockLevel: 10,
    special: '智力训练'
  },
  'heated_bed': {
    id: 'heated_bed',
    name: '恒温睡垫',
    icon: '🛏️',
    category: 'furniture',
    price: 400,
    quality: 'luxury',
    effects: {
      energy: 50,
      mood: 20,
      health: 10
    },
    description: '恒温加热，冬天睡觉更舒服',
    durability: 100,
    unlockLevel: 12,
    special: '恒温',
    passive: true
  },
  
  // ========== 季节性玩具 ==========
  'christmas_tree': {
    id: 'christmas_tree',
    name: '迷你圣诞树',
    icon: '🎄',
    category: 'seasonal',
    price: 250,
    quality: 'premium',
    effects: {
      mood: 25,
      mental: 15
    },
    description: '节日限定，可以装饰的小树',
    durability: 80,
    unlockLevel: 5,
    special: '节日限定',
    season: 'winter'
  },
  'lantern': {
    id: 'lantern',
    name: '小灯笼玩具',
    icon: '🏮',
    category: 'seasonal',
    price: 200,
    quality: 'premium',
    effects: {
      mood: 22,
      mental: 18
    },
    description: '春节限定，红红火火',
    durability: 75,
    unlockLevel: 5,
    special: '节日限定',
    season: 'spring'
  },
  
  // ========== 特殊玩具 ==========
  'catnip_mouse': {
    id: 'catnip_mouse',
    name: '猫薄荷老鼠',
    icon: '🌿',
    category: 'special',
    price: 120,
    quality: 'premium',
    effects: {
      mood: 35,
      exercise: 20,
      mental: 15
    },
    description: '含有猫薄荷，让猫咪兴奋不已',
    durability: 50,
    unlockLevel: 8,
    special: '猫薄荷',
    cooldown: 24 // 小时
  },
  'bubble_machine': {
    id: 'bubble_machine',
    name: '泡泡机',
    icon: '🫧',
    category: 'electronic',
    price: 280,
    quality: 'premium',
    effects: {
      mood: 30,
      exercise: 25,
      mental: 20
    },
    description: '自动吹出猫咪安全的泡泡',
    durability: 85,
    unlockLevel: 10,
    special: '自动泡泡'
  },
  'tv_for_cats': {
    id: 'tv_for_cats',
    name: '猫咪电视',
    icon: '📺',
    category: 'electronic',
    price: 600,
    quality: 'luxury',
    effects: {
      mood: 20,
      mental: 30
    },
    description: '播放鸟类和鱼类视频，猫咪看得入迷',
    durability: 100,
    unlockLevel: 15,
    special: '视频内容',
    passive: true
  }
};

// ============================================
// 🏪 商店系统
// ============================================

// 获取用户商店数据
function getUserStore(userId) {
  const filePath = path.join(DATA_DIR, `${userId}_store.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  return {
    ownerId: userId,
    coins: 500, // 初始猫币
    inventory: [],
    purchasedToys: [],
    totalSpent: 0,
    level: 1,
    unlockedToys: Object.keys(TOY_DATABASE).filter(k => TOY_DATABASE[k].unlockLevel <= 1)
  };
}

// 保存商店数据
function saveUserStore(userId, store) {
  const filePath = path.join(DATA_DIR, `${userId}_store.json`);
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
}

// 浏览商店
function browseStore(userId) {
  const store = getUserStore(userId);
  const userLevel = store.level;
  
  const categories = {
    ball: { name: '球类', icon: '⚽' },
    wand: { name: '逗猫棒', icon: '🪶' },
    plush: { name: '毛绒玩具', icon: '🧸' },
    structure: { name: '游乐设施', icon: '🏰' },
    electronic: { name: '电子玩具', icon: '🔌' },
    furniture: { name: '家具', icon: '🪑' },
    puzzle: { name: '益智玩具', icon: '🧩' },
    seasonal: { name: '季节限定', icon: '🎁' },
    special: { name: '特殊道具', icon: '✨' }
  };
  
  const availableToys = [];
  
  for (const [key, toy] of Object.entries(TOY_DATABASE)) {
    if (toy.unlockLevel <= userLevel) {
      const owned = store.inventory.filter(i => i.toyId === key).length;
      availableToys.push({
        ...toy,
        owned: owned,
        canBuy: store.coins >= toy.price
      });
    }
  }
  
  // 按分类整理
  const byCategory = {};
  for (const toy of availableToys) {
    if (!byCategory[toy.category]) {
      byCategory[toy.category] = {
        ...categories[toy.category],
        toys: []
      };
    }
    byCategory[toy.category].toys.push(toy);
  }
  
  return {
    coins: store.coins,
    level: store.level,
    categories: byCategory,
    totalToys: availableToys.length
  };
}

// 购买玩具
function buyToy(userId, toyId) {
  const store = getUserStore(userId);
  const toy = TOY_DATABASE[toyId];
  
  if (!toy) {
    return { error: '玩具不存在' };
  }
  
  if (toy.unlockLevel > store.level) {
    return { error: '等级不足', required: toy.unlockLevel };
  }
  
  if (store.coins < toy.price) {
    return { 
      error: '猫币不足',
      have: store.coins,
      need: toy.price
    };
  }
  
  // 扣款
  store.coins -= toy.price;
  store.totalSpent += toy.price;
  
  // 添加库存
  store.inventory.push({
    toyId: toyId,
    name: toy.name,
    icon: toy.icon,
    quality: toy.quality,
    durability: toy.durability,
    purchasedAt: Date.now(),
    timesUsed: 0
  });
  
  store.purchasedToys.push(toyId);
  
  saveUserStore(userId, store);
  
  return {
    success: true,
    toy: {
      name: toy.name,
      icon: toy.icon,
      quality: toy.quality
    },
    remaining: store.coins,
    message: `🎉 购买了${toy.icon} ${toy.name}！`
  };
}

// 使用玩具
function useToy(userId, toyId, catId) {
  const store = getUserStore(userId);
  const toyInstance = store.inventory.find(
    t => t.toyId === toyId && t.durability > 0
  );
  
  if (!toyInstance) {
    return { error: '没有可用的玩具' };
  }
  
  const toy = TOY_DATABASE[toyId];
  if (!toy) {
    return { error: '玩具数据不存在' };
  }
  
  // 检查冷却
  if (toy.cooldown) {
    const lastUsed = toyInstance.lastUsed || 0;
    const hoursSinceUse = (Date.now() - lastUsed) / (1000 * 60 * 60);
    if (hoursSinceUse < toy.cooldown) {
      return {
        error: '冷却中',
        remaining: Math.ceil(toy.cooldown - hoursSinceUse)
      };
    }
  }
  
  // 应用效果
  const cat = loadCatData(catId);
  if (cat) {
    if (toy.effects.mood) {
      cat.stats.mood = Math.min(100, cat.stats.mood + toy.effects.mood);
    }
    if (toy.effects.exercise) {
      if (!cat.wellness) cat.wellness = {};
      cat.wellness.exercise = Math.min(100, (cat.wellness.exercise || 50) + toy.effects.exercise);
    }
    if (toy.effects.mental) {
      if (!cat.wellness) cat.wellness = {};
      cat.wellness.mental = Math.min(100, (cat.wellness.mental || 50) + toy.effects.mental);
    }
    if (toy.effects.social) {
      if (!cat.wellness) cat.wellness = {};
      cat.wellness.social = Math.min(100, (cat.wellness.social || 50) + toy.effects.social);
    }
    if (toy.effects.hydration) {
      if (!cat.wellness) cat.wellness = {};
      cat.wellness.hydration = Math.min(100, (cat.wellness.hydration || 50) + toy.effects.hydration);
    }
    if (toy.effects.energy) {
      cat.stats.energy = Math.min(100, cat.stats.energy + toy.effects.energy);
    }
    if (toy.effects.hunger) {
      cat.stats.hunger = Math.min(100, cat.stats.hunger + toy.effects.hunger);
    }
    
    saveCatData(catId, cat);
  }
  
  // 更新玩具状态
  toyInstance.timesUsed = (toyInstance.timesUsed || 0) + 1;
  toyInstance.lastUsed = Date.now();
  toyInstance.durability -= Math.floor(Math.random() * 5) + 1; // 随机损耗 1-5
  
  saveUserStore(userId, store);
  
  // 生成使用消息
  const messages = [
    `玩得超开心！${toy.icon}`,
    `太喜欢这个玩具了！`,
    `还要玩还要玩！`,
    `这是最棒的玩具！`,
    `喵呜~ 太好玩了！`
  ];
  
  return {
    success: true,
    toy: toyInstance,
    effects: toy.effects,
    message: messages[Math.floor(Math.random() * messages.length)],
    durability: toyInstance.durability
  };
}

// 查看库存
function viewInventory(userId) {
  const store = getUserStore(userId);
  
  if (store.inventory.length === 0) {
    return {
      empty: true,
      message: '还没有玩具呢，去商店逛逛吧！'
    };
  }
  
  // 按质量分类
  const byQuality = {
    basic: [],
    premium: [],
    luxury: [],
    special: []
  };
  
  for (const item of store.inventory) {
    const quality = item.quality || 'basic';
    if (!byQuality[quality]) byQuality[quality] = [];
    byQuality[quality].push(item);
  }
  
  return {
    total: store.inventory.length,
    byQuality: byQuality,
    coins: store.coins
  };
}

// 获得猫币
function earnCoins(userId, amount, reason) {
  const store = getUserStore(userId);
  store.coins += amount;
  saveUserStore(userId, store);
  
  return {
    success: true,
    earned: amount,
    total: store.coins,
    reason: reason
  };
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

// ============================================
// 📤 导出 API
// ============================================

module.exports = {
  // 玩具数据库
  TOY_DATABASE,
  
  // 商店操作
  getUserStore,
  saveUserStore,
  browseStore,
  buyToy,
  useToy,
  viewInventory,
  earnCoins,
  
  // 数据操作
  loadCatData,
  saveCatData
};
