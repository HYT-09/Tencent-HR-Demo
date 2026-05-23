@echo off
echo 🚀 启动腾讯校招求职平台...

echo 📦 启动后端服务...
start /b "后端服务" cmd /c "cd /d %~dp0server && node src/index.js"

timeout /t 2 /nobreak >nul

echo 🎨 启动前端服务...
start /b "前端服务" cmd /c "cd /d %~dp0client && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ✅ 服务已启动！
echo    后端API: http://localhost:3001
echo    前端页面: http://localhost:5173
echo.
echo 用户端: http://localhost:5173
echo HR端:   http://localhost:5173/hr/login
echo 管理端: http://localhost:5173/admin
echo.
echo 关闭此窗口可停止所有服务

pause
