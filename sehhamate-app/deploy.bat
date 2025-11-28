@echo off
REM Sehhamate Health Companion - Deployment Script (Windows)
REM This script helps deploy the app using EAS Build

echo.
echo 🚀 Sehhamate Health Companion - Deployment Script
echo ==================================================
echo.

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ EAS CLI is not installed. Installing...
    npm install -g eas-cli
)

REM Check if logged in
echo 📋 Checking Expo account...
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Expo. Please run: eas login
    exit /b 1
)

for /f "tokens=*" %%i in ('eas whoami') do set EXPO_USER=%%i
echo ✅ Logged in as: %EXPO_USER%
echo.

REM Initialize project if needed
if not exist ".eas\project.json" (
    echo 🔧 Initializing EAS project...
    eas init
)

echo.
echo 📦 Build Options:
echo 1. Preview Build (Android APK for testing)
echo 2. Production Build (Android)
echo 3. Production Build (iOS)
echo 4. Production Build (Both platforms)
echo.
set /p choice="Select build option (1-4): "

if "%choice%"=="1" (
    echo 🔨 Building Android Preview APK...
    eas build --profile preview --platform android
) else if "%choice%"=="2" (
    echo 🔨 Building Android Production APK...
    eas build --platform android --profile production
) else if "%choice%"=="3" (
    echo 🔨 Building iOS Production...
    eas build --platform ios --profile production
) else if "%choice%"=="4" (
    echo 🔨 Building for both platforms...
    eas build --platform all --profile production
) else (
    echo ❌ Invalid option
    exit /b 1
)

echo.
echo ✅ Build started! Check progress at: https://expo.dev
echo 📱 You'll receive a notification when the build is complete.

