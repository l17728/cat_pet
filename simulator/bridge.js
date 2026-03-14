/**
 * 桥接服务核心
 * Bridge Service - 连接 cat-pet 和 Star-Office
 * 
 * 职责:
 * 1. 加载 cat-pet 模块
 * 2. 轮询猫咪状态
 * 3. 映射状态到 Star-Office
 * 4. 同步到可视化界面
 * 5. 后台任务：状态衰减、自主行为
 */

const path = require('path');
const config = require('./config');
const OfficeClient = require('./office-client');
const BackgroundScheduler = require('./background-scheduler');
const LLMAdapter = require('./llm-adapter');
const interactionLogger = require('./interaction-logger');
const { mapCatToOffice, getCatStatusSummary, adjustDetailByPersonality } = require('./state-mapper');
const memory = require('./memory-manager');

// 加载 cat-pet 模块 (从上级目录)
const catCore = require('../cat-core.js');

class CatPetBridge {
  constructor(options = {}) {
    this.config = { ...config, ...options };
    this.officeClient = new OfficeClient(this.config.officeUrl);
    
    // 运行状态
    this.isRunning = false;
    this.syncTimer = null;
    this.lastState = null;
    
    // 猫咪信息
    this.userId = this.config.defaultUserId;
    this.catId = this.config.catId;
    
    // 访客模式
    this.agentId = null;
    this.isGuest = options.guestMode || false;
    
    // 后台调度器
    this.scheduler = null;
    
    // LLM 适配器
    this.llm = new LLMAdapter({
      provider: options.llmProvider || process.env.LLM_PROVIDER,
      apiKey: options.llmApiKey || process.env.LLM_API_KEY,
      apiBaseUrl: options.llmApiUrl || process.env.LLM_API_URL,
      model: options.llmModel || process.env.LLM_MODEL,
      logger: interactionLogger
    });
    
    // ========== 对话记录和上下文管理 ==========
    // 从磁盘加载已有历史，实现跨会话持久化（对应 OpenClaw 持久化 messages）
    this.conversationHistory = memory.loadHistory(this.userId);
    this.maxHistoryLength = 20;
    this.systemPrompt = this._buildSystemPrompt();
    this.isWaitingForUserInput = false;
    this.pendingAction = null;
  }

  /**
   * 构建系统提示词
   */
  _buildSystemPrompt() {
    return `你是猫咪养成系统的智能代理，负责与用户互动并推进游戏进程。

你的职责：
1. 引导用户创建和养育虚拟猫咪
2. 根据猫咪状态主动发起互动请求
3. 记录所有对话历史，保持上下文连贯
4. 以可爱、温馨的语气与用户交流

猫咪状态包括：精力、心情、饱食度、清洁度、水分、社交
当猫咪状态低时，你需要提醒用户并引导互动。

回复格式要求：
- 使用 emoji 增加趣味性
- 语气要亲切可爱
- 必要时询问用户意愿`;
  }

  /**
   * 添加消息到对话历史
   */
  addToHistory(role, content, metadata = {}) {
    const message = {
      role,  // 'system', 'user', 'assistant'
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    this.conversationHistory.push(message);

    // 限制历史长度，保留最近的对话
    if (this.conversationHistory.length > this.maxHistoryLength * 2) {
      const systemMessages = this.conversationHistory.filter(m => m.role === 'system');
      const recentMessages = this.conversationHistory.slice(-this.maxHistoryLength * 2);
      this.conversationHistory = [...systemMessages, ...recentMessages];
    }

    // 持久化到磁盘（对应 OpenClaw 跨会话历史）
    memory.saveHistory(this.userId, this.conversationHistory);
  }

  /**
   * 获取格式化的对话上下文
   */
  getFormattedContext() {
    return this.conversationHistory.map(msg => {
      if (msg.role === 'system') return `[系统] ${msg.content}`;
      if (msg.role === 'user') return `[用户] ${msg.content}`;
      if (msg.role === 'assistant') return `[猫咪] ${msg.content}`;
      return `${msg.content}`;
    }).join('\n');
  }

  /**
   * 获取用于 LLM 的 messages 格式
   */
  getLLMMessages() {
    const messages = [
      { role: 'system', content: this.systemPrompt }
    ];
    
    // 添加最近的历史对话
    const recentHistory = this.conversationHistory
      .filter(m => m.role !== 'system')
      .slice(-10);  // 最近10轮对话
    
    messages.push(...recentHistory);
    
    return messages;
  }

  /**
   * 推送消息到聊天窗口
   */
  async pushToChat(message, type = 'system') {
    try {
      await this.officeClient._request('POST', '/cat-chat/push', {
        response: message,
        type: type,
        timestamp: new Date().toISOString()
      });
      console.log(`📢 [推送到对话框]: ${message}`);
    } catch (e) {
      console.log(`⚠️ 推送失败: ${e.message}`);
    }
  }

  /**
   * 与 LLM 沟通获取回复
   */
  async chatWithLLM(userMessage) {
    if (!this.llm.isAvailable()) {
      return null;
    }

    try {
      // 获取当前猫咪状态上下文
      const catStatus = this.getCatStatus();
      const statusContext = catStatus?.success
        ? `\n当前猫咪状态：${JSON.stringify(catStatus.stats)}`
        : '';

      // 先将用户消息追加到历史
      this.addToHistory('user', userMessage);

      // 使用历史构建消息列表，在发送给 LLM 的副本中追加状态上下文（不污染历史）
      const messages = this.getLLMMessages();
      if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, content: last.content + statusContext };
      }

      // 调用 LLM
      const response = await this.llm.chat(messages, { context: '对话交互' });

      // 将助手回复追加到历史
      this.addToHistory('assistant', response);

      return response;
    } catch (error) {
      console.error('LLM 调用失败:', error);
      return null;
    }
  }

  /**
   * 主动发起对话（猫咪主动说话）
   * 使用完整对话历史保持上下文连贯性
   */
  async proactiveChat(reason = 'general') {
    if (!this.llm.isAvailable()) {
      return;
    }

    const cat = this._getCat();
    if (!cat) return;

    const prompts = {
      hungry: `${cat.name}饿了，以猫咪视角用可爱的语气向主人撒娇请求食物`,
      tired: `${cat.name}困了，用可爱方式告诉主人想睡觉`,
      dirty: `${cat.name}脏了，提醒主人该洗澡了`,
      bored: `${cat.name}觉得无聊，邀请主人玩耍`,
      general: `${cat.name}想跟主人说点什么，生成一句可爱的问候`
    };

    const prompt = prompts[reason] || prompts.general;

    try {
      // 使用带完整历史的消息列表，保持对话上下文连贯
      const messages = this.getLLMMessages();
      messages.push({ role: 'user', content: prompt });

      // 将临时触发 prompt 追加到历史，确保 user/assistant 交替不断链
      this.addToHistory('user', prompt, { ephemeral: true, reason });

      const response = await this.llm.chat(messages, { context: '主动发起对话' });

      if (response) {
        this.addToHistory('assistant', response, { proactive: true, reason });
        await this.pushToChat(response, 'cat');
        // 写入日记
        if (this.catId) memory.appendDiary(this.catId, `[主动] ${response}`);
      }

      return response;
    } catch (error) {
      console.error('主动对话失败:', error);
    }
  }

  /**
   * 初始化 - 检查连接、获取猫咪（带交互式创建流程）
   */
  async init() {
    console.log('🚀 初始化猫咪模拟器...');
    
    // ========== 步骤1: 推送 Skill 加载信息到聊天窗口 ==========
    await this.pushToChat('🐱 猫咪养成系统 v3.0.0 已加载！', 'system');
    await this.pushToChat('✨ 我是你的云猫世界助手，让我们一起养育可爱的虚拟猫咪吧~', 'system');
    
    // 检查 Star-Office 连接
    const connected = await this.officeClient.testConnection();
    if (!connected) {
      const errorMsg = '❌ 无法连接到 Star-Office，请确保后端已启动 (python backend/app.py)';
      console.error(errorMsg);
      await this.pushToChat(errorMsg, 'error');
      return false;
    }
    await this.pushToChat('✅ 已成功连接到云猫世界服务器', 'system');
    console.log('✅ Star-Office 连接成功');
    
    // ========== 步骤2: 检查是否已有猫咪 ==========
    const cats = catCore.getUserCats(this.userId);
    
    if (cats && cats.cats && cats.cats.length > 0) {
      // 已有猫咪，直接进入游戏
      this.catId = this.catId || cats.cats[0].id;
      const cat = this._getCat();
      await this.pushToChat(`🎉 欢迎回来！找到你的猫咪【${cat.name}】，${cat.breed}，性格${cat.personality}`, 'system');
      await this.pushToChat(`喵呜~ 主人你回来啦！${cat.name}好想你呀~ 🐱`, 'cat');
      console.log('✅ 找到猫咪:', cat.name);
    } else {
      // ========== 步骤3: 交互式创建猫咪 ==========
      await this.pushToChat('🎁 你还没有猫咪呢，让我们一起创建一只吧！', 'system');
      await this.pushToChat('请告诉我你想养什么样的猫咪：\n格式：名字 [品种] [性格]\n例如：小白 布偶猫 温顺', 'system');
      
      // 设置等待状态
      this.isWaitingForUserInput = true;
      this.pendingAction = 'create_cat';
      
      // 创建默认猫咪作为示例，但通知用户这是临时的
      const result = catCore.createCat(this.userId, {
        name: '小橘',
        personality: '活泼',
        breed: '中华田园猫'
      });
      
      if (result.success) {
        this.catId = result.cat.id;
        await this.pushToChat(`✅ 已为你创建默认猫咪【小橘】作为示例`, 'system');
        await this.pushToChat(`喵呜~ 主人你好呀！我是小橘，一只活泼的中华田园猫，快来给我起个新名字吧！🐱`, 'cat');
        console.log('✅ 创建默认猫咪:', result.cat.name);
      } else {
        await this.pushToChat('❌ 创建猫咪失败，请重试', 'error');
        return false;
      }
    }
    
    // 添加系统消息到历史
    this.addToHistory('system', '猫咪养成系统初始化完成');
    
    // ========== 步骤4: 初始化后台调度器 ==========
    this.scheduler = new BackgroundScheduler({
      userId: this.userId,
      catId: this.catId,
      decayInterval: this.config.decayInterval || 20 * 1000,  // 20秒
      autoActionInterval: this.config.autoActionInterval || 10 * 1000,  // 10秒
      enableLLM: this.llm.isAvailable(),
      llmClient: this.llm,
      
      // 回调 - 修改为推送到聊天窗口
      onDecay: async (data) => {
        if (data.warnings.length > 0) {
          await this.handleWarnings(data.warnings);
        }
      },
      onAutoAction: async (action) => {
        if (action.notifyOwner && action.notificationMessage) {
          // 推送到聊天窗口
          await this.pushToChat(action.notificationMessage, 'cat');
          console.log(`📢 ${action.notificationMessage}`);
          // 将通知消息追加到对话历史，让后续 LLM 知道发生了什么
          this.addToHistory('assistant', action.notificationMessage, {
            proactive: true,
            type: 'auto_action',
            actionType: action.action
          });
        }
        // 如果有 LLM，基于完整历史生成更丰富的描述并推进游戏
        if (this.llm.isAvailable() && action.description) {
          await this.proactiveChat(action.type || 'general');
        }
        // 自主行为后同步状态
        await this.sync();
      }
    });
    
    // LLM 状态
    if (this.llm.isAvailable()) {
      await this.pushToChat(`🤖 智能对话已启用 (Provider: ${this.llm.provider})`, 'system');
      console.log('✅ LLM 已启用:', this.llm.provider);
    } else {
      await this.pushToChat('ℹ️ 智能对话未配置，使用基础模式', 'system');
      console.log('ℹ️ LLM 未配置，使用规则模式');
    }
    
    // 访客模式: 加入办公室
    if (this.isGuest) {
      const joinResult = await this.officeClient.join({
        joinKey: this.config.joinKey,
        agentName: this.config.agentName
      });
      if (joinResult.ok && joinResult.data?.agent_id) {
        this.agentId = joinResult.data.agent_id;
        await this.pushToChat(`✅ 已以访客模式加入办公室`, 'system');
        console.log('✅ 加入办公室 (访客模式), Agent ID:', this.agentId);
      } else {
        await this.pushToChat(`⚠️ 访客模式加入失败，使用主 Agent 模式`, 'warning');
        console.log('⚠️ 访客模式加入失败，使用主 Agent 模式');
        this.isGuest = false;
      }
    }
    
    // 启动时主动打个招呼
    if (this.llm.isAvailable()) {
      await this.proactiveChat('general');
    }
    
    await this.pushToChat('🎮 猫咪养成系统已启动！你可以：\n• 喂食、玩耍、洗澡、睡觉、摸摸\n• 查看猫咪状态\n• 等待猫咪自主行动', 'system');
    
    return true;
  }

  /**
   * 处理用户创建猫咪的输入
   */
  async handleCreateCatInput(input) {
    // 解析用户输入
    const parts = input.trim().split(/\s+/);
    const name = parts[0];
    const breed = parts[1] || '中华田园猫';
    const personality = parts[2] || '活泼';
    
    if (!name) {
      await this.pushToChat('❌ 请提供猫咪名字', 'error');
      return false;
    }
    
    // 删除临时猫咪，创建新猫咪
    if (this.catId) {
      // 这里可以添加删除旧猫咪的逻辑
    }
    
    const result = catCore.createCat(this.userId, {
      name,
      breed,
      personality
    });
    
    if (result.success) {
      this.catId = result.cat.id;
      await this.pushToChat(`🎉 成功创建猫咪【${name}】！${breed}，性格${personality}`, 'system');
      await this.pushToChat(`喵呜~ 主人好！我是${name}，以后请多多关照！🐱`, 'cat');
      
      // 记录到历史
      this.addToHistory('user', `创建猫咪: ${name}`);
      this.addToHistory('assistant', `成功创建猫咪 ${name}`);
      
      return true;
    } else {
      await this.pushToChat(`❌ 创建失败: ${result.error}`, 'error');
      return false;
    }
  }

  /**
   * 处理健康警告
   */
  async handleWarnings(warnings) {
    for (const warning of warnings) {
      console.log(`⚠️ ${warning}`);
      await this.pushToChat(warning, 'warning');
      // 写入日记（对应 OpenClaw memory/YYYY-MM-DD.md）
      if (this.catId) memory.appendDiary(this.catId, `⚠️ ${warning}`);
    }
    await this.sync();
  }

  /**
   * 获取当前猫咪状态
   */
  getCatStatus() {
    if (!this.catId) return null;
    return catCore.getStatus(this.userId, this.catId);
  }

  /**
   * 获取猫咪数据对象（内部使用）
   */
  _getCat() {
    if (!this.catId) return null;
    const { loadCatData } = require('../core/evolvable');
    return loadCatData(this.catId);
  }

  /**
   * 同步状态到 Star-Office
   */
  async sync() {
    const statusResult = this.getCatStatus();
    if (!statusResult || !statusResult.success) {
      console.log('⚠️ 获取猫咪状态失败');
      return false;
    }
    
    // 合并 cat 和 stats 到一个对象供映射器使用
    const cat = {
      ...statusResult.cat,
      stats: statusResult.stats
    };
    const officeState = mapCatToOffice(cat);
    const detail = adjustDetailByPersonality(cat, officeState.detail);
    
    // 检查状态是否变化
    const stateKey = `${officeState.state}:${detail}`;
    if (stateKey === this.lastState) {
      // 状态未变化，跳过同步
      return true;
    }
    this.lastState = stateKey;
    
    // 同步到 Star-Office
    let result;
    if (this.isGuest && this.agentId) {
      result = await this.officeClient.push(this.agentId, officeState.state, detail);
    } else {
      // 构建完整的状态数据（包含猫咪状态）
      const catData = {
        name: cat.name,
        personality: cat.personality,
        breed: statusResult.cat.breed,
        energy: statusResult.stats.energy,
        mood: statusResult.stats.mood,
        hunger: statusResult.stats.hunger,
        cleanliness: statusResult.stats.cleanliness
      };
      result = await this.officeClient.setState(officeState.state, detail, catData);
    }
    
    if (result.ok) {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] ${getCatStatusSummary(cat)}`);
      console.log(`   → ${officeState.state}: ${detail}`);
    } else {
      console.log('⚠️ 同步失败:', result.error);
    }
    
    return result.ok;
  }

  /**
   * 开始自动同步
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('\n🎯 开始同步猫咪状态...');
    console.log(`   同步间隔: ${this.config.syncInterval}ms`);
    console.log(`   按 Ctrl+C 停止\n`);
    
    // 启动后台调度器
    if (this.scheduler) {
      this.scheduler.start();
    }
    
    // 立即同步一次
    this.sync();
    
    // 定时同步
    this.syncTimer = setInterval(() => {
      this.sync();
    }, this.config.syncInterval);
  }

  /**
   * 停止同步
   */
  async stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    // 停止后台调度器
    if (this.scheduler) {
      this.scheduler.stop();
    }
    
    // 访客模式: 离开办公室
    if (this.isGuest && this.agentId) {
      await this.officeClient.leave(this.agentId);
      console.log('👋 已离开办公室');
    }
    
    console.log('⏹️ 同步已停止');
  }

  /**
   * 执行互动操作
   */
  async interact(action) {
    const actions = {
      feed: () => catCore.feed(this.userId, this.catId),
      play: () => catCore.play(this.userId, this.catId),
      bathe: () => catCore.bathe(this.userId, this.catId),
      sleep: () => catCore.sleep(this.userId, this.catId),
      pet: () => catCore.pet(this.userId, this.catId)
    };
    
    if (!actions[action]) {
      console.log('❌ 未知操作:', action);
      return null;
    }
    
    const result = actions[action]();
    if (result.success) {
      console.log(`✨ ${result.reaction || action + ' 成功'}`);
      // 写入日记
      if (this.catId) {
        const catName = result.cat?.name || '';
        memory.appendDiary(this.catId, `${catName} ${action}: ${result.reaction || '成功'} | 状态: 精力${result.stats?.energy} 心情${result.stats?.mood} 饱食${result.stats?.hunger}`);
      }
      await this.sync();
    } else {
      console.log('❌ 操作失败:', result.message || result.error);
    }

    return result;
  }

  /**
   * 打印猫咪详情
   */
  printStatus() {
    const result = this.getCatStatus();
    if (!result || !result.success) {
      console.log('❌ 获取状态失败');
      return;
    }
    
    const { cat, stats, wellness, status } = result;
    console.log('\n📊 猫咪状态');
    console.log('─'.repeat(30));
    console.log(`名字: ${cat.name}`);
    console.log(`品种: ${cat.breed}`);
    console.log(`性格: ${cat.personality}`);
    console.log(`状态: ${status}`);
    console.log('\n核心状态:');
    console.log(`  ⚡ 精力: ${stats.energy}/100`);
    console.log(`  💖 心情: ${stats.mood}/100`);
    console.log(`  🍖 饱食: ${stats.hunger}/100`);
    console.log(`  🛁 清洁: ${stats.cleanliness}/100`);
    
    if (wellness) {
      console.log('\n福祉状态:');
      console.log(`  💧 水分: ${wellness.hydration}/100`);
      console.log(`  👥 社交: ${wellness.social}/100`);
      console.log(`  🏃 运动: ${wellness.exercise}/100`);
      console.log(`  🧩 心理: ${wellness.mental}/100`);
    }
    
    // LLM 状态
    console.log('\n系统状态:');
    console.log(`  🤖 LLM: ${this.llm.isAvailable() ? this.llm.provider : '未配置'}`);
    console.log(`  ⏰ 后台调度: ${this.scheduler?.isRunning ? '运行中' : '已停止'}`);
    
    console.log('─'.repeat(30));
  }
}

module.exports = CatPetBridge;