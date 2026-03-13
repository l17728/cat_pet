/**
 * 🌀 时空门系统 - 魔幻空间探索
 * Space-Time Portal System - Magical Space Exploration
 * 
 * 功能:
 * - 打开时空门生成随机场景
 * - 存储最多 5 个魔幻空间
 * - 场景可重复使用
 * - AI 生成场景描述
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

// 获取用户时空门数据
function getPortalData(userId) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${userId}_portal.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return {
    unlocked: false,
    portals: [],
    maxPortals: 5,
    lastOpen: null,
    totalOpens: 0
  };
}

// 保存时空门数据
function savePortalData(userId, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${userId}_portal.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================
// 🌌 场景模板库 (基础模板 + AI 扩展)
// ============================================

const SCENE_TEMPLATES = {
  // 自然场景
  'forest': {
    name: '神秘森林',
    icon: '🌲',
    baseDesc: '阳光透过树叶洒下斑驳光影，空气中弥漫着青草香',
    elements: ['古树', '蘑菇', '小溪', '蝴蝶', '小鸟'],
    mood: 'peaceful',
    rarity: 'common'
  },
  'beach': {
    name: '金色海滩',
    icon: '🏖️',
    baseDesc: '细软的沙滩延伸至远方，海浪轻柔地拍打着岸边',
    elements: ['贝壳', '海星', '椰子树', '海鸥', '寄居蟹'],
    mood: 'relaxing',
    rarity: 'common'
  },
  'mountain': {
    name: '云端山峰',
    icon: '⛰️',
    baseDesc: '站在山巅俯瞰云海，远处的山峰若隐若现',
    elements: ['岩石', '松树', '云雾', '老鹰', '野花'],
    mood: 'majestic',
    rarity: 'uncommon'
  },
  'desert': {
    name: '金色沙漠',
    icon: '🏜️',
    baseDesc: '连绵的沙丘在阳光下闪闪发光，远处有绿洲的轮廓',
    elements: ['仙人掌', '沙丘', '蜥蜴', '骆驼刺', '落日'],
    mood: 'mysterious',
    rarity: 'uncommon'
  },
  
  // 魔幻场景
  'crystal_cave': {
    name: '水晶洞穴',
    icon: '💎',
    baseDesc: '洞穴内布满了发光的水晶，折射出七彩光芒',
    elements: ['水晶簇', '地下河', '荧光蘑菇', '宝石', '钟乳石'],
    mood: 'magical',
    rarity: 'rare'
  },
  'floating_island': {
    name: '浮空岛屿',
    icon: '🏝️',
    baseDesc: '岛屿悬浮在云端，瀑布从边缘倾泻而下化作彩虹',
    elements: ['浮石', '云梯', '彩虹', '飞马', '星尘'],
    mood: 'wondrous',
    rarity: 'epic'
  },
  'star_garden': {
    name: '星空花园',
    icon: '🌌',
    baseDesc: '夜空中繁星点点，花朵散发着微光如同地上的星星',
    elements: ['星花', '月亮池', '萤火虫', '流星', '银河'],
    mood: 'dreamy',
    rarity: 'epic'
  },
  'time_ruins': {
    name: '时光遗迹',
    icon: '🏛️',
    baseDesc: '古老的石柱上刻着神秘的符文，时间在这里仿佛静止',
    elements: ['石柱', '符文', '沙漏', '古籍', '时光碎片'],
    mood: 'ancient',
    rarity: 'legendary'
  },
  
  // 节日场景
  'cherry_blossom': {
    name: '樱花秘境',
    icon: '🌸',
    baseDesc: '粉色樱花如雪般飘落，铺成一条花径',
    elements: ['樱花树', '花瓣雨', '石灯笼', '锦鲤', '和风桥'],
    mood: 'romantic',
    rarity: 'seasonal'
  },
  'winter_wonderland': {
    name: '冬日仙境',
    icon: '❄️',
    baseDesc: '银装素裹的世界，雪花轻柔地飘落',
    elements: ['雪松', '冰湖', '雪人', '驯鹿', '极光'],
    mood: 'peaceful',
    rarity: 'seasonal'
  }
};

// ============================================
// 🎲 AI 场景生成器
// ============================================

// 生成场景 Prompt (用于调用大模型)
function generateScenePrompt(variation = 'random') {
  const templates = Object.values(SCENE_TEMPLATES);
  let baseTemplate;
  
  if (variation === 'random') {
    baseTemplate = templates[Math.floor(Math.random() * templates.length)];
  } else if (variation === 'rare') {
    const rareTemplates = templates.filter(t => ['rare', 'epic', 'legendary'].includes(t.rarity));
    baseTemplate = rareTemplates[Math.floor(Math.random() * rareTemplates.length)];
  } else {
    baseTemplate = templates.find(t => t.name === variation) || templates[0];
  }
  
  // 生成变化参数
  const timeOfDay = ['清晨', '正午', '黄昏', '深夜'][Math.floor(Math.random() * 4)];
  const weather = ['晴朗', '多云', '微风', '细雨', '薄雾'][Math.floor(Math.random() * 5)];
  const season = ['春', '夏', '秋', '冬'][Math.floor(Math.random() * 4)];
  
  return {
    template: baseTemplate,
    variation: {
      timeOfDay,
      weather,
      season
    },
    prompt: `生成一个${timeOfDay}的${baseTemplate.name}场景，天气${weather}，季节是${season}。
    
基础描述：${baseTemplate.baseDesc}
可用元素：${baseTemplate.elements.join(', ')}
氛围：${baseTemplate.mood}

请扩展描述这个场景，让猫咪可以在其中探索玩耍。包括：
1. 详细的环境描述 (50-100 字)
2. 猫咪可以互动的 3-5 个元素
3. 可能发现的惊喜或秘密
4. 场景的特殊效果或氛围`
  };
}

// 调用 AI 生成场景描述 (模拟，实际应调用大模型 API)
async function generateSceneWithAI(templateKey) {
  const sceneData = generateScenePrompt(templateKey);
  
  // TODO: 调用实际的大模型 API 生成详细描述
  // 这里先返回模拟结果
  return simulateSceneGeneration(sceneData);
}

// 模拟场景生成
function simulateSceneGeneration(sceneData) {
  const { template, variation } = sceneData;
  
  // 生成独特描述
  const descriptions = {
    peaceful: [
      `这里宁静而祥和，${variation.timeOfDay}的阳光温柔地洒在每一片叶子上。`,
      `微风轻拂，带来${variation.season}季特有的气息，让人心情平静。`,
      `时间仿佛在这里放慢了脚步，只有自然的声音在耳边回响。`
    ],
    magical: [
      `水晶的光芒在${variation.timeOfDay}中闪烁，创造出梦幻般的光影。`,
      `空气中弥漫着神秘的能量，每一次呼吸都能感受到魔法的流动。`,
      `这里的一切都散发着微光，仿佛置身于童话世界。`
    ],
    wondrous: [
      `眼前的景象令人叹为观止，${variation.weather}的天空下是奇迹般的存在。`,
      `云朵在身边飘过，伸手可及，仿佛站在了世界的顶端。`,
      `每一次眨眼都怕错过这美妙的瞬间，这里是梦想的具现。`
    ],
    mysterious: [
      `${variation.timeOfDay}的光线给这里蒙上了一层神秘的面纱。`,
      `远处似乎有什么在闪烁，吸引着好奇的探索者前行。`,
      `每一阵风都带着古老的故事，等待被发现。`
    ]
  };
  
  const moodDesc = descriptions[template.mood] || descriptions.peaceful;
  const selectedDesc = moodDesc[Math.floor(Math.random() * moodDesc.length)];
  
  // 生成互动元素
  const interactiveElements = template.elements
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 2)
    .map(element => {
      const interactions = {
        '古树': ['可以攀爬', '树洞里有秘密', '树叶会发光'],
        '小溪': ['可以喝水', '里面有小鱼', '水很清凉'],
        '水晶': ['会发光', '触摸有温暖感', '能听到音乐'],
        '花朵': ['散发香气', '会跟着动', '颜色会变化'],
        '云朵': ['可以跳跃', '软软的', '能改变形状']
      };
      const inter = interactions[element] || ['可以探索', '很有趣', '值得看看'];
      return {
        name: element,
        interaction: inter[Math.floor(Math.random() * inter.length)]
      };
    });
  
  return {
    id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    icon: template.icon,
    description: selectedDesc,
    baseTemplate: template.name,
    variation: variation,
    elements: interactiveElements,
    mood: template.mood,
    rarity: template.rarity,
    createdAt: Date.now(),
    visitCount: 0,
    discoveries: []
  };
}

// ============================================
// 🚪 时空门操作
// ============================================

// 打开时空门
function openPortal(userId) {
  const portalData = getPortalData(userId);
  
  // 检查是否已满
  if (portalData.portals.length >= portalData.maxPortals) {
    return {
      success: false,
      error: '空间已满',
      message: `你最多只能存储${portalData.maxPortals}个魔幻空间。请先删除一些再打开新的时空门。`,
      portals: portalData.portals
    };
  }
  
  // 生成新场景
  const isRare = Math.random() < 0.3; // 30% 概率生成稀有场景
  const scene = generateSceneWithAI(isRare ? 'rare' : 'random');
  
  // 由于 generateSceneWithAI 是异步的，这里先返回模拟结果
  // 实际使用时需要 await
  const newScene = simulateSceneGeneration(generateScenePrompt(isRare ? 'rare' : 'random'));
  
  portalData.portals.push(newScene);
  portalData.unlocked = true;
  portalData.lastOpen = Date.now();
  portalData.totalOpens += 1;
  
  savePortalData(userId, portalData);
  
  return {
    success: true,
    message: '✨ 时空门打开了！一个新的魔幻空间出现在你面前！',
    scene: newScene,
    portalCount: portalData.portals.length,
    maxPortals: portalData.maxPortals
  };
}

// 查看已存储的场景
function listPortals(userId) {
  const portalData = getPortalData(userId);
  
  if (!portalData.unlocked || portalData.portals.length === 0) {
    return {
      unlocked: false,
      message: '你还没有打开过时空门。使用"打开时空门"来探索新的魔幻空间吧！'
    };
  }
  
  return {
    unlocked: true,
    count: portalData.portals.length,
    max: portalData.maxPortals,
    totalOpens: portalData.totalOpens,
    portals: portalData.portals.map((p, index) => ({
      index: index + 1,
      id: p.id,
      name: p.name,
      icon: p.icon,
      rarity: p.rarity,
      visits: p.visitCount,
      createdAt: new Date(p.createdAt).toLocaleString('zh-CN')
    }))
  };
}

// 进入场景
function enterPortal(userId, portalIndex) {
  const portalData = getPortalData(userId);
  
  if (!portalData.unlocked || portalData.portals.length === 0) {
    return { error: '没有可用的时空门' };
  }
  
  const index = portalIndex - 1;
  if (index < 0 || index >= portalData.portals.length) {
    return { error: '无效的时空门编号' };
  }
  
  const scene = portalData.portals[index];
  scene.visitCount += 1;
  savePortalData(userId, portalData);
  
  return {
    success: true,
    scene: scene,
    message: `🌀 你进入了${scene.icon} ${scene.name}！`
  };
}

// 删除场景
function deletePortal(userId, portalIndex) {
  const portalData = getPortalData(userId);
  
  if (!portalData.unlocked || portalData.portals.length === 0) {
    return { error: '没有可用的时空门' };
  }
  
  const index = portalIndex - 1;
  if (index < 0 || index >= portalData.portals.length) {
    return { error: '无效的时空门编号' };
  }
  
  const deleted = portalData.portals.splice(index, 1)[0];
  savePortalData(userId, portalData);
  
  return {
    success: true,
    message: `已删除场景"${deleted.name}"`,
    remaining: portalData.portals.length
  };
}

// 探索场景 (发现新元素)
function explorePortal(userId, portalIndex) {
  const portalData = getPortalData(userId);
  
  if (!portalData.unlocked || portalData.portals.length === 0) {
    return { error: '没有可用的时空门' };
  }
  
  const index = portalIndex - 1;
  if (index < 0 || index >= portalData.portals.length) {
    return { error: '无效的时空门编号' };
  }
  
  const scene = portalData.portals[index];
  
  // 生成新发现
  const discoveries = [
    '发现了一颗闪闪发光的宝石！',
    '遇到了一个友好的小精灵！',
    '找到了一个隐藏的宝箱！',
    '发现了一片从未见过的花朵！',
    '听到了神秘的歌声！',
    '发现了一个古老的遗迹！',
    '遇到了另一只探索的猫咪！',
    '发现了可以许愿的流星！'
  ];
  
  const newDiscovery = {
    text: discoveries[Math.floor(Math.random() * discoveries.length)],
    timestamp: Date.now()
  };
  
  scene.discoveries.push(newDiscovery);
  savePortalData(userId, portalData);
  
  return {
    success: true,
    discovery: newDiscovery,
    totalDiscoveries: scene.discoveries.length,
    message: `🔍 在${scene.name}中探索... ${newDiscovery.text}`
  };
}

// ============================================
// 📊 导出 API
// ============================================

module.exports = {
  // 数据操作
  getPortalData,
  savePortalData,
  
  // 时空门操作
  openPortal,
  listPortals,
  enterPortal,
  deletePortal,
  explorePortal,
  
  // 场景生成
  generateScenePrompt,
  generateSceneWithAI,
  
  // 场景模板
  SCENE_TEMPLATES
};
