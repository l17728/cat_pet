#!/usr/bin/env bash
# 一键启动：Star-Office 后端 + 猫咪模拟器
# 用法: bash start.sh [--llm openai|anthropic|ollama]
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$ROOT_DIR/Star-Office-UI-master"
SIM_DIR="$ROOT_DIR/simulator"

# 解析 --llm 参数
LLM_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --llm) LLM_ARG="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# 加载 .env（如果存在）
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

# ── 启动 Flask 后端 ──────────────────────────────────────────────
echo "🖥️  启动 Star-Office 后端 (port 19000)..."
# Windows venv: Scripts/python.exe；Unix venv: bin/python
if [[ -f "$UI_DIR/.venv/Scripts/python.exe" ]]; then
  PYTHON="$UI_DIR/.venv/Scripts/python.exe"
elif [[ -f "$UI_DIR/.venv/bin/python" ]]; then
  PYTHON="$UI_DIR/.venv/bin/python"
elif command -v python3 &>/dev/null; then
  PYTHON="python3"
else
  PYTHON="python"
fi
echo "   Python: $PYTHON"

cd "$UI_DIR"
"$PYTHON" backend/app.py &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"

# 等待后端就绪（最多 10 秒）
echo "   等待后端就绪..."
BACKEND_READY=0
for i in $(seq 1 20); do
  if curl -sf http://localhost:19000/status >/dev/null 2>&1; then
    echo "   ✅ 后端已就绪"
    BACKEND_READY=1
    break
  fi
  sleep 0.5
done

if [[ $BACKEND_READY -eq 0 ]]; then
  echo "   ❌ 后端启动失败，请检查 Python 环境或端口 19000 是否被占用"
  kill "$BACKEND_PID" 2>/dev/null || true
  exit 1
fi

# ── 启动模拟器 ───────────────────────────────────────────────────
echo "🐱 启动猫咪模拟器 (agent 模式)..."
cd "$ROOT_DIR"
if [[ -n "$LLM_ARG" ]]; then
  node "$SIM_DIR/index.js" --agent --llm "$LLM_ARG" &
else
  node "$SIM_DIR/index.js" --agent &
fi
SIM_PID=$!
echo "   模拟器 PID: $SIM_PID"

echo ""
echo "✅ 全部启动完成"
echo "   UI:         http://localhost:19000"
echo "   后端 PID:   $BACKEND_PID"
echo "   模拟器 PID: $SIM_PID"
echo ""
echo "按 Ctrl+C 停止所有进程"

# 捕获退出信号，一并杀掉子进程
cleanup() {
  echo ""
  echo "🛑 正在停止..."
  kill "$BACKEND_PID" "$SIM_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$SIM_PID" 2>/dev/null || true
  echo "👋 已停止"
}
trap cleanup INT TERM

wait
