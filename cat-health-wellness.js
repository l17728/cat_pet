/**
 * 🏥 健康与福祉系统 - 综合健康管理
 * Cat Health & Wellness System
 * 
 * 核心理念:
 * - 猫咪的心情、饮食、睡眠、社交、玩耍共同影响健康
 * - 健康度影响性格表现和互动意愿
 * - 每小时自动检查健康状态
 * - 预防胜于治疗
 */

const fs = require('fs');
const path = require('path');

// 数据目录
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ============================================
// 📊 健康评分系统
// ============================================

// 计算健康评分 (0-100)
function calculateHealthScore(cat) {
  const stats = cat.stats || {};
  const wellness = cat.wellness || {};
  
  // 各项权重
  const weights = {
    hunger: 0.20,      // 饮食 20%
    energy: 0.20,      // 睡眠 20%
    mood: 0.20,        // 心情 20%
    cleanliness: 0.15, // 清洁 15%
    hydration: 0.15,   // 水分 15%
    social: 0.10       // 社交 10%
  };
  
  // 获取各项分数
  const hungerScore = stats.hunger || 50;
  const energyScore = stats.energy || 50;
  const moodScore = stats.mood || 50;
  const cleanlinessScore = stats.cleanliness || 50;
  const hydrationScore = wellness.hydration || 50;
  const socialScore = wellness.social || 50;
  
  // 加权计算
  const healthScore = 
    hungerScore * weights.hunger +
    energyScore * weights.energy +
    moodScore * weights.mood +
    cleanlinessScore * weights.cleanliness +
    hydrationScore * weights.hydration +
    socialScore * weights.social;
  
  return Math.round(healthScore);
}

// 获取健康等级
function getHealthLevel(score) {
  if (score >= 90) return { level: 'excellent', label: '非常健康', icon: '💪', color: '🟢' };
  if (score >= 75) return { level: 'good', label: '健康', icon: '😊', color: '🟡' };
  if (score >= 60) return { level: 'fair', label: '一般', icon: '😐', color: '🟠' };
  if (score >= 40) return { level: 'poor', label: '亚健康', icon: '😟', color: '🔴' };
  return { level: 'critical', label: '危险', icon: '🚨', color: '⚫' };
}

// 计算性格影响
function calculatePersonalityEffect(cat, healthScore) {
  const personality = cat.personality || '温顺';
  const healthLevel = getHealthLevel(healthScore).level;
  
  // 健康度对性格的影响系数
  const effects = {
    excellent: { modifier: 1.2, bonus: '性格特质更加明显，互动意愿高' },
    good: { modifier: 1.0, bonus: '正常表现' },
    fair: { modifier: 0.8, bonus: '有些无精打采' },
    poor: { modifier: 0.6, bonus: '容易烦躁，不愿互动' },
    critical: { modifier: 0.4, bonus: '需要立即关注！' }
  };
  
  const effect = effects[healthLevel];
  
  // 不同性格在低健康时的特殊表现
  const lowHealthBehaviors = {
    '活泼': '变得异常安静，不玩耍了',
    '温顺': '更加依赖主人，寻求安慰',
    '高冷': '完全不理人，躲在角落',
    '粘人': '比平时更粘人，不停叫唤',
    '独立': '拒绝任何互动',
    '好奇': '对什么都没兴趣',
    '胆小': '更加警惕，容易受惊',
    '霸道': '变得暴躁，容易攻击'
  };
  
  return {
    modifier: effect.modifier,
    bonus: effect.bonus,
    specialBehavior: healthLevel === 'poor' || healthLevel === 'critical' 
      ? lowHealthBehaviors[personality] 
      : null
  };
}

// ============================================
// 💧 五维福祉系统
// ============================================

// 更新福祉状态
function updateWellness(catId, updates = {}) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  if (!cat.wellness) {
    cat.wellness = {
      hydration: 70,      // 水分
      social: 50,         // 社交
      exercise: 50,       // 运动
      mental: 50,         // 心理
      lastCheck: Date.now(),
      history: []
    };
  }
  
  // 应用更新
  if (updates.hydration !== undefined) {
    cat.wellness.hydration = Math.max(0, Math.min(100, updates.hydration));
  }
  if (updates.social !== undefined) {
    cat.wellness.social = Math.max(0, Math.min(100, updates.social));
  }
  if (updates.exercise !== undefined) {
    cat.wellness.exercise = Math.max(0, Math.min(100, updates.exercise));
  }
  if (updates.mental !== undefined) {
    cat.wellness.mental = Math.max(0, Math.min(100, updates.mental));
  }
  
  cat.wellness.lastCheck = Date.now();
  
  // 记录历史 (保留最近 24 条)
  cat.wellness.history.push({
    timestamp: Date.now(),
    hydration: cat.wellness.hydration,
    social: cat.wellness.social,
    exercise: cat.wellness.exercise,
    mental: cat.wellness.mental,
    healthScore: calculateHealthScore(cat)
  });
  
  if (cat.wellness.history.length > 24) {
    cat.wellness.history.shift();
  }
  
  saveCatData(catId, cat);
  
  return {
    success: true,
    wellness: cat.wellness,
    healthScore: calculateHealthScore(cat)
  };
}

// 每小时自动衰减
function applyHourlyDecay(catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  if (!cat.wellness) {
    cat.wellness = {
      hydration: 70,
      social: 50,
      exercise: 50,
      mental: 50,
      lastCheck: Date.now(),
      history: []
    };
  }
  
  // 每小时衰减
  const decay = {
    hydration: -5,    // 每小时 -5 (需要喝水)
    social: -3,       // 每小时 -3 (需要陪伴)
    exercise: -2,     // 每小时 -2 (需要活动)
    mental: -2        // 每小时 -2 (需要刺激)
  };
  
  // 基础 stats 也会衰减
  const statDecay = {
    hunger: -3,       // 每小时 -3
    energy: -2,       // 每小时 -2
    cleanliness: -2   // 每小时 -2
  };
  
  // 应用衰减
  cat.wellness.hydration = Math.max(0, cat.wellness.hydration + decay.hydration);
  cat.wellness.social = Math.max(0, cat.wellness.social + decay.social);
  cat.wellness.exercise = Math.max(0, cat.wellness.exercise + decay.exercise);
  cat.wellness.mental = Math.max(0, cat.wellness.mental + decay.mental);
  
  cat.stats.hunger = Math.max(0, cat.stats.hunger + statDecay.hunger);
  cat.stats.energy = Math.max(0, cat.stats.energy + statDecay.energy);
  cat.stats.cleanliness = Math.max(0, cat.stats.cleanliness + statDecay.cleanliness);
  
  // 记录检查
  cat.wellness.lastCheck = Date.now();
  
  // 生成健康报告
  const healthScore = calculateHealthScore(cat);
  const healthLevel = getHealthLevel(healthScore);
  const personalityEffect = calculatePersonalityEffect(cat, healthScore);
  
  // 检查是否需要警告
  const warnings = [];
  if (cat.wellness.hydration < 30) warnings.push('⚠️ 猫咪缺水！请提供饮用水。');
  if (cat.wellness.social < 30) warnings.push('⚠️ 猫咪感到孤独！多陪陪它吧。');
  if (cat.stats.hunger < 30) warnings.push('⚠️ 猫咪饿了！该喂食了。');
  if (cat.stats.energy < 30) warnings.push('⚠️ 猫咪很累！让它休息吧。');
  if (cat.stats.cleanliness < 30) warnings.push('⚠️ 猫咪太脏了！该洗澡了。');
  if (healthLevel.level === 'critical') warnings.push('🚨 猫咪健康状况危险！需要立即关注！');
  
  saveCatData(catId, cat);
  
  return {
    success: true,
    healthScore,
    healthLevel,
    personalityEffect,
    warnings,
    stats: {
      hunger: cat.stats.hunger,
      energy: cat.stats.energy,
      cleanliness: cat.stats.cleanliness,
      hydration: cat.wellness.hydration,
      social: cat.wellness.social
    }
  };
}

// ============================================
// 🎯 互动效果系统
// ============================================

// 互动对福祉的影响
const INTERACTION_EFFECTS = {
  feed: {
    hunger: 30,
    hydration: 5,
    mood: 10,
    social: 5
  },
  drink: {
    hydration: 25,
    mood: 5
  },
  play: {
    energy: -15,
    exercise: 20,
    mental: 15,
    social: 15,
    mood: 20
  },
  sleep: {
    energy: 40,
    mental: 10
  },
  bathe: {
    cleanliness: 40,
    mood: -5,  // 猫咪通常不喜欢洗澡
    social: 5
  },
  pet: {
    mood: 15,
    social: 10,
    mental: 5
  },
  talk: {
    social: 15,
    mental: 10,
    mood: 5
  },
  explore: {
    exercise: 15,
    mental: 20,
    mood: 10
  }
};

// 应用互动效果
function applyInteraction(catId, interactionType) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  const effects = INTERACTION_EFFECTS[interactionType];
  if (!effects) return { error: '未知的互动类型' };
  
  // 初始化 wellness
  if (!cat.wellness) {
    cat.wellness = {
      hydration: 70,
      social: 50,
      exercise: 50,
      mental: 50,
      lastCheck: Date.now(),
      history: []
    };
  }
  
  // 应用效果
  if (effects.hunger !== undefined) {
    cat.stats.hunger = Math.max(0, Math.min(100, cat.stats.hunger + effects.hunger));
  }
  if (effects.energy !== undefined) {
    cat.stats.energy = Math.max(0, Math.min(100, cat.stats.energy + effects.energy));
  }
  if (effects.cleanliness !== undefined) {
    cat.stats.cleanliness = Math.max(0, Math.min(100, cat.stats.cleanliness + effects.cleanliness));
  }
  if (effects.mood !== undefined) {
    cat.stats.mood = Math.max(0, Math.min(100, cat.stats.mood + effects.mood));
  }
  if (effects.hydration !== undefined) {
    cat.wellness.hydration = Math.max(0, Math.min(100, cat.wellness.hydration + effects.hydration));
  }
  if (effects.social !== undefined) {
    cat.wellness.social = Math.max(0, Math.min(100, cat.wellness.social + effects.social));
  }
  if (effects.exercise !== undefined) {
    cat.wellness.exercise = Math.max(0, Math.min(100, cat.wellness.exercise + effects.exercise));
  }
  if (effects.mental !== undefined) {
    cat.wellness.mental = Math.max(0, Math.min(100, cat.wellness.mental + effects.mental));
  }
  
  // 记录互动
  if (!cat.wellness.interactions) {
    cat.wellness.interactions = [];
  }
  cat.wellness.interactions.push({
    type: interactionType,
    timestamp: Date.now(),
    effects: effects
  });
  
  // 保留最近 50 条互动记录
  if (cat.wellness.interactions.length > 50) {
    cat.wellness.interactions.shift();
  }
  
  saveCatData(catId, cat);
  
  const healthScore = calculateHealthScore(cat);
  const healthLevel = getHealthLevel(healthScore);
  
  return {
    success: true,
    interaction: interactionType,
    effects: effects,
    healthScore,
    healthLevel
  };
}

// ============================================
// 🏥 健康检查与报告
// ============================================

// 完整健康检查
function healthCheckup(catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  const healthScore = calculateHealthScore(cat);
  const healthLevel = getHealthLevel(healthScore);
  const personalityEffect = calculatePersonalityEffect(cat, healthScore);
  
  // 生成详细报告
  const report = {
    summary: {
      score: healthScore,
      level: healthLevel.label,
      icon: healthLevel.icon,
      color: healthLevel.color
    },
    stats: {
      hunger: { value: cat.stats.hunger, label: '饱食度', icon: '🍖' },
      energy: { value: cat.stats.energy, label: '精力', icon: '⚡' },
      mood: { value: cat.stats.mood, label: '心情', icon: '💖' },
      cleanliness: { value: cat.stats.cleanliness, label: '清洁', icon: '🛁' },
      hydration: { value: cat.wellness?.hydration || 50, label: '水分', icon: '💧' },
      social: { value: cat.wellness?.social || 50, label: '社交', icon: '👥' }
    },
    personality: {
      type: cat.personality,
      effect: personalityEffect.bonus,
      modifier: personalityEffect.modifier,
      specialBehavior: personalityEffect.specialBehavior
    },
    recommendations: generateRecommendations(cat, healthScore),
    timestamp: Date.now()
  };
  
  // 更新最后一次检查时间
  if (cat.wellness) {
    cat.wellness.lastCheckup = Date.now();
    saveCatData(catId, cat);
  }
  
  return report;
}

// 生成建议
function generateRecommendations(cat, healthScore) {
  const recommendations = [];
  
  if (cat.stats.hunger < 40) {
    recommendations.push({ priority: 'high', text: '🍖 猫咪饿了，请及时喂食', action: 'feed' });
  }
  if (cat.stats.energy < 40) {
    recommendations.push({ priority: 'high', text: '😴 猫咪很困，让它休息吧', action: 'sleep' });
  }
  if (cat.stats.mood < 40) {
    recommendations.push({ priority: 'high', text: '😢 猫咪心情不好，多陪陪它', action: 'play' });
  }
  if (cat.stats.cleanliness < 40) {
    recommendations.push({ priority: 'medium', text: '🛁 猫咪需要洗澡了', action: 'bathe' });
  }
  if ((cat.wellness?.hydration || 50) < 40) {
    recommendations.push({ priority: 'high', text: '💧 猫咪缺水，请提供饮用水', action: 'drink' });
  }
  if ((cat.wellness?.social || 50) < 40) {
    recommendations.push({ priority: 'medium', text: '👥 猫咪感到孤独，和它说说话吧', action: 'talk' });
  }
  if ((cat.wellness?.exercise || 50) < 40) {
    recommendations.push({ priority: 'medium', text: '🏃 猫咪需要运动，陪它玩耍吧', action: 'play' });
  }
  if ((cat.wellness?.mental || 50) < 40) {
    recommendations.push({ priority: 'low', text: '🧩 猫咪需要精神刺激，试试新玩具', action: 'explore' });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({ priority: 'low', text: '✨ 猫咪状态很好，继续保持！', action: 'none' });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
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
  // 健康评分
  calculateHealthScore,
  getHealthLevel,
  calculatePersonalityEffect,
  
  // 福祉系统
  updateWellness,
  applyHourlyDecay,
  applyInteraction,
  
  // 健康检查
  healthCheckup,
  generateRecommendations,
  
  // 数据操作
  loadCatData,
  saveCatData,
  
  // 互动效果
  INTERACTION_EFFECTS
};
