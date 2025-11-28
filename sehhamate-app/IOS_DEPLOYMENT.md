# iOS Deployment Guide - Sehhamate Health Companion

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Enroll in the Apple Developer Program

2. **App Store Connect Access**
   - Create an app record in App Store Connect
   - Get your App Store Connect API key (optional, for automated submission)

## Build Process

### Step 1: Start the Build

Run the following command:
```bash
eas build --platform ios --profile production
```

### Step 2: Answer Prompts

When prompted, you'll need to answer:

1. **iOS app only uses standard/exempt encryption?**
   - Answer: **Y** (Yes)
   - Most apps use standard encryption (HTTPS, standard APIs)

2. **Generate a new iOS Distribution Certificate?**
   - Answer: **Y** (Yes) - if this is your first build
   - EAS will manage certificates automatically

3. **Generate a new Provisioning Profile?**
   - Answer: **Y** (Yes) - if this is your first build

### Step 3: Apple Credentials

If you haven't set up credentials yet, EAS will ask for:
- **Apple ID**: Your Apple Developer account email
- **App-Specific Password**: Generate at [appleid.apple.com](https://appleid.apple.com)
  - Go to Sign-In and Security → App-Specific Passwords
  - Create a new password for "Expo EAS"

### Step 4: Wait for Build

- Build time: 15-30 minutes
- You'll receive an email when complete
- Check status at: https://expo.dev

## Alternative: Use EAS Credentials Management

You can set up credentials first:

```bash
# Configure iOS credentials
eas credentials

# Then build
eas build --platform ios --profile production
```

## Build Profiles

### Production Build (App Store)
```bash
eas build --platform ios --profile production
```

### Preview Build (Ad-hoc/TestFlight)
```bash
eas build --platform ios --profile preview
```

## After Build Completes

### Option 1: Submit to App Store
```bash
eas submit --platform ios
```

### Option 2: Download IPA
1. Go to https://expo.dev
2. Navigate to your project → Builds
3. Download the IPA file
4. Install via TestFlight or ad-hoc distribution

## Troubleshooting

### Build Fails
- Check build logs: `eas build:list` then `eas build:view [BUILD_ID]`
- Verify bundle identifier in `app.json` matches your Apple Developer account
- Ensure Apple Developer account is active

### Certificate Issues
```bash
# Reset credentials
eas credentials

# Or let EAS manage automatically (recommended)
# Just answer Y when prompted during build
```

### App Store Connect Issues
- Verify app record exists in App Store Connect
- Check bundle identifier matches
- Ensure you have proper permissions

## Quick Start Command

```bash
# Start iOS production build
eas build --platform ios --profile production

# When prompted:
# 1. Encryption: Y
# 2. Generate certificate: Y (first time)
# 3. Generate provisioning profile: Y (first time)
# 4. Enter Apple ID and app-specific password
```

## Important Notes

⚠️ **Current Status**: EAS Build is experiencing partial outages for iOS builds (Pod installation issues). The build may take longer or fail. Check [status.expo.dev](https://status.expo.dev) for updates.

✅ **Recommended**: Wait for the outage to resolve, or try the build and monitor the logs.

---

**Need Help?**
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Apple Developer: https://developer.apple.com
- Expo Forums: https://forums.expo.dev

