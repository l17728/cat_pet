/**
 * LLM 适配器
 * LLM Adapter - 支持多种 LLM 后端
 * 
 * 支持的后端:
 * - Anthropic API (兼容格式，支持阿里云 DashScope)
 * - OpenAI API
 * - 本地 Ollama
 * - 自定义 HTTP API
 * - OpenClaw sessions_spawn
 */

const fs = require('fs');
const path = require('path');

class LLMAdapter {
  constructor(options = {}) {
    // 加载配置文件
    this.config = this.loadConfig();
    
    // 优先级: 选项参数 > 配置文件 > 环境变量
    this.provider = options.provider || this.config.provider || process.env.LLM_PROVIDER || 'none';
    this.apiKey = options.apiKey || this.config.apiKey || process.env.LLM_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
    this.baseUrl = options.apiBaseUrl || this.config.baseUrl || process.env.LLM_API_URL || process.env.ANTHROPIC_BASE_URL;
    this.model = options.model || this.config.model || process.env.LLM_MODEL || process.env.ANTHROPIC_MODEL || 'glm-5';
    
    // 生成参数
    this.temperature = this.config.generation?.temperature || 0.8;
    this.maxTokens = this.config.generation?.maxTokens || 500;
    this.systemPrompt = this.config.systemPrompt || '你是一只可爱的虚拟猫咪。';
    
    // Ollama 配置
    this.ollamaUrl = options.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    this.ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || 'llama2';
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    const configPath = path.join(__dirname, 'llm-config.json');
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.log('[LLM] 配置文件加载失败，使用默认配置');
    }
    return {};
  }

  /**
   * 检查是否可用
   */
  isAvailable() {
    return this.provider !== 'none' && !!this.apiKey;
  }

  /**
   * 调用 LLM - 支持消息数组格式（对话上下文）
   * @param {string|array} prompt - 输入提示或消息数组
   * @param {object} options - 选项
   * @returns {Promise<string>} - LLM 响应
   */
  async call(prompt, options = {}) {
    if (!this.isAvailable()) {
      console.log('[LLM] 未配置 LLM，使用规则模式');
      return null;
    }

    try {
      // 判断输入类型：字符串或消息数组
      const isMessagesFormat = Array.isArray(prompt);
      
      switch (this.provider) {
        case 'anthropic':
          return await this.callAnthropicWithMessages(prompt, options, isMessagesFormat);
        case 'openai':
          return await this.callOpenAIWithMessages(prompt, options, isMessagesFormat);
        case 'ollama':
          return isMessagesFormat 
            ? await this.callOllamaChat(prompt, options)
            : await this.callOllama(prompt, options);
        case 'custom':
          return await this.callCustom(prompt, options);
        case 'openclaw':
          return await this.callOpenClaw(prompt, options);
        default:
          return null;
      }
    } catch (error) {
      console.error('[LLM] 调用失败:', error.message);
      return null;
    }
  }

  /**
   * Anthropic API - 支持消息数组格式
   */
  async callAnthropicWithMessages(promptOrMessages, options = {}, isMessagesFormat = false) {
    const url = this.baseUrl || 'https://api.anthropic.com/v1/messages';
    
    let messages;
    let systemPrompt = options.systemPrompt || this.systemPrompt;
    
    if (isMessagesFormat) {
      // 消息数组格式 - 提取 system 消息
      const systemMsg = promptOrMessages.find(m => m.role === 'system');
      if (systemMsg) {
        systemPrompt = systemMsg.content;
        messages = promptOrMessages.filter(m => m.role !== 'system');
      } else {
        messages = promptOrMessages;
      }
    } else {
      // 字符串格式
      messages = [{ role: 'user', content: promptOrMessages }];
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        system: systemPrompt,
        messages: messages,
        temperature: options.temperature || this.temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Anthropic 响应格式 (标准)
    if (data.content && Array.isArray(data.content)) {
      // 标准 Anthropic 格式: content[0].text
      if (data.content[0]?.text) {
        return data.content[0].text;
      }
      // 思考格式: content[0].thinking
      if (data.content[0]?.thinking) {
        // 如果有多个 content，找 text 类型的
        const textContent = data.content.find(c => c.type === 'text');
        return textContent?.text || data.content[0].thinking;
      }
    }
    
    // 兼容其他格式
    return data.response || data.message || data.text || JSON.stringify(data);
  }

  /**
   * OpenAI API - 支持消息数组格式
   */
  async callOpenAIWithMessages(promptOrMessages, options = {}, isMessagesFormat = false) {
    let messages;
    
    if (isMessagesFormat) {
      messages = promptOrMessages;
    } else {
      // 字符串格式
      messages = [
        { role: 'system', content: options.systemPrompt || this.systemPrompt },
        { role: 'user', content: promptOrMessages }
      ];
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: messages,
        temperature: options.temperature || 0.8,
        max_tokens: options.maxTokens || 500
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  }

  /**
   * Ollama Chat API - 支持消息数组格式
   */
  async callOllamaChat(messages, options = {}) {
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.ollamaModel,
        messages: messages,
        stream: false
      })
    });

    const data = await response.json();
    return data.message?.content || null;
  }

  /**
   * 简化的 chat 方法 - 直接传入消息数组
   */
  async chat(messages, options = {}) {
    return this.call(messages, { ...options, isMessagesFormat: true });
  }

  /**
   * Anthropic API (兼容格式，支持阿里云 DashScope)
   */
  async callAnthropic(prompt, options = {}) {
    const url = this.baseUrl || 'https://api.anthropic.com/v1/messages';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        system: options.systemPrompt || this.systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || this.temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Anthropic 响应格式 (标准)
    if (data.content && Array.isArray(data.content)) {
      // 标准 Anthropic 格式: content[0].text
      if (data.content[0]?.text) {
        return data.content[0].text;
      }
      // 思考格式: content[0].thinking
      if (data.content[0]?.thinking) {
        // 如果有多个 content，找 text 类型的
        const textContent = data.content.find(c => c.type === 'text');
        return textContent?.text || data.content[0].thinking;
      }
    }
    
    // 兼容其他格式
    return data.response || data.message || data.text || JSON.stringify(data);
  }

  /**
   * OpenAI API
   */
  async callOpenAI(prompt, options = {}) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: [
          { role: 'system', content: '你是一只可爱的虚拟猫咪，用猫咪的视角回答问题。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  }

  /**
   * Ollama 本地模型
   */
  async callOllama(prompt, options = {}) {
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.ollamaModel,
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    return data.response || null;
  }

  /**
   * 自定义 API
   */
  async callCustom(prompt, options = {}) {
    if (!this.apiBaseUrl) return null;

    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : ''
      },
      body: JSON.stringify({
        prompt: prompt,
        model: options.model || this.model
      })
    });

    const data = await response.json();
    // 尝试多种响应格式
    return data.response || data.content || data.message || data.text || JSON.stringify(data);
  }

  /**
   * OpenClaw sessions_spawn
   */
  async callOpenClaw(prompt, options = {}) {
    try {
      const { sessions_spawn } = require('openclaw');
      
      const result = await sessions_spawn({
        task: prompt,
        model: options.model || 'qwen3.5-plus',
        mode: 'run',
        runtime: 'subagent',
        timeoutSeconds: options.timeout || 30
      });

      if (typeof result === 'string') return result;
      if (result?.content) return result.content;
      if (result?.message) return result.message;
      if (result?.messages?.[0]?.content) return result.messages[0].content;
      
      return JSON.stringify(result);
    } catch (error) {
      // OpenClaw 不可用
      return null;
    }
  }

  /**
   * 解析 JSON 响应
   */
  parseJson(content) {
    if (!content) return null;
    
    try {
      // 尝试直接解析
      return JSON.parse(content);
    } catch {
      // 尝试提取 JSON 块
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {}
      }
      
      // 尝试提取 { } 块
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          return JSON.parse(braceMatch[0]);
        } catch {}
      }
      
      return null;
    }
  }

  /**
   * 打印配置状态
   */
  printStatus() {
    console.log('\n🤖 LLM 配置状态:');
    console.log(`   Provider: ${this.provider}`);
    console.log(`   Model: ${this.model}`);
    console.log(`   Base URL: ${this.baseUrl || '默认'}`);
    console.log(`   API Key: ${this.apiKey ? this.apiKey.slice(0, 10) + '...' : '未配置'}`);
    console.log(`   状态: ${this.isAvailable() ? '✅ 可用' : '❌ 不可用'}`);
  }
}

module.exports = LLMAdapter;