@echo off
echo Starting CROP v2.0...
start "CROP Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 4 >nul
start "CROP Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm start"
