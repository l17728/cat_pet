/**
 * 响应格式化器
 * Response Formatter - 将结构化数据格式化为可爱回复
 * 
 * 功能：
 * - 格式化工具函数返回的结构化数据
 * - 根据猫咪性格调整语气
 * - 支持模板模式和 LLM 模式
 */

class ResponseFormatter {
  constructor(llmAdapter = null) {
    this.llm = llmAdapter;
    
    // 性格语气映射
    this.personalityTones = {
      '活泼': { prefix: '喵呜！', suffix: '~', emoji: '✨' },
      '温顺': { prefix: '喵~', suffix: '...', emoji: '💕' },
      '高冷': { prefix: '哼', suffix: '。', emoji: '😐' },
      '粘人': { prefix: '喵呜~', suffix: '！不要走~', emoji: '🐾' },
      '独立': { prefix: '', suffix: '喵。', emoji: '🐱' },
      '好奇': { prefix: '喵？', suffix: '~', emoji: '❓' },
      '胆小': { prefix: '...', suffix: '喵', emoji: '💦' },
      '霸道': { prefix: '喵！', suffix: '！', emoji: '👑' }
    };
    
    // 状态 emoji
    this.statEmojis = {
      energy: '⚡',
      mood: '💖',
      hunger: '🍖',
      cleanliness: '🛁',
      hydration: '💧',
      social: '👥'
    };
    
    // 响应模板
    this.templates = {
      create_cat: (data) => {
        const cat = data.cat;
        return `✨ 恭喜你！${cat.name}来到了你的身边~
品种：${cat.breed || '中华田园猫'}
性格：${cat.personality || '活泼'}
${this._getRandomEmoji()} 好好照顾它吧！`;
      },
      
      feed: (data) => {
        const { cat, stats, reaction } = data;
        const tone = this._getTone(cat.personality);
        return `${tone.prefix} ${reaction} ${tone.suffix}
🍖 饱食：${stats.hunger}
💖 心情：${stats.mood}`;
      },
      
      play: (data) => {
        const { cat, stats, reaction } = data;
        return `🎾 ${reaction}
💖 心情：+20 (${stats.mood})
⚡ 精力：-15 (${stats.energy})`;
      },
      
      bathe: (data) => {
        const { cat, stats, reaction } = data;
        return `🛁 ${reaction}
🧼 清洁度：+40 (${stats.cleanliness})
${stats.mood < 80 ? '💦 心情有点下降了...' : ''}`;
      },
      
      sleep: (data) => {
        const { cat, stats, reaction } = data;
        return `💤 ${reaction}
⚡ 精力：+40 (${stats.energy})
🌙 晚安喵~`;
      },
      
      pet: (data) => {
        const { cat, stats, reaction } = data;
        return `💕 ${reaction}
💖 心情：+10 (${stats.mood})
呼噜呼噜~`;
      },
      
      status: (data) => {
        const { cat, stats, wellness, status } = data;
        return `📊 ${cat.name} 的状态

【基本信息】
品种：${cat.breed}
性格：${cat.personality}
状态：${status}

【核心状态】
${this._formatStats(stats)}
${wellness ? `\n【福祉状态】\n${this._formatStats(wellness)}` : ''}`;
      },
      
      error: (data) => {
        return `❌ ${data.message || '出错了喵...'}`;
      },
      
      help: () => {
        return `🐱 猫咪模拟器帮助

【基础命令】
创建猫、喂食、玩耍、洗澡、睡觉、摸摸

【查看状态】
状态、健康检查

【扩展功能】
商店、拜访

直接用自然语言和我说话就可以啦~`;
      },
      
      unknown: () => {
        return `喵？我没听懂...
试试说：喂食、玩耍、看看猫、帮助`;
      }
    };
  }

  /**
   * 格式化响应
   * @param {string} intent - 意图
   * @param {object} data - 数据
   * @param {object} cat - 猫咪信息（可选）
   * @returns {string} - 格式化后的响应
   */
  async format(intent, data, cat = null) {
    // 1. 如果有 LLM 且需要个性化，使用 LLM 格式化
    if (this.llm && this.llm.isAvailable() && cat && this._shouldUseLLM(intent)) {
      const llmResponse = await this.formatWithLLM(intent, data, cat);
      if (llmResponse) return llmResponse;
    }
    
    // 2. 使用模板格式化
    const template = this.templates[intent] || this.templates.unknown;
    return template(data);
  }

  /**
   * 判断是否应该使用 LLM
   */
  _shouldUseLLM(intent) {
    // 这些意图适合用 LLM 格式化
    const llmPreferred = ['feed', 'play', 'bathe', 'sleep', 'pet', 'status'];
    return llmPreferred.includes(intent);
  }

  /**
   * 使用 LLM 格式化
   */
  async formatWithLLM(intent, data, cat) {
    const prompt = `你是${cat.name}，一只${cat.personality}的猫咪。
主人刚刚${this._getActionDescription(intent)}。
结果：${JSON.stringify(data)}

用可爱的猫咪语气回复主人（50字以内），加入拟声词如"喵呜~"。`;

    try {
      const response = await this.llm.call(prompt, { maxTokens: 100 });
      if (response) {
        return response;
      }
    } catch (e) {
      console.error('[响应格式化] LLM 失败:', e.message);
    }
    
    return null;
  }

  /**
   * 获取动作描述
   */
  _getActionDescription(intent) {
    const descriptions = {
      feed: '喂了你',
      play: '陪你玩了',
      bathe: '给你洗了澡',
      sleep: '让你睡觉',
      pet: '摸了摸你'
    };
    return descriptions[intent] || '做了什么';
  }

  /**
   * 获取性格语气
   */
  _getTone(personality) {
    return this.personalityTones[personality] || this.personalityTones['活泼'];
  }

  /**
   * 格式化状态数据
   */
  _formatStats(stats) {
    return Object.entries(stats)
      .map(([key, value]) => `${this.statEmojis[key] || '📊'} ${key}: ${value}/100`)
      .join('\n');
  }

  /**
   * 随机 emoji
   */
  _getRandomEmoji() {
    const emojis = ['🐱', '😺', '😸', '😻', '🙀', '😿', '😾'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }
}

module.exports = ResponseFormatter;