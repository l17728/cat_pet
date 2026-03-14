/**
 * 意图识别器
 * Intent Recognizer - 理解用户自然语言输入
 * 
 * 功能：
 * - 识别用户意图（创建猫咪、喂食、玩耍等）
 * - 提取参数（猫咪名字、品种、性格等）
 * - 支持规则模式和 LLM 模式
 */

class IntentRecognizer {
  constructor(llmAdapter = null) {
    this.llm = llmAdapter;
    
    // 意图规则库
    this.intentRules = [
      // 猫咪管理
      {
        intent: 'create_cat',
        patterns: ['创建(一只)?猫', '养猫', '我要猫', 'new cat', 'create cat', '养一只'],
        params: {
          name: ['叫(\\w+)', '名字(是)?(\\w+)', 'named (\\w+)'],
          personality: ['性格(是)?(活泼|温顺|高冷|粘人|独立|好奇|胆小|霸道)'],
          breed: ['(布偶猫|英短|美短|中华田园猫|布偶)', '品种(是)?(\\w+猫)']
        }
      },
      {
        intent: 'delete_cat',
        patterns: ['删除猫', '不要猫', 'delete cat']
      },
      
      // 日常互动
      {
        intent: 'feed',
        patterns: ['喂食', '喂猫', '给猫吃', 'feed', '吃饭', '吃东西']
      },
      {
        intent: 'play',
        patterns: ['玩耍', '玩(一会儿|一下)?', '陪猫玩', 'play', '逗猫']
      },
      {
        intent: 'bathe',
        patterns: ['洗澡', '洗(一?个)澡', '给猫洗', 'bathe', '清洁']
      },
      {
        intent: 'sleep',
        patterns: ['睡觉', '睡(一?觉)?', '休息', 'sleep', '让猫睡']
      },
      {
        intent: 'pet',
        patterns: ['摸摸', '摸(一?下)?', '抚摸', 'pet', '撸猫', '蹭蹭']
      },
      {
        intent: 'drink',
        patterns: ['喝水', '给水', 'drink', '喂水']
      },
      
      // 状态查询
      {
        intent: 'status',
        patterns: ['状态', '看看猫', '猫(怎么样|如何|在哪)', 'status', '查看', '怎么样', '看看我的']
      },
      {
        intent: 'health',
        patterns: ['健康', '体检', 'health', '健康检查']
      },
      
      // 扩展功能
      {
        intent: 'shop',
        patterns: ['商店', '买玩具', 'shop', 'store']
      },
      {
        intent: 'visit',
        patterns: ['拜访', '去别人家', 'visit']
      },
      
      // 成就
      {
        intent: 'achievements',
        patterns: ['成就', '徽章', 'achievement', '我解锁了什么', '奖励']
      },

      // 冷却/定时器查询
      {
        intent: 'get_cooldowns',
        patterns: ['冷却', '还要等(多久|多少)', '能(再)?喂吗', '能(再)?玩吗', '定时器', '等待时间', '什么时候能']
      },

      // 重置冷却/定时器
      {
        intent: 'clear_cooldown',
        patterns: ['重置冷却', '清除冷却', '清除等待', '重置定时', '跳过等待', '取消冷却', '重置所有冷却'],
        params: {
          action: ['重置(喂食|玩耍|洗澡|睡觉|摸摸)冷却', '清除(喂食|玩耍|洗澡|睡觉|摸摸)']
        }
      },

      // 读取原始状态文件
      {
        intent: 'read_state',
        patterns: ['读取状态', '状态文件', '原始数据', '查看数据', '导出状态', '显示原始']
      },

      // 修改状态文件（部分更新）
      {
        intent: 'write_state',
        patterns: ['修改状态', '设置状态', '更新数据', '直接设置', '强制设置']
      },

      // 帮助
      {
        intent: 'help',
        patterns: ['帮助', 'help', '怎么用', '能做什么']
      }
    ];
    
    // 闲聊回应
    this.chatResponses = {
      '早(上好|安)?': '早上好喵~ {name}已经醒了，正等着你呢~',
      '晚(上好|安)?': '晚上好喵~ {name}困了，准备睡觉啦~',
      '谢(谢|了)': '不客气喵~ {name}蹭蹭你~',
      '(你|猫)好': '你好呀喵~ {name}冲你眨眨眼~',
      '(可爱|萌|卡哇伊)': '喵呜~ {name}得意地转圈圈~'
    };
  }

  /**
   * 识别用户意图
   * @param {string} input - 用户输入
   * @returns {object} - { intent, params, confidence }
   */
  async recognize(input) {
    const normalizedInput = input.toLowerCase().trim();

    // 1. 先尝试规则匹配
    const ruleResult = this.matchRules(normalizedInput);

    // 2. 规则置信度足够高则直接返回
    if (ruleResult.confidence >= 0.8) {
      return ruleResult;
    }

    // 3. 规则未命中（unknown/low confidence），有 LLM 则交 LLM 识别
    if (this.llm && this.llm.isAvailable()) {
      const llmResult = await this.recognizeWithLLM(input);
      if (llmResult && llmResult.confidence >= 0.5) {
        return llmResult;
      }
    }

    // 4. 兜底返回规则结果（可能是 unknown）
    return ruleResult;
  }

  /**
   * 规则匹配
   */
  matchRules(input) {
    for (const rule of this.intentRules) {
      for (const pattern of rule.patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(input)) {
            // 提取参数
            const params = {};
            if (rule.params) {
              for (const [param, patterns] of Object.entries(rule.params)) {
                for (const p of patterns) {
                  const match = input.match(new RegExp(p, 'i'));
                  if (match) {
                    params[param] = match[match.length - 1] || match[1];
                    break;
                  }
                }
              }
            }
            
            return {
              intent: rule.intent,
              params,
              confidence: 0.9,
              method: 'rule'
            };
          }
        } catch (e) {
          // 忽略无效正则
        }
      }
    }
    
    // 检查闲聊
    for (const [pattern, response] of Object.entries(this.chatResponses)) {
      try {
        if (new RegExp(pattern, 'i').test(input)) {
          return {
            intent: 'chat',
            params: { response },
            confidence: 0.8,
            method: 'rule'
          };
        }
      } catch (e) {
        // 忽略
      }
    }
    
    return { intent: 'unknown', params: {}, confidence: 0, method: 'rule' };
  }

  /**
   * LLM 识别
   */
  async recognizeWithLLM(input) {
    const prompt = `分析用户输入，识别意图和参数。

用户输入：${input}

可用意图：create_cat, feed, play, bathe, sleep, pet, drink, status, health, shop, visit, help, chat, unknown

输出 JSON：
{
  "intent": "意图名称",
  "params": { "name": "名字", "personality": "性格", "breed": "品种" },
  "confidence": 0.9
}`;

    try {
      const response = await this.llm.call(prompt, { maxTokens: 100 });
      const result = this.llm.parseJson(response);
      
      if (result && result.intent) {
        return {
          ...result,
          method: 'llm'
        };
      }
    } catch (e) {
      console.error('[意图识别] LLM 失败:', e.message);
    }
    
    return null;
  }
}

module.exports = IntentRecognizer;