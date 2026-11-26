@echo off
chcp 65001 >nul
title Tìm Bubu ^& Dudu
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [Lỗi] Chưa cài Node.js. Tải tại https://nodejs.org rồi chạy lại file này.
  pause
  exit /b 1
)

echo [1/3] Chép ảnh Bubu / Dudu...
node scripts\gen-manifest.mjs
if errorlevel 1 (
  pause
  exit /b 1
)

echo [2/3] Khởi động máy chủ socket cho chế độ online...
if not exist "server\node_modules" (
  echo       Lần đầu chạy: đang cài đặt, vui lòng chờ một chút...
  pushd server
  call npm install
  popd
)
start "Tìm Gấu - Socket server" /d "%~dp0server" cmd /k npm run dev

echo [3/3] Khởi động web game...
start "Tìm Gấu - Web" /d "%~dp0" cmd /k npx --yes serve public -l 3000

timeout /t 4 /nobreak >nul
start "" http://localhost:3000

echo.
echo Game đang chạy tại http://localhost:3000
echo Muốn tắt game: đóng 2 cửa sổ "Tìm Gấu - Web" và "Tìm Gấu - Socket server".
echo.
timeout /t 8 >nul
