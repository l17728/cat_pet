/**
 * 模拟器配置
 * Simulator Configuration
 */

module.exports = {
  // Star-Office 后端地址
  officeUrl: process.env.OFFICE_URL || 'http://127.0.0.1:19000',
  
  // 默认用户ID
  defaultUserId: process.env.USER_ID || 'simulator_user',
  
  // 状态同步间隔 (毫秒)
  syncInterval: parseInt(process.env.SYNC_INTERVAL) || 3000,
  
  // 后台任务间隔 (毫秒) - 测试配置
  decayInterval: parseInt(process.env.DECAY_INTERVAL) || 20 * 1000,  // 20秒
  autoActionInterval: parseInt(process.env.AUTO_ACTION_INTERVAL) || 10 * 1000,  // 10秒
  
  // 是否启用自动同步
  autoSync: process.env.AUTO_SYNC !== 'false',
  
  // 猫咪ID (运行时设置)
  catId: null,
  
  // Join Key (用于多猫咪场景)
  joinKey: process.env.JOIN_KEY || 'ocj_cat_simulator',
  
  // Agent 名称
  agentName: process.env.AGENT_NAME || '猫咪模拟器'
};