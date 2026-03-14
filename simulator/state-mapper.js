/**
 * 状态映射器
 * State Mapper - 将猫咪状态映射到 Star-Office 状态
 * 
 * 设计原则:
 * 1. 优先处理紧急状态 (饿了、脏了)
 * 2. 根据状态组合判断行为
 * 3. 保持映射的可读性和可扩展性
 */

/**
 * 状态映射规则
 * 优先级从高到低
 */
const MAPPING_RULES = [
  // === 紧急状态 → error (错误 bug 动画) ===
  {
    name: 'hungry',
    condition: (cat) => cat.stats.hunger < 25,
    state: 'error',
    detail: (cat) => `${cat.name} 饿坏了！🍖 饱食:${cat.stats.hunger}`
  },
  {
    name: 'dirty',
    condition: (cat) => cat.stats.cleanliness < 25,
    state: 'error',
    detail: (cat) => `${cat.name} 太脏了需要洗澡！🛁 清洁:${cat.stats.cleanliness}`
  },

  // === 深度睡眠/打盹 → idle (star_idle 角色动画) ===
  {
    name: 'exhausted',
    condition: (cat) => cat.stats.energy < 20,
    state: 'idle',
    detail: (cat) => `${cat.name} 累坏了，睡着了... 💤 精力:${cat.stats.energy}`
  },
  {
    name: 'napping',
    condition: (cat) => cat.stats.energy < 40 && cat.stats.mood < 45,
    state: 'idle',
    detail: (cat) => `${cat.name} 在打盹~ 😴 精力:${cat.stats.energy}`
  },

  // === 高度兴奋 → syncing (同步动画) ===
  {
    name: 'playing',
    condition: (cat) => cat.stats.mood > 80 && cat.stats.energy > 50,
    state: 'syncing',
    detail: (cat) => `${cat.name} 玩耍中！开心极了！🎾 心情:${cat.stats.mood}`
  },

  // === 消化饱食 → executing (star_working 动画) ===
  {
    name: 'digesting',
    condition: (cat) => cat.stats.hunger > 75 && cat.stats.energy > 35,
    state: 'executing',
    detail: (cat) => `${cat.name} 吃饱了在消化~ 🍖 饱食:${cat.stats.hunger}`
  },

  // === 正常活跃 → writing (star_working 动画) ===
  {
    name: 'healthy',
    condition: (cat) => {
      const avg = (cat.stats.energy + cat.stats.mood + cat.stats.hunger + cat.stats.cleanliness) / 4;
      return avg >= 60;
    },
    state: 'writing',
    detail: (cat) => `${cat.name} 状态良好，在巡视领地~`
  },

  // === 好奇探索 → researching (star_researching 动画) ===
  // 状态中等时猫咪会四处探索，触发 star_researching 动画
  {
    name: 'exploring',
    condition: (cat) => cat.stats.mood > 50 && cat.stats.energy > 40,
    state: 'researching',
    detail: (cat) => `${cat.name} 在探索领地~ 🐾 心情:${cat.stats.mood}`
  },

  // === 梳毛/保养 → syncing (同步动画) ===
  {
    name: 'grooming',
    condition: (cat) => cat.stats.cleanliness > 55 && cat.stats.energy > 30,
    state: 'syncing',
    detail: (cat) => `${cat.name} 在梳理毛毛~ ✨ 清洁:${cat.stats.cleanliness}`
  },

  // === 低能休息 → idle (star_idle 动画) ===
  {
    name: 'resting',
    condition: (cat) => cat.stats.energy < 55,
    state: 'idle',
    detail: (cat) => `${cat.name} 有点累，在休息... 精力:${cat.stats.energy}`
  },

  // === 兜底 ===
  {
    name: 'default',
    condition: () => true,
    state: 'idle',
    detail: (cat) => `${cat.name} 在发呆~`
  }
];

/**
 * 将猫咪状态映射到 Star-Office 状态
 * @param {object} cat - 猫咪数据对象
 * @returns {object} - { state, detail, rule }
 */
function mapCatToOffice(cat) {
  if (!cat || !cat.stats) {
    return {
      state: 'idle',
      detail: '没有猫咪数据',
      rule: 'default'
    };
  }
  
  for (const rule of MAPPING_RULES) {
    if (rule.condition(cat)) {
      return {
        state: rule.state,
        detail: typeof rule.detail === 'function' ? rule.detail(cat) : rule.detail,
        rule: rule.name
      };
    }
  }
  
  // 兜底
  return {
    state: 'idle',
    detail: `${cat.name} 在休息中...`,
    rule: 'fallback'
  };
}

/**
 * 获取猫咪状态摘要
 * @param {object} cat - 猫咪数据
 * @returns {string} - 状态描述
 */
function getCatStatusSummary(cat) {
  if (!cat || !cat.stats) return '状态未知';
  
  const { energy, mood, hunger, cleanliness } = cat.stats;
  const stats = [
    `精力:${energy}`,
    `心情:${mood}`,
    `饱食:${hunger}`,
    `清洁:${cleanliness}`
  ];
  
  return `${cat.name} | ${stats.join(' | ')}`;
}

/**
 * 根据性格调整状态描述
 * @param {object} cat - 猫咪数据
 * @param {string} baseDetail - 基础描述
 * @returns {string} - 调整后的描述
 */
function adjustDetailByPersonality(cat, baseDetail) {
  const personalitySuffixes = {
    '活泼': '喵呜~',
    '温顺': '~',
    '高冷': '哼。',
    '粘人': '喵~',
    '独立': '...',
    '好奇': '?',
    '胆小': '...',
    '霸道': '喵！'
  };
  
  const suffix = personalitySuffixes[cat.personality] || '';
  return baseDetail + suffix;
}

module.exports = {
  mapCatToOffice,
  getCatStatusSummary,
  adjustDetailByPersonality,
  MAPPING_RULES
};