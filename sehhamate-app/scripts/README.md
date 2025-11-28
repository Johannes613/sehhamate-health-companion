# Firebase Mock Data Scripts

This directory contains scripts to create mock user data in Firebase for simulation and testing.

## Option 1: Manual Firebase Console (Easiest)

1. Run the simple script to get the JSON:
   ```bash
   node scripts/createMockUserSimple.js
   ```

2. Copy the JSON output

3. Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Firestore Database
   - Click "Start collection" or select "users" collection
   - Create a new document with ID: `mock_user_001`
   - Paste the JSON data or add fields manually

## Option 2: Using Firebase Admin SDK

If you have Firebase Admin SDK set up:

1. Create a service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-service-account.json` in the root directory

2. Install dependencies:
   ```bash
   npm install firebase-admin
   ```

3. Run the script:
   ```bash
   node scripts/createMockUser.js
   ```

## Option 3: Using Firebase CLI

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Use Firestore emulator or import data:
   ```bash
   firebase firestore:import --project your-project-id
   ```

## Mock User Details

The mock user includes:
- **Name**: Ahmed Al-Mansoori
- **Email**: ahmed.almansoori@example.com
- **Phone**: +971501234567
- **Diabetes Type**: Type 2
- **Allergies**: Peanuts (high), Dairy (medium), Shellfish (high)
- **Dietary Restrictions**: Vegetarian, Low Sodium
- **Complete Health Profile**: Nutrition profile and allergy profile generated
- **Profile Setup**: Completed

## Testing

After creating the mock user, you can:
1. Login with the email in the app
2. Test food scanning with allergen detection
3. Test medication scanning with interaction detection
4. View the complete health profile




