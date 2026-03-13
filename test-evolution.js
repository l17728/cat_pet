/**
 * 🧪 进化系统测试脚本
 * Evolution System Test
 */

const evolution = require('./core/evolution-index');
const { ToySystem, FacilitySystem } = evolution;
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(
  process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace',
  'cat-pet',
  'data'
);

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log('🧪 猫咪进化系统测试\n');
console.log('=' .repeat(60));

const stats = { total: 0, passed: 0, failed: 0 };

async function test(name, fn) {
  stats.total++;
  try {
    const result = await fn();
    if (result) {
      stats.passed++;
      console.log(`✅ ${name}`);
      return true;
    } else {
      stats.failed++;
      console.log(`❌ ${name}`);
      return false;
    }
  } catch (error) {
    stats.failed++;
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

// 测试用猫咪
const TEST_CAT = {
  id: 'evo_test_cat',
  name: '雪球',
  personality: '活泼',
  stats: { energy: 80, mood: 85, hunger: 70, cleanliness: 75 },
  trustLevel: 75,
  emotionalState: '开心'
};

async function runTests() {
  console.log('\n【准备】创建测试猫咪...\n');
  
  // 保存测试猫咪
  const filePath = path.join(DATA_DIR, `cat_${TEST_CAT.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(TEST_CAT, null, 2));
  console.log('✓ 创建测试猫咪：雪球 (活泼)\n');
  
  console.log('=' .repeat(60));
  console.log('\n【测试 1】动作系统\n');
  
  // 测试动作系统
  const actionSystem = new evolution.ActionSystem(TEST_CAT.id);
  const availableActions = actionSystem.getAvailableItems();
  console.log(`本能动作：${availableActions.instinct.length}个`);
  console.log(`性格动作：${availableActions.personality.length}个`);
  console.log(`习得动作：${availableActions.learned.length}个`);
  console.log(`自创动作：${availableActions.custom.length}个\n`);
  
  test('获取可用动作', () => availableActions.instinct.length > 0);
  
  console.log('\n【测试 2】反应系统\n');
  
  // 测试反应系统
  const reactionSystem = new evolution.ReactionSystem(TEST_CAT.id);
  const availableReactions = reactionSystem.getAvailableItems();
  console.log(`基础反应：${Object.keys(availableReactions.base).length}类`);
  console.log(`自创反应：${availableReactions.custom.length}个\n`);
  
  test('获取可用反应', () => Object.keys(availableReactions.base).length > 0);
  
  const feedReaction = reactionSystem.getReactionForAction('feed');
  console.log(`喂食反应示例：${feedReaction}\n`);
  test('获取特定反应', () => feedReaction && feedReaction.length > 0);
  
  console.log('\n【测试 3】进化管理器\n');
  
  // 测试进化管理器
  const manager = new evolution.EvolutionManager(TEST_CAT.id);
  console.log(`注册系统：${manager.systems.size}个`);
  test('创建管理器', () => manager.systems.size >= 3);
  
  const actionSystemFromManager = manager.getSystem('actions');
  test('获取动作系统', () => actionSystemFromManager instanceof evolution.ActionSystem);
  
  const toySystemFromManager = manager.getSystem('toys');
  test('获取玩具系统', () => toySystemFromManager instanceof evolution.ToySystem);
  
  const facilitySystemFromManager = manager.getSystem('facilities');
  test('获取设施系统', () => facilitySystemFromManager instanceof evolution.FacilitySystem);
  
  console.log('\n【测试 4】工具函数\n');
  
  // 测试工具函数
  const newId = evolution.generateId('test');
  console.log(`生成 ID: ${newId}`);
  test('生成唯一 ID', () => newId.startsWith('test_'));
  
  const rarity = evolution.rollRarity();
  console.log(`随机稀有度：${rarity}`);
  test('随机稀有度', () => ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(rarity));
  
  // 清理测试数据
  console.log('\n' + '=' .repeat(60));
  console.log('\n【清理】删除测试数据...\n');
  fs.unlinkSync(filePath);
  console.log('✓ 测试数据已清理\n');
  
  // 总结
  console.log('=' .repeat(60));
  console.log('\n📊 测试结果\n');
  console.log(`总测试数：${stats.total}`);
  console.log(`✅ 通过：${stats.passed}`);
  console.log(`❌ 失败：${stats.failed}`);
  console.log(`成功率：${(stats.passed / stats.total * 100).toFixed(1)}%\n`);
  
  if (stats.failed === 0) {
    console.log('🎉 所有测试通过！进化系统运行正常！\n');
  } else {
    console.log(`⚠️ 有 ${stats.failed} 项测试失败\n`);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
});
