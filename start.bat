@echo off
chcp 65001 >nul
title 🐱 猫咪模拟器 - Cat Pet Simulator

echo.
echo ══════════════════════════════════════════════════
echo   🐱 猫咪模拟器 - Cat Pet Simulator
echo   连接 cat-pet 与 Star-Office 可视化
echo ══════════════════════════════════════════════════
echo.
echo   功能:
echo   - 状态可视化 (实时同步)
echo   - 手动互动 (喂食/玩耍/洗澡/睡觉/摸摸)
echo   - 状态衰减 (每小时自动下降)
echo   - 自主行为 (智能决策)
echo.
echo ══════════════════════════════════════════════════
echo.

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Python，请先安装 Python 3.10+
    pause
    exit /b 1
)

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 检查 Flask
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo 📦 安装 Python 依赖...
    pip install flask pillow -q
)

:: 准备状态文件
if not exist "Star-Office-UI-master\state.json" (
    copy "Star-Office-UI-master\state.sample.json" "Star-Office-UI-master\state.json" >nul
)

echo 🚀 启动 Star-Office 后端...
cd Star-Office-UI-master\backend
start "Star-Office Backend" python app.py
cd ..\..

:: 等待后端启动
echo ⏳ 等待后端启动...
timeout /t 3 /nobreak >nul

:: 检查后端是否启动
curl -s http://127.0.0.1:19000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Star-Office 后端启动失败
    echo    请检查端口 19000 是否被占用
    pause
    exit /b 1
)
echo ✅ Star-Office 后端已启动

echo.
echo 🚀 启动猫咪模拟器...
echo.
echo ══════════════════════════════════════════════════
echo   🌐 打开浏览器访问: http://127.0.0.1:19000
echo   按 Ctrl+C 停止模拟器
echo.
echo   可用命令:
echo   - node index.js status   查看状态
echo   - node index.js feed     喂食
echo   - node index.js play     玩耍
echo ══════════════════════════════════════════════════
echo.

:: 启动模拟器 (Agent 模式：支持自然语言交互 + 后台状态同步)
cd simulator
node index.js --agent

:: 清理
cd ..
echo.
echo 👋 模拟器已停止