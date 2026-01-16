@echo off
echo ========================================================
echo   VibeMatch - Emscripten SDK 自动安装脚本
echo   正在准备开发环境...
echo ========================================================

:: 1. 检查 Git 是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git！请先安装 Git: https://git-scm.com/download/win
    pause
    exit /b
)

:: 2. 检查 Python 是否安装
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python！请先安装 Python: https://www.python.org/downloads/
    pause
    exit /b
)

echo [1/4] 正在从 GitHub 克隆 emsdk 仓库...
if exist emsdk (
    echo 文件夹已存在，跳过克隆...
) else (
    git clone https://github.com/emscripten-core/emsdk.git
)

cd emsdk

echo [2/4] 正在拉取最新版本...
git pull

echo [3/4] 正在下载并安装最新版 SDK (这可能需要几分钟，取决于网速)...
call emsdk.bat install latest

echo [4/4] 正在激活 SDK...
call emsdk.bat activate latest

echo ========================================================
echo   安装完成！
echo   请注意：每次新打开终端窗口，你需要运行一次 emsdk_env.bat
echo   或者现在直接在当前窗口开始编译。
echo ========================================================
pause