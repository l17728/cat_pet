/**
 * 🐱 猫咪养成系统 - 纯工具函数版 (带进化系统)
 * Cat Pet System - Pure Tools Edition (with Evolution)
 * 
 * 功能:
 * - 猫咪创建/管理
 * - 互动系统 (喂食/玩耍/洗澡/睡觉/摸摸)
 * - 状态系统
 * - 成就系统
 * - 记忆系统
 * - 社交系统
 * - 🧬 进化系统 (动态扩展动作/反应)
 * 
 * 注意：本模块只提供纯业务逻辑工具，不包含任何 LLM 调用
 * LLM 能力由 OpenClaw Agent 提供
 */

const fs = require('fs');
const path = require('path');

// 进化系统
const evolution = require('./core/evolution-index');

// 数据目录
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 获取用户数据文件路径
function getUserDataPath(userId) {
  return path.join(DATA_DIR, `${userId}.json`);
}

// 读取用户数据
function loadUserData(userId) {
  ensureDataDir();
  const filePath = getUserDataPath(userId);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

// 保存用户数据
function saveUserData(userId, data) {
  ensureDataDir();
  const filePath = getUserDataPath(userId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 获取猫咪数据文件路径
function getCatDataPath(catId) {
  return path.join(DATA_DIR, `cat_${catId}.json`);
}

// 读取猫咪数据
function loadCatData(catId) {
  const filePath = getCatDataPath(catId);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

// 保存猫咪数据
function saveCatData(catId, data) {
  const filePath = getCatDataPath(catId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================
// 🎮 性格反馈系统
// ============================================

const PERSONALITY_REACTIONS = {
  '活泼': {
    feed: ['上蹿下跳地吃！', '兴奋地转圈圈吃饭！', '喵呜喵呜边叫边吃！', '狼吞虎咽太可爱了！'],
    play: ['疯了一样追逗猫棒！', '跳到空中抓玩具！', '玩到停不下来！', '兴奋得尾巴都竖起来了！'],
    bathe: ['在水里扑腾！', '边洗边玩水！', '洗完了还要甩你一身水！', '好像很享受洗澡！'],
    sleep: ['翻来覆去才睡着', '睡梦中还在蹬腿', '蜷成一团但尾巴在动', '睡相超级可爱'],
    pet: ['蹭蹭蹭个不停！', '翻肚皮求继续！', '呼噜声像小马达！', '用头使劲顶你的手！'],
    meet: ['兴奋地凑过去闻闻', '尾巴高高竖起', '喵呜~你好呀！', '好奇地绕着对方转']
  },
  '温顺': {
    feed: ['乖乖地吃饭', '优雅地舔食', '吃完还舔舔嘴巴', '安静地享受美食'],
    play: ['温和地玩玩具', '轻轻地抓逗猫棒', '玩一会儿就休息', '很配合你的互动'],
    bathe: ['安静地让你洗', '偶尔喵一声', '洗得很配合', '洗完乖乖让你擦干'],
    sleep: ['安静地入睡', '睡姿很优雅', '发出轻微的呼噜声', '睡得很踏实'],
    pet: ['满足地呼噜', '眯着眼睛享受', '轻轻蹭你的手', '发出舒服的叫声'],
    meet: ['友好地蹭蹭对方', '轻声喵了一下', '温和地靠近', '尾巴轻轻摆动']
  },
  '高冷': {
    feed: ['瞥了你一眼才开始吃', '勉强赏脸吃了一点', '假装不在意但吃光了', '哼，还算满意'],
    play: ['勉强陪你玩一下', '用爪子拨弄玩具', '玩一会儿就走开了', '看似不在意但其实很享受'],
    bathe: ['一脸不情愿但没反抗', '洗完立刻走开', '甩甩水表示不满', '哼，下次别洗了'],
    sleep: ['背对着你睡', '找了个安静的角落', '假装睡觉但偷看你', '哼，别打扰本喵'],
    pet: ['尾巴轻轻摆动', '假装躲开但没真走', '...还行吧', '勉强让你摸一下'],
    meet: ['瞥了一眼对方', '假装没看见但尾巴在动', '哼，又来一只', '保持距离观察']
  },
  '粘人': {
    feed: ['边吃边看你', '吃完就蹭你求抱抱', '要你陪着才肯吃', '喵呜~主人别走'],
    play: ['一直跟着玩具跑', '玩完就赖在你身上', '不让你停', '喵呜~再来一次嘛'],
    bathe: ['害怕但相信你不会伤害它', '洗完立刻粘着你', '喵呜~安慰我', '要抱抱才能好'],
    sleep: ['要睡在你旁边', '抱着你的手臂睡', '时不时蹭蹭你', '没有你不肯睡'],
    pet: ['一直蹭你的手', '求摸摸不要停', '翻肚皮撒娇', '喵呜~最喜欢主人了'],
    meet: ['立刻凑过去蹭蹭', '喵呜~新朋友！', '一直跟着对方', '想和对方一起玩']
  },
  '独立': {
    feed: ['自己安静地吃', '吃完就去忙自己的事', '不需要你陪', '有自己的节奏'],
    play: ['自己玩玩具', '偶尔看你一眼', '玩累了就自己走开', '保持适当距离'],
    bathe: ['自己跳进水里', '洗完了自己甩干', '不需要你帮忙', '很独立'],
    sleep: ['找了个舒服的地方', '自己睡得很香', '不需要陪伴', '独立的小猫'],
    pet: ['让你摸但不主动', '摸一会儿就走开', '保持距离但没拒绝', '有自己的界限'],
    meet: ['远远地看着对方', '点点头算是打招呼', '保持距离但没离开', '各自做各自的事']
  },
  '好奇': {
    feed: ['先闻闻再吃', '用爪子拨弄食物', '边吃边研究', '对碗很感兴趣'],
    play: ['歪头研究玩具', '用爪子试探', '发现新玩法', '好奇地探索每个角落'],
    bathe: ['好奇地看着水', '用爪子试试水温', '好像发现了新大陆', '边洗边观察周围'],
    sleep: ['找了个新奇的地方睡', '睡梦中还在动耳朵', '对环境很好奇', '警惕但好奇'],
    pet: ['闻闻你的手', '用头蹭蹭研究你', '好奇地看着你', '歪头杀！'],
    meet: ['凑近仔细闻闻', '歪头打量对方', '喵？你是谁呀？', '用爪子轻轻碰了碰']
  },
  '胆小': {
    feed: ['小心翼翼地靠近', '吃一口看一下你', '躲在角落吃', '紧张地吃饭'],
    play: ['远远地看着玩具', '慢慢靠近', '被吓到会躲起来', '需要鼓励才敢玩'],
    bathe: ['很害怕但信任你', '瑟瑟发抖', '洗完要安慰好久', '喵呜~好怕怕'],
    sleep: ['找了个隐蔽的地方', '蜷成一团', '有点动静就惊醒', '需要安全感'],
    pet: ['犹豫要不要靠近', '轻轻地蹭你', '被摸会紧张', '慢慢建立信任'],
    meet: ['躲在你身后偷看', '瑟瑟发抖', '喵...（小声）', '慢慢靠近闻了闻']
  },
  '霸道': {
    feed: ['命令你继续喂', '用爪子按着碗', '吃完还想要', '喵！还要！'],
    play: ['命令你陪玩', '玩腻了就换', '你是它的仆人', '喵！继续！'],
    bathe: ['勉强让你洗', '洗完甩你一身水', '哼，下次不许这样', '本喵勉为其难'],
    sleep: ['睡在你的枕头上', '霸占最好的位置', '不许你动', '这是本喵的地盘'],
    pet: ['用头命令你继续', '摸少了会咬你', '翻肚皮是命令你挠', '哼，还算满意'],
    meet: ['居高临下地看着对方', '哼，新来的？', '用尾巴扫了扫对方', '宣示主权']
  }
};

// 猫咪语录
const CAT_QUOTES = {
  '活泼': ['喵呜！太好玩了！', '本喵天下第一！', '铲屎的，快陪我玩！', '能量满满！', '冲呀！'],
  '温顺': ['喵~ 谢谢你', '好舒服呀', '最喜欢主人了', '今天也很开心', '喵呜~'],
  '高冷': ['哼', '...还行吧', '（尾巴轻轻摆动）', '本喵没兴趣', '勉强可以'],
  '粘人': ['不要走嘛', '一直陪着我好不好', '喵呜~ 抱抱', '主人最好了', '要贴贴'],
  '独立': ['我自己可以', '别管我', '（自己玩去了）', '嗯', '...'],
  '好奇': ['这是什么？', '喵？', '（歪头）', '让我看看', '哇！'],
  '胆小': ['喵...（小声）', '（躲起来）', '好怕怕', '主人保护我', '瑟瑟发抖'],
  '霸道': ['铲屎的！', '本喵命令你！', '还不快伺候！', '哼！', '继续！']
};

// ============================================
// 🎲 随机事件系统
// ============================================

const RANDOM_EVENTS = [
  { 
    name: '礼物', 
    icon: '🎁',
    desc: ['猫咪叼来一个小玩具送给你！', '猫咪抓了一只"猎物"放在你面前！', '猫咪找到了一个漂亮的小东西给你！'],
    effect: { mood: 20 },
    quote: '喵呜~ 给你的！'
  },
  { 
    name: '捣乱', 
    icon: '😼',
    desc: ['猫咪打翻了水杯！', '猫咪把纸巾都扯出来了！', '猫咪推倒了桌上的东西！'],
    effect: { cleanliness: -10, mood: 5 },
    quote: '哼，谁让你不理我！'
  },
  { 
    name: '撒娇', 
    icon: '💕',
    desc: ['猫咪突然蹭你的腿', '猫咪翻肚皮求摸摸', '猫咪用头使劲顶你的手'],
    effect: { mood: 15 },
    quote: '喵呜~ 抱抱嘛~'
  },
  { 
    name: '装睡', 
    icon: '😴',
    desc: ['猫咪假装睡觉但偷看你', '猫咪闭着眼睛但尾巴在动', '猫咪睡得太香了'],
    effect: { mood: 10, energy: 5 },
    quote: '...（假装没听见）'
  },
  { 
    name: '捕猎', 
    icon: '🦟',
    desc: ['猫咪捕捉到了一只苍蝇！', '猫咪抓到了一只小虫子！', '猫咪成功狩猎！'],
    effect: { hunger: 10, mood: 15 },
    quote: '看本喵的厉害！'
  },
  { 
    name: '噩梦', 
    icon: '😰',
    desc: ['猫咪睡觉时做噩梦了', '猫咪被吓醒了', '猫咪睡得不安稳'],
    effect: { mood: -10, energy: -5 },
    quote: '喵呜...（惊醒）'
  },
  { 
    name: '发现', 
    icon: '🔍',
    desc: ['猫咪在床下找到了丢失的东西', '猫咪发现了家里的秘密基地', '猫咪找到了一个盒子'],
    effect: { mood: 20 },
    quote: '喵！快看这个！'
  },
  { 
    name: '呼噜', 
    icon: '💤',
    desc: ['猫咪发出满足的呼噜声', '猫咪的呼噜声像小马达', '猫咪舒服得直呼噜'],
    effect: { mood: 10 },
    quote: '呼噜呼噜~'
  },
  { 
    name: '伸懒腰', 
    icon: '🧘',
    desc: ['猫咪伸了个大大的懒腰', '猫咪舒展身体', '猫咪做了个瑜伽动作'],
    effect: { energy: 5, mood: 5 },
    quote: '哈~ 舒服~'
  },
  { 
    name: '窗边发呆', 
    icon: '🪟',
    desc: ['猫咪坐在窗边看鸟', '猫咪盯着窗外看', '猫咪被外面的声音吸引了'],
    effect: { mood: 5 },
    quote: '喵？（那是什么？）'
  }
];

// ============================================
// 🏆 成就系统
// ============================================

const ACHIEVEMENTS = {
  // 公开成就
  '新手铲屎官': {
    id: 'newbie',
    name: '🍼 新手铲屎官',
    desc: '第一次喂食',
    hidden: false,
    check: (cat) => cat.interactions >= 1
  },
  '最佳玩伴': {
    id: 'playmate',
    name: '🎾 最佳玩伴',
    desc: '累计互动 10 次',
    hidden: false,
    check: (cat) => cat.interactions >= 10
  },
  '洁癖猫奴': {
    id: 'clean',
    name: '🛁 洁癖猫奴',
    desc: '累计洗澡 5 次',
    hidden: false,
    check: (cat) => (cat.batheCount || 0) >= 5
  },
  '养生专家': {
    id: 'sleep',
    name: '💤 养生专家',
    desc: '累计睡觉 20 次',
    hidden: false,
    check: (cat) => (cat.sleepCount || 0) >= 20
  },
  '完美猫咪': {
    id: 'perfect',
    name: '🏅 完美猫咪',
    desc: '全状态满值',
    hidden: false,
    check: (cat) => cat.stats.energy >= 100 && cat.stats.mood >= 100 && 
                    cat.stats.hunger >= 100 && cat.stats.cleanliness >= 100
  },
  '百日陪伴': {
    id: 'century',
    name: '📅 百日陪伴',
    desc: '养猫 100 天',
    hidden: false,
    check: (cat) => {
      const birthDate = new Date(cat.birthDate);
      const now = new Date();
      const days = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
      return days >= 100;
    }
  },
  '猫妈妈/猫爸爸': {
    id: 'parent',
    name: '👪 猫妈妈/猫爸爸',
    desc: '有了自己的孩子',
    hidden: false,
    check: (cat) => (cat.children || []).length > 0
  },
  '社交达人': {
    id: 'social',
    name: '🤝 社交达人',
    desc: '拥有 3 个以上猫朋友',
    hidden: false,
    check: (cat) => (Object.keys(cat.relationships || {}).length) >= 3
  },
  // 隐藏成就
  'cat_whisperer': {
    id: 'cat_whisperer',
    name: '???',
    desc: '???',
    hidden: true,
    realName: '🗣️ 猫语者',
    realDesc: '连续 7 天全状态满值',
    check: (cat) => (cat.perfectDays || 0) >= 7
  },
  'lucky_cat': {
    id: 'lucky_cat',
    name: '???',
    desc: '???',
    hidden: true,
    realName: '🍀 幸运猫',
    realDesc: '触发 10 次随机事件',
    check: (cat) => (cat.eventCount || 0) >= 10
  },
  'cat_collector': {
    id: 'cat_collector',
    name: '???',
    desc: '???',
    hidden: true,
    realName: '🐱 收藏家',
    realDesc: '拥有 5 只不同品种的猫',
    check: (cat, userData) => (userData?.cats?.length || 0) >= 5
  },
  'millionaire': {
    id: 'millionaire',
    name: '???',
    desc: '???',
    hidden: true,
    realName: '💰 百万富翁',
    realDesc: '累计互动 100 次',
    check: (cat) => cat.interactions >= 100
  },
  'cat_lover': {
    id: 'cat_lover',
    name: '???',
    desc: '???',
    hidden: true,
    realName: '❤️ 真爱粉',
    realDesc: '连续登录 30 天',
    check: (cat) => (cat.loginStreak || 0) >= 30
  },
  'big_family': {
    id: 'big_family',
    name: '???',
    desc: '???',
    hidden: true,
    realName: '👨‍👩‍👧‍👦 大家庭',
    realDesc: '拥有 5 只猫咪',
    check: (cat, userData) => (userData?.cats?.length || 0) >= 5
  }
};

// ============================================
// 品种库
// ============================================

const BREEDS = [
  { name: '中华田园猫', rarity: 1, traits: { health: 1.2, mood: 1.0 } },
  { name: '英国短毛猫', rarity: 2, traits: { health: 1.0, mood: 1.1 } },
  { name: '美国短毛猫', rarity: 2, traits: { health: 1.1, mood: 1.0 } },
  { name: '布偶猫', rarity: 3, traits: { health: 0.9, mood: 1.2 } },
  { name: '暹罗猫', rarity: 2, traits: { health: 1.0, mood: 1.1 } },
  { name: '波斯猫', rarity: 3, traits: { health: 0.8, mood: 1.0 } },
  { name: '缅因猫', rarity: 3, traits: { health: 1.1, mood: 1.0 } },
  { name: '苏格兰折耳', rarity: 3, traits: { health: 0.85, mood: 1.15 } },
  { name: '孟加拉豹猫', rarity: 4, traits: { health: 1.0, mood: 1.2 } },
  { name: '俄罗斯蓝猫', rarity: 4, traits: { health: 1.1, mood: 0.9 } },
  { name: '斯芬克斯无毛猫', rarity: 5, traits: { health: 0.7, mood: 1.3 } },
  // 隐藏品种
  { name: '招财猫', rarity: 99, hidden: true, traits: { luck: 1.5, health: 1.0 } },
  { name: '九命猫', rarity: 99, hidden: true, traits: { health: 2.0, recovery: 1.5 } },
  { name: '仙猫', rarity: 99, hidden: true, traits: { all: 1.3 } }
];

// 毛色库
const COLORS = [
  '白色', '黑色', '灰色', '橘色', '奶油色',
  '银渐层', '金渐层', '虎斑', '三花', '玳瑁',
  '重点色', '奶牛色', '蓝白', '棕白'
];

// 眼睛颜色
const EYE_COLORS = [
  '蓝色', '绿色', '金色', '铜色', '琥珀色', '异色瞳'
];

// 性格类型
const PERSONALITIES = [
  '活泼', '温顺', '高冷', '粘人', '独立', '好奇', '胆小', '霸道'
];

// ============================================
// 工具函数
// ============================================

// 随机选择（带权重）
function weightedRandom(array, weightFn) {
  const weights = array.filter(item => !item.hidden).map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  const visibleArray = array.filter(item => !item.hidden);
  for (let i = 0; i < visibleArray.length; i++) {
    random -= weights[i];
    if (random <= 0) return visibleArray[i];
  }
  return visibleArray[visibleArray.length - 1];
}

// 随机选择数组元素
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 生成唯一 ID
function generateId() {
  return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 计算亲密度描述
function getRelationshipDescription(intimacy) {
  if (intimacy >= 90) return { level: 5, name: '最佳拍档', desc: '形影不离的好朋友' };
  if (intimacy >= 70) return { level: 4, name: '闺蜜/死党', desc: '经常在一起玩' };
  if (intimacy >= 50) return { level: 3, name: '好朋友', desc: '关系很好' };
  if (intimacy >= 30) return { level: 2, name: '朋友', desc: '可以一起玩' };
  if (intimacy >= 10) return { level: 1, name: '认识', desc: '见过几次面' };
  return { level: 0, name: '陌生', desc: '第一次见面' };
}

// 遗传特征
function inheritTraits(parent1, parent2) {
  // 品种遗传（随机选一个）
  const breed = Math.random() < 0.5 ? parent1.breed : parent2.breed;
  
  // 毛色遗传（随机选一个或混合）
  const colorRoll = Math.random();
  let color;
  if (colorRoll < 0.4) color = parent1.color;
  else if (colorRoll < 0.8) color = parent2.color;
  else color = randomChoice(COLORS); // 变异
  
  // 眼睛颜色遗传
  const eyesRoll = Math.random();
  let eyes;
  if (eyesRoll < 0.4) eyes = parent1.eyes;
  else if (eyesRoll < 0.8) eyes = parent2.eyes;
  else eyes = randomChoice(EYE_COLORS); // 变异
  
  // 性格遗传（随机选一个）
  const personality = Math.random() < 0.5 ? parent1.personality : parent2.personality;
  
  return { breed, color, eyes, personality };
}

// ============================================
// 核心功能
// ============================================

// 获取用户等级和猫窝容量
function getUserLevel(userData) {
  const exp = userData.exp || 0;
  const level = Math.floor(Math.sqrt(exp / 100)) + 1;
  
  // 等级对应的猫窝容量（更宽松）
  let maxCats = 2;  // 初始就可以养 2 只
  if (level >= 3) maxCats = 3;
  if (level >= 5) maxCats = 4;
  if (level >= 8) maxCats = 5;
  
  return {
    level,
    exp,
    nextLevelExp: level * level * 100,
    maxCats,
    currentCats: userData.cats?.length || 0
  };
}

// 生成随机猫咪
function generateRandomCat(options = {}) {
  const breed = weightedRandom(BREEDS, b => 1 / b.rarity);
  const color = options.color || COLORS[Math.floor(Math.random() * COLORS.length)];
  const eyes = options.eyes || (Math.random() < 0.1 ? '异色瞳' : EYE_COLORS[Math.floor(Math.random() * (EYE_COLORS.length - 1))]);
  const gender = options.gender || (Math.random() < 0.5 ? '公' : '母');
  const personality = options.personality || PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
  
  // 年龄阶段
  const ageStage = options.ageStage || (Math.random() < 0.3 ? 'kitten' : 'adult');
  const ageDays = ageStage === 'kitten' ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 300) + 60;
  
  // 生成名字
  const name = options.name || (() => {
    const namePrefix = gender === '公' ? ['小', '阿', '大'] : ['小', '咪', '妞'];
    const nameSuffix = ['球', '咪', '宝', '豆', '糖', '团', '仔', '妹'];
    return namePrefix[Math.floor(Math.random() * namePrefix.length)] + 
           nameSuffix[Math.floor(Math.random() * nameSuffix.length)];
  })();
  
  return {
    name,
    breed: breed.name,
    color,
    eyes,
    gender,
    personality,
    ageStage,
    ageDays,
    breedTraits: breed.traits
  };
}

// 创建猫咪
function createCat(userId, options = {}) {
  let userData = loadUserData(userId);
  if (!userData) {
    // 初始化用户数据
    userData = {
      userId,
      cats: [],
      relationships: {},
      exp: 0,
      level: 1,
      createdAt: new Date().toISOString()
    };
  }
  
  // 检查猫窝容量
  const levelInfo = getUserLevel(userData);
  if (userData.cats.length >= levelInfo.maxCats) {
    return {
      error: `猫窝已满！当前等级可养${levelInfo.maxCats}只猫`,
      levelInfo
    };
  }
  
  const randomCat = generateRandomCat(options);
  const catId = generateId();
  
  const cat = {
    id: catId,
    userId,
    name: options.name || randomCat.name,
    breed: options.breed || randomCat.breed,
    color: options.color || randomCat.color,
    eyes: options.eyes || randomCat.eyes,
    gender: options.gender || randomCat.gender,
    personality: options.personality || randomCat.personality,
    birthDate: options.birthDate || new Date().toISOString(),
    ageDays: randomCat.ageDays,
    ageStage: randomCat.ageStage,
    stats: {
      energy: 100,
      mood: 100,
      hunger: 100,
      cleanliness: 100
    },
    achievements: [],
    interactions: 0,
    level: 1,
    exp: 0,
    lastInteraction: Date.now(),
    cooldowns: {},
    // 社交相关
    relationships: {}, // 与其他猫的关系
    memories: [], // 记忆
    parents: options.parents || null, // 父母信息
    children: [], // 孩子 ID 列表
    mate: null, // 配偶
    // 计数统计
    feedCount: 0,
    playCount: 0,
    batheCount: 0,
    sleepCount: 0,
    petCount: 0,
    eventCount: 0,
    perfectDays: 0,
    loginStreak: 0
  };
  
  // 保存猫咪数据
  saveCatData(catId, cat);
  
  // 添加到用户猫咪列表
  userData.cats.push(catId);
  saveUserData(userId, userData);
  
  return {
    success: true,
    cat,
    levelInfo
  };
}

// 获取用户所有猫咪
function getUserCats(userId) {
  const userData = loadUserData(userId);
  if (!userData || !userData.cats) {
    return { cats: [], levelInfo: getUserLevel({ cats: [] }) };
  }
  
  const cats = userData.cats
    .map(catId => loadCatData(catId))
    .filter(cat => cat !== null);
  
  return {
    cats,
    levelInfo: getUserLevel(userData),
    userData
  };
}

// 获取猫咪状态描述
function getStatusDescription(stats) {
  const avg = (stats.energy + stats.mood + stats.hunger + stats.cleanliness) / 4;
  
  if (avg >= 80) return { text: '完美 ✨', emoji: '🌟' };
  if (avg >= 60) return { text: '开心 😊', emoji: '😊' };
  if (avg >= 40) return { text: '一般 😐', emoji: '😐' };
  if (avg >= 20) return { text: '需要关心 😟', emoji: '😟' };
  return { text: '危险 😷', emoji: '😷' };
}

// 添加记忆
function addMemory(catId, memory) {
  const cat = loadCatData(catId);
  if (!cat) return false;
  
  // 添加时间戳
  memory.date = new Date().toISOString();
  
  // 添加到记忆列表
  cat.memories = cat.memories || [];
  cat.memories.push(memory);
  
  // 限制记忆数量（保留最重要的 100 条）
  if (cat.memories.length > 100) {
    // 保留重要记忆
    cat.memories = cat.memories
      .filter(m => m.important)
      .concat(cat.memories.filter(m => !m.important).slice(-50));
  }
  
  saveCatData(catId, cat);
  return true;
}

// 获取猫咪记忆
function getCatMemories(catId, options = {}) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  const memories = cat.memories || [];
  
  // 筛选
  let filtered = memories;
  if (options.type) {
    filtered = memories.filter(m => m.type === options.type);
  }
  if (options.important !== undefined) {
    filtered = filtered.filter(m => m.important === options.important);
  }
  
  // 排序（最新的在前）
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 分页
  const limit = options.limit || 20;
  const offset = options.offset || 0;
  
  return {
    memories: filtered.slice(offset, offset + limit),
    total: filtered.length,
    cat
  };
}

// 更新猫咪关系
function updateRelationship(cat1Id, cat2Id, intimacyChange, interactionType) {
  const cat1 = loadCatData(cat1Id);
  const cat2 = loadCatData(cat2Id);
  
  if (!cat1 || !cat2) return { error: '猫咪不存在' };
  
  // 确保两只猫属于同一个用户
  if (cat1.userId !== cat2.userId) {
    return { error: '只能管理同一用户的猫咪关系' };
  }
  
  const userData = loadUserData(cat1.userId);
  const relationshipKey = [cat1Id, cat2Id].sort().join('_');
  
  // 获取或创建关系
  let relationship = userData.relationships[relationshipKey];
  if (!relationship) {
    relationship = {
      cat1Id,
      cat2Id,
      intimacy: 0,
      interactions: 0,
      lastMeet: new Date().toISOString(),
      memories: []
    };
  }
  
  // 更新亲密度
  relationship.intimacy = Math.min(100, Math.max(0, relationship.intimacy + intimacyChange));
  relationship.interactions++;
  relationship.lastMeet = new Date().toISOString();
  
  // 添加关系记忆
  if (interactionType) {
    relationship.memories.push({
      date: new Date().toISOString(),
      type: interactionType,
      intimacyChange
    });
    
    // 限制记忆数量
    if (relationship.memories.length > 20) {
      relationship.memories = relationship.memories.slice(-20);
    }
  }
  
  // 保存关系
  userData.relationships[relationshipKey] = relationship;
  saveUserData(cat1.userId, userData);
  
  // 更新猫咪的关系记录
  if (!cat1.relationships) cat1.relationships = {};
  cat1.relationships[cat2Id] = relationship.intimacy;
  saveCatData(cat1Id, cat1);
  
  if (!cat2.relationships) cat2.relationships = {};
  cat2.relationships[cat1Id] = relationship.intimacy;
  saveCatData(cat2Id, cat2);
  
  return {
    success: true,
    relationship: {
      ...relationship,
      description: getRelationshipDescription(relationship.intimacy)
    }
  };
}

// 获取猫咪关系
function getCatRelationships(catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  const userData = loadUserData(cat.userId);
  const relationships = [];
  
  for (const [key, rel] of Object.entries(userData.relationships || {})) {
    if (key.includes(catId)) {
      const otherCatId = key.replace(catId + '_', '').replace('_' + catId, '');
      const otherCat = loadCatData(otherCatId);
      if (otherCat) {
        relationships.push({
          cat: otherCat,
          intimacy: rel.intimacy,
          interactions: rel.interactions,
          lastMeet: rel.lastMeet,
          description: getRelationshipDescription(rel.intimacy)
        });
      }
    }
  }
  
  return { relationships, cat };
}

// 猫咪互动（社交）
function catSocialInteraction(cat1Id, cat2Id, interactionType) {
  const cat1 = loadCatData(cat1Id);
  const cat2 = loadCatData(cat2Id);
  
  if (!cat1 || !cat2) return { error: '有猫咪不存在' };
  if (cat1.userId !== cat2.userId) return { error: '只能让同一用户的猫咪互动' };
  
  // 获取关系
  const relationshipKey = [cat1Id, cat2Id].sort().join('_');
  const userData = loadUserData(cat1.userId);
  const relationship = userData.relationships[relationshipKey];
  const currentIntimacy = relationship ? relationship.intimacy : 0;
  
  // 根据互动类型和关系计算结果
  const interactionResults = {
    'meet': { // 见面
      baseIntimacy: 10,
      outcomes: [
        { text: '互相闻了闻', intimacy: 5 },
        { text: '友好地蹭蹭', intimacy: 10 },
        { text: '保持距离观察', intimacy: 2 },
        { text: '一起玩耍', intimacy: 15 }
      ]
    },
    'play': { // 玩耍
      baseIntimacy: 15,
      outcomes: [
        { text: '追逐打闹', intimacy: 15 },
        { text: '互相舔毛', intimacy: 20 },
        { text: '抢玩具', intimacy: -5 },
        { text: '一起发呆', intimacy: 10 }
      ]
    },
    'eat': { // 一起吃饭
      baseIntimacy: 10,
      outcomes: [
        { text: '分享食物', intimacy: 15 },
        { text: '抢食', intimacy: -10 },
        { text: '各吃各的', intimacy: 5 }
      ]
    },
    'sleep': { // 一起睡觉
      baseIntimacy: 20,
      outcomes: [
        { text: '依偎在一起', intimacy: 25 },
        { text: '各睡各的', intimacy: 10 },
        { text: '抢地盘', intimacy: -5 }
      ]
    }
  };
  
  const interaction = interactionResults[interactionType];
  if (!interaction) return { error: '未知的互动类型' };
  
  // 根据关系选择结果
  let outcome;
  if (currentIntimacy >= 70) {
    // 关系好，大概率好结果
    outcome = interaction.outcomes.filter(o => o.intimacy > 0)[
      Math.floor(Math.random() * (interaction.outcomes.length - 1))
    ] || interaction.outcomes[0];
  } else if (currentIntimacy >= 30) {
    // 关系一般
    outcome = randomChoice(interaction.outcomes);
  } else {
    // 关系差，大概率坏结果
    outcome = interaction.outcomes.filter(o => o.intimacy <= 0)[0] || 
              randomChoice(interaction.outcomes);
  }
  
  // 更新关系
  const intimacyChange = outcome.intimacy;
  updateRelationship(cat1Id, cat2Id, intimacyChange, interactionType);
  
  // 添加记忆
  addMemory(cat1Id, {
    type: 'social',
    description: `和${cat2.name}${outcome.text}`,
    with: cat2.name,
    important: intimacyChange > 15
  });
  
  addMemory(cat2Id, {
    type: 'social',
    description: `和${cat1.name}${outcome.text}`,
    with: cat1.name,
    important: intimacyChange > 15
  });
  
  // 获取性格反应
  const reaction1 = randomChoice(PERSONALITY_REACTIONS[cat1.personality].meet);
  const reaction2 = randomChoice(PERSONALITY_REACTIONS[cat2.personality].meet);
  
  return {
    success: true,
    outcome: outcome.text,
    intimacyChange,
    newRelationship: getRelationshipDescription(currentIntimacy + intimacyChange),
    reactions: {
      cat1: `${cat1.name}${reaction1}`,
      cat2: `${cat2.name}${reaction2}`
    },
    quotes: {
      cat1: randomChoice(CAT_QUOTES[cat1.personality]),
      cat2: randomChoice(CAT_QUOTES[cat2.personality])
    }
  };
}

// 繁殖系统
function breedCats(cat1Id, cat2Id) {
  const cat1 = loadCatData(cat1Id);
  const cat2 = loadCatData(cat2Id);
  
  if (!cat1 || !cat2) return { error: '有猫咪不存在' };
  if (cat1.gender === cat2.gender) return { error: '需要一公一母' };
  if (cat1.ageStage === 'kitten' || cat2.ageStage === 'kitten') {
    return { error: '小猫不能繁殖' };
  }
  
  // 检查关系
  const relationshipKey = [cat1Id, cat2Id].sort().join('_');
  const userData = loadUserData(cat1.userId);
  const relationship = userData.relationships[relationshipKey];
  const intimacy = relationship ? relationship.intimacy : 0;
  
  if (intimacy < 50) {
    return { 
      error: '亲密度不够！需要达到"好朋友"级别（50 亲密度）',
      currentIntimacy: intimacy
    };
  }
  
  // 检查冷却
  const now = Date.now();
  if (cat1.cooldowns?.breed && now < cat1.cooldowns.breed) {
    return { error: '猫咪还在恢复期' };
  }
  if (cat2.cooldowns?.breed && now < cat2.cooldowns.breed) {
    return { error: '猫咪还在恢复期' };
  }
  
  // 怀孕判定（70% 成功率）
  const pregnant = Math.random() < 0.7;
  
  if (!pregnant) {
    return {
      success: true,
      pregnant: false,
      message: '两只猫咪尝试繁殖，但没有成功...（成功率 70%）'
    };
  }
  
  // 确定猫妈妈
  const mother = cat1.gender === '母' ? cat1 : cat2;
  const father = cat1.gender === '母' ? cat2 : cat1;
  
  // 怀孕期（3 天）
  const pregnancyDays = 3;
  const dueDate = new Date(Date.now() + pregnancyDays * 24 * 60 * 60 * 1000);
  
  // 设置冷却（90 天）
  cat1.cooldowns = cat1.cooldowns || {};
  cat1.cooldowns.breed = Date.now() + 90 * 24 * 60 * 60 * 1000;
  cat2.cooldowns.breed = Date.now() + 90 * 24 * 60 * 60 * 1000;
  
  saveCatData(cat1Id, cat1);
  saveCatData(cat2Id, cat2);
  
  // 设置配偶
  mother.mate = father.id;
  father.mate = mother.id;
  saveCatData(mother.id, mother);
  saveCatData(father.id, father);
  
  // 添加记忆
  addMemory(mother.id, {
    type: 'romance',
    description: `和${father.name}成为了配偶，怀孕了！`,
    important: true
  });
  
  addMemory(father.id, {
    type: 'romance',
    description: `和${mother.name}成为了配偶，即将有孩子了！`,
    important: true
  });
  
  // 更新关系
  updateRelationship(cat1Id, cat2Id, 30, 'breed');
  
  return {
    success: true,
    pregnant: true,
    mother: mother.name,
    father: father.name,
    dueDate,
    pregnancyDays,
    message: `恭喜！${mother.name}怀孕了！预计${pregnancyDays}天后生产~`
  };
}

// 生产小猫
function giveBirth(catId) {
  const mother = loadCatData(catId);
  if (!mother) return { error: '猫咪不存在' };
  if (mother.gender !== '母') return { error: '只有母猫能生产' };
  if (!mother.mate) return { error: '没有找到配偶' };
  
  const father = loadCatData(mother.mate);
  if (!father) return { error: '配偶不存在' };
  
  // 随机小猫数量（1-4 只）
  const kittenCount = Math.floor(Math.random() * 4) + 1;
  const kittens = [];
  
  const userId = mother.userId;
  
  for (let i = 0; i < kittenCount; i++) {
    // 遗传特征
    const traits = inheritTraits(mother, father);
    
    // 创建小猫
    const kittenResult = createCat(userId, {
      name: `小猫${String.fromCharCode(65 + i)}`, // 小猫 A, 小猫 B...
      breed: traits.breed,
      color: traits.color,
      eyes: traits.eyes,
      gender: Math.random() < 0.5 ? '公' : '母',
      personality: traits.personality,
      ageStage: 'kitten',
      birthDate: new Date().toISOString(),
      parents: {
        mother: mother.id,
        father: father.id
      }
    });
    
    if (kittenResult.success) {
      const kitten = kittenResult.cat;
      kittens.push(kitten);
      
      // 更新父母的孩子列表
      mother.children.push(kitten.id);
      father.children.push(kitten.id);
      
      // 添加记忆
      addMemory(mother.id, {
        type: 'birth',
        description: `生下了${kitten.name}（${kitten.gender}）`,
        important: true
      });
    }
  }
  
  saveCatData(mother.id, mother);
  saveCatData(father.id, father);
  
  // 清除配偶关系
  mother.mate = null;
  father.mate = null;
  saveCatData(mother.id, mother);
  saveCatData(father.id, father);
  
  return {
    success: true,
    kittenCount,
    kittens: kittens.map(k => ({
      name: k.name,
      gender: k.gender,
      breed: k.breed,
      color: k.color
    })),
    message: `恭喜！${mother.name}生下了${kittenCount}只可爱的小猫！`
  };
}

// 互动 - 喂食
function feed(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '还没有猫咪，先创建一只吧！' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  // 检查冷却
  const cooldown = cat.cooldowns?.feed || 0;
  if (Date.now() < cooldown) {
    const waitMinutes = Math.ceil((cooldown - Date.now()) / 60000);
    return { 
      success: false,
      error: '还在消化中',
      waitMinutes
    };
  }
  
  // 应用效果
  cat.stats.hunger = Math.min(100, cat.stats.hunger + 30);
  cat.stats.cleanliness = Math.max(0, cat.stats.cleanliness - 5);
  cat.interactions = (cat.interactions || 0) + 1;
  cat.feedCount = (cat.feedCount || 0) + 1;
  cat.cooldowns = cat.cooldowns || {};
  cat.cooldowns.feed = Date.now() + 2 * 60 * 60 * 1000;
  
  // 获取性格反应（规则系统）
  const reaction = randomChoice(PERSONALITY_REACTIONS[cat.personality].feed);
  const quote = randomChoice(CAT_QUOTES[cat.personality]);
  
  // 触发随机事件
  const event = triggerRandomEvent(cat);
  
  // 添加记忆
  addMemory(cat.id, {
    type: 'feed',
    description: '主人喂我吃饭了',
    important: false
  });
  
  // 增加经验
  addExp(userId, 10);
  
  saveCatData(catId, cat);
  const newAchievements = checkAchievements(userId, cat);
  
  // 返回结构化数据（由 Agent LLM 格式化）
  return {
    success: true,
    action: 'feed',
    cat: {
      name: cat.name,
      personality: cat.personality
    },
    reaction,
    quote,
    event,
    stats: cat.stats,
    cooldown: 120,
    achievements: newAchievements
  };
}

// 互动 - 玩耍
function play(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '还没有猫咪，先创建一只吧！' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const cooldown = cat.cooldowns?.play || 0;
  if (Date.now() < cooldown) {
    const waitMinutes = Math.ceil((cooldown - Date.now()) / 60000);
    return { 
      success: false,
      error: '刚玩过，需要休息',
      waitMinutes
    };
  }
  
  cat.stats.mood = Math.min(100, cat.stats.mood + 20);
  cat.stats.energy = Math.max(0, cat.stats.energy - 15);
  cat.interactions = (cat.interactions || 0) + 1;
  cat.playCount = (cat.playCount || 0) + 1;
  cat.cooldowns = cat.cooldowns || {};
  cat.cooldowns.play = Date.now() + 1 * 60 * 60 * 1000;
  
  const reaction = randomChoice(PERSONALITY_REACTIONS[cat.personality].play);
  const quote = randomChoice(CAT_QUOTES[cat.personality]);
  const event = triggerRandomEvent(cat);
  
  addMemory(cat.id, {
    type: 'play',
    description: '和主人一起玩耍',
    important: false
  });
  
  addExp(userId, 15);
  
  saveCatData(catId, cat);
  const newAchievements = checkAchievements(userId, cat);
  
  return {
    success: true,
    action: 'play',
    cat: {
      name: cat.name,
      personality: cat.personality
    },
    reaction,
    quote,
    event,
    stats: cat.stats,
    cooldown: 60,
    achievements: newAchievements,
    evolution: checkEvolutionAfterInteraction(catId, 'play')
  };
}

// 互动 - 洗澡
function bathe(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '还没有猫咪，先创建一只吧！' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const cooldown = cat.cooldowns?.bathe || 0;
  if (Date.now() < cooldown) {
    const waitHours = Math.ceil((cooldown - Date.now()) / 3600000);
    return { 
      success: false,
      error: '刚洗过澡',
      waitHours
    };
  }
  
  cat.stats.cleanliness = Math.min(100, cat.stats.cleanliness + 40);
  cat.stats.mood = Math.max(0, cat.stats.mood - 10);
  cat.interactions = (cat.interactions || 0) + 1;
  cat.batheCount = (cat.batheCount || 0) + 1;
  cat.cooldowns = cat.cooldowns || {};
  cat.cooldowns.bathe = Date.now() + 4 * 60 * 60 * 1000;
  
  const reaction = randomChoice(PERSONALITY_REACTIONS[cat.personality].bathe);
  const quote = randomChoice(CAT_QUOTES[cat.personality]);
  const event = triggerRandomEvent(cat);
  
  addMemory(cat.id, {
    type: 'bathe',
    description: '洗澡了（不太开心）',
    important: false
  });
  
  addExp(userId, 10);
  
  saveCatData(catId, cat);
  const newAchievements = checkAchievements(userId, cat);
  
  return {
    success: true,
    action: 'bathe',
    cat: { name: cat.name, personality: cat.personality },
    reaction,
    quote,
    event,
    stats: cat.stats,
    cooldown: 240,
    achievements: newAchievements
  };
}

// 互动 - 睡觉
function sleep(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '还没有猫咪，先创建一只吧！' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const cooldown = cat.cooldowns.sleep || 0;
  if (Date.now() < cooldown) {
    const waitHours = Math.ceil((cooldown - Date.now()) / 3600000);
    return { error: `${cat.name}还不困，${waitHours}小时后再睡吧~` };
  }
  
  const energyGain = 50;
  const hungerLoss = 10;
  
  cat.stats.energy = Math.min(100, cat.stats.energy + energyGain);
  cat.stats.hunger = Math.max(0, cat.stats.hunger - hungerLoss);
  cat.interactions++;
  cat.sleepCount = (cat.sleepCount || 0) + 1;
  cat.cooldowns.sleep = Date.now() + 6 * 60 * 60 * 1000;
  
  const reaction = randomChoice(PERSONALITY_REACTIONS[cat.personality].sleep);
  const quote = randomChoice(CAT_QUOTES[cat.personality]);
  const event = triggerRandomEvent(cat);
  
  addMemory(cat.id, {
    type: 'sleep',
    description: '睡了一觉',
    important: false
  });
  
  addExp(userId, 10);
  
  saveCatData(catId, cat);
  const newAchievements = checkAchievements(userId, cat);
  
  return {
    success: true,
    message: `${cat.name}${reaction}`,
    quote,
    event,
    stats: cat.stats,
    achievements: newAchievements
  };
}

// 互动 - 摸摸
function pet(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '还没有猫咪，先创建一只吧！' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const cooldown = cat.cooldowns?.pet || 0;
  if (Date.now() < cooldown) {
    const waitMinutes = Math.ceil((cooldown - Date.now()) / 60000);
    return { 
      success: false,
      error: '刚被摸过',
      waitMinutes
    };
  }
  
  cat.stats.mood = Math.min(100, cat.stats.mood + 10);
  cat.interactions = (cat.interactions || 0) + 1;
  cat.petCount = (cat.petCount || 0) + 1;
  cat.cooldowns = cat.cooldowns || {};
  cat.cooldowns.pet = Date.now() + 30 * 60 * 1000;
  
  const reaction = randomChoice(PERSONALITY_REACTIONS[cat.personality].pet);
  const quote = randomChoice(CAT_QUOTES[cat.personality]);
  const event = triggerRandomEvent(cat);
  
  addMemory(cat.id, {
    type: 'pet',
    description: '主人摸摸我，好舒服~',
    important: false
  });
  
  addExp(userId, 5);
  
  saveCatData(catId, cat);
  const newAchievements = checkAchievements(userId, cat);
  
  return {
    success: true,
    action: 'pet',
    cat: { name: cat.name, personality: cat.personality },
    reaction,
    quote,
    event,
    stats: cat.stats,
    cooldown: 30,
    achievements: newAchievements
  };
}

// 增加经验
function addExp(userId, exp) {
  const userData = loadUserData(userId);
  if (!userData) return null;
  
  userData.exp = (userData.exp || 0) + exp;
  const oldLevel = getUserLevel(userData).level;
  
  saveUserData(userId, userData);
  
  const newLevel = getUserLevel(userData).level;
  const leveledUp = newLevel > oldLevel;
  
  return {
    exp: userData.exp,
    level: newLevel,
    leveledUp,
    nextLevelExp: newLevel * newLevel * 100
  };
}

// 触发随机事件
function triggerRandomEvent(cat) {
  if (Math.random() > 0.1) return null;
  
  const event = randomChoice(RANDOM_EVENTS);
  const desc = randomChoice(event.desc);
  
  if (event.effect.mood) cat.stats.mood = Math.min(100, Math.max(0, cat.stats.mood + event.effect.mood));
  if (event.effect.energy) cat.stats.energy = Math.min(100, Math.max(0, cat.stats.energy + event.effect.energy));
  if (event.effect.hunger) cat.stats.hunger = Math.min(100, Math.max(0, cat.stats.hunger + event.effect.hunger));
  if (event.effect.cleanliness) cat.stats.cleanliness = Math.max(0, cat.stats.cleanliness + event.effect.cleanliness);
  
  cat.eventCount = (cat.eventCount || 0) + 1;
  
  addMemory(cat.id, {
    type: 'event',
    description: event.desc,
    important: true
  });
  
  return {
    name: event.name,
    icon: event.icon,
    desc,
    quote: event.quote,
    effects: event.effect
  };
}

// 检查成就
function checkAchievements(userId, cat) {
  const newAchievements = [];
  const userData = loadUserData(userId);
  
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (!cat.achievements.includes(key) && achievement.check(cat, userData)) {
      newAchievements.push({
        key,
        ...achievement
      });
    }
  }
  
  if (newAchievements.length > 0) {
    newAchievements.forEach(a => cat.achievements.push(a.key));
    saveCatData(cat.id, cat);
  }
  
  return newAchievements;
}

// 查看状态
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
    interactions: cat.interactions || 0
  };
}

// 获取成就列表
function getAchievements(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  
  const userData = loadUserData(userId);
  const allAchievements = [];
  
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    const unlocked = cat.achievements.includes(key);
    allAchievements.push({
      key,
      ...achievement,
      unlocked,
      name: (achievement.hidden && !unlocked) ? '???' : (achievement.realName || achievement.name),
      desc: (achievement.hidden && !unlocked) ? '???' : (achievement.realDesc || achievement.desc)
    });
  }
  
  return {
    success: true,
    achievements: allAchievements,
    unlocked: cat.achievements.length,
    total: Object.keys(ACHIEVEMENTS).length
  };
}

// 删除猫咪
function deleteCat(userId, catId) {
  const cat = loadCatData(catId);
  if (!cat) return { error: '猫咪不存在' };
  if (cat.userId !== userId) return { error: '这不是你的猫咪' };
  
  const filePath = getCatDataPath(catId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  const userData = loadUserData(userId);
  if (userData) {
    userData.cats = userData.cats.filter(id => id !== catId);
    saveUserData(userId, userData);
  }
  
  return { success: true, message: '猫咪数据已删除' };
}

module.exports = {
  // ========== 核心工具函数 (供 Agent 调用) ==========
  
  // 猫咪管理
  createCat,
  getUserCats,
  deleteCat,
  
  // 基础互动
  feed,
  play,
  bathe,
  sleep,
  pet,
  
  // 查询
  getStatus,
  getAchievements,
  
  // ========== 内部工具函数 ==========
  
  // 数据操作
  loadCatData,
  loadUserData,
  
  // 常量
  ACHIEVEMENTS,
  PERSONALITIES,
  BREEDS,
  
  // ========== 进化系统 ==========
  
  checkEvolutionAfterInteraction
};

/**
 * 交互后检查进化
 * @param {string} catId - 猫咪 ID
 * @param {string} actionType - 互动类型
 * @returns {Promise<object>} 进化结果
 */
async function checkEvolutionAfterInteraction(catId, actionType) {
  try {
    const cat = loadCatData(catId);
    if (!cat) return null;
    
    const context = {
      description: `猫咪刚刚进行了${actionType}互动`,
      actionType,
      cat
    };
    
    const { results, messages } = await evolution.checkAndProcessEvolution(catId, context);
    
    if (results.length > 0) {
      return {
        triggered: true,
        results,
        messages
      };
    }
    
    return { triggered: false };
  } catch (error) {
    console.error('[进化检查] 失败:', error.message);
    return { triggered: false, error: error.message };
  }
}
