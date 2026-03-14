/**
 * 后台任务调度器
 * Background Scheduler - 状态衰减、自主行为、定时检查
 * 
 * 独立运行，不依赖 OpenClaw Cron
 */

const catCore = require('../cat-core.js');
const { loadCatData, saveCatData } = require('../core/evolvable');

class BackgroundScheduler {
  constructor(options = {}) {
    this.userId = options.userId || 'simulator_user';
    this.catId = options.catId;
    
    // 调度间隔
    this.decayInterval = options.decayInterval || 60 * 60 * 1000;  // 1小时
    this.autoActionInterval = options.autoActionInterval || 30 * 60 * 1000;  // 30分钟
    this.syncInterval = options.syncInterval || 10 * 1000;  // 10秒
    
    // 定时器
    this.decayTimer = null;
    this.autoActionTimer = null;
    this.syncTimer = null;
    
    // 回调
    this.onDecay = options.onDecay || (() => {});
    this.onAutoAction = options.onAutoAction || (() => {});
    this.onSync = options.onSync || null;  // null 表示不启动 sync 定时器
    
    // 运行状态
    this.isRunning = false;
    
    // LLM 功能开关
    this.enableLLM = options.enableLLM || false;
    this.llmClient = options.llmClient || null;
  }

  /**
   * 启动调度器
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🕐 启动后台调度器...');
    console.log(`   状态衰减: 每 ${this.decayInterval / 60000} 分钟`);
    console.log(`   自主行为: 每 ${this.autoActionInterval / 60000} 分钟`);
    if (this.onSync) {
      console.log(`   状态同步: 每 ${this.syncInterval / 1000} 秒`);
    }
    
    // 立即执行一次
    this.runDecay();
    
    // 定时任务
    this.decayTimer = setInterval(() => this.runDecay(), this.decayInterval);
    this.autoActionTimer = setInterval(() => this.runAutoAction(), this.autoActionInterval);
    // 只有提供了 onSync 回调时才启动 sync 定时器，避免与 bridge 自身的 syncTimer 重复
    if (this.onSync) {
      this.syncTimer = setInterval(() => this.runSync(), this.syncInterval);
    }
  }

  /**
   * 停止调度器
   */
  stop() {
    this.isRunning = false;
    
    if (this.decayTimer) clearInterval(this.decayTimer);
    if (this.autoActionTimer) clearInterval(this.autoActionTimer);
    if (this.syncTimer) clearInterval(this.syncTimer);
    
    this.decayTimer = null;
    this.autoActionTimer = null;
    this.syncTimer = null;
    
    console.log('⏹️ 后台调度器已停止');
  }

  /**
   * 状态衰减
   */
  runDecay() {
    if (!this.catId) return;
    
    const cat = loadCatData(this.catId);
    if (!cat) return;
    
    const before = { ...cat.stats };
    
    // 衰减规则
    cat.stats.hunger = Math.max(0, cat.stats.hunger - 3);
    cat.stats.energy = Math.max(0, cat.stats.energy - 2);
    cat.stats.cleanliness = Math.max(0, cat.stats.cleanliness - 2);
    
    // 福祉衰减
    if (cat.wellness) {
      cat.wellness.hydration = Math.max(0, (cat.wellness.hydration || 50) - 5);
      cat.wellness.social = Math.max(0, (cat.wellness.social || 50) - 3);
    }
    
    // 保存
    saveCatData(this.catId, cat);
    
    // 生成警告
    const warnings = this.generateWarnings(cat);
    
    this.onDecay({
      cat,
      before,
      after: cat.stats,
      warnings
    });
    
    if (warnings.length > 0) {
      console.log(`📉 [状态衰减] ${cat.name}:`);
      warnings.forEach(w => console.log(`   ${w}`));
    }
  }

  /**
   * 生成健康警告
   */
  generateWarnings(cat) {
    const warnings = [];
    
    if (cat.stats.hunger < 30) {
      warnings.push(`🚨 饥饿警告：${cat.name} 饿了！饱食度 ${cat.stats.hunger}`);
    }
    if (cat.stats.energy < 30) {
      warnings.push(`⚠️ 疲劳警告：${cat.name} 需要休息！精力 ${cat.stats.energy}`);
    }
    if (cat.stats.cleanliness < 30) {
      warnings.push(`⚠️ 清洁警告：${cat.name} 需要洗澡！清洁度 ${cat.stats.cleanliness}`);
    }
    if (cat.wellness?.hydration < 30) {
      warnings.push(`⚠️ 脱水警告：${cat.name} 需要喝水！水分 ${cat.wellness.hydration}`);
    }
    
    return warnings;
  }

  /**
   * 自主行为决策
   */
  async runAutoAction() {
    if (!this.catId) return;
    
    const cat = loadCatData(this.catId);
    if (!cat) return;
    
    // 如果启用 LLM，使用智能决策
    if (this.enableLLM && this.llmClient) {
      const action = await this.decideWithLLM(cat);
      if (action) {
        this.executeAction(cat, action);
        this.onAutoAction(action);
        return;
      }
    }
    
    // 否则使用规则决策
    const action = this.decideWithRules(cat);
    if (action) {
      this.executeAction(cat, action);
      this.onAutoAction(action);
    }
  }

  /**
   * 规则决策（无需 LLM）
   */
  decideWithRules(cat) {
    const { energy, mood, hunger, cleanliness } = cat.stats;
    const hydration = cat.wellness?.hydration || 50;
    
    // 优先级：生存需求 > 舒适需求 > 娱乐需求
    
    // 1. 紧急需求
    if (hunger < 30) {
      return {
        action: 'request',
        type: 'food',
        description: `${cat.name} 饿了，喵喵叫着找食物`,
        notifyOwner: true,
        notificationMessage: `喵呜~ ${cat.name} 饿了！快给它喂食吧！`,
        effects: { mood: -5 }
      };
    }
    
    if (hydration < 30) {
      return {
        action: 'drink',
        description: `${cat.name} 自己去喝水`,
        notifyOwner: false,
        effects: { hydration: +20 }
      };
    }
    
    if (energy < 20) {
      return {
        action: 'sleep',
        description: `${cat.name} 找了个舒服的地方睡觉`,
        notifyOwner: false,
        effects: { energy: +30, mood: +5 }
      };
    }
    
    if (cleanliness < 30) {
      return {
        action: 'groom',
        description: `${cat.name} 开始自我清洁`,
        notifyOwner: false,
        effects: { cleanliness: +10, energy: -5 }
      };
    }
    
    // 2. 舒适需求
    if (mood < 50 && energy > 40) {
      const toys = cat.toys || [];
      if (toys.length > 0) {
        const toy = toys[Math.floor(Math.random() * toys.length)];
        return {
          action: 'play_toy',
          target: toy.name,
          description: `${cat.name} 自己玩了会儿 ${toy.name}`,
          notifyOwner: false,
          effects: { mood: +15, energy: -10 }
        };
      }
    }
    
    // 3. 探索需求
    if (energy > 60 && mood > 60) {
      const actions = ['explore_house', 'rest', 'groom'];
      const chosen = actions[Math.floor(Math.random() * actions.length)];
      
      const descriptions = {
        explore_house: `${cat.name} 在房间里转了一圈`,
        rest: `${cat.name} 趴在窗台上晒太阳`,
        groom: `${cat.name} 仔细梳理自己的毛发`
      };
      
      const effects = {
        explore_house: { mood: +5, energy: -5 },
        rest: { energy: +10 },
        groom: { cleanliness: +5, mood: +3 }
      };
      
      return {
        action: chosen,
        description: descriptions[chosen],
        notifyOwner: false,
        effects: effects[chosen]
      };
    }
    
    return null;
  }

  /**
   * LLM 决策（需要 LLM）
   */
  async decideWithLLM(cat) {
    // 如果有 LLM 客户端，调用它
    if (this.llmClient) {
      try {
        return await this.llmClient.decideAutoAction(cat);
      } catch (e) {
        console.error('[LLM 决策失败]', e.message);
        return null;
      }
    }
    return null;
  }

  /**
   * 执行行为
   */
  executeAction(cat, action) {
    // 应用效果
    if (action.effects) {
      if (action.effects.mood) {
        cat.stats.mood = Math.max(0, Math.min(100, cat.stats.mood + action.effects.mood));
      }
      if (action.effects.energy) {
        cat.stats.energy = Math.max(0, Math.min(100, cat.stats.energy + action.effects.energy));
      }
      if (action.effects.hunger) {
        cat.stats.hunger = Math.max(0, Math.min(100, cat.stats.hunger + action.effects.hunger));
      }
      if (action.effects.cleanliness) {
        cat.stats.cleanliness = Math.max(0, Math.min(100, cat.stats.cleanliness + action.effects.cleanliness));
      }
      if (action.effects.hydration && cat.wellness) {
        cat.wellness.hydration = Math.max(0, Math.min(100, cat.wellness.hydration + action.effects.hydration));
      }
    }
    
    // 记录
    if (!cat.autoActionHistory) cat.autoActionHistory = [];
    cat.autoActionHistory.push({
      ...action,
      timestamp: Date.now()
    });
    
    // 保留最近 20 条
    if (cat.autoActionHistory.length > 20) {
      cat.autoActionHistory.shift();
    }
    
    saveCatData(this.catId, cat);
    
    if (action.description) {
      console.log(`🐱 [自主行为] ${action.description}`);
    }
  }

  /**
   * 状态同步
   */
  runSync() {
    if (!this.catId || !this.onSync) return;

    const statusResult = catCore.getStatus(this.userId, this.catId);
    if (statusResult && statusResult.success) {
      this.onSync(statusResult);
    }
  }

  /**
   * 设置猫咪 ID
   */
  setCatId(catId) {
    this.catId = catId;
  }
}

module.exports = BackgroundScheduler;