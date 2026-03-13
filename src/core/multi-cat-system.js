/**
 * 多猫系统
 * 
 * 实现云猫世界的多猫支持：
 * - 多猫支持架构
 * - 猫咪切换机制
 * - 猫咪互动事件
 * - 关系管理
 * - 独立存档
 */

class MultiCatSystem {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.catsDir = path.join(baseDir, 'cats');
    
    // 确保猫咪目录存在
    this.init();
  }

  /**
   * 初始化
   */
  async init() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      await fs.mkdir(this.catsDir, { recursive: true });
      console.log('🐱 多猫系统初始化完成');
    } catch (error) {
      console.error('🚨 多猫系统初始化失败:', error);
    }
  }

  /**
   * 创建新猫咪
   */
  async createCat(userId, catData) {
    const fs = require('fs').promises;
    const path = require('path');
    
    // 生成猫咪 ID
    const catId = `cat_${userId}_${Date.now()}`;
    const catDir = path.join(this.catsDir, catId);
    
    // 创建猫咪目录
    await fs.mkdir(catDir, { recursive: true });
    
    // 初始化猫咪数据
    const catProfile = {
      id: catId,
      userId,
      name: catData.name,
      breed: catData.breed,
      color: catData.color,
      gender: catData.gender,
      createdAt: new Date().toISOString(),
      level: 1,
      exp: 0,
      stage: 'kitten',
      energy: 100,
      mood: 100,
      hunger: 0,
      thirst: 0,
      bond: 0,
      skills: [],
      friends: [],
      unlockedScenes: ['cat_room'],
      achievements: [],
      stats: {
        totalInteractions: 0,
        totalExplores: 0,
        totalSkills: 0
      }
    };
    
    // 保存猫咪档案
    await fs.writeFile(
      path.join(catDir, 'profile.json'),
      JSON.stringify(catProfile, null, 2),
      'utf-8'
    );
    
    // 创建日志文件
    await fs.writeFile(path.join(catDir, 'log.jsonl'), '', 'utf-8');
    await fs.writeFile(path.join(catDir, 'system.log.jsonl'), '', 'utf-8');
    await fs.writeFile(path.join(catDir, 'transcript.md'), `# 🐱 ${catData.name} 的成长记录\n\n`, 'utf-8');
    
    return {
      success: true,
      catId,
      name: catData.name,
      message: `成功创建了猫咪 ${catData.name}！`
    };
  }

  /**
   * 获取用户的所有猫咪
   */
  async getUserCats(userId) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const files = await fs.readdir(this.catsDir);
      const cats = [];
      
      for (const file of files) {
        if (file.startsWith(`cat_${userId}_`)) {
          const catDir = path.join(this.catsDir, file);
          const profilePath = path.join(catDir, 'profile.json');
          
          try {
            const content = await fs.readFile(profilePath, 'utf-8');
            const profile = JSON.parse(content);
            cats.push(profile);
          } catch (e) {
            // 文件损坏，跳过
          }
        }
      }
      
      return cats;
    } catch (error) {
      console.error('🚨 获取猫咪列表失败:', error);
      return [];
    }
  }

  /**
   * 加载猫咪数据
   */
  async loadCat(catId) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const catDir = path.join(this.catsDir, catId);
      const profilePath = path.join(catDir, 'profile.json');
      
      const content = await fs.readFile(profilePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('🚨 加载猫咪数据失败:', error);
      return null;
    }
  }

  /**
   * 保存猫咪数据
   */
  async saveCat(catId, catData) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const catDir = path.join(this.catsDir, catId);
      const profilePath = path.join(catDir, 'profile.json');
      
      await fs.writeFile(
        profilePath,
        JSON.stringify(catData, null, 2),
        'utf-8'
      );
      
      return true;
    } catch (error) {
      console.error('🚨 保存猫咪数据失败:', error);
      return false;
    }
  }

  /**
   * 切换当前猫咪
   */
  async switchCat(userId, catId) {
    const cat = await this.loadCat(catId);
    
    if (!cat || cat.userId !== userId) {
      return {
        success: false,
        error: '猫咪不存在或不属于你'
      };
    }
    
    return {
      success: true,
      cat,
      message: `切换到猫咪 ${cat.name}`
    };
  }

  /**
   * 删除猫咪
   */
  async deleteCat(userId, catId) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const cat = await this.loadCat(catId);
    if (!cat || cat.userId !== userId) {
      return {
        success: false,
        error: '猫咪不存在或不属于你'
      };
    }
    
    // 删除猫咪目录
    const catDir = path.join(this.catsDir, catId);
    await fs.rm(catDir, { recursive: true, force: true });
    
    return {
      success: true,
      message: `已删除猫咪 ${cat.name}`
    };
  }

  /**
   * 猫咪互动（多猫之间）
   */
  async catInteraction(catId1, catId2, interactionType) {
    const cat1 = await this.loadCat(catId1);
    const cat2 = await this.loadCat(catId2);
    
    if (!cat1 || !cat2) {
      return { success: false, error: '猫咪不存在' };
    }
    
    const interactions = {
      play: {
        name: '一起玩耍',
        expReward: 30,
        bondChange: 5
      },
      sleep: {
        name: '一起睡觉',
        expReward: 20,
        bondChange: 3
      },
      eat: {
        name: '一起吃饭',
        expReward: 20,
        bondChange: 3
      },
      groom: {
        name: '互相梳理',
        expReward: 40,
        bondChange: 8
      }
    };
    
    const interaction = interactions[interactionType];
    if (!interaction) {
      return { success: false, error: '互动类型不存在' };
    }
    
    return {
      success: true,
      interaction: interaction.name,
      cats: [cat1.name, cat2.name],
      expReward: interaction.expReward,
      bondChange: interaction.bondChange
    };
  }

  /**
   * 获取猫咪关系网
   */
  async getRelationshipNetwork(catId) {
    const cat = await this.loadCat(catId);
    if (!cat) return null;
    
    const network = {
      cat: {
        id: cat.id,
        name: cat.name
      },
      friends: cat.friends || [],
      totalFriends: (cat.friends || []).length
    };
    
    return network;
  }

  /**
   * 批量保存所有猫咪
   */
  async saveAllCats(userId) {
    const cats = await this.getUserCats(userId);
    
    const results = [];
    for (const cat of cats) {
      const success = await this.saveCat(cat.id, cat);
      results.push({ catId: cat.id, success });
    }
    
    return results;
  }

  /**
   * 获取猫咪统计
   */
  async getCatStats(userId) {
    const cats = await this.getUserCats(userId);
    
    return {
      totalCats: cats.length,
      cats: cats.map(cat => ({
        id: cat.id,
        name: cat.name,
        level: cat.level,
        stage: cat.stage,
        createdAt: cat.createdAt
      })),
      totalLevels: cats.reduce((sum, cat) => sum + cat.level, 0),
      averageLevel: cats.length > 0 ? (cats.reduce((sum, cat) => sum + cat.level, 0) / cats.length).toFixed(1) : 0
    };
  }
}

// 需要 path 模块
const path = require('path');

module.exports = { MultiCatSystem };
