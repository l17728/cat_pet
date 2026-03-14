#!/bin/bash

echo ""
echo "══════════════════════════════════════════════════"
echo "  🐱 猫咪模拟器 - Cat Pet Simulator"
echo "  连接 cat-pet 与 Star-Office 可视化"
echo "══════════════════════════════════════════════════"
echo ""
echo "  功能:"
echo "  - 状态可视化 (实时同步)"
echo "  - 手动互动 (喂食/玩耍/洗澡/睡觉/摸摸)"
echo "  - 状态衰减 (每小时自动下降)"
echo "  - 自主行为 (智能决策)"
echo ""
echo "══════════════════════════════════════════════════"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python，请先安装 Python 3.10+"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 Flask
if ! python3 -c "import flask" &> /dev/null; then
    echo "📦 安装 Python 依赖..."
    pip3 install flask pillow -q
fi

# 准备状态文件
if [ ! -f "Star-Office-UI-master/state.json" ]; then
    cp "Star-Office-UI-master/state.sample.json" "Star-Office-UI-master/state.json"
fi

echo "🚀 启动 Star-Office 后端..."
cd Star-Office-UI-master/backend
python3 app.py &
BACKEND_PID=$!
cd ../..

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 3

# 检查后端是否启动
if ! curl -s http://127.0.0.1:19000/health > /dev/null; then
    echo "❌ Star-Office 后端启动失败"
    echo "   请检查端口 19000 是否被占用"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo "✅ Star-Office 后端已启动"

echo ""
echo "🚀 启动猫咪模拟器..."
echo ""
echo "══════════════════════════════════════════════════"
echo "  🌐 打开浏览器访问: http://127.0.0.1:19000"
echo "  按 Ctrl+C 停止模拟器"
echo ""
echo "  可用命令:"
echo "  - node index.js status   查看状态"
echo "  - node index.js feed     喂食"
echo "  - node index.js play     玩耍"
echo "══════════════════════════════════════════════════"
echo ""

# 信号处理
trap "echo ''; echo '👋 正在停止...'; kill $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# 启动模拟器 (Agent 模式：支持自然语言交互 + 后台状态同步)
cd simulator
node index.js --agent

# 清理
cd ..
kill $BACKEND_PID 2>/dev/null
echo ""
echo "👋 模拟器已停止"