@echo off
title Push FUZI VERSE to GitHub
cls
echo =======================================================
echo          Pushing FUZI VERSE to GitHub
echo =======================================================
echo.
cd /d "D:\fuzi verse"
"%USERPROFILE%\MinGit\cmd\git.exe" config --global --add safe.directory "D:/fuzi verse"
"%USERPROFILE%\MinGit\cmd\git.exe" push -u origin main
echo.
echo =======================================================
echo  If it says 'Everything up-to-date' or 'Branch main', 
echo  it is uploaded successfully!
echo =======================================================
pause
