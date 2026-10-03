@echo off
REM start_all.bat - One-click start for Windows (calls `start.ps1`)
REM Usage: double-click this file or run from cmd: start_all.bat [recreate]
REM Pass "recreate" to recreate the Python virtual environment before starting.

SETLOCAL
pushd "%~dp0"
echo.
echo Starting Crime Tracking System from "%~dp0"
if "%1"=="recreate" (
    echo Recreating Python virtual environment and launching...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" -RecreateVenv
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
)
popd
ENDLOCAL

echo.
echo Press any key to close this window when the processes stop.
pause >nul
