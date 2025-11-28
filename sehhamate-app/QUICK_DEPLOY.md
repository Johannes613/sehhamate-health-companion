# Quick Deployment Guide - Sehhamate Health Companion

## 🚀 Quick Start (3 Steps)

### Step 1: Initialize EAS Project
```bash
cd sehhamate-mobile-app
eas init
```
When prompted, type `Y` to create the project.

### Step 2: Build the App

**For Android (Testing/Preview):**
```bash
npm run build:preview
```
This creates an APK file you can install directly on Android devices.

**For Android (Production):**
```bash
npm run build:android
```

**For iOS (Production):**
```bash
npm run build:ios
```

**For Both Platforms:**
```bash
npm run build:all
```

### Step 3: Download & Install

After the build completes:
1. Visit https://expo.dev and log in
2. Go to your project → Builds
3. Download the APK (Android) or IPA (iOS)
4. Install on your device

---

## 📱 Alternative: Use Deployment Scripts

**Windows:**
```bash
.\deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🎯 Recommended First Build

For testing, start with a preview build:
```bash
eas build --profile preview --platform android
```

This will:
- ✅ Build an APK file (easy to install)
- ✅ Take ~10-15 minutes
- ✅ Be ready for internal testing
- ✅ Not require app store accounts

---

## 📋 What Happens During Build

1. **EAS uploads your code** to Expo's servers
2. **Builds native app** in the cloud
3. **Generates installable file** (APK/IPA)
4. **Sends notification** when complete

---

## 🔗 Useful Commands

```bash
# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]

# Cancel a build
eas build:cancel [BUILD_ID]

# Update app without rebuilding (JavaScript only)
npm run update
```

---

## ⚠️ Important Notes

- **First build** may take 15-20 minutes
- **Subsequent builds** are faster (5-10 minutes)
- **Free Expo account** includes limited builds per month
- **Production builds** may require app store accounts

---

## 🆘 Need Help?

1. Check build logs: `eas build:list`
2. View documentation: `DEPLOYMENT.md`
3. Expo dashboard: https://expo.dev

---

**Ready to deploy?** Run `eas init` and follow the prompts!

