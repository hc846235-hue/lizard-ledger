@echo off
REM 便捷提交脚本 - 自动添加、提交并推送

echo ========================================
echo 📝 快速提交到 GitHub
echo ========================================
echo.

REM 显示当前状态
echo 📊 当前 Git 状态:
git status --short
echo.

REM 询问提交信息
set /p message="请输入提交信息 (按回车使用默认信息): "

if "%message%"=="" (
    set message=Update files
)

echo.
echo 🔨 正在提交...
echo.

REM 添加所有修改
git add .

REM 提交
git commit -m "%message%"

REM 推送
echo.
echo 🚀 正在推送到 GitHub...
git push

echo.
echo ========================================
echo ✅ 完成!
echo ========================================
pause
