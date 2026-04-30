#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "========================================"
echo "  产业带智能看板 · 线上版"
echo "========================================"

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未检测到 Node.js"
  echo "请先安装 Node.js 18+ : https://nodejs.org/"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "[警告] Node.js 版本过低 ($(node -v))，建议升级到 18+"
fi

if [ ! -d "node_modules" ]; then
  echo "[首次运行] 正在安装依赖..."
  npm install --omit=dev
fi

echo ""
echo "[启动中] 端口 ${PORT:-8080}"
echo "本机访问 : http://localhost:${PORT:-8080}"
echo "默认账号 : admin / admin123"
echo "Ctrl+C 停止服务"
echo "========================================"
echo ""

exec node server.js
