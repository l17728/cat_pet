/**
 * 🏠 设施系统 - 猫咪设施改造与进化
 * Facility System - Cat Facility Modification & Evolution
 */

const { IEvolvable, callLLM, parseLLMJson, generateId, rollRarity } = require('./evolvable');

/**
 * 基础设施库
 * 
 * 养猫必备设施（根据真实猫咪需求设计）:
 * 1. 猫砂盆 - 每天使用 2-5 次，需要每天清理
 * 2. 猫抓板 - 磨爪需求，保护家具
 * 3. 食盆/水碗 - 每天喂食，新鲜水源
 * 4. 猫窝 - 休息场所，猫咪每天睡 12-16 小时
 */
const BASE_FACILITIES = [
  { id: 'cat_bed', name: '猫窝', category: '休息', comfort: 50, description: '猫咪每天需要睡 12-16 小时' },
  { id: 'food_bowl', name: '食盆', category: '饮食', comfort: 50, description: '每天需要喂食 2-4 次' },
  { id: 'water_bowl', name: '水碗', category: '饮食', comfort: 50, description: '需要每天更换新鲜水' },
  { id: 'litter_box', name: '猫砂盆', category: '卫生', comfort: 50, description: '每天使用 2-5 次，需要每天清理', required: true },
  { id: 'scratching_post', name: '猫抓板', category: '磨爪', comfort: 50, description: '磨爪是必须需求，保护家具', required: true }
];

class FacilitySystem extends IEvolvable {
  constructor(catId) {
    super(catId, 'facilities');
  }
  
  /**
   * 获取当前可用设施
   */
  getAvailableItems() {
    const cat = this.getCat();
    if (!cat) return { facilities: [], modifications: [] };
    
    const facilities = cat.facilities?.owned || BASE_FACILITIES;
    const modifications = cat.facilities?.modifications || [];
    
    return { facilities, modifications };
  }
  
  /**
   * LLM 选择设施改造
   */
  async selectItem(context) {
    const cat = this.getCat();
    const available = this.getAvailableItems();
    
    const prompt = this.buildPrompt(`
你是{catName}，一只{personality}的猫咪。

【当前状态】
心情：{mood}/100  信任：{trustLevel}/100

【你的设施】
{facilityList}

【当前需求】
{context}

请选择一个设施进行改造，或者保持不变。

输出 JSON:
{
  "selectedFacility": "设施 ID",
  "modification": "改造想法",
  "reason": "理由",
  "keepAsIs": true/false
}`, {
      catName: cat.name,
      personality: cat.personality,
      mood: cat.stats.mood,
      trustLevel: cat.trustLevel || 80,
      facilityList: available.facilities.map(f => `${f.name} (舒适度：${f.comfort})`).join(', '),
      context: context.description || '想要更舒适的生活'
    });
    
    return parseLLMJson(await callLLM(prompt));
  }
  
  /**
   * 判断是否需要新设施/改造
   */
  async needsNewItem(context) {
    const cat = this.getCat();
    if (!cat) return false;

    // 信任度达到 60 以上，想要改造设施
    if ((cat.trustLevel || 0) >= 60) {
      return true;
    }
    
    // 心情特别好，想要新设施
    if (cat.stats.mood > 85) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 创建新设施/改造
   */
  async createNewItem(context) {
    const cat = this.getCat();
    
    const prompt = this.buildPrompt(`
{catName}({personality})对现在的生活环境有些想法。

【当前状态】
心情：{mood}/100  信任：{trustLevel}/100

【现有设施】
{facilityList}

请设计：
1. 现有设施的改造方案，或
2. 一个全新的设施

输出 JSON:
{
  "type": "modification/new",
  "facilityId": "设施 ID",
  "name": "设施名称",
  "description": "设施描述",
  "location": "放置位置",
  "howToBuild": "主人需要做什么",
  "cost": 50~500,
  "effects": { 
    "mood": 5~20, 
    "energy": 5~15,
    "comfort": 5~20 
  },
  "rarity": "common/uncommon/rare/epic/legendary",
  "story": "为什么想要这个设施"
}`, {
      catName: cat.name,
      personality: cat.personality,
      mood: cat.stats.mood,
      trustLevel: cat.trustLevel || 80,
      facilityList: this.getAvailableItems().facilities.map(f => f.name).join(', ')
    });
    
    const result = parseLLMJson(await callLLM(prompt));
    if (!result) return null;
    
    result.id = generateId('facility');
    result.rarity = result.rarity || rollRarity();
    result.createdAt = Date.now();
    result.discoveredBy = cat.name;
    
    return result;
  }
  
  /**
   * 添加设施/改造到猫咪
   */
  addItem(item) {
    const cat = this.getCat();
    if (!cat) return false;
    
    if (!cat.facilities) cat.facilities = { owned: [], modifications: [] };
    
    if (item.type === 'new') {
      // 新设施
      const exists = cat.facilities.owned.some(f => f.id === item.id);
      if (!exists) {
        cat.facilities.owned.push(item);
        this.saveCat(cat);
        return true;
      }
    } else if (item.type === 'modification') {
      // 设施改造
      const exists = cat.facilities.modifications.some(m => m.id === item.id);
      if (!exists) {
        cat.facilities.modifications.push(item);
        this.saveCat(cat);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 检查设施进化
   */
  async checkEvolution(item) {
    // 设施系统暂不支持进化
    return null;
  }
  
  /**
   * 执行设施进化
   */
  evolve(item, evolution) {
    // 设施系统暂不支持进化
    return false;
  }
  
  /**
   * 提升设施舒适度
   */
  upgradeComfort(facilityId, amount) {
    const cat = this.getCat();
    if (!cat || !cat.facilities) return false;
    
    const facility = cat.facilities.owned.find(f => f.id === facilityId);
    if (facility) {
      facility.comfort = Math.min(100, (facility.comfort || 50) + amount);
      this.saveCat(cat);
      return true;
    }
    
    return false;
  }
}

module.exports = FacilitySystem;
