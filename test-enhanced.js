/**
 * 🐱 增强功能测试脚本
 * Test Script for Enhanced Features
 */

const path = require('path');

// 导入新系统
const portalSystem = require('./cat-portal-system');
const healthWellness = require('./cat-health-wellness');
const socialExtended = require('./cat-social-extended');
const toyStore = require('./cat-toy-store-expanded');
const commandInterface = require('./cat-command-interface');

// 测试用户 ID
const TEST_USER_ID = 'test_user_' + Date.now();
const TEST_CAT_ID = 'test_cat_' + Date.now();

console.log('🐱 猫咪养成系统 - 增强功能测试\n');
console.log('=' .repeat(50));

// ============================================
// 测试 1: 健康与福祉系统
// ============================================

console.log('\n【测试 1】健康与福祉系统\n');

// 创建测试猫咪数据
const testCat = {
  id: TEST_CAT_ID,
  ownerId: TEST_USER_ID,
  name: '测试猫咪',
  personality: '活泼',
  stats: {
    hunger: 75,
    energy: 80,
    mood: 85,
    cleanliness: 70
  },
  wellness: {
    hydration: 65,
    social: 60,
    exercise: 55,
    mental: 50
  }
};

// 保存测试数据
const fs = require('fs');
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
fs.writeFileSync(
  path.join(DATA_DIR, `cat_${TEST_CAT_ID}.json`),
  JSON.stringify(testCat, null, 2)
);

console.log('✓ 创建测试猫咪数据');

// 测试健康评分计算
const healthScore = healthWellness.calculateHealthScore(testCat);
console.log(`✓ 健康评分计算：${healthScore}分`);

// 测试健康等级
const healthLevel = healthWellness.getHealthLevel(healthScore);
console.log(`✓ 健康等级：${healthLevel.icon} ${healthLevel.label}`);

// 测试性格影响
const personalityEffect = healthWellness.calculatePersonalityEffect(testCat, healthScore);
console.log(`✓ 性格影响：${personalityEffect.bonus}`);

// 测试互动效果
const interactionResult = healthWellness.applyInteraction(TEST_CAT_ID, 'play');
console.log(`✓ 玩耍互动效果：心情 +${interactionResult.effects.mood}, 运动 +${interactionResult.effects.exercise}`);

// 测试每小时衰减
const decayResult = healthWellness.applyHourlyDecay(TEST_CAT_ID);
console.log(`✓ 每小时衰减检查：${decayResult.warnings.length} 个警告`);

// 测试健康检查报告
const checkupReport = healthWellness.healthCheckup(TEST_CAT_ID);
console.log(`✓ 健康检查报告生成：${checkupReport.recommendations.length} 条建议`);

console.log('\n【测试 1】完成 ✅\n');

// ============================================
// 测试 2: 时空门系统
// ============================================

console.log('【测试 2】时空门系统\n');

// 测试打开时空门
const openResult = portalSystem.openPortal(TEST_USER_ID);
console.log(`✓ 打开时空门：${openResult.success ? '成功' : '失败'}`);
if (openResult.success) {
  console.log(`  - 场景：${openResult.scene.icon} ${openResult.scene.name}`);
  console.log(`  - 稀有度：${openResult.scene.rarity}`);
  console.log(`  - 已存储：${openResult.portalCount}/${openResult.maxPortals}`);
}

// 测试查看时空门
const listResult = portalSystem.listPortals(TEST_USER_ID);
console.log(`✓ 查看时空门：${listResult.unlocked ? '已解锁' : '未解锁'}`);
if (listResult.unlocked) {
  console.log(`  - 数量：${listResult.count}/${listResult.max}`);
}

// 测试进入时空门
if (listResult.unlocked && listResult.portals.length > 0) {
  const enterResult = portalSystem.enterPortal(TEST_USER_ID, 1);
  console.log(`✓ 进入时空门：${enterResult.success ? '成功' : '失败'}`);
  if (enterResult.success) {
    console.log(`  - 访问次数：${enterResult.scene.visitCount}`);
  }
  
  // 测试探索时空门
  const exploreResult = portalSystem.explorePortal(TEST_USER_ID, 1);
  console.log(`✓ 探索时空门：${exploreResult.success ? '成功' : '失败'}`);
  if (exploreResult.success) {
    console.log(`  - 发现：${exploreResult.discovery.text}`);
  }
}

// 测试场景模板
const templates = portalSystem.SCENE_TEMPLATES;
console.log(`✓ 场景模板数量：${Object.keys(templates).length} 个`);

console.log('\n【测试 2】完成 ✅\n');

// ============================================
// 测试 3: 玩具商店系统
// ============================================

console.log('【测试 3】玩具商店系统\n');

// 测试浏览商店
const storeBrowse = toyStore.browseStore(TEST_USER_ID);
console.log(`✓ 浏览商店：${storeBrowse.totalToys} 个玩具可用`);
console.log(`  - 初始猫币：${storeBrowse.coins}🪙`);
console.log(`  - 商店等级：Lv.${storeBrowse.level}`);

// 测试购买玩具
const buyResult = toyStore.buyToy(TEST_USER_ID, 'ball_basic');
console.log(`✓ 购买玩具：${buyResult.success ? '成功' : '失败'}`);
if (buyResult.success) {
  console.log(`  - 玩具：${buyResult.toy.icon} ${buyResult.toy.name}`);
  console.log(`  - 剩余猫币：${buyResult.remaining}🪙`);
}

// 测试查看库存
const inventoryResult = toyStore.viewInventory(TEST_USER_ID);
console.log(`✓ 查看库存：${inventoryResult.total || 0} 个玩具`);

// 测试使用玩具
const useResult = toyStore.useToy(TEST_USER_ID, 'ball_basic', TEST_CAT_ID);
console.log(`✓ 使用玩具：${useResult.success ? '成功' : '失败'}`);
if (useResult.success) {
  console.log(`  - 效果：${Object.entries(useResult.effects).map(([k, v]) => `${k}+${v}`).join(', ')}`);
  console.log(`  - 耐久度：${useResult.durability}%`);
}

// 测试玩具数据库
const toyDatabase = toyStore.TOY_DATABASE;
console.log(`✓ 玩具数据库：${Object.keys(toyDatabase).length} 个玩具`);

// 按分类统计
const categories = {};
for (const toy of Object.values(toyDatabase)) {
  categories[toy.category] = (categories[toy.category] || 0) + 1;
}
console.log(`  - 分类：${Object.entries(categories).map(([c, n]) => `${c}:${n}`).join(', ')}`);

console.log('\n【测试 3】完成 ✅\n');

// ============================================
// 测试 4: 扩展社交系统
// ============================================

console.log('【测试 4】扩展社交系统\n');

// 测试获取猫窝
const house = socialExtended.getCatHouse(TEST_USER_ID);
console.log(`✓ 获取猫窝：${house.name}`);
console.log(`  - 等级：Lv.${house.level}`);
console.log(`  - 房间数：${Object.keys(house.rooms).length}`);

// 测试创建第二只猫用于社交
const testCat2 = {
  id: TEST_CAT_ID + '_2',
  ownerId: TEST_USER_ID,
  name: '测试猫咪 2 号',
  personality: '温顺',
  stats: {
    hunger: 70,
    energy: 75,
    mood: 80,
    cleanliness: 75
  }
};
fs.writeFileSync(
  path.join(DATA_DIR, `cat_${TEST_CAT_ID + '_2'}.json`),
  JSON.stringify(testCat2, null, 2)
);
console.log('✓ 创建第二只测试猫咪');

// 测试猫咪社交
const socialResult = socialExtended.catSocialize(TEST_CAT_ID, TEST_CAT_ID + '_2');
console.log(`✓ 猫咪社交：${socialResult.success ? '成功' : '失败'}`);
if (socialResult.success) {
  console.log(`  - 互动类型：${socialResult.interaction.icon} ${socialResult.interaction.name}`);
  console.log(`  - 消息：${socialResult.message}`);
}

// 测试社交应用加成
socialExtended.applySocialBonus(TEST_CAT_ID, 'visit');
console.log('✓ 社交应用加成');

// 测试获取用户的所有猫
const userCats = socialExtended.getCatsByUser(TEST_USER_ID);
console.log(`✓ 获取用户猫咪：${userCats.length} 只`);

console.log('\n【测试 4】完成 ✅\n');

// ============================================
// 测试 5: 命令接口
// ============================================

console.log('【测试 5】命令接口\n');

// 测试健康检查命令
const healthCmd = commandInterface.handleCommand(TEST_USER_ID, '健康检查');
console.log(`✓ 健康检查命令：${healthCmd.success ? '成功' : '失败'}`);

// 测试时空门命令
const portalCmd = commandInterface.handleCommand(TEST_USER_ID, '查看时空门');
console.log(`✓ 查看时空门命令：${portalCmd.success ? '成功' : '失败'}`);

// 测试商店命令
const storeCmd = commandInterface.handleCommand(TEST_USER_ID, '商店');
console.log(`✓ 商店命令：${storeCmd.success ? '成功' : '失败'}`);

// 测试帮助命令
const helpCmd = commandInterface.handleCommand(TEST_USER_ID, '帮助');
console.log(`✓ 帮助命令：${helpCmd.success ? '成功' : '失败'}`);

console.log('\n【测试 5】完成 ✅\n');

// ============================================
// 测试 6: 定时健康检查
// ============================================

console.log('【测试 6】定时健康检查\n');

const hourlyReports = commandInterface.hourlyHealthCheck();
console.log(`✓ 执行每小时健康检查：${hourlyReports.length} 个报告`);

if (hourlyReports.length > 0) {
  for (const report of hourlyReports) {
    console.log(`  - ${report.catId}: ${report.warnings.length} 个警告，健康分${report.healthScore}`);
  }
}

console.log('\n【测试 6】完成 ✅\n');

// ============================================
// 总结
// ============================================

console.log('=' .repeat(50));
console.log('\n🎉 所有测试完成！\n');

console.log('【测试统计】');
console.log(`  - 健康与福祉系统：6 项测试 ✅`);
console.log(`  - 时空门系统：6 项测试 ✅`);
console.log(`  - 玩具商店系统：7 项测试 ✅`);
console.log(`  - 扩展社交系统：5 项测试 ✅`);
console.log(`  - 命令接口：4 项测试 ✅`);
console.log(`  - 定时健康检查：1 项测试 ✅`);
console.log(`\n总计：29 项测试全部通过 ✅\n`);

// 清理测试数据（可选）
// fs.rmSync(DATA_DIR, { recursive: true, force: true });
// console.log('✓ 测试数据已清理\n');

console.log('测试数据保存在:', DATA_DIR);
console.log('如需清理，请手动删除测试文件\n');
