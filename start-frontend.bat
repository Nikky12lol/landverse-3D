@echo off
REM Start LANDVERSE 3D frontend (Windows)
cd /d "%~dp0frontend"
where npm.cmd >nul 2>nul
if %errorlevel%==0 (
  call npm.cmd install
  call npm.cmd run dev
) else (
  npm install
  npm run dev
)
