/**
 * 连续照顾奖励系统
 * 
 * 功能:
 * - 记录连续照顾天数
 * - 发放连续奖励
 * - 特殊成就解锁
 */

class StreakRewardSystem {
  constructor(catDataManager) {
    this.catDataManager = catDataManager;
    this.rewardLevels = [
      { days: 1, reward: '新手铲屎官', bonus: 0 },
      { days: 3, reward: '细心照顾', bonus: 10 },
      { days: 7, reward: '一周陪伴', bonus: 50 },
      { days: 14, reward: '半月守护', bonus: 100 },
      { days: 30, reward: '满月成就', bonus: 300 },
      { days: 60, reward: '两月相伴', bonus: 600 },
      { days: 100, reward: '百日陪伴', bonus: 1000 },
      { days: 365, reward: '周年守护', bonus: 3650 }
    ];
  }

  /**
   * 记录照顾行为
   */
  async recordCare(userId, action) {
    const data = await this.catDataManager.load(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // 初始化照顾记录
    if (!data.careStreak) {
      data.careStreak = {
        current: 0,
        max: 0,
        lastCareDate: null,
        totalCareActions: 0,
        rewards: []
      };
    }
    
    const streak = data.careStreak;
    
    // 检查是否是新的照顾日
    if (streak.lastCareDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (streak.lastCareDate === yesterdayStr) {
        // 连续照顾
        streak.current++;
        console.log(`🔥 连续照顾第 ${streak.current} 天！`);
      } else if (streak.lastCareDate !== today) {
        // 中断后重新开始
        if (streak.lastCareDate) {
          console.log(`⚠️ 照顾中断，重新开始计数`);
        }
        streak.current = 1;
      }
      
      streak.lastCareDate = today;
      streak.totalCareActions++;
      
      // 更新最大连续天数
      if (streak.current > streak.max) {
        streak.max = streak.current;
      }
      
      // 检查奖励
      const reward = this.checkReward(streak.current);
      if (reward) {
        await this.grantReward(userId, reward);
      }
      
      // 保存数据
      await this.catDataManager.save(userId, data);
    }
    
    return {
      current: streak.current,
      max: streak.max,
      totalActions: streak.totalCareActions
    };
  }

  /**
   * 检查奖励
   */
  checkReward(days) {
    const reward = this.rewardLevels.find(r => r.days === days);
    return reward || null;
  }

  /**
   * 发放奖励
   */
  async grantReward(userId, reward) {
    const data = await this.catDataManager.load(userId);
    
    // 检查是否已领取
    if (data.careStreak.rewards.includes(reward.reward)) {
      console.log(`ℹ️ 奖励已领取：${reward.reward}`);
      return;
    }
    
    // 添加奖励
    data.careStreak.rewards.push(reward.reward);
    
    // 发放金币奖励
    if (!data.coins) data.coins = 0;
    data.coins += reward.bonus;
    
    console.log(`🎁 获得奖励：${reward.reward} (+${reward.bonus} 金币)`);
    
    // 保存数据
    await this.catDataManager.save(userId, data);
    
    // 返回奖励信息
    return {
      reward: reward.reward,
      bonus: reward.bonus,
      totalCoins: data.coins
    };
  }

  /**
   * 获取连续照顾信息
   */
  async getStreakInfo(userId) {
    const data = await this.catDataManager.load(userId);
    
    if (!data.careStreak) {
      return {
        current: 0,
        max: 0,
        totalActions: 0,
        nextReward: this.rewardLevels[0],
        rewards: []
      };
    }
    
    const streak = data.careStreak;
    const nextReward = this.rewardLevels.find(r => r.days > streak.current);
    
    return {
      current: streak.current,
      max: streak.max,
      totalActions: streak.totalActions,
      nextReward: nextReward ? nextReward.days - streak.current : null,
      rewards: streak.rewards,
      coins: data.coins || 0
    };
  }

  /**
   * 获取所有奖励等级
   */
  getRewardLevels() {
    return this.rewardLevels;
  }
}

module.exports = { StreakRewardSystem };
