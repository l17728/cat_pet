/**
 * 成长阶段系统
 * 
 * 实现云猫世界的完整成长系统：
 * - 5 个成长阶段（奶猫期→幼猫期→青年期→成年期→终极形态）
 * - 等级系统（1-99 级）
 * - 阶段转换事件
 * - 成长里程碑
 */

class GrowthSystem {
  constructor() {
    // 成长阶段定义（参考 cloud-cat-world 设计）
    this.stages = {
      kitten: {
        id: 'kitten',
        name: '奶猫期',
        levels: [1, 10],
        days: 7,
        description: '爱睡觉、粘人、需要细心照顾',
        features: ['睡眠时间长', '需要喂食', '容易生病', '学习基础技能'],
        stats: {
          maxEnergy: 60,
          maxMood: 80,
          learningRate: 1.5
        }
      },
      juvenile: {
        id: 'juvenile',
        name: '幼猫期',
        levels: [11, 20],
        days: 7,
        description: '好奇心强、活泼好动、开始学习技能',
        features: ['好奇心强', '精力旺盛', '学习速度快', '开始探索'],
        stats: {
          maxEnergy: 80,
          maxMood: 90,
          learningRate: 1.8
        }
      },
      youth: {
        id: 'youth',
        name: '青年期',
        levels: [21, 35],
        days: 14,
        description: '精力充沛、探索欲强、技能快速成长',
        features: ['探索欲强', '技能提升快', '独立性强', '社交活跃'],
        stats: {
          maxEnergy: 100,
          maxMood: 100,
          learningRate: 2.0
        }
      },
      adult: {
        id: 'adult',
        name: '成年期',
        levels: [36, 50],
        days: 28,
        description: '性格稳定、技能成熟、可以传授技能',
        features: ['性格稳定', '技能成熟', '可以社交', '可以传授'],
        stats: {
          maxEnergy: 100,
          maxMood: 100,
          learningRate: 1.5
        }
      },
      ultimate: {
        id: 'ultimate',
        name: '终极形态',
        levels: [51, 999],
        days: 'permanent',
        description: '最可爱的样子、拥有传奇技能',
        features: ['传奇技能', '特殊外观', '最高属性', '永久形态'],
        stats: {
          maxEnergy: 150,
          maxMood: 150,
          learningRate: 3.0
        }
      }
    };

    // 阶段转换里程碑
    this.milestones = {
      kitten_to_juvenile: {
        name: '断奶成长',
        description: '从奶猫成长为幼猫，开始独立生活',
        reward: { coins: 50, exp: 100 }
      },
      juvenile_to_youth: {
        name: '青春绽放',
        description: '进入青年期，精力充沛',
        reward: { coins: 100, exp: 200 }
      },
      youth_to_adult: {
        name: '成熟稳重',
        description: '进入成年期，性格稳定',
        reward: { coins: 200, exp: 300 }
      },
      adult_to_ultimate: {
        name: '传奇蜕变',
        description: '达到终极形态，拥有传奇力量',
        reward: { coins: 1000, exp: 1000, title: '传奇猫咪' }
      }
    };
  }

  /**
   * 获取当前阶段
   */
  getCurrentStage(level) {
    if (level <= 10) return this.stages.kitten;
    if (level <= 20) return this.stages.juvenile;
    if (level <= 35) return this.stages.youth;
    if (level <= 50) return this.stages.adult;
    return this.stages.ultimate;
  }

  /**
   * 获取阶段进度
   */
  getStageProgress(level, currentStage) {
    const minLevel = currentStage.levels[0];
    const maxLevel = currentStage.levels[1];
    const progress = ((level - minLevel) / (maxLevel - minLevel)) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * 检查是否可以升级
   */
  canLevelUp(catData) {
    const currentStage = this.getCurrentStage(catData.level);
    const maxLevel = currentStage.levels[1];
    return catData.level < maxLevel;
  }

  /**
   * 升级
   */
  levelUp(catData) {
    if (!this.canLevelUp(catData)) {
      return {
        success: false,
        error: '已达到当前阶段最高等级'
      };
    }

    const oldLevel = catData.level;
    const oldStage = this.getCurrentStage(oldLevel);
    
    catData.level++;
    catData.exp = 0; // 重置经验
    
    const newStage = this.getCurrentStage(catData.level);
    const stageChanged = oldStage.id !== newStage.id;

    const result = {
      success: true,
      oldLevel,
      newLevel: catData.level,
      oldStage: oldStage.name,
      newStage: newStage.name,
      stageChanged,
      rewards: []
    };

    // 检查阶段转换
    if (stageChanged) {
      const milestone = this.getMilestone(oldStage.id, newStage.id);
      if (milestone) {
        result.milestone = milestone;
        result.rewards.push(milestone.reward);
        
        // 添加成长记录
        if (catData.growthRecord) {
          catData.growthRecord.push({
            type: 'stage_change',
            from: oldStage.name,
            to: newStage.name,
            timestamp: new Date().toISOString(),
            milestone: milestone.name
          });
        }
      }
    }

    // 更新属性上限
    catData.maxEnergy = newStage.stats.maxEnergy;
    catData.maxMood = newStage.stats.maxMood;

    return result;
  }

  /**
   * 获取阶段转换里程碑
   */
  getMilestone(fromStageId, toStageId) {
    const key = `${fromStageId}_to_${toStageId}`;
    return this.milestones[key] || null;
  }

  /**
   * 获取升级所需经验
   */
  getExpForNextLevel(level) {
    const base = 100;
    const multiplier = 1.2;
    return Math.floor(base * Math.pow(multiplier, level - 1));
  }

  /**
   * 添加经验
   */
  addExp(catData, expAmount) {
    const expNeeded = this.getExpForNextLevel(catData.level);
    catData.exp = (catData.exp || 0) + expAmount;

    const leveledUp = [];

    // 检查是否可以升级
    while (catData.exp >= expNeeded && this.canLevelUp(catData)) {
      const levelResult = this.levelUp(catData);
      if (levelResult.success) {
        leveledUp.push(levelResult);
      }
    }

    return {
      currentExp: catData.exp,
      expNeeded,
      progress: (catData.exp / expNeeded) * 100,
      leveledUp
    };
  }

  /**
   * 获取成长统计
   */
  getGrowthStats(catData) {
    const currentStage = this.getCurrentStage(catData.level);
    const stageProgress = this.getStageProgress(catData.level, currentStage);
    const expNeeded = this.getExpForNextLevel(catData.level);

    return {
      level: catData.level,
      stage: currentStage.name,
      stageDescription: currentStage.description,
      stageProgress: stageProgress.toFixed(1),
      exp: catData.exp || 0,
      expNeeded,
      expProgress: ((catData.exp || 0) / expNeeded * 100).toFixed(1),
      features: currentStage.features,
      stats: currentStage.stats,
      nextStage: this.getNextStage(currentStage.id),
      daysInStage: this.getDaysInStage(catData, currentStage)
    };
  }

  /**
   * 获取下一阶段
   */
  getNextStage(currentStageId) {
    const stages = Object.values(this.stages);
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    
    if (currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return null;
  }

  /**
   * 获取在当前阶段的天数
   */
  getDaysInStage(catData, currentStage) {
    if (!catData.stageStartDate) {
      return 0;
    }
    
    const startDate = new Date(catData.stageStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * 初始化猫咪成长数据
   */
  initGrowthData(catData) {
    catData.level = 1;
    catData.exp = 0;
    catData.stageStartDate = new Date().toISOString();
    catData.growthRecord = [];
    catData.maxEnergy = this.stages.kitten.stats.maxEnergy;
    catData.maxMood = this.stages.kitten.stats.maxMood;
    
    return catData;
  }

  /**
   * 获取所有阶段列表
   */
  getAllStages() {
    return Object.values(this.stages).map(stage => ({
      id: stage.id,
      name: stage.name,
      levels: stage.levels,
      days: stage.days,
      description: stage.description,
      features: stage.features
    }));
  }
}

module.exports = { GrowthSystem };
