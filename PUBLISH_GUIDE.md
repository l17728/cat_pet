# 📦 猫咪养成系统 - 发布与安装指南

**如何分发这个 skill 给其他 OpenClaw 用户**

---

## 🎯 分发方式对比

| 方式 | 难度 | 推荐场景 |
|------|------|----------|
| ClawHub | ⭐⭐⭐ | 公开发布，版本管理 |
| SkillHub | ⭐⭐⭐ | 公开发布，社区分享 |
| 手动复制 | ⭐ | 本地测试，小范围分享 |
| Git 仓库 | ⭐⭐ | 开发协作，开源项目 |

---

## 方式 1: 通过 ClawHub 发布 (推荐)

### 前提条件

```bash
# 安装 clawhub CLI
npm install -g clawhub
```

### 发布步骤

1. **准备 skill 包**
   ```bash
   cd /root/.openclaw/workspace/skills/cat-pet
   
   # 确保有 SKILL.md 和 package.json
   ls -la
   ```

2. **登录 ClawHub**
   ```bash
   clawhub login
   ```

3. **发布**
   ```bash
   clawhub publish .
   ```

4. **验证发布**
   ```bash
   clawhub search cat-pet
   ```

### 用户安装

```bash
# 用户执行
clawhub install cat-pet
```

---

## 方式 2: 通过 SkillHub 发布

### 发布步骤

```bash
# 1. 登录
skillhub login

# 2. 发布
skillhub publish .

# 3. 验证
skillhub search cat-pet
```

### 用户安装

```bash
skillhub install cat-pet
```

---

## 方式 3: 手动分发 (最简单)

### 打包

```bash
cd /root/.openclaw/workspace/skills/
tar -czf cat-pet.tar.gz cat-pet/
```

### 分发给用户

- 通过邮件发送 `cat-pet.tar.gz`
- 通过网盘分享
- 通过 IM 工具传输

### 用户安装

```bash
# 1. 解压到 skills 目录
tar -xzf cat-pet.tar.gz -C ~/.openclaw/workspace/skills/

# 2. 重启 OpenClaw
openclaw gateway restart

# 3. 验证安装
openclaw skills list
```

---

## 方式 4: Git 仓库

### 发布步骤

```bash
cd /root/.openclaw/workspace/skills/cat-pet

# 1. 初始化 git
git init
git add .
git commit -m "Initial release"

# 2. 推送到远程仓库
git remote add origin https://github.com/yourname/cat-pet.git
git push -u origin main
```

### 用户安装

```bash
cd ~/.openclaw/workspace/skills/
git clone https://github.com/yourname/cat-pet.git

# 重启 OpenClaw
openclaw gateway restart
```

---

## 📋 发布前检查清单

### 必需文件

- [ ] `SKILL.md` - 技能说明
- [ ] `cat-core.js` - 主模块
- [ ] `package.json` - 依赖配置
- [ ] `README.md` - 详细文档（推荐）

### 可选文件

- [ ] `utils/` - 工具函数目录
- [ ] `test.js` - 测试脚本
- [ ] `examples/` - 使用示例

### 不要发布的文件

- [ ] `data/` - 用户数据（应排除）
- [ ] `logs/` - 日志文件
- [ ] `node_modules/` - 依赖（通过 package.json 管理）

---

## 🔧 package.json 配置

```json
{
  "name": "cat-pet",
  "version": "3.0.0",
  "description": "猫咪养成系统",
  "main": "cat-core.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": ["cat", "pet", "game"],
  "author": "Your Name",
  "license": "MIT",
  "clawhub": {
    "displayName": "猫咪养成系统",
    "category": "game",
    "tags": ["宠物", "养成", "游戏"]
  }
}
```

---

## 📦 .clawhub/meta.json 配置

```json
{
  "name": "cat-pet",
  "version": "3.0.0",
  "description": "在 OpenClaw 中创建并养育属于你的虚拟宠物猫！",
  "author": "Your Name",
  "license": "MIT",
  "repository": "https://github.com/yourname/cat-pet",
  "main": "cat-core.js",
  "files": [
    "SKILL.md",
    "cat-core.js",
    "utils/"
  ],
  "exclude": [
    "data/",
    "logs/",
    "node_modules/",
    "*.log"
  ]
}
```

---

## 🧪 测试安装

### 本地测试

```bash
# 1. 备份当前安装
cp -r ~/.openclaw/workspace/skills/cat-pet /tmp/cat-pet-backup

# 2. 卸载
rm -rf ~/.openclaw/workspace/skills/cat-pet

# 3. 重新安装
clawhub install cat-pet

# 4. 测试功能
# 在聊天中输入："创建猫咪"
```

### 远程测试

找一位朋友帮忙测试：

```bash
# 朋友执行
clawhub install cat-pet

# 测试命令
创建猫咪
看看我的猫
喂食
```

---

## 📊 版本管理

### 语义化版本

```
主版本。次版本.修订版
  ↑      ↑      ↑
 重大变更 新功能  bug 修复

示例:
1.0.0  # 初始发布
1.1.0  # 新增功能
1.1.1  # bug 修复
2.0.0  # 重大变更（不兼容）
```

### 更新 skill

```bash
# 修改代码后
cd /root/.openclaw/workspace/skills/cat-pet

# 更新版本号
# 编辑 package.json 和 .clawhub/meta.json

# 重新发布
clawhub publish .

# 用户更新
clawhub update cat-pet
```

---

## 🎯 最佳实践

### 1. 使用版本控制

```bash
git init
git add .
git commit -m "v3.0.0 - 纯工具函数架构"
git tag v3.0.0
```

### 2. 编写清晰的文档

- `SKILL.md` - 快速开始
- `README.md` - 详细说明
- `EXAMPLES.md` - 使用示例

### 3. 提供测试脚本

```javascript
// test.js
console.log('猫咪养成系统测试...');
const catPet = require('./cat-core');
// 测试各个功能
```

### 4. 排除敏感文件

创建 `.gitignore`:
```
data/
logs/
*.log
.env
```

---

## ❓ 常见问题

### Q: 发布后用户看不到？
A: 检查是否发布了正确的目录，确保有 SKILL.md。

### Q: 用户安装后无法使用？
A: 让用户重启 OpenClaw: `openclaw gateway restart`

### Q: 如何更新已发布的 skill？
A: 修改版本号后重新发布：`clawhub publish .`

### Q: 可以收费吗？
A: 可以，但需要在 SKILL.md 中明确说明。

---

## 📞 获取帮助

- ClawHub 文档：https://clawhub.com/docs
- OpenClaw 文档：https://docs.openclaw.ai
- 社区：https://discord.gg/clawd

---

**祝发布顺利！** 🚀
