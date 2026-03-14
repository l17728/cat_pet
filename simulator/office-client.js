/**
 * Star-Office API 客户端
 * HTTP client for Star-Office backend
 */

const http = require('http');
const https = require('https');

class OfficeClient {
  constructor(baseUrl = 'http://127.0.0.1:19000') {
    this.baseUrl = baseUrl;
    this.timeout = 5000;
  }

  /**
   * 发送 HTTP 请求
   * @private
   */
  _request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = httpModule.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ ok: true, status: res.statusCode, data: response });
            } else {
              resolve({ ok: false, status: res.statusCode, error: response });
            }
          } catch (e) {
            resolve({ ok: false, status: res.statusCode, error: body });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  /**
   * 健康检查
   */
  async health() {
    return this._request('GET', '/health');
  }

  /**
   * 获取当前状态
   */
  async getStatus() {
    return this._request('GET', '/status');
  }

  /**
   * 设置状态
   * @param {string} state - 状态值 (idle/writing/researching/executing/syncing/error)
   * @param {string} detail - 详细描述
   * @param {object} cat - 猫咪状态数据 (可选)
   */
  async setState(state, detail = '', cat = null) {
    const data = { state, detail };
    if (cat) {
      data.cat = cat;
    }
    return this._request('POST', '/set_state', data);
  }

  /**
   * 加入办公室 (作为访客 Agent)
   * @param {object} options - { joinKey, agentName }
   */
  async join(options) {
    return this._request('POST', '/join-agent', {
      join_key: options.joinKey,
      agent_name: options.agentName
    });
  }

  /**
   * 推送状态 (访客模式)
   * @param {string} agentId - Agent ID
   * @param {string} state - 状态
   * @param {string} detail - 详情
   */
  async push(agentId, state, detail = '') {
    return this._request('POST', '/agent-push', {
      agent_id: agentId,
      state: state,
      detail: detail
    });
  }

  /**
   * 离开办公室
   * @param {string} agentId - Agent ID
   */
  async leave(agentId) {
    return this._request('POST', '/leave-agent', {
      agent_id: agentId
    });
  }

  /**
   * 获取所有 Agent 列表
   */
  async getAgents() {
    return this._request('GET', '/agents');
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      const result = await this.health();
      return result.ok;
    } catch {
      return false;
    }
  }
}

module.exports = OfficeClient;