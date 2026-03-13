/**
 * 🎭 动作系统 - 猫咪动作的进化与管理
 * Action System - Cat Action Evolution & Management
 */

const { IEvolvable, callLLM, parseLLMJson, generateId, rollRarity } = require('./evolvable');

/**
 * 基础本能动作（所有猫咪共有）
 */
const INSTINCT_ACTIONS = [
  { id: 'eat', name: '吃饭', category: '生存', unlocked: true },
  { id: 'drink', name: '喝水', category: '生存', unlocked: true },
  { id: 'sleep', name: '睡觉', category: '生存', unlocked: true },
  { id: 'groom', name: '舔毛', category: '清洁', unlocked: true }
];

/**
 * 性格动作模板
 */
const PERSONALITY_ACTIONS = {
  '活泼': [
    { id: 'jump_around', name: '上蹿下跳', category: '娱乐', unlockCondition: { mood: 60 } },
    { id: 'chase_toy', name: '追玩具', category: '娱乐', unlockCondition: { energy: 50 } }
  ],
  '温顺': [
    { id: 'cuddle', name: '求抱抱', category: '社交', unlockCondition: { trustLevel: 50 } },
    { id: 'purr', name: '呼噜呼噜', category: '社交', unlockCondition: { mood: 70 } }
  ],
  '高冷': [
    { id: 'ignore', name: '假装不理', category: '社交', unlockCondition: { mood: 50 } },
    { id: 'tail_flick', name: '甩尾巴', category: '表达', unlockCondition: { trustLevel: 40 } }
  ],
  '粘人': [
    { id: 'follow_owner', name: '跟着主人', category: '社交', unlockCondition: { trustLevel: 60 } },
    { id: 'demand_attention', name: '求关注', category: '社交', unlockCondition: { mood: 50 } }
  ],
  '独立': [
    { id: 'play_alone', name: '自己玩', category: '娱乐', unlockCondition: { energy: 60 } },
    { id: 'explore_alone', name: '独自探索', category: '探索', unlockCondition: { mood: 60 } }
  ],
  '好奇': [
    { id: 'investigate', name: '调查研究', category: '探索', unlockCondition: { mood: 70 } },
    { id: 'sniff_around', name: '到处闻闻', category: '探索', unlockCondition: { energy: 50 } }
  ],
  '胆小': [
    { id: 'hide', name: '躲起来', category: '生存', unlockCondition: { mood: 30 } },
    { id: 'peek', name: '偷偷看', category: '探索', unlockCondition: { trustLevel: 40 } }
  ],
  '霸道': [
    { id: 'demand_food', name: '命令喂食', category: '社交', unlockCondition: { hunger: 40 } },
    { id: 'claim_territory', name: '宣示领地', category: '表达', unlockCondition: { trustLevel: 70 } }
  ]
};

class ActionSystem extends IEvolvable {
  constructor(catId) {
    super(catId, 'actions');
  }
  
  /**
   * 获取当前可用动作
   */
  getAvailableItems() {
    const cat = this.getCat();
    if (!cat) return { instinct: [], personality: [], learned: [], custom: [] };
    
    // 获取性格动作
    const personalityActions = PERSONALITY_ACTIONS[cat.personality] || [];
    const unlockedPersonality = personalityActions.filter(action => 
      this.checkUnlockConditions(cat, action.unlockCondition)
    );
    
    return {
      instinct: INSTINCT_ACTIONS,
      personality: unlockedPersonality,
      learned: cat.actionSpace?.learned || [],
      custom: cat.actionSpace?.custom || []
    };
  }
  
  /**
   * 检查解锁条件
   */
  checkUnlockConditions(cat, conditions) {
    if (!conditions) return true;
    
    if (conditions.mood && cat.stats.mood < conditions.mood) return false;
    if (conditions.energy && cat.stats.energy < conditions.energy) return false;
    if (conditions.hunger && cat.stats.hunger < conditions.hunger) return false;
    if (conditions.trustLevel && (cat.trustLevel || 0) < conditions.trustLevel) return false;
    
    return true;
  }
  
  /**
   * LLM 选择动作
   */
  async selectItem(context) {
    const cat = this.getCat();
    const available = this.getAvailableItems();
    
    const prompt = this.buildPrompt(`
你是{catName}，一只{personality}的猫咪。

【当前状态】
精力：{energy}/100  心情：{mood}/100  饱食：{hunger}/100

【你会的动作】
本能：{instinctList}
性格动作：{personalityList}
习得动作：{learnedList}
自创动作：{customList}

【当前情境】
{context}

请从以上动作中选择一个最合适的。

输出 JSON:
{
  "selectedAction": "动作 ID",
  "category": "动作分类",
  "reason": "选择理由",
  "urgency": "low/medium/high/critical"
}`, {
      catName: cat.name,
      personality: cat.personality,
      energy: cat.stats.energy,
      mood: cat.stats.mood,
      hunger: cat.stats.hunger,
      instinctList: available.instinct.map(a => a.name).join(', '),
      personalityList: available.personality.map(a => a.name).join(', '),
      learnedList: available.learned.map(a => a.name).join(', ') || '无',
      customList: available.custom.map(a => a.name).join(', ') || '无',
      context: context.description || '日常'
    });
    
    const result = await callLLM(prompt);
    return parseLLMJson(result);
  }
  
  /**
   * 判断是否需要新动作
   */
  async needsNewItem(context) {
    const cat = this.getCat();
    const available = this.getAvailableItems();
    
    const prompt = this.buildPrompt(`
你是{catName}，一只{personality}的猫咪。

【当前情境】
{context}

【你会的动作】
{allActions}

问题：现有的动作能否完美表达你现在的想法？
如果现有动作足够，回答 false。
如果需要新动作，回答 true 并说明原因。

输出 JSON:
{
  "needsNew": true/false,
  "reason": "理由",
  "newActionIdea": "新动作想法（如果需要）"
}`, {
      catName: cat.name,
      personality: cat.personality,
      context: context.description,
      allActions: [
        ...available.instinct,
        ...available.personality,
        ...available.learned,
        ...available.custom
      ].map(a => a.name).join(', ')
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    return result?.needsNew || false;
  }
  
  /**
   * 创建新动作
   */
  async createNewItem(context) {
    const cat = this.getCat();
    
    const prompt = this.buildPrompt(`
{catName}({personality})遇到了以下情况：
{context}

现有的动作都无法完美表达它的需求。

请为它设计一个新动作：

输出 JSON:
{
  "id": "action_{timestamp}",
  "name": "动作名称 (2-6 字)",
  "description": "动作描述 (10-30 字)",
  "category": "生存/社交/娱乐/探索/表达",
  "triggerConditions": {
    "mood": { min: 0, max: 100 },
    "energy": { min: 0, max: 100 },
    "timeOfDay": ["morning", "afternoon", "night", "any"]
  },
  "effects": {
    "mood": -10~30,
    "energy": -20~20,
    "hunger": -20~30,
    "trust": -5~10
  },
  "cooldown": 600~7200,
  "rarity": "common/uncommon/rare/epic/legendary",
  "story": "这个动作是如何被发现的"
}`, {
      catName: cat.name,
      personality: cat.personality,
      context: context.description
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    if (!result) return null;
    
    // 生成 ID 和稀有度
    result.id = generateId('action');
    result.rarity = result.rarity || rollRarity();
    result.createdAt = Date.now();
    result.usageCount = 0;
    
    return result;
  }
  
  /**
   * 添加动作到猫咪
   */
  addItem(item) {
    const cat = this.getCat();
    if (!cat) return false;
    
    if (!cat.actionSpace) cat.actionSpace = { learned: [], custom: [] };
    
    // 检查是否已存在
    const allActions = [
      ...INSTINCT_ACTIONS,
      ...(PERSONALITY_ACTIONS[cat.personality] || []),
      ...cat.actionSpace.learned,
      ...cat.actionSpace.custom
    ];
    
    const exists = allActions.some(a => a.id === item.id);
    if (!exists) {
      cat.actionSpace.custom.push(item);
      this.saveCat(cat);
      return true;
    }
    
    return false;
  }
  
  /**
   * 检查动作进化
   */
  async checkEvolution(item) {
    const cat = this.getCat();
    const usageCount = item.usageCount || 0;
    
    // 使用次数达到 50 次可以进化
    if (usageCount >= 50) {
      const prompt = this.buildPrompt(`
{catName}的"{actionName}"动作已经使用了{usageCount}次，非常熟练！

【动作信息】
描述：{description}
当前等级：{level}

它可以：
1. 进化成更高级的版本
2. 衍生出变体动作
3. 保持不变

请决定进化方向并设计新动作。

输出 JSON:
{
  "shouldEvolve": true/false,
  "evolutionType": "upgrade/variant/none",
  "newAction": { 进化后的动作 },
  "story": "进化故事"
}`, {
        catName: cat.name,
        actionName: item.name,
        usageCount: usageCount,
        description: item.description,
        level: item.level || 1
      });
      
      const result = parseLLMJson(await callLLM(prompt));
      if (result?.shouldEvolve) {
        return result;
      }
    }
    
    return null;
  }
  
  /**
   * 执行动作进化
   */
  evolve(item, evolution) {
    const cat = this.getCat();
    if (!cat || !cat.actionSpace) return false;
    
    // 标记原动作为已进化
    item.evolved = true;
    item.evolvedTo = evolution.newAction.id;
    
    // 添加新动作
    evolution.newAction.id = generateId('action');
    evolution.newAction.createdAt = Date.now();
    evolution.newAction.evolvedFrom = item.id;
    evolution.newAction.level = (item.level || 1) + 1;
    
    cat.actionSpace.custom.push(evolution.newAction);
    this.saveCat(cat);
    
    return true;
  }
}

module.exports = ActionSystem;
