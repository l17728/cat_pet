#!/usr/bin/env node
/**
 * 模拟器测试脚本
 * 验证核心功能无需 Star-Office 后端
 */

console.log('🧪 猫咪模拟器 - 单元测试\n');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// ============ 测试状态映射 ============
console.log('\n📋 状态映射测试\n');

const mapper = require('./state-mapper');

test('健康猫咪 → writing 状态', () => {
  const cat = {
    name: '健康猫',
    personality: '活泼',
    stats: { energy: 70, mood: 70, hunger: 70, cleanliness: 70 }
  };
  const result = mapper.mapCatToOffice(cat);
  assert(result.state === 'writing', `期望 writing，得到 ${result.state}`);
});

test('饥饿猫咪 → error 状态', () => {
  const cat = {
    name: '饿猫',
    personality: '活泼',
    stats: { energy: 70, mood: 70, hunger: 20, cleanliness: 70 }
  };
  const result = mapper.mapCatToOffice(cat);
  assert(result.state === 'error', `期望 error，得到 ${result.state}`);
  assert(result.rule === 'hungry', `期望 hungry 规则`);
});

test('脏猫咪 → error 状态', () => {
  const cat = {
    name: '脏猫',
    personality: '活泼',
    stats: { energy: 70, mood: 70, hunger: 70, cleanliness: 20 }
  };
  const result = mapper.mapCatToOffice(cat);
  assert(result.state === 'error', `期望 error，得到 ${result.state}`);
  assert(result.rule === 'dirty', `期望 dirty 规则`);
});

test('累猫咪 → idle 状态', () => {
  const cat = {
    name: '累猫',
    personality: '活泼',
    stats: { energy: 15, mood: 50, hunger: 70, cleanliness: 70 }
  };
  const result = mapper.mapCatToOffice(cat);
  assert(result.state === 'idle', `期望 idle，得到 ${result.state}`);
  assert(result.rule === 'exhausted', `期望 exhausted 规则`);
});

test('开心猫咪 → syncing 状态', () => {
  const cat = {
    name: '开心猫',
    personality: '活泼',
    stats: { energy: 80, mood: 90, hunger: 70, cleanliness: 70 }
  };
  const result = mapper.mapCatToOffice(cat);
  assert(result.state === 'syncing', `期望 syncing，得到 ${result.state}`);
});

test('性格后缀调整', () => {
  const cat = {
    name: '高冷猫',
    personality: '高冷',
    stats: { energy: 70, mood: 70, hunger: 70, cleanliness: 70 }
  };
  const result = mapper.mapCatToOffice(cat);
  const adjusted = mapper.adjustDetailByPersonality(cat, result.detail);
  assert(adjusted.includes('哼。'), `期望包含高冷后缀`);
});

// ============ 测试 Office 客户端 ============
console.log('\n📡 API 客户端测试\n');

const OfficeClient = require('./office-client');

test('客户端实例化', () => {
  const client = new OfficeClient('http://127.0.0.1:19000');
  assert(client.baseUrl === 'http://127.0.0.1:19000');
});

test('状态摘要生成', () => {
  const cat = {
    name: '测试猫',
    stats: { energy: 80, mood: 70, hunger: 90, cleanliness: 85 }
  };
  const summary = mapper.getCatStatusSummary(cat);
  assert(summary.includes('测试猫'), '摘要应包含猫咪名字');
  assert(summary.includes('80'), '摘要应包含精力值');
});

// ============ 测试 cat-pet 集成 ============
console.log('\n🐱 cat-pet 集成测试\n');

const catCore = require('../cat-core.js');

test('创建猫咪', () => {
  const result = catCore.createCat('test_user_sim', {
    name: '测试猫咪',
    personality: '活泼'
  });
  assert(result.success, '创建应该成功');
  assert(result.cat.name === '测试猫咪');
});

test('获取用户猫咪列表', () => {
  const result = catCore.getUserCats('test_user_sim');
  assert(result.cats !== undefined, '应该返回 cats 数组');
});

test('获取猫咪状态', () => {
  const cats = catCore.getUserCats('test_user_sim');
  if (cats.cats.length > 0) {
    const status = catCore.getStatus('test_user_sim', cats.cats[0].id);
    assert(status.success, '获取状态应该成功');
    assert(status.cat, '应该返回猫咪信息');
    assert(status.stats, '应该返回状态信息');
  }
});

test('喂食操作', () => {
  const cats = catCore.getUserCats('test_user_sim');
  if (cats.cats.length > 0) {
    const result = catCore.feed('test_user_sim', cats.cats[0].id);
    assert(result.success !== false, '喂食应该成功或返回冷却信息');
  }
});

// ============ 清理测试数据 ============
console.log('\n🧹 清理测试数据\n');

const fs = require('fs');
const path = require('path');
const dataDir = path.join(process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace', 'cat-pet', 'data');

const testUserFile = path.join(dataDir, 'test_user_sim.json');
if (fs.existsSync(testUserFile)) {
  // 读取并删除测试猫咪
  const userData = JSON.parse(fs.readFileSync(testUserFile, 'utf-8'));
  if (userData.cats) {
    userData.cats.forEach(catId => {
      const catFile = path.join(dataDir, `cat_${catId}.json`);
      if (fs.existsSync(catFile)) fs.unlinkSync(catFile);
    });
  }
  fs.unlinkSync(testUserFile);
  console.log('✅ 清理测试数据');
}

// ============ 结果汇总 ============
console.log('\n' + '='.repeat(50));
console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败\n`);

if (failed > 0) {
  process.exit(1);
}