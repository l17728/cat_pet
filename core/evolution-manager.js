/**
 * 🧬 进化系统管理器
 * Evolution Manager - Unified management for all evolvable systems
 */

const ActionSystem = require('./action-system');
const ReactionSystem = require('./reaction-system');
const ToySystem = require('./toy-system');
const FacilitySystem = require('./facility-system');
const AutoActionSystem = require('./auto-action-system');
const { loadCatData, callLLM, parseLLMJson } = require('./evolvable');

class EvolutionManager {
  constructor(catId, options = {}) {
    this.catId = catId;
    this.systems = new Map();
    this.options = options;
    
    // 注册所有可进化系统
    this.registerSystem('actions', new ActionSystem(catId));
    this.registerSystem('reactions', new ReactionSystem(catId));
    this.registerSystem('toys', new ToySystem(catId));
    this.registerSystem('facilities', new FacilitySystem(catId));
    
    // 自主行为系统（可选）
    if (options.enableAutoAction !== false) {
      this.autoActionSystem = new AutoActionSystem(catId);
    }
  }
  
  /**
   * 获取自主行为系统
   */
  getAutoActionSystem() {
    return this.autoActionSystem;
  }
  
  /**
   * 执行自主行为决策
   */
  async decideAutoAction() {
    if (!this.autoActionSystem) {
      throw new Error('自主行为系统未启用');
    }
    return await this.autoActionSystem.decideAutoAction();
  }
  
  /**
   * 探索魔幻空间
   */
  async explorePortal(portalId) {
    if (!this.autoActionSystem) {
      throw new Error('自主行为系统未启用');
    }
    return await this.autoActionSystem.explorePortal(portalId);
  }
  
  /**
   * 注册系统
   */
  registerSystem(name, system) {
    this.systems.set(name, system);
  }
  
  /**
   * 获取系统
   */
  getSystem(name) {
    return this.systems.get(name);
  }
  
  /**
   * 交互后检查所有系统的进化可能
   */
  async checkAllEvolutions(context) {
    // 若猫咪已不存在（如测试清理后），直接跳过
    const cat = loadCatData(this.catId);
    if (!cat) return [];

    const results = [];

    for (const [name, system] of this.systems) {
      try {
        // 检查是否需要创建新项
        const needsNew = await system.needsNewItem(context);
        if (needsNew) {
          const newItem = await system.createNewItem(context);
          if (newItem) {
            system.addItem(newItem);
            results.push({
              system: name,
              type: 'creation',
              item: newItem
            });
          }
        }
        
        // 检查现有项的进化
        const evolution = await this.checkSystemEvolutions(system, context);
        if (evolution) {
          results.push({
            system: name,
            type: 'evolution',
            evolution: evolution
          });
        }
      } catch (error) {
        console.error(`进化检查失败 (${name}):`, error.message);
      }
    }
    
    return results;
  }
  
  /**
   * 检查单个系统的所有项
   */
  async checkSystemEvolutions(system, context) {
    const available = system.getAvailableItems();
    
    // 检查自定义项的进化
    if (available.custom) {
      for (const item of available.custom) {
        const evolution = await system.checkEvolution(item);
        if (evolution) {
          system.evolve(item, evolution);
          return { item, evolution };
        }
      }
    }
    
    return null;
  }
  
  /**
   * LLM 决定是否创建新内容
   */
  async decideCreation(systemName, context) {
    const system = this.getSystem(systemName);
    if (!system) return null;
    
    const cat = loadCatData(this.catId);
    const available = system.getAvailableItems();
    
    // 扁平化所有可用项
    const allItems = this.flattenItems(available);
    
    const prompt = system.buildPrompt(`
你是{catName}，一只{personality}的猫咪。

【当前情境】
{context}

【你会的{systemName}】
{itemList}

问题：现有的{systemName}能否满足当前需求？

如果现有内容足够，请选择最合适的一个。
如果都不合适，请创造一个新的{systemName}。

输出 JSON:
{
  "selectedItem": "选择的项 ID",
  "needsNew": true/false,
  "newItemIdea": "新项描述",
  "reason": "理由"
}`, {
      catName: cat.name,
      personality: cat.personality,
      context: context.description,
      itemList: allItems.map(i => i.name).join(', ') || '无',
      systemName: this.getSystemDisplayName(systemName)
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    return result;
  }
  
  /**
   * 扁平化所有可用项
   */
  flattenItems(available) {
    const items = [];
    for (const [category, categoryItems] of Object.entries(available)) {
      if (Array.isArray(categoryItems)) {
        items.push(...categoryItems);
      } else if (typeof categoryItems === 'object') {
        // 处理嵌套对象（如反应系统）
        for (const [subCategory, subItems] of Object.entries(categoryItems)) {
          if (Array.isArray(subItems)) {
            items.push(...subItems.map(i => ({ ...i, category: subCategory })));
          }
        }
      }
    }
    return items;
  }
  
  /**
   * 获取系统显示名称
   */
  getSystemDisplayName(systemName) {
    const names = {
      actions: '动作',
      reactions: '反应',
      toys: '玩具玩法',
      facilities: '设施',
      skills: '技能',
      events: '事件'
    };
    return names[systemName] || systemName;
  }
  
  /**
   * 通知主人进化事件
   */
  notifyOwner(evolution) {
    const { system, type, item, evolution: evoData } = evolution;
    
    let message = '';
    
    if (type === 'creation') {
      message = `
🎉 {catName}学会了新{systemName}！

✨ {itemName}
{description}

{story}

稀有度：{rarity}
      `;
      
      message = message
        .replace('{catName}', loadCatData(this.catId).name)
        .replace('{systemName}', this.getSystemDisplayName(system))
        .replace('{itemName}', item.name)
        .replace('{description}', item.description)
        .replace('{story}', item.story || '')
        .replace('{rarity}', this.getRarityEmoji(item.rarity));
    } else if (type === 'evolution') {
      message = `
🌟 {catName}的{itemName}进化了！

✨ {newItemName}
{description}

{story}

稀有度：{rarity}
      `;
      
      message = message
        .replace('{catName}', loadCatData(this.catId).name)
        .replace('{itemName}', evoData.item.name)
        .replace('{newItemName}', evoData.evolution.newAction?.name || '新形态')
        .replace('{description}', evoData.evolution.newAction?.description || '')
        .replace('{story}', evoData.evolution.story || '')
        .replace('{rarity}', this.getRarityEmoji(evoData.evolution.newAction?.rarity));
    }
    
    return message;
  }
  
  /**
   * 获取稀有度 Emoji
   */
  getRarityEmoji(rarity) {
    const emojis = {
      common: '⚪ 普通',
      uncommon: '🟢 少见',
      rare: '🔵 稀有',
      epic: '🟣 史诗',
      legendary: '🟡 传说'
    };
    return emojis[rarity] || '⚪ 普通';
  }
}

module.exports = EvolutionManager;
