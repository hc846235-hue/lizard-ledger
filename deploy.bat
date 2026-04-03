@echo off
REM Lizard Ledger 自动部署脚本
REM 同步到 CloudBase 和 GitHub

echo ========================================
echo   Lizard Ledger 自动部署工具
echo ========================================
echo.

REM 检查是否在项目根目录
if not exist "package.json" (
    echo 错误: 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [1/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo 依赖安装失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 构建生产版本...
call npm run build
if errorlevel 1 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 部署到 CloudBase...
echo 正在上传到 CloudBase 静态托管...
REM 注意: CloudBase 部署需要使用 MCP 工具，这里提示用户
echo 请在 WorkBuddy 中执行部署到 CloudBase
echo.

echo [4/4] 提交到 GitHub...
git add .
git commit -m "Auto deploy: update production build"
git push origin main

if errorlevel 1 (
    echo Git 提交失败！请检查是否有未提交的更改或网络连接
    pause
    exit /b 1
)

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo GitHub Pages: https://hc846235-hue.github.io/lizard-ledger/
echo CloudBase: https://mm223-7gozbhmt7b381a50-1302094821.tcloudbaseapp.com/lizard-ledger/
echo.
echo GitHub Actions 将自动构建并部署到 GitHub Pages
echo CloudBase 需要手动上传 dist 目录
echo.
pause
