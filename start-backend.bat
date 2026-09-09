@echo off
REM Start LANDVERSE 3D backend (Windows)
cd /d "%~dp0backend"
if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
echo Starting FastAPI on http://localhost:8000 ...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
