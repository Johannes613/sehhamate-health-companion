@echo off
echo.
echo ========================================
echo   Sehhamate - Starting Android Build
echo ========================================
echo.
echo This will build an Android APK for testing.
echo When prompted, type 'Y' to generate a keystore.
echo.
echo Press any key to start the build...
pause >nul
echo.
echo Starting build...
eas build --profile preview --platform android

