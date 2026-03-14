/**
 * 记忆管理器
 * Memory Manager - 对应 OpenClaw 的持久化记忆能力
 *
 * 对应关系:
 *   conversation-{userId}.json  ←→  OpenClaw 持久化对话历史
 *   {catId}-diary-{date}.md     ←→  OpenClaw memory/YYYY-MM-DD.md
 *   todo.md                     ←→  OpenClaw cron + todo.md 任务清单
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ─────────────────────────────────────────────
// 1. 对话历史持久化
// ─────────────────────────────────────────────

function historyPath(userId) {
  return path.join(DATA_DIR, `conversation-${userId}.json`);
}

function loadHistory(userId) {
  ensureDataDir();
  const p = historyPath(userId);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return [];
  }
}

function saveHistory(userId, history) {
  ensureDataDir();
  // 只保留最近 40 条，防止文件无限增长
  const trimmed = history.slice(-40);
  fs.writeFileSync(historyPath(userId), JSON.stringify(trimmed, null, 2));
}

// ─────────────────────────────────────────────
// 2. 游戏日记（对应 OpenClaw memory/YYYY-MM-DD.md）
// ─────────────────────────────────────────────

function diaryPath(catId) {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(DATA_DIR, `${catId}-diary-${today}.md`);
}

function appendDiary(catId, entry) {
  ensureDataDir();
  const p = diaryPath(catId);
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });

  if (!fs.existsSync(p)) {
    const header = `# 猫咪日记\n**日期**: ${new Date().toLocaleDateString('zh-CN')}\n\n`;
    fs.writeFileSync(p, header);
  }

  fs.appendFileSync(p, `[${ts}] ${entry}\n`);
}

function readTodayDiary(catId) {
  ensureDataDir();
  const p = diaryPath(catId);
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf-8');
}

// ─────────────────────────────────────────────
// 3. todo.md 定时任务（对应 OpenClaw cron + todo.md）
//
// 格式:
//   - [ ] HH:MM 喂食
//   - [x] HH:MM 检查状态
// ─────────────────────────────────────────────

function todoPath() {
  return path.join(DATA_DIR, 'todo.md');
}

function readTodo() {
  ensureDataDir();
  const p = todoPath();
  if (!fs.existsSync(p)) return { pending: [], completed: [] };

  const content = fs.readFileSync(p, 'utf-8');
  const pending = [];
  const completed = [];

  for (const line of content.split('\n')) {
    const pendingMatch = line.match(/^- \[ \] (\d{2}:\d{2}) (.+)$/);
    const doneMatch    = line.match(/^- \[x\] (\d{2}:\d{2}) (.+)$/);
    if (pendingMatch) pending.push({ time: pendingMatch[1], task: pendingMatch[2].trim() });
    else if (doneMatch) completed.push({ time: doneMatch[1], task: doneMatch[2].trim() });
  }

  return { pending, completed };
}

function writeTodo(pending, completed) {
  ensureDataDir();
  const lines = [
    `# 猫咪定时任务`,
    `**更新**: ${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 待执行',
    ...pending.map(t => `- [ ] ${t.time} ${t.task}`),
    '',
    '## 已完成',
    ...completed.map(t => `- [x] ${t.time} ${t.task}`)
  ];
  fs.writeFileSync(todoPath(), lines.join('\n'));
}

/**
 * 添加一条定时任务
 * @param {string} time  - "HH:MM" 格式
 * @param {string} task  - 任务描述
 */
function addTodoTask(time, task) {
  const { pending, completed } = readTodo();
  // 去重
  if (pending.some(t => t.time === time && t.task === task)) return;
  pending.push({ time, task });
  pending.sort((a, b) => a.time.localeCompare(b.time));
  writeTodo(pending, completed);
}

/**
 * 标记任务完成
 * @param {string} taskStr - 任务描述（或部分匹配）
 */
function markTodoDone(taskStr) {
  const { pending, completed } = readTodo();
  const idx = pending.findIndex(t => t.task.includes(taskStr));
  if (idx < 0) return false;
  const done = pending.splice(idx, 1)[0];
  completed.push(done);
  writeTodo(pending, completed);
  return true;
}

/**
 * 获取当前到期的任务（时间 <= 当前时间，且是今天写入的）
 */
function getDueTasks() {
  const { pending } = readTodo();
  const now = new Date();
  const cur = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = now.toLocaleDateString('zh-CN');

  // 检查 todo.md 文件的修改日期，过期文件（非今天）不触发任务
  const p = todoPath();
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    const fileDate = new Date(stat.mtime).toLocaleDateString('zh-CN');
    if (fileDate !== today) return [];
  }

  return pending.filter(t => t.time <= cur);
}

/**
 * 清除过去日期的已完成任务（保持文件整洁）
 */
function pruneCompleted(keepLast = 20) {
  const { pending, completed } = readTodo();
  writeTodo(pending, completed.slice(-keepLast));
}

module.exports = {
  // 对话历史
  loadHistory,
  saveHistory,
  // 日记
  appendDiary,
  readTodayDiary,
  // todo 任务
  readTodo,
  writeTodo,
  addTodoTask,
  markTodoDone,
  getDueTasks,
  pruneCompleted
};
