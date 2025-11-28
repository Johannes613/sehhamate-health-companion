/**
 * Script to register mock user using Firebase Admin SDK
 * This creates both Authentication user and Firestore document
 * 
 * Prerequisites:
 * 1. Install: npm install firebase-admin
 * 2. Get service account key from Firebase Console
 * 3. Save as firebase-service-account.json in root directory
 * 
 * Usage: node scripts/registerMockUserAdmin.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: firebase-service-account.json not found!');
  console.log('\n📋 To get service account key:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save as firebase-service-account.json in the root directory');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Mock user credentials
const mockUserCredentials = {
  email: 'ahmed.almansoori@example.com',
  password: 'Test123!@#',
  name: 'Ahmed Al-Mansoori',
  phoneNumber: '+971501234567',
};

// Mock user data for Firestore
const mockUserData = {
  name: mockUserCredentials.name,
  email: mockUserCredentials.email,
  phoneNumber: mockUserCredentials.phoneNumber,
  diabetesType: 'Type 2',
  allergies: [
    { id: 'peanuts', label: 'Peanuts', severity: 'high', type: 'common' },
    { id: 'dairy', label: 'Dairy', severity: 'medium', type: 'common' },
    { id: 'shellfish', label: 'Shellfish', severity: 'high', type: 'common' },
  ],
  dietaryRestrictions: ['Vegetarian', 'Low Sodium'],
  dietaryPreferences: ['vegetarian', 'pescatarian'], // Valid options: 'none', 'vegetarian', 'vegan', 'pescatarian'
  age: '35',
  weight: '78',
  height: '175',
  gender: 'male',
  activityLevel: 'moderately_active',
  nutritionProfile: {
    calories: 2450,
    bmr: 1850,
    tdee: 2450,
    macronutrients: { protein: 184, carbohydrates: 245, fat: 82 },
    micronutrients: { fiber: 30, addedSugarLimit: 15, sodiumLimit: 2000 },
    mealTiming: {
      breakfast: 'Within 1-2 hours of waking',
      lunch: '4-5 hours after breakfast',
      dinner: '3-4 hours after lunch, at least 2-3 hours before bed',
      snacks: '1-2 small snacks between meals if needed',
    },
    foodGroups: {
      vegetables: '3-5 servings/day (non-starchy)',
      fruits: '2-3 servings/day (whole fruits)',
      grains: '4-6 servings/day (whole grains preferred)',
      protein: '2-3 servings/day (lean meats, fish, legumes)',
      dairy: '2-3 servings/day (low-fat options)',
      fats: 'Healthy fats in moderation',
    },
    specialConsiderations: [
      'Monitor carbohydrate intake closely and distribute evenly throughout the day.',
      'Regular blood glucose monitoring is crucial.',
      'Ensure adequate intake of plant-based protein.',
    ],
    profileGeneratedAt: new Date().toISOString(),
  },
  allergyProfile: {
    userAllergies: [
      { id: 'peanuts', label: 'Peanuts', severity: 'high', type: 'common' },
      { id: 'dairy', label: 'Dairy', severity: 'medium', type: 'common' },
      { id: 'shellfish', label: 'Shellfish', severity: 'high', type: 'common' },
    ],
    riskAssessment: {
      overallRiskLevel: 'high',
      highRiskAllergies: ['Peanuts', 'Shellfish'],
      moderateRiskAllergies: ['Dairy'],
      lowRiskAllergies: [],
    },
    crossReactivity: [
      'Lupin, tree nuts (less common)',
      'Goat milk, sheep milk',
      'Other crustaceans and mollusks',
    ],
    hiddenAllergenSources: [
      'Baked goods, candy, sauces, vegetarian meat substitutes.',
      'Lactose, casein, whey, ghee, chocolate, deli meats.',
      'Fish stock, surimi, some Asian sauces.',
    ],
    safeAlternatives: [
      'Sunflower seed butter, soy butter, tahini.',
      'Almond milk, soy milk, oat milk, coconut milk.',
      'Fish (if no fish allergy), plant-based proteins.',
    ],
    emergencyActionPlan: {
      hasHighRiskAllergy: true,
      instructions: [
        'Carry an epinephrine auto-injector if prescribed.',
        'Know how to use your auto-injector.',
        'Seek immediate medical attention for severe reactions.',
        'Wear medical alert jewelry or carry an allergy card.',
      ],
    },
    alertSettings: {
      foodScanAlerts: true,
      mealPlanAlerts: true,
      ingredientAlerts: true,
    },
    dietaryRecommendations: [
      'Always read labels carefully.',
      'Be cautious with baked goods from unknown sources.',
      'Check ingredients for milk derivatives.',
      'Avoid seafood restaurants or ensure strict protocols.',
    ],
    profileGeneratedAt: new Date().toISOString(),
  },
  dailyRequirements: {
    calories: 2450,
    protein: 184,
    carbs: 245,
    fat: 82,
    fiber: 30,
  },
  profileSetupCompleted: true,
  setupDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function registerMockUser() {
  try {
    console.log('🚀 Registering mock user in Firebase...\n');

    // Step 1: Create user in Firebase Authentication
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: mockUserCredentials.email,
        password: mockUserCredentials.password,
        displayName: mockUserCredentials.name,
        emailVerified: true, // Set to true for testing
      });
      console.log('✅ User created in Firebase Authentication');
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists in Authentication');
        // Get existing user
        userRecord = await auth.getUserByEmail(mockUserCredentials.email);
        console.log(`   Using existing UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Step 2: Create user document in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    const userDataWithId = {
      id: userRecord.uid,
      ...mockUserData,
    };

    if (userDoc.exists) {
      console.log('⚠️  User document already exists in Firestore');
      console.log('   Updating with latest data...');
      await userRef.update(userDataWithId);
      console.log('✅ User document updated in Firestore');
    } else {
      await userRef.set(userDataWithId);
      console.log('✅ User document created in Firestore');
    }

    console.log('\n📋 Registration Summary:');
    console.log('=====================================');
    console.log('🔐 Login Credentials:');
    console.log(`   Email: ${mockUserCredentials.email}`);
    console.log(`   Password: ${mockUserCredentials.password}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log('\n👤 User Profile:');
    console.log(`   Name: ${mockUserData.name}`);
    console.log(`   Diabetes Type: ${mockUserData.diabetesType}`);
    console.log(`   Allergies: ${mockUserData.allergies.map(a => a.label).join(', ')}`);
    console.log(`   Profile Setup: ${mockUserData.profileSetupCompleted ? 'Completed' : 'Pending'}`);
    console.log('\n✅ Mock user registered successfully!');
    console.log('   You can now login with the credentials above.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error registering mock user:', error);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    process.exit(1);
  }
}

// Run the script
registerMockUser();


