/**
 * 🎾 玩具系统 - 猫咪玩具玩法的进化与管理
 * Toy System - Cat Toy Play Evolution & Management
 */

const { IEvolvable, callLLM, parseLLMJson, generateId, rollRarity } = require('./evolvable');

/**
 * 基础玩具库
 */
const BASE_TOYS = [
  { id: 'ball_basic', name: '基础小球', icon: '⚽', category: 'ball', price: 50 },
  { id: 'feather_basic', name: '羽毛逗猫棒', icon: '🪶', category: 'wand', price: 80 },
  { id: 'mouse_basic', name: '毛绒老鼠', icon: '🐭', category: 'plush', price: 60 },
  { id: 'laser', name: '激光笔', icon: '🔴', category: 'electronic', price: 180 },
  { id: 'tunnel', name: '猫咪隧道', icon: '🕳️', category: 'structure', price: 300 },
  { id: 'cat_tree', name: '猫爬架', icon: '🌳', category: 'furniture', price: 800 }
];

/**
 * 基础玩法模板
 */
const BASE_PLAYS = {
  ball: ['追球', '扑球', '顶球'],
  wand: ['跳跃抓', '追逐', '扑咬'],
  plush: ['抱着咬', '踢', '叼着走'],
  electronic: ['追光点', '观察', '突袭'],
  structure: ['钻洞', '躲藏', '探索'],
  furniture: ['爬高', '磨爪', '眺望']
};

class ToySystem extends IEvolvable {
  constructor(catId) {
    super(catId, 'toys');
  }
  
  /**
   * 获取当前可用玩具和玩法
   */
  getAvailableItems() {
    const cat = this.getCat();
    if (!cat) return { toys: [], plays: [], custom: [] };
    
    const ownedToys = cat.toys?.owned || [];
    const toyPlays = cat.toys?.plays || {};
    const customPlays = cat.toys?.customPlays || [];
    
    return {
      toys: ownedToys.length > 0 ? ownedToys : BASE_TOYS.slice(0, 2),
      plays: toyPlays,
      custom: customPlays
    };
  }
  
  /**
   * LLM 选择玩具玩法
   */
  async selectItem(context) {
    const cat = this.getCat();
    const available = this.getAvailableItems();
    
    const prompt = this.buildPrompt(`
你是{catName}，一只{personality}的猫咪。

【当前状态】
精力：{energy}/100  心情：{mood}/100

【你的玩具】
{toyList}

【你会的玩法】
{playList}

【当前情境】
{context}

请选择一个玩具和玩法。

输出 JSON:
{
  "selectedToy": "玩具 ID",
  "selectedPlay": "玩法",
  "reason": "选择理由",
  "enjoyment": 1~5
}`, {
      catName: cat.name,
      personality: cat.personality,
      energy: cat.stats.energy,
      mood: cat.stats.mood,
      toyList: available.toys.map(t => `${t.icon} ${t.name}`).join(', '),
      playList: JSON.stringify(available.plays),
      context: context.description || '想玩耍'
    });
    
    return parseLLMJson(await callLLM(prompt));
  }
  
  /**
   * 判断是否需要新玩法
   */
  async needsNewItem(context) {
    const cat = this.getCat();
    const available = this.getAvailableItems();
    
    // 如果玩具玩了很久，可能需要新玩法
    const toy = context.toy;
    if (toy) {
      const playCount = available.plays[toy.id]?.count || 0;
      if (playCount >= 20) {
        return true;
      }
    }
    
    // 如果心情特别好或特别差，可能发明新玩法
    if (cat.stats.mood > 85 || cat.stats.mood < 30) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 创建新玩法
   */
  async createNewItem(context) {
    const cat = this.getCat();
    const toy = context.toy;
    
    const prompt = this.buildPrompt(`
{catName}({personality})正在玩{toyName}，但它想要点新花样！

【当前状态】
心情：{mood}/100  精力：{energy}/100

【现有玩法】
{existingPlays}

请设计一个新的玩法：

输出 JSON:
{
  "id": "play_{timestamp}",
  "toyId": "玩具 ID",
  "name": "玩法名称 (2-6 字)",
  "description": "玩法描述 (10-30 字)",
  "category": "娱乐/运动/智力",
  "effects": {
    "mood": 5~20,
    "energy": -5~-20,
    "exercise": 5~20
  },
  "difficulty": "easy/medium/hard",
  "rarity": "common/uncommon/rare/epic/legendary",
  "story": "这个玩法是如何被发现的"
}`, {
      catName: cat.name,
      personality: cat.personality,
      toyName: toy?.name || '玩具',
      mood: cat.stats.mood,
      energy: cat.stats.energy,
      existingPlays: JSON.stringify(this.getAvailableItems().plays)
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    if (!result) return null;
    
    result.id = generateId('play');
    result.rarity = result.rarity || rollRarity();
    result.createdAt = Date.now();
    result.discoveredBy = cat.name;
    result.playCount = 0;
    
    return result;
  }
  
  /**
   * 添加新玩法到猫咪
   */
  addItem(item) {
    const cat = this.getCat();
    if (!cat) return false;
    
    if (!cat.toys) cat.toys = { owned: [], plays: {}, customPlays: [] };
    
    // 添加到对应玩具的玩法列表
    if (item.toyId) {
      if (!cat.toys.plays[item.toyId]) {
        cat.toys.plays[item.toyId] = [];
      }
      
      // 检查是否已存在
      const exists = cat.toys.plays[item.toyId].some(p => p.id === item.id);
      if (!exists) {
        cat.toys.plays[item.toyId].push(item);
        cat.toys.customPlays.push(item);
        this.saveCat(cat);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 检查玩法进化
   */
  async checkEvolution(item) {
    const playCount = item.playCount || 0;
    
    // 玩法使用 30 次可以进化
    if (playCount >= 30) {
      const cat = this.getCat();
      
      const prompt = this.buildPrompt(`
{catName}的"{playName}"玩法已经玩了{playCount}次，非常熟练！

【玩法信息】
描述：{description}
难度：{difficulty}

它可以：
1. 进化成更高级的玩法
2. 衍生出变体玩法
3. 保持不变

请决定进化方向并设计新玩法。

输出 JSON:
{
  "shouldEvolve": true/false,
  "evolutionType": "upgrade/variant/none",
  "newPlay": { 进化后的玩法 },
  "story": "进化故事"
}`, {
        catName: cat.name,
        playName: item.name,
        playCount: playCount,
        description: item.description,
        difficulty: item.difficulty
      });
      
      const result = parseLLMJson(await callLLM(prompt));
      if (result?.shouldEvolve) {
        return result;
      }
    }
    
    return null;
  }
  
  /**
   * 执行玩法进化
   */
  evolve(item, evolution) {
    const cat = this.getCat();
    if (!cat || !cat.toys) return false;
    
    // 标记原玩法为已进化
    item.evolved = true;
    item.evolvedTo = evolution.newPlay.id;
    
    // 添加新玩法
    evolution.newPlay.id = generateId('play');
    evolution.newPlay.createdAt = Date.now();
    evolution.newPlay.evolvedFrom = item.id;
    evolution.newPlay.playCount = 0;
    
    if (!cat.toys.plays[item.toyId]) {
      cat.toys.plays[item.toyId] = [];
    }
    cat.toys.plays[item.toyId].push(evolution.newPlay);
    cat.toys.customPlays.push(evolution.newPlay);
    
    this.saveCat(cat);
    return true;
  }
  
  /**
   * 记录玩法使用
   */
  recordPlay(toyId, playId) {
    const cat = this.getCat();
    if (!cat || !cat.toys) return;
    
    // 增加玩法使用次数
    if (cat.toys.plays[toyId]) {
      const play = cat.toys.plays[toyId].find(p => p.id === playId);
      if (play) {
        play.playCount = (play.playCount || 0) + 1;
      }
    }
    
    // 增加玩具使用次数
    const toy = cat.toys.owned?.find(t => t.id === toyId);
    if (toy) {
      toy.playCount = (toy.playCount || 0) + 1;
    }
    
    this.saveCat(cat);
  }
}

module.exports = ToySystem;
