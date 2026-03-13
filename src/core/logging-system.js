/**
 * 日志系统
 * 
 * 实现云猫世界的完整日志系统：
 * - log.jsonl - 结构化互动记录
 * - system.log.jsonl - 系统事件日志
 * - transcript.md - 人类可读的对话记录
 * 
 * 参考：cloud-cat-world/SYSTEMS.md
 */

const fs = require('fs').promises;
const path = require('path');

class LoggingSystem {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.logsDir = path.join(baseDir, 'logs');
    
    // 确保日志目录存在
    this.init();
  }

  /**
   * 初始化日志系统
   */
  async init() {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
      console.log('📝 日志系统初始化完成');
    } catch (error) {
      console.error('🚨 日志系统初始化失败:', error);
    }
  }

  /**
   * 获取猫咪日志目录
   */
  getCatLogDir(catId) {
    return path.join(this.baseDir, 'cats', catId);
  }

  /**
   * 记录互动日志（log.jsonl）
   */
  async logInteraction(catId, data) {
    try {
      const logFile = path.join(this.getCatLogDir(catId), 'log.jsonl');
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        session_id: data.sessionId || this.generateSessionId(),
        cat_id: catId,
        type: 'interaction',
        user_input: data.userInput,
        cat_response: data.catResponse,
        state_snapshot: data.stateSnapshot,
        state_changes: data.stateChanges || [],
        events_triggered: data.eventsTriggered || [],
        milestones: data.milestones || [],
        achievements: data.achievements || []
      };

      await this.appendLog(logFile, logEntry);
      
      return logEntry;
    } catch (error) {
      console.error('🚨 记录互动日志失败:', error);
      return null;
    }
  }

  /**
   * 记录系统事件（system.log.jsonl）
   */
  async logSystemEvent(catId, data) {
    try {
      const logFile = path.join(this.getCatLogDir(catId), 'system.log.jsonl');
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        cat_id: catId,
        type: 'system_event',
        event: data.event,
        details: data.details,
        previous_state: data.previousState,
        new_state: data.newState
      };

      await this.appendLog(logFile, logEntry);
      
      return logEntry;
    } catch (error) {
      console.error('🚨 记录系统事件失败:', error);
      return null;
    }
  }

  /**
   * 记录到 transcript.md（人类可读）
   */
  async logTranscript(catId, data) {
    try {
      const transcriptFile = path.join(this.getCatLogDir(catId), 'transcript.md');
      
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const date = timestamp.split(' ')[0];
      const time = timestamp.split(' ')[1];
      
      let transcript = `\n---\n\n## ${date} ${time}\n\n`;
      
      // 用户输入
      if (data.userInput && data.userInput.text) {
        transcript += `**👤 主人**: ${data.userInput.text}\n\n`;
      }
      
      // 猫咪回应
      if (data.catResponse && data.catResponse.text) {
        transcript += `**🐱 ${data.catResponse.name || '猫咪'}**: ${data.catResponse.text}\n\n`;
        
        if (data.catResponse.mood) {
          transcript += `*心情：${this.getMoodEmoji(data.catResponse.mood)}*\n\n`;
        }
      }
      
      // 状态变化
      if (data.stateChanges && data.stateChanges.length > 0) {
        transcript += `**📊 状态变化**:\n`;
        data.stateChanges.forEach(change => {
          transcript += `- ${this.getFieldName(change.field)}: ${change.from} → ${change.to}\n`;
        });
        transcript += `\n`;
      }
      
      // 触发事件
      if (data.eventsTriggered && data.eventsTriggered.length > 0) {
        transcript += `**✨ 触发事件**:\n`;
        data.eventsTriggered.forEach(event => {
          transcript += `- ${event.name}\n`;
        });
        transcript += `\n`;
      }
      
      // 成就解锁
      if (data.achievements && data.achievements.length > 0) {
        transcript += `**🏆 解锁成就**:\n`;
        data.achievements.forEach(achievement => {
          transcript += `- ${achievement.name}\n`;
        });
        transcript += `\n`;
      }

      await this.appendFile(transcriptFile, transcript);
      
      return transcript;
    } catch (error) {
      console.error('🚨 记录 transcript 失败:', error);
      return null;
    }
  }

  /**
   * 记录成长里程碑
   */
  async logMilestone(catId, data) {
    try {
      const milestoneFile = path.join(this.getCatLogDir(catId), 'milestones.jsonl');
      
      const milestoneEntry = {
        timestamp: new Date().toISOString(),
        cat_id: catId,
        type: data.type, // 'level_up', 'stage_change', 'achievement', 'first_time'
        title: data.title,
        description: data.description,
        details: data.details,
        rewards: data.rewards
      };

      await this.appendLog(milestoneFile, milestoneEntry);
      
      return milestoneEntry;
    } catch (error) {
      console.error('🚨 记录里程碑失败:', error);
      return null;
    }
  }

  /**
   * 记录"第一次"系列
   */
  async logFirstTime(catId, data) {
    try {
      const firstTimeFile = path.join(this.getCatLogDir(catId), 'first_times.json');
      
      let firstTimes = {};
      try {
        const content = await fs.readFile(firstTimeFile, 'utf-8');
        firstTimes = JSON.parse(content);
      } catch (e) {
        // 文件不存在
      }

      if (!firstTimes[data.type]) {
        firstTimes[data.type] = {
          timestamp: new Date().toISOString(),
          description: data.description,
          details: data.details
        };

        await fs.writeFile(firstTimeFile, JSON.stringify(firstTimes, null, 2), 'utf-8');
        console.log(`🎉 记录第一次：${data.type}`);
      }

      return firstTimes[data.type];
    } catch (error) {
      console.error('🚨 记录第一次失败:', error);
      return null;
    }
  }

  /**
   * 获取日志统计
   */
  async getLogStats(catId) {
    try {
      const logDir = this.getCatLogDir(catId);
      
      const stats = {
        totalInteractions: 0,
        totalSystemEvents: 0,
        totalMilestones: 0,
        firstTimes: 0,
        lastInteraction: null,
        daysTracked: 0
      };

      // 统计互动日志
      try {
        const logContent = await fs.readFile(path.join(logDir, 'log.jsonl'), 'utf-8');
        const logs = logContent.trim().split('\n').filter(l => l.trim());
        stats.totalInteractions = logs.length;
        if (logs.length > 0) {
          const lastLog = JSON.parse(logs[logs.length - 1]);
          stats.lastInteraction = lastLog.timestamp;
        }
      } catch (e) {
        // 文件不存在
      }

      // 统计系统事件
      try {
        const systemLogContent = await fs.readFile(path.join(logDir, 'system.log.jsonl'), 'utf-8');
        const systemLogs = systemLogContent.trim().split('\n').filter(l => l.trim());
        stats.totalSystemEvents = systemLogs.length;
      } catch (e) {
        // 文件不存在
      }

      // 统计里程碑
      try {
        const milestoneContent = await fs.readFile(path.join(logDir, 'milestones.jsonl'), 'utf-8');
        const milestones = milestoneContent.trim().split('\n').filter(l => l.trim());
        stats.totalMilestones = milestones.length;
      } catch (e) {
        // 文件不存在
      }

      // 统计第一次
      try {
        const firstTimeContent = await fs.readFile(path.join(logDir, 'first_times.json'), 'utf-8');
        const firstTimes = JSON.parse(firstTimeContent);
        stats.firstTimes = Object.keys(firstTimes).length;
      } catch (e) {
        // 文件不存在
      }

      // 计算追踪天数
      if (stats.lastInteraction) {
        const firstDate = new Date(stats.lastInteraction);
        const now = new Date();
        const diffTime = Math.abs(now - firstDate);
        stats.daysTracked = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return stats;
    } catch (error) {
      console.error('🚨 获取日志统计失败:', error);
      return null;
    }
  }

  /**
   * 导出日志为 Markdown
   */
  async exportToMarkdown(catId, options = {}) {
    try {
      const logDir = this.getCatLogDir(catId);
      const outputFile = path.join(logDir, 'export.md');
      
      let markdown = `# 🐱 猫咪成长记录\n\n`;
      markdown += `**导出时间**: ${new Date().toISOString()}\n\n`;
      
      // 获取统计
      const stats = await this.getLogStats(catId);
      markdown += `## 📊 统计\n\n`;
      markdown += `- 总互动次数：${stats.totalInteractions}\n`;
      markdown += `- 系统事件：${stats.totalSystemEvents}\n`;
      markdown += `- 里程碑：${stats.totalMilestones}\n`;
      markdown += `- 第一次记录：${stats.firstTimes}\n`;
      markdown += `- 追踪天数：${stats.daysTracked}\n\n`;
      
      // 获取第一次系列
      try {
        const firstTimeContent = await fs.readFile(path.join(logDir, 'first_times.json'), 'utf-8');
        const firstTimes = JSON.parse(firstTimeContent);
        
        markdown += `## 🎉 第一次系列\n\n`;
        for (const [type, data] of Object.entries(firstTimes)) {
          markdown += `### ${this.formatFirstTimeType(type)}\n`;
          markdown += `- 时间：${data.timestamp}\n`;
          markdown += `- 描述：${data.description}\n\n`;
        }
      } catch (e) {
        // 无第一次记录
      }

      await fs.writeFile(outputFile, markdown, 'utf-8');
      
      return outputFile;
    } catch (error) {
      console.error('🚨 导出 Markdown 失败:', error);
      return null;
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 追加日志到文件
   */
  async appendLog(logFile, entry) {
    const line = JSON.stringify(entry) + '\n';
    await this.appendFile(logFile, line);
  }

  /**
   * 追加内容到文件
   */
  async appendFile(file, content) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.appendFile(file, content, 'utf-8');
  }

  /**
   * 生成会话 ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取心情表情
   */
  getMoodEmoji(mood) {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      sleepy: '😴',
      hungry: '😋',
      playful: '😸',
      calm: '😌'
    };
    return emojis[mood] || '😺';
  }

  /**
   * 获取字段中文名
   */
  getFieldName(field) {
    const names = {
      hunger: '饥饿',
      thirst: '口渴',
      energy: '精力',
      mood: '心情',
      happiness: '快乐',
      bond: '羁绊',
      exp: '经验',
      level: '等级'
    };
    return names[field] || field;
  }

  /**
   * 格式化第一次类型
   */
  formatFirstTimeType(type) {
    const names = {
      first_meeting: '第一次见面',
      first_meal: '第一顿饭',
      first_play: '第一次玩耍',
      first_sleep: '第一次睡觉',
      first_explore: '第一次探索',
      first_skill: '第一次学会技能',
      first_friend: '第一次交朋友',
      first_sick: '第一次生病',
      first_birthday: '第一次过生日'
    };
    return names[type] || type;
  }
}

module.exports = { LoggingSystem };
