@echo off
title Stop FUZI VERSE Servers
cls
echo =======================================================
echo          Stopping FUZI VERSE Background Servers
echo =======================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports = 5050, 5174; foreach ($p in $ports) { Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { $procId = $_.OwningProcess; Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process ' + $procId + ' on port ' + $p) } }"
taskkill /F /IM cloudflared.exe >nul 2>&1
echo.
echo =======================================================
echo  [OK] FUZI VERSE background processes stopped cleanly.
echo =======================================================
ping 127.0.0.1 -n 2 >nul
exit
