# Firebase Setup Guide

## Why the Login Error?

The error `Firebase: Error (auth/invalid-credential)` occurs because Firebase is not properly configured. The app needs Firebase credentials to work.

## Quick Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 2: Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → Project settings
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app (name it "Sehhamate Mobile App")
5. Copy the config values

### Step 3: Create .env File

Create a `.env` file in the `new-react-native-app` directory:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and add your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Enable other providers you want to use

### Step 5: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location close to your users

### Step 6: Restart the App

After creating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## Testing Login

After setup, you can:

1. **Create a test user:**
   - Use the Sign Up screen in the app
   - Or create one in Firebase Console → Authentication → Users

2. **Use admin credentials (if configured):**
   - Email: `admin@sehhamate.app`
   - Password: `admin123`
   - (You need to create this user in Firebase Console first)

## Troubleshooting

### Error: "Firebase configuration is incomplete"
- Check that `.env` file exists
- Verify all environment variables are set
- Restart the Expo server after creating `.env`

### Error: "auth/invalid-credential"
- Firebase is not initialized (missing config)
- Check console logs for "Firebase Config Check"
- Verify your Firebase project is active

### Error: "auth/user-not-found"
- The user account doesn't exist
- Create the user via Sign Up or Firebase Console

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)



