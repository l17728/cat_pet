/**
 * 💬 反应系统 - 猫咪反应的进化与管理
 * Reaction System - Cat Reaction Evolution & Management
 */

const { IEvolvable, callLLM, parseLLMJson, generateId, rollRarity } = require('./evolvable');

/**
 * 基础性格反应模板
 */
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
  },
  '独立': {
    feed: ['自己安静地吃', '吃完就去忙自己的事', '不需要你陪'],
    play: ['自己玩玩具', '偶尔看你一眼', '保持适当距离'],
    pet: ['让你摸但不主动', '摸一会儿就走开', '有自己的界限']
  },
  '好奇': {
    feed: ['先闻闻再吃', '用爪子拨弄食物', '对碗很感兴趣'],
    play: ['歪头研究玩具', '用爪子试探', '好奇地探索每个角落'],
    pet: ['闻闻你的手', '用头蹭蹭研究你', '歪头杀！']
  },
  '胆小': {
    feed: ['小心翼翼地靠近', '吃一口看一下你', '躲在角落吃'],
    play: ['远远地看着玩具', '被吓到会躲起来', '需要鼓励才敢玩'],
    pet: ['犹豫要不要靠近', '轻轻地蹭你', '慢慢建立信任']
  },
  '霸道': {
    feed: ['命令你继续喂', '用爪子按着碗', '喵！还要！'],
    play: ['命令你陪玩', '玩腻了就换', '喵！继续！'],
    pet: ['用头命令你继续', '摸少了会咬你', '哼，还算满意']
  }
};

class ReactionSystem extends IEvolvable {
  constructor(catId) {
    super(catId, 'reactions');
  }
  
  /**
   * 获取当前可用反应
   */
  getAvailableItems() {
    const cat = this.getCat();
    if (!cat) return { base: [], custom: [] };
    
    const baseReactions = PERSONALITY_REACTIONS[cat.personality] || {};
    const customReactions = cat.reactionSpace?.custom || [];
    
    return {
      base: baseReactions,
      custom: customReactions
    };
  }
  
  /**
   * 获取特定动作的反应
   */
  getReactionForAction(actionType) {
    const available = this.getAvailableItems();
    
    // 从基础反应中选择
    const baseReactions = available.base[actionType] || [];
    if (baseReactions.length > 0) {
      return baseReactions[Math.floor(Math.random() * baseReactions.length)];
    }
    
    // 从自定义反应中选择
    const customReactions = available.custom.filter(r => r.trigger === actionType);
    if (customReactions.length > 0) {
      return customReactions[Math.floor(Math.random() * customReactions.length)].reaction;
    }
    
    return '喵~';
  }
  
  /**
   * LLM 选择反应
   */
  async selectItem(context) {
    const cat = this.getCat();
    const available = this.getAvailableItems();
    
    const prompt = this.buildPrompt(`
你是{catName}，一只{personality}的猫咪。

【当前情境】
动作：{actionType}
状态：精力{energy}, 心情{mood}, 饱食{hunger}

【你的反应库】
基础反应：{baseReactions}
自创反应：{customReactions}

请选择最合适的反应。

输出 JSON:
{
  "selectedReaction": "反应内容",
  "source": "base/custom",
  "emotion": "情绪",
  "intensity": "low/medium/high"
}`, {
      catName: cat.name,
      personality: cat.personality,
      actionType: context.actionType,
      energy: cat.stats.energy,
      mood: cat.stats.mood,
      hunger: cat.stats.hunger,
      baseReactions: JSON.stringify(available.base[context.actionType] || []),
      customReactions: available.custom.filter(r => r.trigger === context.actionType).map(r => r.reaction).join(', ') || '无'
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    return result;
  }
  
  /**
   * 判断是否需要新反应
   */
  async needsNewItem(context) {
    const cat = this.getCat();
    
    // 如果猫咪心情很低或很高，可能产生独特反应
    if (cat.stats.mood < 30 || cat.stats.mood > 85) {
      return true;
    }
    
    // 如果信任度有特殊变化
    if (context.trustChange && Math.abs(context.trustChange) > 10) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 创建新反应
   */
  async createNewItem(context) {
    const cat = this.getCat();
    
    const prompt = this.buildPrompt(`
{catName}({personality})对{actionType}有了独特的反应。

【当前状态】
心情：{mood}/100
信任：{trustLevel}/100
情绪：{emotionalState}

【情境】
{context}

请记录这个独特的反应：

输出 JSON:
{
  "id": "reaction_{timestamp}",
  "trigger": "触发条件",
  "reaction": "反应描述",
  "emotion": "情绪",
  "personalityMatch": ["适合的性格"],
  "condition": {
    "moodMin": 0~100,
    "trustMin": 0~100
  },
  "rarity": "common/uncommon/rare/epic",
  "story": "这个反应背后的故事"
}`, {
      catName: cat.name,
      personality: cat.personality,
      actionType: context.actionType,
      mood: cat.stats.mood,
      trustLevel: cat.trustLevel || 80,
      emotionalState: cat.emotionalState || '平静',
      context: context.description
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    if (!result) return null;
    
    result.id = generateId('reaction');
    result.rarity = result.rarity || rollRarity();
    result.createdAt = Date.now();
    result.usageCount = 0;
    
    return result;
  }
  
  /**
   * 添加反应到猫咪
   */
  addItem(item) {
    const cat = this.getCat();
    if (!cat) return false;
    
    if (!cat.reactionSpace) cat.reactionSpace = { custom: [] };
    
    // 检查是否已存在
    const exists = cat.reactionSpace.custom.some(r => r.id === item.id);
    if (!exists) {
      cat.reactionSpace.custom.push(item);
      this.saveCat(cat);
      return true;
    }
    
    return false;
  }
  
  /**
   * 检查反应进化
   */
  async checkEvolution(item) {
    // 反应系统暂不支持进化
    return null;
  }
  
  /**
   * 执行反应进化
   */
  evolve(item, evolution) {
    // 反应系统暂不支持进化
    return false;
  }
}

module.exports = ReactionSystem;
