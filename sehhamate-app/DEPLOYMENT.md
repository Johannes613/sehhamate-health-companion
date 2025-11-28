# Sehhamate Health Companion - Deployment Guide

This guide will walk you through deploying the Sehhamate Health Companion mobile app using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
2. **Node.js**: Version 18 or higher
3. **EAS CLI**: Install globally with `npm install -g eas-cli`

## Initial Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Initialize EAS in your project

```bash
cd sehhamate-mobile-app
eas build:configure
```

This will create/update the `eas.json` configuration file.

## Building the App

### Development Build (for testing)

```bash
# Android APK
npm run build:preview

# Or using EAS directly
eas build --profile preview --platform android
```

### Production Build

#### Android

```bash
# Build Android APK
npm run build:android

# Or build AAB for Google Play Store
eas build --platform android --profile production
```

#### iOS

```bash
# Build iOS app
npm run build:ios

# Or using EAS directly
eas build --platform ios --profile production
```

#### Both Platforms

```bash
npm run build:all
```

## Deployment Options

### Option 1: Internal Distribution (Testing)

1. **Build for internal testing:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **Download and share:**
   - After build completes, download the APK/IPA
   - Share with testers via email or file sharing
   - Android: Install APK directly on devices
   - iOS: Use TestFlight or distribute via ad-hoc provisioning

### Option 2: Google Play Store (Android)

1. **Create a Google Play Console account** at [play.google.com/console](https://play.google.com/console)

2. **Build production AAB:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit to Play Store:**
   ```bash
   eas submit --platform android
   ```
   
   Or manually upload the AAB file from the Google Play Console.

### Option 3: Apple App Store (iOS)

1. **Create an Apple Developer account** at [developer.apple.com](https://developer.apple.com)

2. **Build production iOS app:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

## Over-The-Air (OTA) Updates

For quick updates without rebuilding, use EAS Update:

```bash
# Publish an update
npm run update

# Or manually
eas update --branch production --message "Your update message"
```

**Note**: OTA updates work for JavaScript changes only. Native code changes require a new build.

## Environment Variables

If you need to set environment variables for production builds, add them to `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-api.com"
      }
    }
  }
}
```

## Build Profiles Explained

- **development**: For development builds with dev client
- **preview**: For internal testing (APK/IPA files)
- **production**: For app store releases

## Troubleshooting

### Build Fails

1. Check build logs: `eas build:list` then `eas build:view [BUILD_ID]`
2. Verify app.json configuration
3. Ensure all dependencies are compatible
4. Check for missing assets (icons, splash screens)

### Android Build Issues

- Ensure `package` in app.json matches your bundle identifier
- Verify Android permissions are correctly configured
- Check if Google Play services are required

### iOS Build Issues

- Verify `bundleIdentifier` in app.json
- Ensure Apple Developer account is active
- Check provisioning profiles and certificates

## Quick Start Commands

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (first time only)
eas build:configure

# 4. Build Android APK for testing
eas build --profile preview --platform android

# 5. Build production Android
eas build --platform android --profile production

# 6. Submit to stores (after building)
eas submit --platform android
eas submit --platform ios
```

## Build Status

Check your build status:
```bash
eas build:list
```

View specific build details:
```bash
eas build:view [BUILD_ID]
```

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Forums](https://forums.expo.dev/)

## Support

For deployment issues, check:
1. Expo documentation
2. Build logs in Expo dashboard
3. GitHub issues for similar problems

---

**Last Updated**: January 2025
**App Version**: 1.0.0
**Expo SDK**: 54

