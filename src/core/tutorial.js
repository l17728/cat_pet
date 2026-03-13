/**
 * 新手引导系统
 * 
 * 功能:
 * - 分天解锁功能
 * - 教学任务
 * - 引导奖励
 */

class TutorialSystem {
  constructor(catDataManager) {
    this.catDataManager = catDataManager;
    
    this.tutorialDays = [
      {
        day: 1,
        title: '欢迎来到猫咪世界',
        tasks: [
          { id: 'create_cat', name: '创建你的猫咪', reward: 50 },
          { id: 'feed_cat', name: '第一次喂食', reward: 30 },
          { id: 'check_stats', name: '查看猫咪状态', reward: 20 }
        ],
        description: '恭喜你成为铲屎官！完成这些任务来熟悉游戏吧～'
      },
      {
        day: 2,
        title: '日常照顾',
        tasks: [
          { id: 'play_cat', name: '陪猫咪玩耍', reward: 30 },
          { id: 'clean_cat', name: '给猫咪洗澡', reward: 40 },
          { id: 'weigh_cat', name: '给猫咪称重', reward: 20 }
        ],
        description: '照顾猫咪需要细心哦！今天学习更多照顾技巧～'
      },
      {
        day: 3,
        title: '成长记录',
        tasks: [
          { id: 'check_growth', name: '查看成长记录', reward: 30 },
          { id: 'take_photo', name: '给猫咪拍照', reward: 40 },
          { id: 'share_cat', name: '分享猫咪', reward: 50 }
        ],
        description: '记录下猫咪的成长瞬间吧！'
      },
      {
        day: 7,
        title: '一周陪伴',
        tasks: [
          { id: 'week_care', name: '连续照顾 7 天', reward: 200 },
          { id: 'check_achievements', name: '查看成就', reward: 50 }
        ],
        description: '恭喜你陪伴猫咪一周了！来看看你的成就吧～'
      }
    ];
  }

  /**
   * 初始化新手引导
   */
  async initTutorial(userId) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.tutorial) {
      data.tutorial = {
        started: new Date().toISOString(),
        currentDay: 1,
        completedTasks: [],
        rewards: []
      };
      
      await this.catDataManager.save(userId, data);
      console.log('📚 新手引导已初始化');
    }
    
    return data.tutorial;
  }

  /**
   * 获取当天引导
   */
  async getTodayTutorial(userId) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.tutorial) {
      await this.initTutorial(userId);
    }
    
    const tutorial = data.tutorial;
    const startDate = new Date(tutorial.started);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (24 * 60 * 60 * 1000)) + 1;
    
    // 更新当前天数
    tutorial.currentDay = Math.min(daysPassed, this.tutorialDays.length);
    await this.catDataManager.save(userId, data);
    
    // 获取当天引导内容
    const dayTutorial = this.tutorialDays.find(t => t.day === tutorial.currentDay);
    
    if (!dayTutorial) {
      return {
        completed: true,
        message: '恭喜你完成所有新手引导！'
      };
    }
    
    // 检查任务完成状态
    const tasksWithStatus = dayTutorial.tasks.map(task => ({
      ...task,
      completed: tutorial.completedTasks.includes(task.id)
    }));
    
    return {
      day: dayTutorial.day,
      title: dayTutorial.title,
      description: dayTutorial.description,
      tasks: tasksWithStatus,
      allCompleted: tasksWithStatus.every(t => t.completed)
    };
  }

  /**
   * 完成任务
   */
  async completeTask(userId, taskId) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.tutorial) {
      throw new Error('新手引导未初始化');
    }
    
    // 检查任务是否存在
    const allTasks = this.tutorialDays.flatMap(d => d.tasks);
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('任务不存在');
    }
    
    // 检查是否已完成
    if (data.tutorial.completedTasks.includes(taskId)) {
      return {
        completed: true,
        message: '任务已完成',
        reward: 0
      };
    }
    
    // 标记完成
    data.tutorial.completedTasks.push(taskId);
    
    // 发放奖励
    if (!data.coins) data.coins = 0;
    data.coins += task.reward;
    
    await this.catDataManager.save(userId, data);
    
    console.log(`✅ 完成新手任务：${task.name} (+${task.reward} 金币)`);
    
    return {
      completed: true,
      task: task.name,
      reward: task.reward,
      totalCoins: data.coins
    };
  }

  /**
   * 获取引导进度
   */
  async getProgress(userId) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.tutorial) {
      return {
        started: false,
        currentDay: 0,
        totalTasks: 0,
        completedTasks: 0,
        progress: 0
      };
    }
    
    const tutorial = data.tutorial;
    const allTasks = this.tutorialDays.flatMap(d => d.tasks);
    const completedCount = tutorial.completedTasks.length;
    
    return {
      started: true,
      currentDay: tutorial.currentDay,
      totalTasks: allTasks.length,
      completedTasks: completedCount,
      progress: Math.round((completedCount / allTasks.length) * 100),
      rewards: tutorial.rewards
    };
  }
}

module.exports = { TutorialSystem };
