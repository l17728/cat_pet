/**
 * 🧪 猫咪养成系统 v3.0.0 - 验证测试
 * 测试核心功能是否正常
 */

const catPet = require('./cat-core');

console.log('🧪 猫咪养成系统 v3.0.0 - 验证测试\n');
console.log('=' .repeat(60));

const stats = { total: 0, passed: 0, failed: 0 };

function test(name, fn) {
  stats.total++;
  try {
    const result = fn();
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

// 测试数据
const TEST_USER = 'test_verify_user';

console.log('\n【测试 1】创建猫咪\n');

test('创建活泼猫咪', () => {
  const result = catPet.createCat(TEST_USER, {
    name: '雪球',
    personality: '活泼',
    breed: '布偶猫'
  });
  console.log(`   创建成功：${result.cat?.name}`);
  return result.success && result.cat;
});

test('创建高冷猫咪', () => {
  const result = catPet.createCat(TEST_USER, {
    name: '煤球',
    personality: '高冷'
  });
  return result.success && result.cat;
});

console.log('\n【测试 2】查看状态\n');

test('获取猫咪列表', () => {
  const result = catPet.getUserCats(TEST_USER);
  console.log(`   猫咪数量：${result.cats?.length || 0}`);
  return result.cats && result.cats.length > 0;
});

test('查看猫咪状态', () => {
  const cats = catPet.getUserCats(TEST_USER).cats;
  const result = catPet.getStatus(TEST_USER, cats[0].id);
  console.log(`   状态：${result.status}`);
  return result.success && result.stats;
});

console.log('\n【测试 3】互动功能\n');

test('喂食互动', () => {
  const cats = catPet.getUserCats(TEST_USER).cats;
  const result = catPet.feed(TEST_USER, cats[0].id);
  console.log(`   反应：${result.reaction}`);
  return result.success && result.reaction;
});

test('玩耍互动', () => {
  const cats = catPet.getUserCats(TEST_USER).cats;
  const result = catPet.play(TEST_USER, cats[0].id);
  console.log(`   反应：${result.reaction}`);
  return result.success && result.reaction;
});

test('摸摸互动', () => {
  const cats = catPet.getUserCats(TEST_USER).cats;
  const result = catPet.pet(TEST_USER, cats[0].id);
  console.log(`   反应：${result.reaction}`);
  return result.success && result.reaction;
});

console.log('\n【测试 4】工具函数\n');

test('加载猫咪数据', () => {
  const cats = catPet.getUserCats(TEST_USER).cats;
  const cat = catPet.loadCatData(cats[0].id);
  return cat && cat.name === '雪球';
});

test('验证数据一致性', () => {
  const cats = catPet.getUserCats(TEST_USER).cats;
  const cat = catPet.loadCatData(cats[0].id);
  return cat.name === '雪球' && cat.personality === '活泼';
});

console.log('\n' + '=' .repeat(60));
console.log('\n📊 测试结果\n');
console.log(`总测试数：${stats.total}`);
console.log(`✅ 通过：${stats.passed}`);
console.log(`❌ 失败：${stats.failed}`);
console.log(`成功率：${(stats.passed / stats.total * 100).toFixed(1)}%`);

if (stats.failed === 0) {
  console.log('\n🎉 所有测试通过！v3.0.0 运行正常！\n');
} else {
  console.log(`\n⚠️ 有 ${stats.failed} 项测试失败\n`);
}

// 清理测试数据
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');
const testFiles = [
  path.join(DATA_DIR, `${TEST_USER}.json`),
  ...fs.readdirSync(DATA_DIR).filter(f => f.includes(TEST_USER)).map(f => path.join(DATA_DIR, f))
];

testFiles.forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});

console.log('测试数据已清理\n');

process.exit(stats.failed > 0 ? 1 : 0);
