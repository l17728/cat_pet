# 🧬 自我进化系统指南

**版本**: 1.0.0  
**更新时间**: 2026-03-12

---

## ✨ 功能介绍

自我进化系统允许猫咪养成系统**动态加载新技能**，无需重启服务！

### 核心特性

- 🔥 **热加载** - 无需重启服务
- 📦 **增量加载** - 只加载新文件
- 🚫 **避免重复** - 文件哈希追踪
- 📁 **目录扫描** - 定时自动扫描
- 🧪 **沙箱执行** - 错误隔离
- 📊 **加载统计** - 完整追踪记录

---

## 📁 目录结构

```
cat-pet/
├── extensions/              # 扩展目录 ⭐
│   ├── loaded.json          # 已加载文件记录
│   ├── 2026-03-12/          # 日期子目录
│   │   ├── action-new.js    # 新互动动作
│   │   ├── achievement.js   # 新成就
│   │   └── feature-xxx.js   # 新功能
│   └── 2026-03-13/
│       └── ...
├── src/
│   └── core/
│       └── self-evolution.js # 自我进化系统
└── SELF_EVOLUTION_GUIDE.md   # 本文档
```

---

## 🚀 工作原理

### 加载流程

```
1. 系统启动
   ↓
2. 扫描 extensions 目录
   ↓
3. 计算文件哈希
   ↓
4. 对比已加载记录
   ↓
5. 只加载新文件/变更文件
   ↓
6. 缓存模块 + 保存记录
   ↓
7. 定时扫描（每 15 分钟）
```

### 避免重复加载

| 机制 | 说明 |
|------|------|
| 文件哈希 | MD5 哈希追踪文件变化 |
| 加载记录 | 持久化保存已加载文件 |
| 模块缓存 | Node.js require 缓存 |
| 变更检测 | 哈希变化才重新加载 |

---

## 📝 创建扩展文件

### 文件命名规范

```
extensions/
└── {date}/
    └── {type}-{name}.js

示例:
└── 2026-03-12/
    ├── action-new-interactions.js
    ├── achievement-new-achievements.js
    └── feature-photo-filter.js
```

### 扩展文件模板

```javascript
/**
 * 扩展模块 - {功能名称}
 * 
 * 描述：{功能描述}
 * 作者：{作者}
 * 日期：{日期}
 */

// 模块数据
const myData = {
  // ...
};

/**
 * 模块加载时的初始化（可选）
 */
async function onLoad() {
  console.log('📦 加载扩展...');
  // 初始化代码
}

/**
 * 模块卸载时的清理（可选）
 */
async function onUnload() {
  console.log('🗑️ 卸载扩展...');
  // 清理代码
}

/**
 * 导出接口
 */
function getData() {
  return myData;
}

module.exports = {
  onLoad,
  onUnload,
  getData,
  myData
};
```

---

## 🔧 使用示例

### 1. 查看已加载扩展

```javascript
// 获取已加载文件列表
const loaded = catPet.getLoadedExtensions();

console.log(loaded);
// [
//   {
//     path: '/path/to/extension.js',
//     hash: 'abc123...',
//     loadTime: '2026-03-12T20:30:00.000Z',
//     moduleName: 'action-new'
//   }
// ]
```

### 2. 查看扩展统计

```javascript
const stats = catPet.getExtensionStats();

console.log(stats);
// {
//   totalScans: 5,
//   totalLoaded: 10,
//   totalSkipped: 3,
//   totalErrors: 0,
//   loadedFiles: 10,
//   cachedModules: 10,
//   lastScanTime: '2026-03-12T20:45:00.000Z',
//   isScanning: false
// }
```

### 3. 手动触发扫描

```javascript
// 立即扫描扩展目录
await catPet.scanExtensions();

console.log('扫描完成');
```

### 4. 获取扩展模块

```javascript
// 获取特定扩展模块
const module = catPet.getExtensionModule('action-new');

// 使用模块功能
const interactions = module.getInteractions();
```

### 5. 获取所有扩展

```javascript
const evolution = catPet.getEvolutionSystem();
const allModules = evolution.getAllModules();

console.log(Object.keys(allModules));
// ['action-new', 'achievement-new', ...]
```

---

## 📋 扩展示例

### 示例 1: 新互动动作

```javascript
// extensions/2026-03-12/action-new-interactions.js

const newInteractions = [
  {
    id: 'massage',
    name: '按摩',
    description: '给猫咪按摩',
    effects: {
      bond: 15,
      mood: 10
    },
    cooldown: 3600000
  }
];

async function onLoad() {
  console.log('加载新互动动作...');
}

module.exports = {
  onLoad,
  getInteractions: () => newInteractions
};
```

### 示例 2: 新成就系统

```javascript
// extensions/2026-03-12/achievement-new.js

const newAchievements = [
  {
    id: 'first_week',
    name: '第一周陪伴',
    description: '连续照顾 7 天',
    reward: { coins: 100 }
  }
];

async function onLoad() {
  console.log('加载新成就...');
}

module.exports = {
  onLoad,
  getAchievements: () => newAchievements
};
```

### 示例 3: 新功能模块

```javascript
// extensions/2026-03-12/feature-cat-speak.js

const catSounds = {
  happy: '喵～',
  hungry: '喵喵！',
  sleepy: '喵呜...'
};

async function onLoad() {
  console.log('加载猫咪说话功能...');
}

function speak(mood) {
  return catSounds[mood] || '喵？';
}

module.exports = {
  onLoad,
  speak,
  catSounds
};
```

---

## ⚙️ 配置选项

### 扫描间隔

默认每 15 分钟扫描一次，可在 `src/index.js` 中修改：

```javascript
const scanInterval = 15 * 60 * 1000; // 改为 10 分钟
// const scanInterval = 10 * 60 * 1000;
```

### 扩展目录

默认在 `extensions/` 目录，可修改：

```javascript
this.extensionsDir = path.join(baseDir, 'my-extensions');
```

---

## 📊 加载记录

### loaded.json 格式

```json
{
  "/path/to/extension.js": {
    "hash": "abc123...",
    "loadTime": "2026-03-12T20:30:00.000Z",
    "moduleName": "action-new"
  }
}
```

### 记录管理

| 操作 | 说明 |
|------|------|
| 自动保存 | 每次扫描后自动保存 |
| 手动清除 | 删除 loaded.json |
| 强制重载 | `forceReload()` 方法 |

---

## ⚠️ 注意事项

### 文件命名

- ✅ 使用 `.js` 扩展名
- ✅ 使用日期子目录
- ✅ 描述性文件名
- ❌ 避免特殊字符
- ❌ 避免中文文件名

### 模块编写

- ✅ 导出 `onLoad` 和 `onUnload`
- ✅ 错误处理完善
- ✅ 避免全局变量
- ❌ 避免副作用
- ❌ 避免阻塞操作

### 性能考虑

| 方面 | 建议 |
|------|------|
| 文件大小 | < 100KB |
| 加载时间 | < 1 秒 |
| 模块数量 | < 50 个 |
| 扫描间隔 | ≥ 5 分钟 |

---

## 🔍 调试技巧

### 查看加载日志

```
🧬 初始化自我进化系统...
✅ 自我进化系统初始化完成
📊 已加载 2 个扩展文件
🔍 开始扫描扩展目录...
🆕 发现 1 个新文件
📦 加载扩展文件：/path/to/file.js
✅ 加载成功：module-name
✅ 扫描完成
```

### 检查加载状态

```javascript
const stats = catPet.getExtensionStats();

if (stats.totalErrors > 0) {
  console.error('最后错误:', stats.lastError);
}
```

### 强制重新加载

```javascript
// 清除所有缓存，重新加载
await catPet.getEvolutionSystem().forceReload();
```

---

## 🎯 实际应用场景

### 1. 渐进式功能发布

```
Week 1: 基础功能
Week 2: extensions/2026-03-12/feature-week2.js
Week 3: extensions/2026-03-19/feature-week3.js
```

### 2. 活动扩展

```
春节活动：extensions/2026-02-01/event-spring-festival.js
生日活动：extensions/2026-03-12/event-birthday.js
```

### 3. 用户自定义

```
用户创建扩展 → 放入 extensions 目录 → 自动加载
```

### 4. A/B 测试

```
A 组功能：extensions/2026-03-12/feature-a.js
B 组功能：extensions/2026-03-12/feature-b.js
```

---

## 📈 系统统计

### 查看统计信息

```javascript
const stats = catPet.getExtensionStats();

console.log(`
  总扫描次数：${stats.totalScans}
  总加载数：${stats.totalLoaded}
  总跳过数：${stats.totalSkipped}
  总错误数：${stats.totalErrors}
  已加载文件：${stats.loadedFiles}
  缓存模块：${stats.cachedModules}
  最后扫描：${stats.lastScanTime}
`);
```

---

## 🔮 未来计划

- [ ] 扩展市场
- [ ] 扩展版本管理
- [ ] 依赖管理
- [ ] 扩展沙箱隔离
- [ ] 热更新通知
- [ ] 扩展性能监控

---

## 📝 最佳实践

### 1. 文件组织

```
extensions/
├── 2026-03-12/
│   ├── README.md          # 说明文档
│   ├── action-xxx.js      # 互动动作
│   ├── achievement-yyy.js # 成就
│   └── feature-zzz.js     # 功能
└── 2026-03-13/
    └── ...
```

### 2. 版本控制

```javascript
// 在扩展中包含版本信息
const moduleInfo = {
  name: 'action-new',
  version: '1.0.0',
  author: 'Your Name',
  date: '2026-03-12'
};
```

### 3. 错误处理

```javascript
async function onLoad() {
  try {
    // 初始化代码
  } catch (error) {
    console.error('扩展加载失败:', error);
    // 降级处理
  }
}
```

### 4. 资源清理

```javascript
async function onUnload() {
  // 清理定时器
  if (this.timer) {
    clearInterval(this.timer);
  }
  
  // 清理文件句柄
  // ...
}
```

---

**系统版本**: 1.0.0  
**最后更新**: 2026-03-12  
**状态**: ✅ 已实现，可使用

---

**🧬 让系统自我进化，持续成长！** 🚀
