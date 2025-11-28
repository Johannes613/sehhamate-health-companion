@echo off
echo.
echo ========================================
echo   Sehhamate - iOS Build
echo ========================================
echo.
echo Starting iOS production build...
echo.
echo IMPORTANT: When prompted, answer:
echo   1. Encryption: Y (Yes)
echo   2. Generate certificate: Y (Yes) - first time only
echo   3. Enter your Apple ID and app-specific password
echo.
echo Press any key to start...
pause >nul
echo.
eas build --platform ios --profile production

