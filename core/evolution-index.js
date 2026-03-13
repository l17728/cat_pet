/**
 * 🧬 猫咪进化系统 - 统一入口
 * Cat Evolution System - Main Entry Point
 * 
 * 使用示例:
 * const evolution = require('./core/evolution-index');
 * 
 * // 创建管理器
 * const manager = new evolution.EvolutionManager(catId);
 * 
 * // 交互后检查进化
 * const results = await manager.checkAllEvolutions(context);
 * 
 * // 通知主人
 * for (const result of results) {
 *   const message = manager.notifyOwner(result);
 *   sendQQMessage(message);
 * }
 */

const EvolutionManager = require('./evolution-manager');
const ActionSystem = require('./action-system');
const ReactionSystem = require('./reaction-system');
const ToySystem = require('./toy-system');
const FacilitySystem = require('./facility-system');
const AutoActionSystem = require('./auto-action-system');
const {
  IEvolvable,
  loadCatData,
  saveCatData,
  callLLM,
  parseLLMJson,
  generateId,
  RARITY_WEIGHTS,
  rollRarity
} = require('./evolvable');

/**
 * 快捷函数：检查并处理进化
 */
async function checkAndProcessEvolution(catId, context) {
  const manager = new EvolutionManager(catId);
  const results = await manager.checkAllEvolutions(context);
  
  const messages = [];
  for (const result of results) {
    const message = manager.notifyOwner(result);
    messages.push(message);
  }
  
  return {
    results,
    messages
  };
}

/**
 * 快捷函数：选择动作
 */
async function selectAction(catId, context) {
  const manager = new EvolutionManager(catId);
  const actionSystem = manager.getSystem('actions');
  return await actionSystem.selectItem(context);
}

/**
 * 快捷函数：选择反应
 */
async function selectReaction(catId, context) {
  const manager = new EvolutionManager(catId);
  const reactionSystem = manager.getSystem('reactions');
  return await reactionSystem.selectItem(context);
}

/**
 * 快捷函数：自主行为决策
 */
async function decideAutoAction(catId) {
  const manager = new EvolutionManager(catId, { enableAutoAction: true });
  return await manager.decideAutoAction();
}

/**
 * 快捷函数：探索魔幻空间
 */
async function explorePortal(catId, portalId) {
  const manager = new EvolutionManager(catId, { enableAutoAction: true });
  return await manager.explorePortal(portalId);
}

module.exports = {
  // 核心类
  EvolutionManager,
  ActionSystem,
  ReactionSystem,
  ToySystem,
  FacilitySystem,
  AutoActionSystem,
  IEvolvable,
  
  // 工具函数
  loadCatData,
  saveCatData,
  callLLM,
  parseLLMJson,
  generateId,
  rollRarity,
  RARITY_WEIGHTS,
  
  // 快捷函数
  checkAndProcessEvolution,
  selectAction,
  selectReaction,
  decideAutoAction,
  explorePortal
};
