/**
 * 探索系统
 * 
 * 实现云猫世界的完整探索系统（参考 cloud-cat-world 设计）：
 * - 7 个场景（猫的房间/阳光花园/奇幻森林/云端城堡/猫咪广场/猫咪海滩/城市屋顶）
 * - 探索机制
 * - 场景解锁
 * - 探索事件
 * - 宝物发现
 */

class ExplorationSystem {
  constructor() {
    // 场景定义
    this.scenes = {
      cat_room: {
        id: 'cat_room',
        name: '猫的房间',
        description: '温馨舒适的家，猫咪的专属空间',
        icon: '🏠',
        difficulty: 0,
        unlockRequirement: null,
        features: ['安全', '舒适', '初始场景'],
        treasures: ['猫玩具', '零食', '毛线球'],
        events: ['发现新玩具', '找到零食', '午睡时光'],
        backgroundColor: '#FFE4B5'
      },
      garden: {
        id: 'garden',
        name: '阳光花园',
        description: '充满阳光和花朵的美丽花园',
        icon: '🌻',
        difficulty: 1,
        unlockRequirement: { level: 5, bond: 20 },
        features: ['蝴蝶', '花朵', '阳光'],
        treasures: ['蝴蝶标本', '花蜜', '幸运草'],
        events: ['追逐蝴蝶', '闻花香', '遇到蜜蜂'],
        backgroundColor: '#98FB98'
      },
      forest: {
        id: 'forest',
        name: '奇幻森林',
        description: '神秘的魔法森林，充满未知',
        icon: '🌲',
        difficulty: 2,
        unlockRequirement: { level: 15, bond: 40 },
        features: ['神秘', '树木', '小动物'],
        treasures: ['松果', '蘑菇', '神秘果实'],
        events: ['遇到松鼠', '发现树洞', '听到猫头鹰'],
        backgroundColor: '#228B22'
      },
      castle: {
        id: 'castle',
        name: '云端城堡',
        description: '漂浮在云端的神秘城堡',
        icon: '🏰',
        difficulty: 3,
        unlockRequirement: { level: 25, bond: 60 },
        features: ['梦幻', '高空', '神秘'],
        treasures: ['云朵结晶', '星星碎片', '天使羽毛'],
        events: ['遇到云精灵', '看到彩虹', '发现秘密房间'],
        backgroundColor: '#87CEEB'
      },
      plaza: {
        id: 'plaza',
        name: '猫咪广场',
        description: '猫咪们的社交聚集地',
        icon: '🏙️',
        difficulty: 2,
        unlockRequirement: { level: 20, bond: 50 },
        features: ['社交', '热闹', '其他猫咪'],
        treasures: ['友谊徽章', '纪念品', '合影'],
        events: ['结交新朋友', '参加派对', '才艺表演'],
        backgroundColor: '#DDA0DD'
      },
      beach: {
        id: 'beach',
        name: '猫咪海滩',
        description: '阳光明媚的海滩，可以捡贝壳',
        icon: '🏖️',
        difficulty: 2,
        unlockRequirement: { level: 18, bond: 45 },
        features: ['沙滩', '海浪', '贝壳'],
        treasures: ['贝壳', '海星', '漂流瓶'],
        events: ['追螃蟹', '捡贝壳', '玩水'],
        backgroundColor: '#FFEFD5'
      },
      rooftop: {
        id: 'rooftop',
        name: '城市屋顶',
        description: '俯瞰城市夜景的屋顶',
        icon: '🌃',
        difficulty: 3,
        unlockRequirement: { level: 30, bond: 70 },
        features: ['夜景', '高处', '安静'],
        treasures: ['城市徽章', '流星碎片', '夜景照片'],
        events: ['看星星', '俯瞰城市', '遇到夜猫'],
        backgroundColor: '#191970'
      }
    };

    // 探索事件池
    this.eventPool = {
      common: [
        { id: 'find_item', name: '发现物品', probability: 0.3 },
        { id: 'meet_friend', name: '遇到朋友', probability: 0.2 },
        { id: 'rest', name: '休息片刻', probability: 0.2 },
        { id: 'play', name: '玩耍', probability: 0.2 },
        { id: 'nothing', name: '平静的一天', probability: 0.1 }
      ],
      rare: [
        { id: 'treasure', name: '发现宝物', probability: 0.05 },
        { id: 'special_friend', name: '遇到特殊朋友', probability: 0.03 },
        { id: 'milestone', name: '重要发现', probability: 0.02 }
      ]
    };
  }

  /**
   * 获取场景详情
   */
  getScene(sceneId) {
    return this.scenes[sceneId] || null;
  }

  /**
   * 获取所有场景
   */
  getAllScenes() {
    return Object.values(this.scenes).map(scene => ({
      id: scene.id,
      name: scene.name,
      description: scene.description,
      icon: scene.icon,
      difficulty: scene.difficulty,
      unlocked: false
    }));
  }

  /**
   * 检查场景是否解锁
   */
  isSceneUnlocked(catData, sceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) return false;

    // 初始场景自动解锁
    if (!scene.unlockRequirement) return true;

    // 检查是否已解锁
    if (catData.unlockedScenes && catData.unlockedScenes.includes(sceneId)) {
      return true;
    }

    return false;
  }

  /**
   * 检查是否可以解锁场景
   */
  canUnlockScene(catData, sceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) return { canUnlock: false, reason: '场景不存在' };

    // 无需解锁
    if (!scene.unlockRequirement) {
      return { canUnlock: true };
    }

    // 检查等级
    if (scene.unlockRequirement.level && catData.level < scene.unlockRequirement.level) {
      return {
        canUnlock: false,
        reason: `需要达到${scene.unlockRequirement.level}级`
      };
    }

    // 检查羁绊
    if (scene.unlockRequirement.bond && catData.bond < scene.unlockRequirement.bond) {
      return {
        canUnlock: false,
        reason: `需要羁绊达到${scene.unlockRequirement.bond}`
      };
    }

    return { canUnlock: true };
  }

  /**
   * 解锁场景
   */
  unlockScene(catData, sceneId) {
    const checkResult = this.canUnlockScene(catData, sceneId);
    if (!checkResult.canUnlock) {
      return {
        success: false,
        error: checkResult.reason
      };
    }

    const scene = this.scenes[sceneId];

    // 初始化解锁列表
    if (!catData.unlockedScenes) {
      catData.unlockedScenes = [];
    }

    // 添加场景
    if (!catData.unlockedScenes.includes(sceneId)) {
      catData.unlockedScenes.push(sceneId);
    }

    return {
      success: true,
      scene: scene.name,
      description: scene.description,
      features: scene.features
    };
  }

  /**
   * 开始探索
   */
  explore(catData, sceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) {
      return { success: false, error: '场景不存在' };
    }

    if (!this.isSceneUnlocked(catData, sceneId)) {
      return { success: false, error: '场景未解锁' };
    }

    // 消耗精力
    const energyCost = 10 + scene.difficulty * 5;
    if (catData.energy < energyCost) {
      return {
        success: false,
        error: `精力不足（需要${energyCost}，当前${catData.energy}）`
      };
    }

    catData.energy -= energyCost;

    // 生成探索结果
    const result = this.generateExploreResult(scene, catData);

    return {
      success: true,
      scene: scene.name,
      energyCost,
      ...result
    };
  }

  /**
   * 生成探索结果
   */
  generateExploreResult(scene, catData) {
    const result = {
      events: [],
      treasures: [],
      expGain: 0,
      coinGain: 0,
      discoveries: []
    };

    // 基础奖励
    result.expGain = 20 + scene.difficulty * 10;
    result.coinGain = 10 + scene.difficulty * 5;

    // 随机事件
    const eventCount = 1 + Math.floor(Math.random() * 2) + (scene.difficulty > 2 ? 1 : 0);
    
    for (let i = 0; i < eventCount; i++) {
      const event = this.rollEvent(scene);
      if (event) {
        result.events.push(event);
      }
    }

    // 宝物发现
    if (Math.random() < 0.3 + scene.difficulty * 0.1) {
      const treasure = this.findTreasure(scene);
      if (treasure) {
        result.treasures.push(treasure);
        result.coinGain += 20;
      }
    }

    // 特殊发现（低概率）
    if (Math.random() < 0.05) {
      const discovery = this.makeDiscovery(scene);
      if (discovery) {
        result.discoveries.push(discovery);
        result.expGain += 50;
      }
    }

    return result;
  }

  /**
   * 随机事件
   */
  rollEvent(scene) {
    const roll = Math.random();
    let cumulative = 0;

    // 先检查稀有事件
    for (const event of this.eventPool.rare) {
      cumulative += event.probability;
      if (roll < cumulative) {
        return this.createEvent(event.id, scene);
      }
    }

    // 再检查普通事件
    cumulative = 0;
    for (const event of this.eventPool.common) {
      cumulative += event.probability;
      if (roll < cumulative) {
        return this.createEvent(event.id, scene);
      }
    }

    return null;
  }

  /**
   * 创建事件
   */
  createEvent(eventId, scene) {
    const events = {
      find_item: {
        name: '发现物品',
        description: `在${scene.name}发现了一些有趣的东西`,
        expReward: 10,
        coinReward: 5
      },
      meet_friend: {
        name: '遇到朋友',
        description: `在${scene.name}遇到了新朋友`,
        expReward: 15,
        coinReward: 10
      },
      rest: {
        name: '休息片刻',
        description: `在${scene.name}舒服地休息了一会儿`,
        expReward: 5,
        coinReward: 0
      },
      play: {
        name: '玩耍',
        description: `在${scene.name}玩得很开心`,
        expReward: 10,
        coinReward: 5
      },
      treasure: {
        name: '发现宝物',
        description: `在${scene.name}发现了珍贵的宝物！`,
        expReward: 50,
        coinReward: 30
      },
      special_friend: {
        name: '遇到特殊朋友',
        description: `在${scene.name}遇到了特别的朋友`,
        expReward: 30,
        coinReward: 20
      },
      milestone: {
        name: '重要发现',
        description: `在${scene.name}有了重要发现！`,
        expReward: 40,
        coinReward: 25
      }
    };

    return events[eventId] || null;
  }

  /**
   * 发现宝物
   */
  findTreasure(scene) {
    if (!scene.treasures || scene.treasures.length === 0) {
      return null;
    }

    const treasure = scene.treasures[Math.floor(Math.random() * scene.treasures.length)];
    return {
      name: treasure,
      value: 20 + scene.difficulty * 10
    };
  }

  /**
   * 特殊发现
   */
  makeDiscovery(scene) {
    const discoveries = [
      '隐藏的小径',
      '神秘的标记',
      '古老的遗迹',
      '稀有的植物',
      '奇怪的石头'
    ];

    return discoveries[Math.floor(Math.random() * discoveries.length)];
  }

  /**
   * 获取探索统计
   */
  getExplorationStats(catData) {
    const allScenes = Object.keys(this.scenes);
    const unlockedScenes = catData.unlockedScenes || [];
    
    const stats = {
      total: allScenes.length,
      unlocked: unlockedScenes.length,
      progress: ((unlockedScenes.length / allScenes.length) * 100).toFixed(1),
      scenes: {}
    };

    for (const sceneId of allScenes) {
      const scene = this.scenes[sceneId];
      stats.scenes[sceneId] = {
        name: scene.name,
        icon: scene.icon,
        unlocked: unlockedScenes.includes(sceneId),
        difficulty: scene.difficulty
      };
    }

    return stats;
  }

  /**
   * 检查是否探索所有场景
   */
  hasExploredAllScenes(catData) {
    const allScenes = Object.keys(this.scenes);
    const unlockedScenes = catData.unlockedScenes || [];
    
    return allScenes.every(sceneId => unlockedScenes.includes(sceneId));
  }
}

module.exports = { ExplorationSystem };
