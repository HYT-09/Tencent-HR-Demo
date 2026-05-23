#!/bin/bash
# 腾讯校招求职平台 - 启动脚本

echo "🚀 启动腾讯校招求职平台..."

# 启动后端
echo "📦 启动后端服务..."
cd server
node src/index.js &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
echo "🎨 启动前端服务..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动！"
echo "   后端API: http://localhost:3001"
echo "   前端页面: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
