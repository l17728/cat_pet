/**
 * Mini Agent 核心引擎
 * Mini Agent Core - 独立运行的迷你 Agent
 * 
 * 具备 OpenClaw Agent 的核心能力：
 * 1. 自然语言理解（意图识别）
 * 2. 工具调用（执行业务逻辑）
 * 3. 响应格式化（生成可爱回复）
 * 4. 后台任务（状态衰减、自主行为）
 * 5. 进化系统（LLM 驱动）
 */

const CatPetBridge = require('./bridge');
const IntentRecognizer = require('./intent-recognizer');
const ResponseFormatter = require('./response-formatter');
const LLMAdapter = require('./llm-adapter');
const { loadCatData, saveCatData } = require('../core/evolvable');

// 注入 LLM 适配器到全局
let globalLLMAdapter = null;

class MiniAgent {
  constructor(options = {}) {
    // LLM 适配器
    this.llm = new LLMAdapter({
      provider: options.llmProvider,
      apiKey: options.llmApiKey,
      apiBaseUrl: options.llmApiUrl,
      model: options.llmModel
    });
    
    // 设置全局 LLM 适配器（供 evolution 系统使用）
    globalLLMAdapter = this.llm;
    global.llmAdapter = this.llm;
    
    // 意图识别器
    this.recognizer = new IntentRecognizer(this.llm);
    
    // 响应格式化器
    this.formatter = new ResponseFormatter(this.llm);
    
    // 猫咪桥接器
    this.bridge = new CatPetBridge({
      ...options,
      llmProvider: this.llm.provider,
      llmApiKey: this.llm.apiKey,
      llmApiUrl: this.llm.baseUrl,
      llmModel: this.llm.model
    });
    
    // 用户 ID 和猫咪 ID
    this.userId = options.userId || 'mini_agent_user';
    this.catId = null;
    
    // 运行状态
    this.initialized = false;
    this.running = false;
  }

  /**
   * 初始化
   */
  async init() {
    console.log('🤖 初始化 Mini Agent...');
    
    // 初始化桥接器
    const success = await this.bridge.init();
    if (!success) {
      console.log('❌ Mini Agent 初始化失败');
      return false;
    }
    
    this.catId = this.bridge.catId;
    this.initialized = true;
    
    console.log('✅ Mini Agent 初始化成功');
    return true;
  }

  /**
   * 处理用户输入
   * @param {string} input - 用户输入
   * @returns {string} - 响应
   */
  async process(input) {
    if (!this.initialized) {
      return '❌ Mini Agent 未初始化';
    }

    // 1. 识别意图（用于工具路由）
    const intentResult = await this.recognizer.recognize(input);
    console.log(`[意图] ${intentResult.intent} (置信度: ${intentResult.confidence})`);

    // 2. 执行动作（调用 cat skill 业务逻辑）
    const actionResult = await this.execute(intentResult);

    // 3. 获取猫咪最新状态
    const cat = this._getCat();

    // 4. 将用户输入追加到对话历史
    this.bridge.addToHistory('user', input);

    // 5. 生成回复（LLM 模式使用完整对话历史；否则降级模板）
    let response;
    if (this.bridge.llm.isAvailable()) {
      response = await this._generateContextualResponse(intentResult, actionResult, cat);
    } else {
      response = await this.formatter.format(intentResult.intent, actionResult, cat);
    }

    // 6. 将 LLM 回复追加到对话历史
    this.bridge.addToHistory('assistant', response);

    // 7. 推送用户消息和猫咪回复到聊天窗口
    await this.pushChatMessage(input, response);

    return response;
  }

  /**
   * 使用完整对话历史调用 LLM 生成上下文相关回复
   */
  async _generateContextualResponse(intentResult, actionResult, cat) {
    try {
      // 构建动作执行结果上下文（追加到本轮用户消息末尾）
      let actionContext = '';
      if (actionResult) {
        if (actionResult.reaction) {
          actionContext += `\n[猫咪反应] ${actionResult.reaction}`;
        }
        if (actionResult.stats) {
          const s = actionResult.stats;
          actionContext += `\n[当前状态] 精力:${s.energy} 心情:${s.mood} 饱食:${s.hunger} 清洁:${s.cleanliness}`;
        }
        if (!actionResult.success && actionResult.message) {
          actionContext += `\n[提示] ${actionResult.message}`;
        }
      }

      // 获取带完整历史的消息列表（最后一条已是刚追加的用户消息）
      const messages = this.bridge.getLLMMessages();
      if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        // 创建新对象而非原地修改，防止污染 conversationHistory 中的原始记录
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, content: last.content + actionContext };
      }

      const response = await this.bridge.llm.chat(messages);
      return response || await this.formatter.format(intentResult.intent, actionResult, cat);
    } catch (error) {
      console.error('生成响应失败:', error);
      return await this.formatter.format(intentResult.intent, actionResult, cat);
    }
  }

  /**
   * 推送用户消息和猫咪回复到 Star-Office 聊天窗口
   */
  async pushChatMessage(userMessage, catResponse) {
    try {
      if (userMessage) {
        await this.bridge.officeClient._request('POST', '/cat-chat/push', {
          response: userMessage,
          type: 'user'
        });
      }
      if (catResponse) {
        await this.bridge.officeClient._request('POST', '/cat-chat/push', {
          response: catResponse,
          type: 'cat'
        });
      }
    } catch (e) {
      // 忽略推送失败
    }
  }

  /**
   * 执行动作
   */
  async execute(intentResult) {
    const { intent, params } = intentResult;
    
    switch (intent) {
      case 'create_cat':
        return this._createCat(params);
      
      case 'feed':
        return this.bridge.interact('feed');
      
      case 'play':
        return this.bridge.interact('play');
      
      case 'bathe':
        return this.bridge.interact('bathe');
      
      case 'sleep':
        return this.bridge.interact('sleep');
      
      case 'pet':
        return this.bridge.interact('pet');
      
      case 'drink':
        return this._giveWater();
      
      case 'status':
        return this.bridge.getCatStatus();
      
      case 'health':
        return this._healthCheck();
      
      case 'help':
        return { intent: 'help' };
      
      case 'chat':
        return { intent: 'chat', response: params.response };
      
      default:
        return { intent: 'unknown', message: '未知命令' };
    }
  }

  /**
   * 创建猫咪
   */
  _createCat(params) {
    const catCore = require('../cat-core.js');
    const result = catCore.createCat(this.userId, {
      name: params.name,
      personality: params.personality,
      breed: params.breed
    });
    
    if (result.success) {
      this.catId = result.cat.id;
      this.bridge.catId = this.catId;
    }
    
    return result;
  }

  /**
   * 给水
   */
  _giveWater() {
    if (!this.catId) return { success: false, message: '没有猫咪' };
    
    const cat = loadCatData(this.catId);
    if (!cat) return { success: false, message: '猫咪不存在' };
    
    if (!cat.wellness) cat.wellness = {};
    cat.wellness.hydration = Math.min(100, (cat.wellness.hydration || 50) + 25);
    saveCatData(this.catId, cat);
    
    return {
      success: true,
      cat,
      stats: cat.stats,
      reaction: '咕嘟咕嘟喝水~'
    };
  }

  /**
   * 健康检查
   */
  _healthCheck() {
    const status = this.bridge.getCatStatus();
    if (!status || !status.success) {
      return { success: false, message: '获取状态失败' };
    }
    
    const warnings = [];
    const { stats, wellness } = status;
    
    if (stats.hunger < 30) warnings.push('🚨 饥饿警告');
    if (stats.energy < 30) warnings.push('⚠️ 疲劳警告');
    if (stats.cleanliness < 30) warnings.push('⚠️ 清洁警告');
    if (wellness?.hydration < 30) warnings.push('⚠️ 脱水警告');
    
    return {
      ...status,
      warnings,
      healthy: warnings.length === 0
    };
  }

  /**
   * 获取猫咪数据
   */
  _getCat() {
    if (!this.catId) return null;
    return loadCatData(this.catId);
  }

  /**
   * 启动后台任务
   */
  startBackground() {
    if (this.running) return;
    this.running = true;
    this.bridge.start();
  }

  /**
   * 停止后台任务
   */
  stopBackground() {
    this.running = false;
    this.bridge.stop();
  }

  /**
   * 打印状态
   */
  printStatus() {
    console.log('\n🤖 Mini Agent 状态');
    console.log('─'.repeat(30));
    console.log(`初始化: ${this.initialized ? '✅' : '❌'}`);
    console.log(`猫咪 ID: ${this.catId || '无'}`);
    console.log(`LLM: ${this.llm.isAvailable() ? this.llm.provider : '未配置'}`);
    console.log(`后台: ${this.running ? '运行中' : '已停止'}`);
    console.log('─'.repeat(30));
  }
}

// 导出全局 LLM 适配器获取函数
function getGlobalLLMAdapter() {
  return globalLLMAdapter;
}

module.exports = { MiniAgent, getGlobalLLMAdapter };