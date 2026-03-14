/**
 * 🧬 可进化对象的标准接口
 * Evolvable Interface - Base class for all evolvable systems
 * 
 * 所有支持动态扩展的系统都继承这个基类
 * 
 * 支持多种 LLM 后端:
 * - 模拟器注入的 LLM 适配器 (优先)
 * - OpenClaw sessions_spawn (回退)
 */

const path = require('path');
const fs = require('fs');

// 数据目录
const DATA_DIR = path.join(
  process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace',
  'cat-pet',
  'data'
);

/**
 * 确保数据目录存在
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 加载猫咪数据
 */
function loadCatData(catId) {
  const filePath = path.join(DATA_DIR, `cat_${catId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

/**
 * 保存猫咪数据
 */
function saveCatData(catId, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `cat_${catId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * LLM 调用封装
 * 
 * 优先级:
 * 1. 全局注入的 LLM 适配器 (模拟器模式)
 * 2. OpenClaw sessions_spawn (平台模式)
 * 3. 返回 null (离线模式)
 */
async function callLLM(prompt, options = {}) {
  // 1. 优先使用注入的 LLM 适配器
  if (global.llmAdapter && typeof global.llmAdapter.call === 'function') {
    try {
      const result = await global.llmAdapter.call(prompt, options);
      if (result) return result;
    } catch (error) {
      console.error('[LLM] 注入适配器调用失败:', error.message);
    }
  }
  
  // 2. 回退到 OpenClaw sessions_spawn
  try {
    const { sessions_spawn } = require('openclaw');
    
    const result = await sessions_spawn({
      task: prompt,
      model: options.model || 'qwen3.5-plus',
      mode: 'run',
      runtime: 'subagent',
      timeoutSeconds: options.timeout || 30
    });
    
    // 提取内容
    if (typeof result === 'string') return result;
    if (result?.content) return result.content;
    if (result?.message) return result.message;
    if (result?.messages?.[0]?.content) return result.messages[0].content;
    
    return JSON.stringify(result);
  } catch (error) {
    // OpenClaw 不可用或调用失败
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.error('[LLM] OpenClaw 调用失败:', error.message);
    }
  }
  
  // 3. 返回 null (离线模式)
  return null;
}

/**
 * 解析 LLM 的 JSON 输出
 */
function parseLLMJson(content) {
  if (!content) return null;
  
  try {
    // 尝试直接解析
    if (typeof content === 'object') return content;
    
    // 提取 JSON 部分
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('[LLM] JSON 解析失败:', error.message);
    return null;
  }
}

/**
 * 生成唯一 ID
 */
function generateId(prefix = 'evo') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 可进化对象基类
 */
class IEvolvable {
  constructor(catId, systemName) {
    this.catId = catId;
    this.systemName = systemName;
  }
  
  /**
   * 获取当前可用项
   * @returns {object} 可用项列表
   */
  getAvailableItems() {
    throw new Error('必须实现 getAvailableItems 方法');
  }
  
  /**
   * LLM 选择最匹配的项
   * @param {object} context - 上下文
   * @returns {Promise<object>} 选择的项
   */
  async selectItem(context) {
    throw new Error('必须实现 selectItem 方法');
  }
  
  /**
   * 判断是否需要创建新项
   * @param {object} context - 上下文
   * @returns {Promise<boolean>} 是否需要新项
   */
  async needsNewItem(context) {
    throw new Error('必须实现 needsNewItem 方法');
  }
  
  /**
   * 创建新项
   * @param {object} context - 上下文
   * @returns {Promise<object>} 新项
   */
  async createNewItem(context) {
    throw new Error('必须实现 createNewItem 方法');
  }
  
  /**
   * 添加到集合
   * @param {object} item - 项
   */
  addItem(item) {
    throw new Error('必须实现 addItem 方法');
  }
  
  /**
   * 检查是否可以进化
   * @param {object} item - 项
   * @returns {Promise<object|null>} 进化结果
   */
  async checkEvolution(item) {
    throw new Error('必须实现 checkEvolution 方法');
  }
  
  /**
   * 执行进化
   * @param {object} item - 项
   * @param {object} evolution - 进化结果
   */
  evolve(item, evolution) {
    throw new Error('必须实现 evolve 方法');
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
   * 构建 LLM Prompt
   */
  buildPrompt(template, replacements) {
    let prompt = template;
    for (const [key, value] of Object.entries(replacements)) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return prompt;
  }
}

/**
 *  rarity 权重配置
 */
const RARITY_WEIGHTS = {
  common: { chance: 0.6, multiplier: 1.0 },
  uncommon: { chance: 0.25, multiplier: 1.2 },
  rare: { chance: 0.1, multiplier: 1.5 },
  epic: { chance: 0.04, multiplier: 2.0 },
  legendary: { chance: 0.01, multiplier: 3.0 }
};

/**
 * 根据稀有度生成随机数
 */
function rollRarity() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [rarity, config] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += config.chance;
    if (rand <= cumulative) return rarity;
  }
  
  return 'common';
}

module.exports = {
  IEvolvable,
  loadCatData,
  saveCatData,
  callLLM,
  parseLLMJson,
  generateId,
  RARITY_WEIGHTS,
  rollRarity
};
