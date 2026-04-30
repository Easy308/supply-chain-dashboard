@echo off
chcp 65001 >nul
title 产业带智能看板 - 线上版
cd /d "%~dp0"

echo ========================================
echo   产业带智能看板 线上版
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js
    echo 请先安装 Node.js 18+ : https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [首次运行] 正在安装依赖...
    call npm install --omit=dev
    if errorlevel 1 (
        echo [错误] npm install 失败
        pause
        exit /b 1
    )
)

echo [启动中] 服务端口 8080
echo 本机访问: http://localhost:8080
echo 局域网访问: http://本机IP:8080
echo 默认账号: admin / admin123
echo.
echo 关闭此窗口即停止服务
echo ========================================
echo.

node server.js
pause
