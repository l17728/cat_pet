/**
 * 情感连接系统
 * 
 * 功能:
 * - 猫咪记忆
 * - 亲密度系统
 * - 特殊对话
 * - 纪念日
 */

class BondSystem {
  constructor(catDataManager) {
    this.catDataManager = catDataManager;
    
    this.bondLevels = [
      { level: 1, name: '陌生', minPoints: 0, description: '猫咪对你还很陌生' },
      { level: 2, name: '认识', minPoints: 100, description: '猫咪开始认识你了' },
      { level: 3, name: '熟悉', minPoints: 300, description: '猫咪和你熟悉了' },
      { level: 4, name: '亲密', minPoints: 600, description: '猫咪很信任你' },
      { level: 5, name: '挚爱', minPoints: 1000, description: '猫咪最爱的人就是你！' }
    ];
  }

  /**
   * 增加亲密度
   */
  async addBondPoints(userId, points, reason) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.bond) {
      data.bond = {
        points: 0,
        level: 1,
        history: [],
        memories: [],
        specialDays: []
      };
    }
    
    const oldLevel = this.getBondLevel(data.bond.points);
    data.bond.points += points;
    data.bond.history.push({
      date: new Date().toISOString(),
      points,
      reason
    });
    
    const newLevel = this.getBondLevel(data.bond.points);
    
    // 检查是否升级
    if (newLevel > oldLevel) {
      data.bond.level = newLevel;
      console.log(`💕 亲密度升级！当前等级：${this.bondLevels[newLevel - 1].name}`);
    }
    
    await this.catDataManager.save(userId, data);
    
    return {
      points: data.bond.points,
      level: newLevel,
      leveledUp: newLevel > oldLevel
    };
  }

  /**
   * 添加记忆
   */
  async addMemory(userId, memory) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.bond) {
      data.bond = { points: 0, level: 1, history: [], memories: [], specialDays: [] };
    }
    
    data.bond.memories.push({
      date: new Date().toISOString(),
      ...memory
    });
    
    // 限制记忆数量
    if (data.bond.memories.length > 50) {
      data.bond.memories = data.bond.memories.slice(-50);
    }
    
    await this.catDataManager.save(userId, data);
    
    console.log(`📸 新增记忆：${memory.title}`);
    
    return data.bond.memories.length;
  }

  /**
   * 记录特殊日子
   */
  async recordSpecialDay(userId, type, description) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.bond) {
      data.bond = { points: 0, level: 1, history: [], memories: [], specialDays: [] };
    }
    
    data.bond.specialDays.push({
      date: new Date().toISOString(),
      type,
      description
    });
    
    await this.catDataManager.save(userId, data);
    
    // 增加亲密度
    await this.addBondPoints(userId, 50, `特殊日子：${type}`);
    
    console.log(`🎉 记录特殊日子：${type}`);
  }

  /**
   * 获取亲密度信息
   */
  async getBondInfo(userId) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.bond) {
      return {
        points: 0,
        level: 1,
        levelName: '陌生',
        nextLevel: 100,
        progress: 0
      };
    }
    
    const currentLevelInfo = this.bondLevels[data.bond.level - 1];
    const nextLevelInfo = this.bondLevels[data.bond.level];
    
    const progress = nextLevelInfo 
      ? ((data.bond.points - currentLevelInfo.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100
      : 100;
    
    return {
      points: data.bond.points,
      level: data.bond.level,
      levelName: currentLevelInfo.name,
      description: currentLevelInfo.description,
      nextLevel: nextLevelInfo ? nextLevelInfo.minPoints : null,
      progress: Math.round(progress),
      memories: data.bond.memories.slice(-5),
      specialDays: data.bond.specialDays.slice(-3)
    };
  }

  /**
   * 获取亲密度等级
   */
  getBondLevel(points) {
    for (let i = this.bondLevels.length - 1; i >= 0; i--) {
      if (points >= this.bondLevels[i].minPoints) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * 获取互动对话
   */
  getInteractionDialog(userId, action) {
    const bondLevel = this.getBondLevelFromData(userId);
    
    const dialogs = {
      feed: [
        { level: 1, text: '猫咪小心翼翼地吃着...' },
        { level: 2, text: '猫咪开始信任你喂的食物了' },
        { level: 3, text: '猫咪开心地吃着你喂的食物' },
        { level: 4, text: '猫咪蹭蹭你，表示很喜欢' },
        { level: 5, text: '猫咪一边吃一边呼噜，超爱你！' }
      ],
      play: [
        { level: 1, text: '猫咪有点警惕地看着玩具' },
        { level: 2, text: '猫咪开始对玩具感兴趣了' },
        { level: 3, text: '猫咪开心地玩起来了' },
        { level: 4, text: '猫咪玩得不亦乐乎，还看着你呢' },
        { level: 5, text: '猫咪和你玩得超开心，舍不得停下' }
      ]
    };
    
    const actionDialogs = dialogs[action] || dialogs.feed;
    const dialog = actionDialogs.find(d => d.level >= bondLevel) || actionDialogs[0];
    
    return dialog.text;
  }

  getBondLevelFromData(userId) {
    // 简化实现
    return 1;
  }
}

module.exports = { BondSystem };
