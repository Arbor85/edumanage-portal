@echo off
setlocal

REM Run from the backend folder regardless of where the script is called
cd /d "%~dp0"

if not exist .venv\Scripts\activate.bat (
  echo Creating virtual environment...
  python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Starting FastAPI server...
uvicorn app.main:app --reload

endlocal
