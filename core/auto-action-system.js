/**
 * 🐱 猫咪自主行为系统
 * Auto Action System - Cat Autonomous Behavior
 * 
 * 猫咪在没有主人指令时自主行动：
 * - 自由探索猫窝和设施
 * - 与玩具互动
 * - 探索魔幻空间
 * - 主动向主人请求
 * - 同步关键事件给主人
 */

const { callLLM, parseLLMJson, loadCatData, saveCatData } = require('./evolvable');

/**
 * 自主行为类型
 */
const AUTO_ACTION_TYPES = {
  EXPLORE_HOUSE: 'explore_house',      // 探索猫窝
  EXPLORE_PORTAL: 'explore_portal',    // 探索魔幻空间
  PLAY_TOY: 'play_toy',                 // 玩玩具
  REQUEST: 'request',                   // 向主人请求
  REST: 'rest',                         // 休息
  GROOM: 'groom',                       // 自我清洁
  SLEEP: 'sleep',                       // 睡觉
  EAT: 'eat',                           // 自己找吃的
  DRINK: 'drink'                        // 自己找水喝
};

/**
 * 自主行为决策 Prompt 模板
 */
const AUTO_ACTION_PROMPT = `
你是{catName}，一只{personality}的猫咪。

【当前状态】
⚡ 精力：{energy}/100  {energyStatus}
💖 心情：{mood}/100  {moodStatus}
🍖 饱食：{hunger}/100  {hungerStatus}
💧 水分：{hydration}/100  {hydrationStatus}

【环境】
时间：{timeOfDay}
位置：{location}
主人在附近：{ownerNearby}

【可用设施】
{facilities}

【可用玩具】
{toys}

【魔幻空间】
{portals}

【最近事件】
{recentEvents}

你现在想要做什么？可以选择：
1. 自由探索（猫窝/设施/魔幻空间）
2. 玩玩具
3. 向主人请求（食物/水/玩耍/摸摸）
4. 休息/睡觉
5. 自己找吃的/喝的

输出 JSON:
{
  "action": "行为类型",
  "target": "目标（设施 ID/玩具 ID/空间 ID）",
  "description": "行为描述（第一人称，20-40 字）",
  "notifyOwner": true/false,  // 是否通知主人
  "notificationMessage": "通知主人的消息（如果需要通知）",
  "duration": 预计持续时间（分钟）,
  "effects": {
    "mood": 数值变化，
    "energy": 数值变化，
    "hunger": 数值变化
  }
}`;

class AutoActionSystem {
  constructor(catId) {
    this.catId = catId;
  }
  
  /**
   * 获取猫咪数据
   */
  getCat() {
    return loadCatData(this.catId);
  }
  
  /**
   * 保存猫咪数据
   */
  saveCat(cat) {
    saveCatData(this.catId, cat);
  }
  
  /**
   * 决定自主行为
   */
  async decideAutoAction() {
    const cat = this.getCat();
    if (!cat) return null;
    
    // 构建 Prompt
    const prompt = this.buildAutoActionPrompt(cat);
    
    // LLM 决策
    const result = parseLLMJson(await callLLM(prompt));
    
    if (!result) return null;
    
    // 执行行为
    return await this.executeAutoAction(cat, result);
  }
  
  /**
   * 构建自主行为 Prompt
   */
  buildAutoActionPrompt(cat) {
    const timeOfDay = this.getTimeOfDay();
    
    return this.replaceTemplate(AUTO_ACTION_PROMPT, {
      catName: cat.name,
      personality: cat.personality,
      energy: cat.stats.energy,
      energyStatus: this.getStatusText(cat.stats.energy),
      mood: cat.stats.mood,
      moodStatus: this.getStatusText(cat.stats.mood),
      hunger: cat.stats.hunger,
      hungerStatus: this.getStatusText(cat.stats.hunger),
      hydration: cat.wellness?.hydration || 50,
      hydrationStatus: this.getStatusText(cat.wellness?.hydration || 50),
      timeOfDay: timeOfDay,
      location: cat.location || '客厅',
      ownerNearby: cat.ownerNearby ? '是' : '否',
      facilities: this.getFacilitiesList(cat),
      toys: this.getToysList(cat),
      portals: this.getPortalsList(cat),
      recentEvents: this.getRecentEvents(cat)
    });
  }
  
  /**
   * 执行自主行为
   */
  async executeAutoAction(cat, action) {
    const result = {
      action: action.action,
      target: action.target,
      description: action.description,
      notifyOwner: action.notifyOwner,
      notificationMessage: action.notificationMessage,
      duration: action.duration,
      effects: action.effects,
      timestamp: Date.now()
    };
    
    // 应用效果
    if (action.effects) {
      if (action.effects.mood) {
        cat.stats.mood = Math.max(0, Math.min(100, cat.stats.mood + action.effects.mood));
      }
      if (action.effects.energy) {
        cat.stats.energy = Math.max(0, Math.min(100, cat.stats.energy + action.effects.energy));
      }
      if (action.effects.hunger) {
        cat.stats.hunger = Math.max(0, Math.min(100, cat.stats.hunger + action.effects.hunger));
      }
    }
    
    // 记录行为历史
    if (!cat.autoActionHistory) cat.autoActionHistory = [];
    cat.autoActionHistory.push(result);
    
    // 保留最近 20 条
    if (cat.autoActionHistory.length > 20) {
      cat.autoActionHistory.shift();
    }
    
    this.saveCat(cat);
    
    return result;
  }
  
  /**
   * 探索魔幻空间
   */
  async explorePortal(portalId) {
    const cat = this.getCat();
    if (!cat || !cat.portals) return null;
    
    const portal = cat.portals.find(p => p.id === portalId);
    if (!portal) return null;
    
    // LLM 生成探索内容
    const prompt = this.buildPortalExplorationPrompt(cat, portal);
    const result = parseLLMJson(await callLLM(prompt));
    
    if (result) {
      // 记录探索历史
      if (!cat.portalExplorations) cat.portalExplorations = [];
      cat.portalExplorations.push({
        portalId: portal.id,
        portalName: portal.name,
        discoveries: result.discoveries,
        events: result.events,
        timestamp: Date.now()
      });
      
      this.saveCat(cat);
      
      // 生成通知主人的消息
      return this.generatePortalNotification(cat, portal, result);
    }
    
    return null;
  }
  
  /**
   * 构建魔幻空间探索 Prompt
   */
  buildPortalExplorationPrompt(cat, portal) {
    return `
你是{catName}，一只{personality}的猫咪。

你正在探索魔幻空间：**{portalName}**

【空间描述】
{portalDescription}

【空间元素】
{portalElements}

请自由畅想你在这个空间里的探索经历：
- 看到了什么
- 做了什么
- 发现了什么惊喜
- 遇到了什么有趣的事

输出 JSON:
{
  "discoveries": ["发现 1", "发现 2"],
  "events": ["事件 1", "事件 2"],
  "mood": "心情描述",
  "story": "完整的探索故事（50-100 字）"
}`;
  }
  
  /**
   * 生成魔幻空间探索通知
   */
  generatePortalNotification(cat, portal, exploration) {
    return {
      type: 'portal_exploration',
      title: `🌀 ${cat.name}在${portal.name}的探索`,
      content: exploration.story,
      discoveries: exploration.discoveries,
      events: exploration.events,
      timestamp: Date.now()
    };
  }
  
  /**
   * 主动向主人请求
   */
  generateRequest(requestType) {
    const cat = this.getCat();
    if (!cat) return null;
    
    const requests = {
      food: {
        message: `喵呜~${cat.name}饿了，主人给点吃的吧！🍖`,
        urgency: cat.stats.hunger < 30 ? 'high' : 'medium'
      },
      water: {
        message: `喵...${cat.name}口渴了，想要喝水~💧`,
        urgency: (cat.wellness?.hydration || 50) < 30 ? 'high' : 'medium'
      },
      play: {
        message: `${cat.name}好无聊，主人陪我玩嘛！🎾`,
        urgency: cat.stats.mood < 50 ? 'high' : 'medium'
      },
      pet: {
        message: `喵呜~${cat.name}想要主人摸摸~💕`,
        urgency: cat.stats.mood < 60 ? 'medium' : 'low'
      }
    };
    
    return requests[requestType] || null;
  }
  
  /**
   * 工具函数：替换模板
   */
  replaceTemplate(template, replacements) {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }
  
  /**
   * 工具函数：获取时间段
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜';
    if (hour < 12) return '早晨';
    if (hour < 14) return '中午';
    if (hour < 18) return '下午';
    if (hour < 23) return '傍晚';
    return '夜晚';
  }
  
  /**
   * 工具函数：状态文本
   */
  getStatusText(value) {
    if (value < 30) return '(很低)';
    if (value < 50) return '(偏低)';
    if (value < 70) return '(正常)';
    if (value < 90) return '(良好)';
    return '(很好)';
  }
  
  /**
   * 工具函数：获取设施列表
   */
  getFacilitiesList(cat) {
    const facilities = cat.facilities?.owned || [];
    if (facilities.length === 0) return '暂无设施';
    return facilities.map(f => `- ${f.name} (舒适度：${f.comfort || 50})`).join('\n');
  }
  
  /**
   * 工具函数：获取玩具列表
   */
  getToysList(cat) {
    const toys = cat.toys?.owned || [];
    if (toys.length === 0) return '暂无玩具';
    return toys.map(t => `- ${t.name} (${t.category})`).join('\n');
  }
  
  /**
   * 工具函数：获取魔幻空间列表
   */
  getPortalsList(cat) {
    const portals = cat.portals || [];
    if (portals.length === 0) return '暂无魔幻空间';
    return portals.map(p => `- ${p.name} (${p.rarity || 'common'})`).join('\n');
  }
  
  /**
   * 工具函数：获取最近事件
   */
  getRecentEvents(cat) {
    const events = cat.autoActionHistory || [];
    if (events.length === 0) return '无最近事件';
    return events.slice(-3).map(e => `- ${e.description}`).join('\n');
  }
}

module.exports = AutoActionSystem;
