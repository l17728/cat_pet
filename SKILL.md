# 🐱 猫咪养成系统 (Cat Pet)

**版本**: 3.0.0  
**类型**: 工具函数 Skill  
**作者**: Your Name  
**许可**: MIT

---

## 📖 简介

在 OpenClaw 中创建并养育属于你的虚拟宠物猫！

- 🎲 随机生成猫咪（品种/性格/外观）
- 🎮 丰富互动（喂食/玩耍/洗澡/睡觉/摸摸）
- 📊 状态系统（精力/心情/饱食/清洁）
- 🏆 成就系统（11 个成就）
- 💾 数据持久化

---

## 🚀 安装

### 方法 1: ClawHub (推荐)

```bash
clawhub install cat-pet
```

### 方法 2: SkillHub

```bash
skillhub install cat-pet
```

### 方法 3: 手动安装

```bash
# 1. 下载 skill 文件夹
# 2. 复制到 skills 目录
cp -r cat-pet ~/.openclaw/workspace/skills/

# 3. 重启 OpenClaw
openclaw gateway restart
```

### 方法 4: Git

```bash
cd ~/.openclaw/workspace/skills/
git clone https://github.com/yourname/cat-pet.git
```

---

## 🎮 使用方法

### 基本命令

安装后，直接在聊天中使用：

```
创建猫咪
创建猫咪，品种布偶，白色，母猫，叫雪球
看看我的猫
喂食
玩耍
洗澡
睡觉
摸摸
查看成就
```

### Agent 自动调用

本 skill 提供工具函数，Agent 的 LLM 会根据你的消息自动调用：

```
你说："给我的猫喂食"
Agent → 调用 feed() 工具 → 返回响应
```

---

## 🛠️ 技术说明

### 架构

```
用户消息 → OpenClaw Agent → LLM 理解意图 → 调用 Skill 工具 → 返回数据 → LLM 格式化 → 用户响应
```

**特点**:
- ✅ 纯工具函数，无 LLM 耦合
- ✅ 符合 OpenClaw 标准架构
- ✅ 可独立测试
- ✅ 易于维护

### 工具函数 API

```javascript
const catPet = require('./skills/cat-pet');

// 创建猫咪
catPet.createCat(userId, { name, personality, breed });

// 互动
catPet.feed(userId, catId);
catPet.play(userId, catId);
catPet.bathe(userId, catId);
catPet.sleep(userId, catId);
catPet.pet(userId, catId);

// 查询
catPet.getStatus(userId, catId);
catPet.getAchievements(userId, catId);
```

### 返回数据结构

```javascript
// feed() 返回
{
  success: true,
  action: 'feed',
  cat: { name: '雪球', personality: '活泼' },
  reaction: '兴奋地转圈圈吃饭！',
  stats: { energy: 80, mood: 85, hunger: 90, cleanliness: 70 },
  cooldown: 120,
  achievements: []
}
```

---

## 📋 系统要求

- OpenClaw: v2026.3.7+
- Node.js: v18+
- 磁盘空间：~100KB

---

## 📁 文件结构

```
cat-pet/
├── SKILL.md              # 技能说明（本文件）
├── README.md             # 详细文档
├── cat-core.js           # 核心逻辑
├── utils/
│   └── cat-tools.js      # 工具函数
├── data/                 # 数据目录（运行时创建）
└── package.json          # 依赖配置
```

---

## 🔧 配置

### 数据位置

```
~/.openclaw/workspace/cat-pet/data/
├── {userId}.json         # 用户数据
└── cat_{catId}.json      # 猫咪数据
```

### 环境变量

```bash
# 可选：自定义数据目录
export OPENCLAW_WORKSPACE=/path/to/workspace
```

---

## 🧪 测试

```bash
cd ~/.openclaw/workspace/skills/cat-pet
node test.js
```

---

## ❓ 常见问题

### Q: 安装后如何使用？
A: 直接在聊天中输入命令，如"创建猫咪"、"喂食"等。

### Q: 可以养几只猫？
A: 最多 5 只。

### Q: 数据会丢失吗？
A: 不会，数据持久化保存在 data 目录。

### Q: 如何备份数据？
A: 备份 `~/.openclaw/workspace/cat-pet/data/` 文件夹。

---

## 📝 更新日志

### v3.0.0 (2026-03-13)
- 🔄 重构为纯工具函数架构
- ✅ 符合 OpenClaw 标准
- 🎯 通过 Agent LLM 提供自然语言交互

### v2.0.0 (2026-03-13)
- 🏥 健康福祉系统
- 🌀 时空门系统
- 👥 跨用户社交
- 🛒 扩展玩具商店

### v1.0.0 (2026-03-12)
- ✨ 初始版本

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 📞 支持

- 文档：`README.md`
- 示例：`EXAMPLES.md`
- Issue: https://github.com/yourname/cat-pet/issues

---

**开始你的养猫之旅吧！** 🐾
