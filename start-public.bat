@echo off
REM LANDVERSE 3D — one-click public launch (Windows)
REM Starts the Docker stack, waits for the API, then opens a public ngrok
REM tunnel. Your hackathon link appears below. KEEP THIS WINDOW OPEN.
REM (First run: ngrok needs your authtoken once via: ngrok.exe config add-authtoken TOKEN)
cd /d "%~dp0"
set PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%

echo [1/3] Starting Docker stack...
docker compose up -d
if errorlevel 1 (
  echo Docker is not running. Start Docker Desktop first, then re-run this file.
  pause
  exit /b 1
)

echo [2/3] Waiting for API...
:wait
curl.exe -s -o NUL http://localhost:8000/health
if errorlevel 1 (
  timeout /t 3 /nobreak >nul
  goto wait
)
echo API is healthy.

echo [3/3] Opening public tunnel (keep this window open!)...
echo Your hackathon link will appear below as https://....ngrok-free.dev
ngrok.exe http 5173
pause
