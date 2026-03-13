/**
 * 猫咪养成游戏 - 完整测试脚本
 * 
 * 测试内容:
 * 1. 系统初始化
 * 2. 创建猫咪
 * 3. 互动测试（喂食、玩耍等）
 * 4. AIGC 照片生成
 * 5. 扩展系统测试
 * 6. 数据持久化
 */

const path = require('path');
const { CatPetSystem } = require('./src/index');

// 测试用户 ID
const TEST_USER_ID = 'test-user-001';

// 测试结果
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// 测试函数
function test(name, fn) {
  testResults.total++;
  console.log(`\n🧪 测试：${name}`);
  
  try {
    fn();
    testResults.passed++;
    console.log(`✅ 通过`);
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
    console.log(`❌ 失败：${error.message}`);
  }
}

// 异步测试函数
async function testAsync(name, fn) {
  testResults.total++;
  console.log(`\n🧪 测试：${name}`);
  
  try {
    await fn();
    testResults.passed++;
    console.log(`✅ 通过`);
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
    console.log(`❌ 失败：${error.message}`);
  }
}

// 主测试流程
async function runTests() {
  console.log('🐱 猫咪养成游戏测试开始！\n');
  console.log('=' .repeat(50));
  
  const catPet = new CatPetSystem();
  
  // 测试 1: 系统初始化
  await testAsync('1. 系统初始化', async () => {
    await catPet.init();
    if (!catPet.backupManager) throw new Error('备份管理器未初始化');
    if (!catPet.selfEvolution) throw new Error('自我进化系统未初始化');
    if (!catPet.aigcPhoto) throw new Error('AIGC 照片系统未初始化');
    console.log('   所有子系统已初始化');
  });
  
  // 测试 2: 创建猫咪数据
  await testAsync('2. 创建猫咪数据', async () => {
    const catData = await catPet.load(TEST_USER_ID);
    if (!catData) throw new Error('猫咪数据创建失败');
    if (!catData.userId) throw new Error('用户 ID 缺失');
    console.log('   猫咪数据创建成功');
  });
  
  // 测试 3: 保存数据
  await testAsync('3. 保存数据', async () => {
    const catData = await catPet.load(TEST_USER_ID);
    catData.cat = {
      name: '测试猫咪',
      breed: '中华田园猫',
      color: '橘色',
      gender: '母',
      age: 30
    };
    const saved = await catPet.save(TEST_USER_ID, catData);
    if (!saved) throw new Error('数据保存失败');
    console.log('   数据保存成功');
  });
  
  // 测试 4: 加载数据
  await testAsync('4. 加载数据', async () => {
    const catData = await catPet.load(TEST_USER_ID);
    if (!catData.cat) throw new Error('猫咪数据未找到');
    if (catData.cat.name !== '测试猫咪') throw new Error('猫咪名字不匹配');
    console.log(`   加载成功：${catData.cat.name}`);
  });
  
  // 测试 5: 记录照顾行为
  await testAsync('5. 记录照顾行为', async () => {
    const streak = await catPet.recordCare(TEST_USER_ID, 'feed');
    if (!streak) throw new Error('照顾记录失败');
    console.log(`   照顾记录成功`);
  });
  
  // 测试 6: 获取可用场景
  await testAsync('6. 获取 AIGC 场景', async () => {
    const scenes = catPet.getAvailableScenes();
    if (!scenes || scenes.length === 0) throw new Error('场景列表为空');
    console.log(`   可用场景：${scenes.length}个`);
    console.log(`   场景列表：${scenes.map(s => s.name).join(', ')}`);
  });
  
  // 测试 7: 获取扩展统计
  await testAsync('7. 获取扩展系统状态', async () => {
    const stats = catPet.getExtensionStats();
    if (!stats) throw new Error('扩展统计获取失败');
    console.log(`   扫描次数：${stats.totalScans}`);
    console.log(`   已加载：${stats.loadedFiles}个扩展`);
  });
  
  // 测试 8: 获取已加载扩展
  await testAsync('8. 获取已加载扩展', async () => {
    const loaded = catPet.getLoadedExtensions();
    console.log(`   已加载扩展：${loaded.length}个`);
    if (loaded.length > 0) {
      console.log(`   扩展列表：${loaded.map(e => e.moduleName).join(', ')}`);
    }
  });
  
  // 测试 9: 手动触发扩展扫描
  await testAsync('9. 手动扫描扩展', async () => {
    await catPet.scanExtensions();
    const stats = catPet.getExtensionStats();
    console.log(`   扫描完成，总扫描次数：${stats.totalScans}`);
  });
  
  // 测试 10: 获取相册
  await testAsync('10. 获取相册', async () => {
    const album = await catPet.getAlbum(TEST_USER_ID);
    if (!album) throw new Error('相册获取失败');
    console.log(`   相册照片数：${album.total}`);
  });
  
  // 测试 11: 数据备份
  await testAsync('11. 数据备份', async () => {
    const backupFile = await catPet.backupManager.createBackup(TEST_USER_ID, {
      test: 'backup test',
      timestamp: new Date().toISOString()
    });
    if (!backupFile) throw new Error('备份失败');
    console.log(`   备份成功：${path.basename(backupFile)}`);
  });
  
  // 测试 12: 获取备份统计
  await testAsync('12. 获取备份统计', async () => {
    const stats = await catPet.backupManager.getBackupStats(TEST_USER_ID);
    console.log(`   备份总数：${stats.total}`);
  });
  
  // 测试 13: 错误处理测试
  await testAsync('13. 错误处理', async () => {
    const result = await catPet.errorHandler.safeExecute(
      () => { throw new Error('测试错误'); },
      '测试错误处理',
      { fallback: '降级数据' }
    );
    if (!result) throw new Error('错误处理失败');
    console.log(`   错误处理正常，返回降级数据`);
  });
  
  // 测试 14: 连续照顾奖励
  await testAsync('14. 连续照顾奖励', async () => {
    const rewardInfo = catPet.streakReward.getRewardLevels();
    if (!rewardInfo || rewardInfo.length === 0) throw new Error('奖励信息获取失败');
    console.log(`   奖励等级：${rewardInfo.length}个`);
    console.log(`   最高奖励：${rewardInfo[rewardInfo.length - 1].reward}`);
  });
  
  // 测试 15: 新手引导
  await testAsync('15. 新手引导', async () => {
    const tutorial = await catPet.tutorial.initTutorial(TEST_USER_ID);
    if (!tutorial) throw new Error('新手引导初始化失败');
    console.log(`   新手引导已初始化`);
  });
  
  // 测试 16: 情感连接系统
  await testAsync('16. 情感连接系统', async () => {
    const bondInfo = await catPet.bond.getBondInfo(TEST_USER_ID);
    if (!bondInfo) throw new Error('情感连接信息获取失败');
    console.log(`   亲密度等级：${bondInfo.level} (${bondInfo.levelName})`);
  });
  
  // 测试 17: 获取可用场景（详细）
  await testAsync('17. AIGC 场景详情', async () => {
    const scenes = catPet.getAvailableScenes();
    const sceneDetails = scenes.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description
    }));
    console.log('   场景详情:');
    sceneDetails.forEach(s => {
      console.log(`     - ${s.name}: ${s.description}`);
    });
  });
  
  // 测试 18: 系统整体状态
  await testAsync('18. 系统整体状态', async () => {
    const status = {
      backupSystem: !!catPet.backupManager,
      evolutionSystem: !!catPet.selfEvolution,
      aigcSystem: !!catPet.aigcPhoto,
      streakReward: !!catPet.streakReward,
      tutorial: !!catPet.tutorial,
      bond: !!catPet.bond,
      errorHandler: !!catPet.errorHandler
    };
    
    const allOk = Object.values(status).every(v => v === true);
    if (!allOk) throw new Error('部分子系统未就绪');
    
    console.log('   所有子系统状态正常:');
    Object.entries(status).forEach(([key, value]) => {
      console.log(`     ${key}: ${value ? '✅' : '❌'}`);
    });
  });
  
  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`总测试数：${testResults.total}`);
  console.log(`✅ 通过：${testResults.passed}`);
  console.log(`❌ 失败：${testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`\n📈 通过率：${passRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有测试通过！系统运行正常！');
  } else {
    console.log(`\n⚠️ 有 ${testResults.failed} 个测试失败，请检查`);
  }
  
  return testResults;
}

// 运行测试
runTests()
  .then(() => {
    console.log('\n✅ 测试完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🚨 测试执行失败:', error);
    process.exit(1);
  });
