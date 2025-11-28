#!/bin/bash

# Sehhamate Health Companion - Deployment Script
# This script helps deploy the app using EAS Build

echo "🚀 Sehhamate Health Companion - Deployment Script"
echo "=================================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed. Installing..."
    npm install -g eas-cli
fi

# Check if logged in
echo "📋 Checking Expo account..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Initialize project if needed
if [ ! -f ".eas/project.json" ]; then
    echo "🔧 Initializing EAS project..."
    eas init
fi

echo ""
echo "📦 Build Options:"
echo "1. Preview Build (Android APK for testing)"
echo "2. Production Build (Android)"
echo "3. Production Build (iOS)"
echo "4. Production Build (Both platforms)"
echo ""
read -p "Select build option (1-4): " choice

case $choice in
    1)
        echo "🔨 Building Android Preview APK..."
        eas build --profile preview --platform android
        ;;
    2)
        echo "🔨 Building Android Production APK..."
        eas build --platform android --profile production
        ;;
    3)
        echo "🔨 Building iOS Production..."
        eas build --platform ios --profile production
        ;;
    4)
        echo "🔨 Building for both platforms..."
        eas build --platform all --profile production
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Build started! Check progress at: https://expo.dev"
echo "📱 You'll receive a notification when the build is complete."

