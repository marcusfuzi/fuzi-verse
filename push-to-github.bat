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
echo  Finished! Check your repo on GitHub:
echo  https://github.com/marcusfuzi/fuzi-verse
echo =======================================================
pause
