@echo off
title FUZI VERSE - Allow Firewall Ports
:: Check for administrative permissions
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :gotAdmin
) else (
    echo Requesting Administrator privileges to open ports 5174 and 5050...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

:gotAdmin
echo ========================================================
echo   FUZI VERSE - Adding Windows Firewall Inbound Rules
echo ========================================================
echo.
netsh advfirewall firewall delete rule name="FUZI VERSE Web 5174" >nul 2>&1
netsh advfirewall firewall delete rule name="FUZI VERSE API 5050" >nul 2>&1

netsh advfirewall firewall add rule name="FUZI VERSE Web 5174" dir=in action=allow protocol=TCP localport=5174
netsh advfirewall firewall add rule name="FUZI VERSE API 5050" dir=in action=allow protocol=TCP localport=5050

echo.
echo [OK] Ports 5174 (Web) and 5050 (API) are now allowed through Windows Firewall!
echo Your phone on the same Wi-Fi can now connect without being blocked.
echo.
pause
