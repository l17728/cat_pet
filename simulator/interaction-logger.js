/**
 * LLM 交互日志记录器
 * 将每次 LLM 请求和响应写入按日期组织的 Markdown 文件
 */

const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function logPath() {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(DATA_DIR, `llm-interactions-${today}.md`);
}

function log(context, request, rawResponse) {
  ensureDataDir();
  const p = logPath();
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });

  if (!fs.existsSync(p)) {
    const date = new Date().toLocaleDateString('zh-CN');
    fs.writeFileSync(p, `# LLM 交互日志\n**日期**: ${date}\n\n`);
  }

  const requestStr = typeof request === 'string'
    ? request
    : JSON.stringify(request, null, 2);

  const block = [
    `## [${ts}] ${context}`,
    '',
    '### 发送',
    '```',
    requestStr,
    '```',
    '',
    '### 接收',
    '```',
    rawResponse ?? '(无响应)',
    '```',
    '',
    '---',
    ''
  ].join('\n');

  fs.appendFileSync(p, block);
}

module.exports = { log, logPath };
