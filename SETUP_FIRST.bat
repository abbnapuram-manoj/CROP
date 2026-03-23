@echo off
echo ====================================
echo  CROP v2.0 - First Time Setup
echo ====================================
echo.
echo [1/3] Installing Python packages...
cd /d %~dp0ml
pip install -r requirements.txt
echo.
echo [2/3] Training ML Model...
python train_model.py
echo.
echo [3/3] Installing backend packages...
cd /d %~dp0backend
npm install
echo.
echo ====================================
echo  Setup Complete! Now run START.bat
echo ====================================
pause
