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
  // 紧急状态 - 需要立即关注
  {
    name: 'hungry',
    condition: (cat) => cat.stats.hunger < 30,
    state: 'error',
    detail: (cat) => `${cat.name} 饿了喵！饱食度: ${cat.stats.hunger}`
  },
  {
    name: 'dirty',
    condition: (cat) => cat.stats.cleanliness < 30,
    state: 'error',
    detail: (cat) => `${cat.name} 需要洗澡！清洁度: ${cat.stats.cleanliness}`
  },
  {
    name: 'exhausted',
    condition: (cat) => cat.stats.energy < 20,
    state: 'idle',
    detail: (cat) => `${cat.name} 累坏了，在休息... 精力: ${cat.stats.energy}`
  },
  
  // 活跃状态 - 正在进行某事
  {
    name: 'playing',
    condition: (cat) => cat.stats.mood > 80 && cat.stats.energy > 50,
    state: 'syncing',
    detail: (cat) => `${cat.name} 玩得很开心！心情: ${cat.stats.mood}`
  },
  {
    name: 'eating',
    condition: (cat) => cat.stats.hunger > 80 && cat.stats.energy > 40,
    state: 'executing',
    detail: (cat) => `${cat.name} 刚刚吃饱，在消化中~`
  },
  
  // 正常状态 - 工作区
  {
    name: 'healthy',
    condition: (cat) => {
      const avg = (cat.stats.energy + cat.stats.mood + cat.stats.hunger + cat.stats.cleanliness) / 4;
      return avg >= 60;
    },
    state: 'writing',
    detail: (cat) => `${cat.name} 状态良好，正在探索世界~`
  },
  
  // 默认状态 - 休息区
  {
    name: 'resting',
    condition: () => true, // 兜底规则
    state: 'idle',
    detail: (cat) => `${cat.name} 在休息中...`
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