@echo off
title FUZI VERSE Launcher
cls
cd /d "%~dp0"
echo =======================================================
echo          FUZI VERSE - Music Creator Platform
echo =======================================================
echo.
echo Starting FUZI VERSE in background (no terminal)...
start "" wscript.exe "%~dp0run-fuziverse-silent.vbs"
echo.
echo  [OK] Servers started in the background!
echo  - Browser URL: http://localhost:5174
echo  - Backend API: http://localhost:5050
echo.
echo  To STOP the servers anytime, double-click "stop-fuziverse.bat"
echo =======================================================
ping 127.0.0.1 -n 3 >nul
exit
