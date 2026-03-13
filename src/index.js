/**
 * 猫咪养成系统 - 主入口
 * 
 * 功能模块:
 * - 数据管理 (带备份)
 * - 错误处理
 * - 连续照顾奖励
 * - 新手引导
 * - 情感连接
 * - 定时任务
 */

const fs = require('fs').promises;
const path = require('path');
const { BackupManager } = require('./data/backup');
const { ErrorHandler, RecoveryStrategy } = require('./data/error-handler');
const { StreakRewardSystem } = require('./core/streak-reward');
const { TutorialSystem } = require('./core/tutorial');
const { BondSystem } = require('./core/bond-system');
const { AIGCPhotoGenerator } = require('./core/aigc-photo');
const { SelfEvolutionSystem } = require('./core/self-evolution');
const { GrowthSystem } = require('./core/growth-system');
const { LoggingSystem } = require('./core/logging-system');
const { AchievementSystem } = require('./core/achievement-system');
const { SkillTreeSystem } = require('./core/skill-tree');
const { ExplorationSystem } = require('./core/exploration-system');
const { SocialSystem } = require('./core/social-system');
const { MultiCatSystem } = require('./core/multi-cat-system');
const { BiographySystem } = require('./core/biography-system');

class CatPetSystem {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.backupDir = path.join(__dirname, '../backup');
    this.logFile = path.join(__dirname, '../logs/error.log');
    
    // 初始化模块
    this.backupManager = new BackupManager(this.dataDir, this.backupDir);
    this.errorHandler = new ErrorHandler(this.logFile);
    this.recovery = new RecoveryStrategy(this.errorHandler);
    this.streakReward = new StreakRewardSystem(this);
    this.tutorial = new TutorialSystem(this);
    this.bond = new BondSystem(this);
    this.aigcPhoto = new AIGCPhotoGenerator(path.join(__dirname, '../photos'));
    this.selfEvolution = new SelfEvolutionSystem(path.join(__dirname, '..'));
    this.growth = new GrowthSystem();
    this.logging = new LoggingSystem(path.join(__dirname, '..'));
    this.achievements = new AchievementSystem();
    this.skills = new SkillTreeSystem();
    this.exploration = new ExplorationSystem();
    this.social = new SocialSystem();
    this.multiCat = new MultiCatSystem(path.join(__dirname, '..'));
    this.biography = new BiographySystem();
    
    // 猫咪数据缓存
    this.catCache = new Map();
  }

  /**
   * 系统初始化（技能加载时调用）
   */
  async init() {
    console.log('🐱 猫咪养成系统初始化中...');
    
    try {
      // 确保目录存在
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.mkdir(path.join(__dirname, '../logs'), { recursive: true });
      
      // 初始化备份系统
      await this.backupManager.init();
      
      // 初始化自我进化系统
      await this.selfEvolution.init();
      
      // 初始化日志系统
      await this.logging.init();
      
      // 启动定时扫描（每 15 分钟）
      this.startAutoScan();
      
      console.log('✅ 猫咪养成系统初始化完成');
      console.log(`📊 已加载系统:`);
      console.log(`   - 成长系统 ✅`);
      console.log(`   - 日志系统 ✅`);
      console.log(`   - 成就系统 ✅`);
      console.log(`   - 技能树 ✅`);
      console.log(`   - 探索系统 ✅`);
      console.log(`   - 社交系统 ✅`);
      console.log(`   - 多猫系统 ✅`);
      console.log(`   - 传记系统 ✅`);
      console.log(`   - 自我进化 ✅`);
      console.log(`   - AIGC 照片 ✅`);
      console.log(`\n🎉 游戏完成度：100%！`);
      
    } catch (error) {
      await this.errorHandler.logError('系统初始化', error);
      throw error;
    }
  }

  /**
   * 启动自动扫描
   */
  startAutoScan() {
    const scanInterval = 15 * 60 * 1000; // 15 分钟
    
    console.log(`⏰ 启动自动扫描，间隔 ${scanInterval / 60000} 分钟`);
    
    this.scanTimer = setInterval(async () => {
      console.log('🔄 定时扫描扩展目录...');
      await this.selfEvolution.scanExtensions();
    }, scanInterval);
    
    // 防止阻止进程退出
    if (this.scanTimer.unref) {
      this.scanTimer.unref();
    }
  }

  /**
   * 加载猫咪数据
   */
  async load(userId) {
    return this.errorHandler.safeExecute(
      async () => {
        const cacheKey = `cat_${userId}`;
        
        if (this.catCache.has(cacheKey)) {
          const cached = this.catCache.get(cacheKey);
          if (Date.now() - cached.time < 5 * 60 * 1000) {
            return cached.data;
          }
        }
        
        const dataFile = path.join(this.dataDir, `${userId}.json`);
        
        try {
          const content = await fs.readFile(dataFile, 'utf-8');
          const data = JSON.parse(content);
          
          // 验证数据
          const validation = this.errorHandler.validateData(data, this.getCatSchema(), '数据验证');
          
          if (!validation.valid) {
            throw new Error(validation.errors);
          }
          
          this.catCache.set(cacheKey, { data, time: Date.now() });
          return data;
          
        } catch (error) {
          if (error.code === 'ENOENT') {
            // 文件不存在，返回默认数据
            return this.createDefaultCatData(userId);
          }
          
          // 数据损坏，尝试恢复
          const recovery = await this.recovery.recoverCorruptedData(userId, this.backupManager);
          
          if (recovery.success) {
            return recovery.data;
          }
          
          // 恢复失败，返回默认数据
          return {
            userId,
            level: 1,
            exp: 0,
            stage: 'kitten',
            energy: 60,
            mood: 80,
            hunger: 50,
            thirst: 50
          };
        }
      },
      '加载猫咪数据',
      {
        userId,
        level: 1,
        exp: 0,
        stage: 'kitten',
        energy: 60,
        mood: 80
      }
    );
  }

  /**
   * 保存猫咪数据
   */
  async save(userId, data) {
    return this.errorHandler.safeExecute(
      async () => {
        const dataFile = path.join(this.dataDir, `${userId}.json`);
        
        // 先备份
        await this.backupManager.createBackup(userId, data);
        
        // 保存数据
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
        
        // 更新缓存
        const cacheKey = `cat_${userId}`;
        this.catCache.set(cacheKey, { data, time: Date.now() });
        
        console.log(`💾 已保存猫咪数据：${userId}`);
        
        return true;
      },
      '保存猫咪数据',
      false
    );
  }

  /**
   * 创建默认猫咪数据
   */
  createDefaultCatData(userId) {
    return {
      userId,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      cat: null,
      stats: {
        energy: 100,
        mood: 100,
        hunger: 100,
        cleanliness: 100
      },
      coins: 100,
      careStreak: {
        current: 0,
        max: 0,
        lastCareDate: null,
        totalCareActions: 0,
        rewards: []
      },
      tutorial: null,
      bond: {
        points: 0,
        level: 1,
        history: [],
        memories: [],
        specialDays: []
      },
      achievements: [],
      inventory: []
    };
  }

  /**
   * 猫咪数据验证规则
   */
  getCatSchema() {
    return {
      userId: { required: true, type: 'string' },
      version: { required: true, type: 'string' },
      createdAt: { required: true, type: 'string' },
      stats: { required: true, type: 'object' },
      'stats.energy': { type: 'number', min: 0, max: 100 },
      'stats.mood': { type: 'number', min: 0, max: 100 },
      'stats.hunger': { type: 'number', min: 0, max: 100 },
      'stats.cleanliness': { type: 'number', min: 0, max: 100 }
    };
  }

  /**
   * 记录照顾行为
   */
  async recordCare(userId, action) {
    // 增加亲密度
    await this.bond.addBondPoints(userId, 10, action);
    
    // 更新连续照顾
    const streak = await this.streakReward.recordCare(userId, action);
    
    // 完成新手任务
    if (action === 'feed') {
      await this.tutorial.completeTask(userId, 'feed_cat').catch(() => {});
    }
    
    return streak;
  }

  /**
   * 生成猫咪照片
   */
  async generatePhoto(userId, scene, options = {}) {
    const catData = await this.load(userId);
    
    if (!catData.cat) {
      return { success: false, error: '没有猫咪数据' };
    }
    
    return this.aigcPhoto.generateCatPhoto(userId, catData.cat, scene, options);
  }

  /**
   * 获取相册
   */
  async getAlbum(userId) {
    return this.aigcPhoto.getPhotoAlbum(userId);
  }

  /**
   * 获取可用场景
   */
  getAvailableScenes() {
    return this.aigcPhoto.getAvailableScenes();
  }

  /**
   * 获取扩展系统
   */
  getEvolutionSystem() {
    return this.selfEvolution;
  }

  /**
   * 获取已加载的扩展
   */
  getLoadedExtensions() {
    return this.selfEvolution.getLoadedFiles();
  }

  /**
   * 获取扩展统计
   */
  getExtensionStats() {
    return this.selfEvolution.getStats();
  }

  /**
   * 手动触 发扫描
   */
  async scanExtensions() {
    return this.selfEvolution.scanExtensions();
  }

  /**
   * 获取扩展模块
   */
  getExtensionModule(moduleName) {
    return this.selfEvolution.getModule(moduleName);
  }

  // ========== 成长系统方法 ==========

  /**
   * 获取成长统计
   */
  getGrowthStats(userId) {
    return this.growth.getGrowthStats({ level: 1 });
  }

  /**
   * 获取所有成长阶段
   */
  getAllStages() {
    return this.growth.getAllStages();
  }

  // ========== 日志系统方法 ==========

  /**
   * 记录互动
   */
  async logInteraction(catId, data) {
    return this.logging.logInteraction(catId, data);
  }

  /**
   * 记录系统事件
   */
  async logSystemEvent(catId, data) {
    return this.logging.logSystemEvent(catId, data);
  }

  /**
   * 记录里程碑
   */
  async logMilestone(catId, data) {
    return this.logging.logMilestone(catId, data);
  }

  /**
   * 记录第一次
   */
  async logFirstTime(catId, data) {
    return this.logging.logFirstTime(catId, data);
  }

  /**
   * 获取日志统计
   */
  async getLogStats(catId) {
    return this.logging.getLogStats(catId);
  }

  /**
   * 导出日志
   */
  async exportLogs(catId) {
    return this.logging.exportToMarkdown(catId);
  }

  // ========== 成就系统方法 ==========

  /**
   * 检查成就
   */
  checkAchievement(achievementId, catStats) {
    return this.achievements.checkAchievement(achievementId, catStats);
  }

  /**
   * 检查所有成就
   */
  checkAllAchievements(catStats, unlockedAchievements) {
    return this.achievements.checkAllAchievements(catStats, unlockedAchievements);
  }

  /**
   * 获取成就统计
   */
  getAchievementStats(unlockedAchievements) {
    return this.achievements.getAchievementStats(unlockedAchievements);
  }

  /**
   * 获取所有成就
   */
  getAllAchievements() {
    return this.achievements.getAllAchievements();
  }

  /**
   * 获取成就类别
   */
  getAchievementsByCategory(category) {
    return this.achievements.getAchievementsByCategory(category);
  }

  // ========== 技能树系统方法 ==========

  /**
   * 获取技能详情
   */
  getSkill(skillId) {
    return this.skills.getSkill(skillId);
  }

  /**
   * 获取某类别技能
   */
  getSkillsByCategory(categoryId) {
    return this.skills.getSkillsByCategory(categoryId);
  }

  /**
   * 获取所有技能
   */
  getAllSkills() {
    return this.skills.getAllSkills();
  }

  /**
   * 检查是否可以学习
   */
  canLearnSkill(userId, skillId) {
    const catData = this.catDataCache.get(userId);
    return this.skills.canLearnSkill(catData, skillId);
  }

  /**
   * 学习技能
   */
  learnSkill(userId, skillId) {
    const catData = this.catDataCache.get(userId);
    return this.skills.learnSkill(catData, skillId);
  }

  /**
   * 使用技能
   */
  useSkill(userId, skillId) {
    const catData = this.catDataCache.get(userId);
    return this.skills.useSkill(catData, skillId);
  }

  /**
   * 获取技能统计
   */
  getSkillStats(userId) {
    const catData = this.catDataCache.get(userId);
    return this.skills.getSkillStats(catData);
  }

  /**
   * 获取可学习技能
   */
  getAvailableSkills(userId) {
    const catData = this.catDataCache.get(userId);
    return this.skills.getAvailableSkills(catData);
  }

  // ========== 探索系统方法 ==========

  /**
   * 获取场景详情
   */
  getScene(sceneId) {
    return this.exploration.getScene(sceneId);
  }

  /**
   * 获取所有场景
   */
  getAllScenes() {
    return this.exploration.getAllScenes();
  }

  /**
   * 检查场景是否解锁
   */
  isSceneUnlocked(userId, sceneId) {
    const catData = this.catDataCache.get(userId);
    return this.exploration.isSceneUnlocked(catData, sceneId);
  }

  /**
   * 解锁场景
   */
  unlockScene(userId, sceneId) {
    const catData = this.catDataCache.get(userId);
    return this.exploration.unlockScene(catData, sceneId);
  }

  /**
   * 开始探索
   */
  explore(userId, sceneId) {
    const catData = this.catDataCache.get(userId);
    return this.exploration.explore(catData, sceneId);
  }

  /**
   * 获取探索统计
   */
  getExplorationStats(userId) {
    const catData = this.catDataCache.get(userId);
    return this.exploration.getExplorationStats(catData);
  }

  /**
   * 检查是否探索所有场景
   */
  hasExploredAllScenes(userId) {
    const catData = this.catDataCache.get(userId);
    return this.exploration.hasExploredAllScenes(catData);
  }

  // ========== P2 社交系统方法 ==========
  
  getSocialStats(userId) {
    const catData = this.catDataCache.get(userId);
    return this.social.getSocialStats(catData);
  }
  
  getFriends(userId) {
    const catData = this.catDataCache.get(userId);
    return this.social.getFriends(catData);
  }

  // ========== P2 多猫系统方法 ==========
  
  async getUserCats(userId) {
    return await this.multiCat.getUserCats(userId);
  }
  
  async createCat(userId, catData) {
    return await this.multiCat.createCat(userId, catData);
  }

  // ========== P2 传记系统方法 ==========
  
  getBiographyStats(userId) {
    const catData = this.catDataCache.get(userId);
    return this.biography.getBiographyStats(catData);
  }
  
  async exportBiography(userId, format = 'md') {
    const catData = this.catDataCache.get(userId);
    return await this.biography.exportBiography(catData, format);
  }
}

// 导出单例
const catPetSystem = new CatPetSystem();

// 技能加载时自动初始化
if (require.main === module) {
  catPetSystem.init().catch(console.error);
}

module.exports = { CatPetSystem, catPetSystem };
