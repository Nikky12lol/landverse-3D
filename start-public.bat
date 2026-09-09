@echo off
REM LANDVERSE 3D — one-click public launch (Windows)
REM Starts Docker stack, then opens a free Cloudflare tunnel and prints the public URL.
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
echo Your hackathon link will appear below as https://....trycloudflare.com
"C:\Users\AKSHITH\AppData\Local\Temp\opencode\cloudflared.exe" tunnel --url http://localhost:5173
pause
