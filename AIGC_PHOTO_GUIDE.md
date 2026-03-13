# 🎨 猫咪 AIGC 相册功能指南

**版本**: 1.0.0  
**更新时间**: 2026-03-12

---

## ✨ 功能介绍

通过 AI 生成技术，为你的虚拟猫咪生成精美的场景照片！

### 特色功能

- 🎨 **AI 文生图** - 根据场景自动生成猫咪照片
- 📸 **多场景支持** - 喂食、玩耍、睡觉、生日等
- 🆓 **免费服务** - 使用 Pollinations.ai 完全免费
- 📁 **相册管理** - 自动保存和整理照片
- 🎯 **智能提示词** - 根据猫咪特征自动生成

---

## 🎯 可用场景

| 场景 ID | 场景名称 | 描述 |
|--------|----------|------|
| `feeding` | 喂食 | 猫咪吃饭的可爱场景 |
| `playing` | 玩耍 | 猫咪玩玩具的动态场景 |
| `sleeping` | 睡觉 | 猫咪安静睡觉的温馨场景 |
| `bathing` | 洗澡 | 猫咪洗澡的可爱场景 |
| `birthday` | 生日 | 猫咪过生日的庆祝场景 |
| `holiday` | 节日 | 节日主题的特殊场景 |
| `growth` | 成长记录 | 记录猫咪成长的纪念照 |
| `achievement` | 成就纪念 | 获得成就的纪念照片 |

---

## 🚀 使用方法

### 1. 生成猫咪照片

```javascript
// 生成玩耍场景照片
const result = await catPet.generatePhoto(userId, 'playing');

console.log(result);
// {
//   success: true,
//   path: '/path/to/photo.jpg',
//   filename: 'playing_2026-03-12T20-30-00.jpg',
//   prompt: 'cute cat playing with toy...',
//   service: 'Pollinations.ai'
// }
```

### 2. 带选项生成

```javascript
// 生成带特殊效果的照片
const result = await catPet.generatePhoto(userId, 'birthday', {
  style: 'party theme',
  mood: 'happy',
  time: 'evening'
});
```

### 3. 获取相册

```javascript
// 获取用户的所有照片
const album = await catPet.getAlbum(userId);

console.log(album);
// {
//   success: true,
//   photos: [...],
//   total: 10
// }
```

### 4. 获取可用场景

```javascript
// 获取所有可用场景
const scenes = catPet.getAvailableScenes();

console.log(scenes);
// [
//   { id: 'feeding', name: '喂食', description: '...' },
//   { id: 'playing', name: '玩耍', description: '...' },
//   ...
// ]
```

---

## 🎨 提示词生成

### 自动提示词

系统会根据猫咪的特征自动生成提示词：

```javascript
// 猫咪数据
const catData = {
  breed: '布偶猫',
  color: '白色',
  age: 60  // 天
};

// 生成的提示词示例：
// "cute cat playing with toy, Ragdoll blue eyes long fur elegant, white, 
//  dynamic pose, happy expression, fluffy, detailed, high quality, 
//  masterpiece, best quality, high resolution, detailed fur"
```

### 提示词组成

```
[场景基础描述] + [品种特征] + [毛色特征] + [年龄特征] + [额外选项] + [质量增强词]
```

### 质量增强词

所有生成的照片都会自动添加：
- `masterpiece` - 杰作质量
- `best quality` - 最佳质量
- `high resolution` - 高分辨率
- `detailed fur` - 详细毛发

---

## 🆓 免费 AIGC 服务

### Pollinations.ai（推荐）

**优点**:
- ✅ 完全免费
- ✅ 无需 API Key
- ✅ 无需注册
- ✅ 生成速度快
- ✅ 质量良好

**限制**:
- ⚠️ 有速率限制（约每分钟 10 张）
- ⚠️ 图片分辨率固定

**使用方式**:
```javascript
// 默认使用 Pollinations.ai
catPet.aigcPhoto.setService('pollinations');

// 生成照片（自动使用 Pollinations）
await catPet.generatePhoto(userId, 'playing');
```

### Hugging Face（备选）

**优点**:
- ✅ 高质量生成
- ✅ 可自定义参数
- ✅ 多种模型可选

**限制**:
- ⚠️ 需要 API Key
- ⚠️ 免费额度有限

**使用方式**:
```javascript
// 切换到 Hugging Face
catPet.aigcPhoto.setService('huggingface');

// 使用 API Key 生成
await catPet.generatePhoto(userId, 'playing', {
  apiKey: 'your_hf_api_key'
});
```

---

## 📁 照片管理

### 存储结构

```
photos/
├── {userId}/
│   ├── photos.json          # 照片记录
│   ├── feeding_2026-03-12.jpg
│   ├── playing_2026-03-12.jpg
│   └── sleeping_2026-03-13.jpg
└── {userId2}/
    └── ...
```

### 照片记录格式

```json
{
  "filename": "playing_2026-03-12T20-30-00.jpg",
  "scene": "playing",
  "prompt": "cute cat playing...",
  "negativePrompt": "ugly, deformed...",
  "service": "Pollinations.ai",
  "timestamp": "2026-03-12T20:30:00.000Z",
  "options": {
    "style": "party theme",
    "mood": "happy"
  }
}
```

---

## 🎯 使用场景

### 1. 成就纪念

```javascript
// 获得成就时生成纪念照
await catPet.generatePhoto(userId, 'achievement', {
  style: 'with medal',
  mood: 'proud'
});
```

### 2. 生日庆祝

```javascript
// 猫咪生日时生成纪念照
await catPet.generatePhoto(userId, 'birthday', {
  style: 'birthday party',
  mood: 'celebratory',
  time: 'afternoon'
});
```

### 3. 成长记录

```javascript
// 每月生成成长记录
await catPet.generatePhoto(userId, 'growth', {
  mood: 'healthy',
  time: 'morning'
});
```

### 4. 日常互动

```javascript
// 喂食后生成照片
await catPet.generatePhoto(userId, 'feeding');

// 玩耍后生成照片
await catPet.generatePhoto(userId, 'playing');
```

---

## ⚙️ 高级配置

### 切换 AIGC 服务

```javascript
// 查看可用服务
console.log(catPet.aigcPhoto.services);

// 切换服务
catPet.aigcPhoto.setService('pollinations');  // 默认
catPet.aigcPhoto.setService('huggingface');   // 需要 API Key
```

### 自定义提示词

```javascript
// 完全自定义提示词
const result = await catPet.aigcPhoto.generateWithPollinations(
  'cute cat in space, astronaut suit, stars background',
  '/path/to/output.jpg'
);
```

### 批量生成

```javascript
// 批量生成多个场景
const scenes = ['feeding', 'playing', 'sleeping'];

for (const scene of scenes) {
  await catPet.generatePhoto(userId, scene);
  // 添加延迟避免速率限制
  await new Promise(r => setTimeout(r, 2000));
}
```

---

## ⚠️ 注意事项

### 速率限制

| 服务 | 限制 | 建议 |
|------|------|------|
| Pollinations.ai | ~10 张/分钟 | 每张照片间隔 6 秒 |
| Hugging Face | 根据额度 | 查看账户额度 |

### 最佳实践

1. **添加延迟**: 批量生成时添加 2-6 秒延迟
2. **错误处理**: 捕获生成失败，提供降级方案
3. **缓存照片**: 避免重复生成相同场景
4. **用户提示**: 告知用户生成需要时间

### 错误处理

```javascript
try {
  const result = await catPet.generatePhoto(userId, 'playing');
  
  if (!result.success) {
    console.error('生成失败:', result.error);
    // 提供降级方案
  }
} catch (error) {
  console.error('生成异常:', error);
  // 使用默认照片
}
```

---

## 🎨 示例输出

### 喂食场景

**提示词**:
```
cute cat eating food, Ragdoll blue eyes long fur elegant, white, 
fluffy fur, big eyes, kawaii style, detailed, high quality, 
masterpiece, best quality, high resolution, detailed fur
```

### 玩耍场景

**提示词**:
```
cute cat playing with toy, American Shorthair athletic build, orange tabby, 
dynamic pose, happy expression, fluffy, detailed, high quality, 
masterpiece, best quality, high resolution, detailed fur
```

### 睡觉场景

**提示词**:
```
cute cat sleeping peacefully, British Shorthair round face chubby, gray, 
cozy, soft lighting, fluffy fur, serene expression, detailed, 
masterpiece, best quality, high resolution, detailed fur
```

---

## 📊 统计信息

### 生成统计

```javascript
// 获取生成统计
const album = await catPet.getAlbum(userId);

console.log(`总照片数：${album.total}`);
console.log(`使用服务：${album.photos.map(p => p.service).join(', ')}`);
```

### 场景分布

```javascript
// 统计各场景照片数量
const sceneCount = {};
album.photos.forEach(photo => {
  sceneCount[photo.scene] = (sceneCount[photo.scene] || 0) + 1;
});

console.log(sceneCount);
// { feeding: 5, playing: 10, sleeping: 3, ... }
```

---

## 🔮 未来计划

- [ ] 更多场景模板
- [ ] 自定义背景
- [ ] 照片滤镜
- [ ] 照片分享
- [ ] 相册导出
- [ ] 更多 AIGC 服务集成

---

**功能版本**: 1.0.0  
**最后更新**: 2026-03-12  
**状态**: ✅ 已实现，可使用

---

**🐱 给你的猫咪生成精美照片吧！** 🎨📸
