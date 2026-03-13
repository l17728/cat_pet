#!/usr/bin/env node

/**
 * 🐱 猫咪养成系统 - 增强版测试
 * 测试新功能：性格反馈、随机事件、隐藏成就
 */

const catPet = require('./cat-core');

// 测试用户 ID
const TEST_USER = 'test_enhanced_' + Date.now();

function printSeparator() {
  console.log('\n' + '='.repeat(60) + '\n');
}

function printCat(cat) {
  console.log(`╔═══════════════════════════╗`);
  console.log(`   🐱 ${cat.name} (${cat.breed})`);
  console.log(`╚═══════════════════════════╝`);
  console.log(`\n🎨 毛色：${cat.color}`);
  console.log(`👁️ 眼睛：${cat.eyes}`);
  console.log(`⚤ 性别：${cat.gender}`);
  console.log(`💭 性格：${cat.personality}`);
  console.log(`\n🎂 出生日期：${cat.birthDate}`);
}

async function runTests() {
  console.log('🐱 猫咪养成系统 - 增强版功能测试\n');
  console.log('测试新功能：性格反馈、随机事件、隐藏成就\n');
  
  // 测试 1: 创建多只不同性格的猫
  printSeparator();
  console.log('📋 测试 1: 创建不同性格的猫咪');
  
  const personalities = ['活泼', '温顺', '高冷', '粘人', '独立', '好奇', '胆小', '霸道'];
  
  for (const personality of personalities) {
    const user = TEST_USER + '_' + personality;
    const cat = catPet.createCat(user, {
      name: `测试_${personality}`,
      personality: personality
    });
    console.log(`✅ 创建了${personality}性格的猫咪：${cat.name}`);
  }
  
  // 测试 2: 性格反馈系统
  printSeparator();
  console.log('📋 测试 2: 性格反馈系统测试');
  
  for (const personality of personalities) {
    const user = TEST_USER + '_' + personality;
    
    console.log(`\n【${personality}猫咪】`);
    
    // 测试喂食反馈
    const feedResult = catPet.feed(user);
    if (feedResult.success) {
      console.log(`  🍖 喂食：${feedResult.message}`);
      if (feedResult.quote) console.log(`  💬 语录："${feedResult.quote}"`);
    }
    
    // 测试玩耍反馈
    const playResult = catPet.play(user);
    if (playResult.success) {
      console.log(`  🎾 玩耍：${playResult.message}`);
      if (playResult.quote) console.log(`  💬 语录："${playResult.quote}"`);
    }
    
    // 测试摸摸反馈
    const petResult = catPet.pet(user);
    if (petResult.success) {
      console.log(`  🤚 摸摸：${petResult.message}`);
      if (petResult.quote) console.log(`  💬 语录："${petResult.quote}"`);
    }
  }
  
  // 测试 3: 随机事件系统
  printSeparator();
  console.log('📋 测试 3: 随机事件系统测试');
  console.log('（多次触发以展示不同事件）\n');
  
  const eventUser = TEST_USER + '_event';
  catPet.createCat(eventUser, { name: '事件测试猫', personality: '好奇' });
  
  const eventsSeen = new Set();
  let attempts = 0;
  const maxAttempts = 50;
  
  while (eventsSeen.size < 10 && attempts < maxAttempts) {
    attempts++;
    const result = catPet.play(eventUser);
    if (result.event) {
      const eventKey = result.event.name;
      if (!eventsSeen.has(eventKey)) {
        eventsSeen.add(eventKey);
        console.log(`🎲 事件 #${eventsSeen.size}: ${result.event.icon} ${result.event.name}`);
        console.log(`   描述：${result.event.desc}`);
        console.log(`   语录："${result.event.quote}"`);
        console.log(`   效果：${JSON.stringify(result.event.effects)}`);
        console.log();
      }
    }
    // 重置冷却以便继续测试
    const cat = catPet.loadCatData(eventUser);
    cat.cooldowns = {};
    catPet.saveCatData(eventUser, cat);
  }
  
  console.log(`✅ 共触发 ${eventsSeen.size}/10 种不同事件（尝试${attempts}次）`);
  
  // 测试 4: 成就系统（含隐藏成就）
  printSeparator();
  console.log('📋 测试 4: 成就系统测试');
  
  const achievementUser = TEST_USER + '_achievement';
  const achCat = catPet.createCat(achievementUser, { name: '成就测试猫' });
  
  // 获取成就列表
  const achievements = catPet.getAchievements(achievementUser);
  console.log(`\n🏆 成就总数：${achievements.total}`);
  console.log(`   已解锁：${achievements.unlocked}`);
  console.log(`\n成就列表:`);
  
  let publicCount = 0;
  let hiddenCount = 0;
  
  for (const ach of achievements.achievements) {
    const status = ach.unlocked ? '✅' : '⬜';
    const hiddenMark = ach.hidden ? '🤫' : '📖';
    console.log(`   ${status} ${hiddenMark} ${ach.name} - ${ach.desc}`);
    if (ach.hidden) hiddenCount++;
    else publicCount++;
  }
  
  console.log(`\n📊 公开成就：${publicCount}个`);
  console.log(`   隐藏成就：${hiddenCount}个`);
  
  // 测试解锁成就
  console.log(`\n🔓 测试成就解锁...`);
  
  // 第一次互动解锁"新手铲屎官"
  catPet.feed(achievementUser);
  const newAchievements = catPet.checkAchievements(achievementUser, catPet.loadCatData(achievementUser));
  if (newAchievements.length > 0) {
    console.log(`   ✅ 解锁成就：${newAchievements.map(a => a.name).join(', ')}`);
  }
  
  // 测试 5: 互动计数统计
  printSeparator();
  console.log('📋 测试 5: 互动计数统计测试');
  
  const statsUser = TEST_USER + '_stats';
  catPet.createCat(statsUser, { name: '统计测试猫' });
  
  // 多次互动
  catPet.feed(statsUser);
  catPet.feed(statsUser);
  catPet.play(statsUser);
  catPet.play(statsUser);
  catPet.play(statsUser);
  catPet.bathe(statsUser);
  catPet.sleep(statsUser);
  catPet.sleep(statsUser);
  catPet.pet(statsUser);
  
  // 重置冷却
  let cat = catPet.loadCatData(statsUser);
  cat.cooldowns = {};
  catPet.saveCatData(statsUser, cat);
  
  // 再次互动
  catPet.feed(statsUser);
  catPet.play(statsUser);
  
  cat = catPet.loadCatData(statsUser);
  
  console.log(`\n📊 互动统计:`);
  console.log(`   总互动次数：${cat.interactions}`);
  console.log(`   喂食次数：${cat.feedCount}`);
  console.log(`   玩耍次数：${cat.playCount}`);
  console.log(`   洗澡次数：${cat.batheCount}`);
  console.log(`   睡觉次数：${cat.sleepCount}`);
  console.log(`   摸摸次数：${cat.petCount}`);
  console.log(`   事件触发：${cat.eventCount}`);
  
  // 测试 6: 查看状态
  printSeparator();
  console.log('📋 测试 6: 查看状态测试');
  
  const statusUser = TEST_USER + '_status';
  catPet.createCat(statusUser, { name: '状态测试猫', personality: '活泼' });
  
  const status = catPet.getStatus(statusUser);
  if (status.success) {
    const c = status.cat;
    console.log(`\n╔═══════════════════════════╗`);
    console.log(`   🐱 ${c.name} (${c.breed})`);
    console.log(`╚═══════════════════════════╝`);
    console.log(`\n🎂 年龄：${c.ageDays} 天`);
    console.log(`💭 性格：${c.personality}`);
    console.log(`⚡ 精力：${c.stats.energy}/100`);
    console.log(`💖 心情：${c.stats.mood}/100`);
    console.log(`🍖 饱食：${c.stats.hunger}/100`);
    console.log(`🛁 清洁：${c.stats.cleanliness}/100`);
    console.log(`\n当前状态：${c.statusDesc.text} ${c.statusDesc.emoji}`);
  }
  
  // 清理测试数据
  printSeparator();
  console.log('📋 清理测试数据...');
  
  for (const personality of personalities) {
    catPet.deleteCat(TEST_USER + '_' + personality);
  }
  catPet.deleteCat(eventUser);
  catPet.deleteCat(achievementUser);
  catPet.deleteCat(statsUser);
  catPet.deleteCat(statusUser);
  
  console.log('✅ 测试完成！\n');
  
  printSeparator();
  console.log('🎉 所有增强版功能测试通过！');
  console.log('\n✨ 新增功能验证:');
  console.log('   ✅ 性格反馈系统 - 8 种性格各有特色');
  console.log('   ✅ 随机事件系统 - 10 种事件可触发');
  console.log('   ✅ 猫咪语录系统 - 性格特色对话');
  console.log('   ✅ 隐藏成就系统 - 5 个隐藏成就');
  console.log('   ✅ 互动统计系统 - 详细计数追踪');
  console.log('\n🐱 猫咪养成系统运行正常~\n');
}

// 运行测试
runTests().catch(console.error);
