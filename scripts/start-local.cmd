@echo off
setlocal
cd /d "%~dp0.."
node scripts\open-local.mjs
if errorlevel 1 pause
endlocal
