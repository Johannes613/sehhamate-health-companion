/**
 * Script to register a mock user in Firebase Authentication and Firestore
 * This creates a real user account that can be used to login
 * 
 * Usage: node scripts/registerMockUser.js
 * 
 * Note: This requires Firebase Admin SDK or you can use the Firebase Console
 * to create the user manually, then run this script to add the Firestore data.
 */

// For client-side Firebase (if running in app context)
// This script can be adapted to use Firebase Admin SDK for server-side

const mockUserCredentials = {
  email: 'ahmed.almansoori@example.com',
  password: 'Test123!@#', // Change this to a secure password
  name: 'Ahmed Al-Mansoori',
  phoneNumber: '+971501234567',
};

const mockUserData = {
  // Basic Info
  name: mockUserCredentials.name,
  email: mockUserCredentials.email,
  phoneNumber: mockUserCredentials.phoneNumber,
  
  // Health Profile (FR-1.1.3, FR-1.1.4, FR-1.1.5)
  diabetesType: 'Type 2',
  allergies: [
    {
      id: 'peanuts',
      label: 'Peanuts',
      severity: 'high',
      type: 'common',
    },
    {
      id: 'dairy',
      label: 'Dairy',
      severity: 'medium',
      type: 'common',
    },
    {
      id: 'shellfish',
      label: 'Shellfish',
      severity: 'high',
      type: 'common',
    },
  ],
  dietaryRestrictions: ['Vegetarian', 'Low Sodium'],
  dietaryPreferences: ['vegetarian', 'pescatarian'], // Valid options: 'none', 'vegetarian', 'vegan', 'pescatarian'
  
  // Profile Setup Data
  age: '35',
  weight: '78', // kg
  height: '175', // cm
  gender: 'male',
  activityLevel: 'moderately_active',
  
  // Nutrition Profile (FR-1.4.3)
  nutritionProfile: {
    calories: 2450,
    bmr: 1850,
    tdee: 2450,
    macronutrients: {
      protein: 184,
      carbohydrates: 245,
      fat: 82,
    },
    micronutrients: {
      fiber: 30,
      addedSugarLimit: 15,
      sodiumLimit: 2000,
    },
    mealTiming: {
      breakfast: 'Within 1-2 hours of waking',
      lunch: '4-5 hours after breakfast',
      dinner: '3-4 hours after lunch, at least 2-3 hours before bed',
      snacks: '1-2 small snacks between meals if needed, especially for blood sugar management',
    },
    foodGroups: {
      vegetables: '3-5 servings/day (non-starchy)',
      fruits: '2-3 servings/day (whole fruits)',
      grains: '4-6 servings/day (whole grains preferred)',
      protein: '2-3 servings/day (lean meats, fish, legumes)',
      dairy: '2-3 servings/day (low-fat options)',
      fats: 'Healthy fats in moderation (avocado, nuts, olive oil)',
    },
    specialConsiderations: [
      'Monitor carbohydrate intake closely and distribute evenly throughout the day. Prioritize low-glycemic index foods.',
      'Regular blood glucose monitoring is crucial to adjust food intake and medication.',
      'Ensure adequate intake of plant-based protein (legumes, tofu, tempeh) and Vitamin B12.',
      'Avoid wheat, barley, rye. Look for certified gluten-free products.',
    ],
    profileGeneratedAt: new Date().toISOString(),
  },
  
  // Allergy Profile (FR-1.4.4)
  allergyProfile: {
    userAllergies: [
      {
        id: 'peanuts',
        label: 'Peanuts',
        severity: 'high',
        type: 'common',
      },
      {
        id: 'dairy',
        label: 'Dairy',
        severity: 'medium',
        type: 'common',
      },
      {
        id: 'shellfish',
        label: 'Shellfish',
        severity: 'high',
        type: 'common',
      },
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
      'Other crustaceans (shrimp, crab, lobster) and mollusks (clams, mussels, oysters) are common.',
    ],
    hiddenAllergenSources: [
      'Baked goods, candy, chili, egg rolls, glazes, sauces (e.g., satay), vegetarian meat substitutes.',
      'Lactose, casein, whey, ghee, artificial butter flavor, caramel candy, chocolate, deli meats.',
      'Fish stock, surimi, glucosamine, some Asian sauces.',
    ],
    safeAlternatives: [
      'Sunflower seed butter, soy butter, tahini.',
      'Almond milk, soy milk, oat milk, coconut milk, lactose-free products.',
      'Fish (if no fish allergy), chicken, beef, plant-based proteins.',
    ],
    emergencyActionPlan: {
      hasHighRiskAllergy: true,
      instructions: [
        'Carry an epinephrine auto-injector (e.g., EpiPen) if prescribed.',
        'Know how to use your auto-injector and educate family/friends.',
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
      'Always read labels carefully, as peanuts can be hidden in many processed foods.',
      'Be cautious with baked goods and desserts from unknown sources.',
      'Check ingredients for milk derivatives like casein and whey.',
      'Avoid seafood restaurants or ensure strict cross-contamination protocols.',
      'Pay close attention to carbohydrate content and sugar alcohols in foods, as they can impact blood sugar.',
      'Be aware that some "allergy-friendly" products might be high in sugar or unhealthy fats; always check nutrition labels.',
    ],
    profileGeneratedAt: new Date().toISOString(),
  },
  
  // Daily Requirements (legacy support)
  dailyRequirements: {
    calories: 2450,
    protein: 184,
    carbs: 245,
    fat: 82,
    fiber: 30,
  },
  
  // Profile Status
  profileSetupCompleted: true,
  setupDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

console.log('📋 Mock User Registration Information:');
console.log('=====================================\n');
console.log('🔐 Authentication Credentials:');
console.log(`   Email: ${mockUserCredentials.email}`);
console.log(`   Password: ${mockUserCredentials.password}`);
console.log('\n📝 User Profile Data:');
console.log(JSON.stringify(mockUserData, null, 2));

console.log('\n\n📋 Instructions to Register User:');
console.log('=====================================\n');
console.log('Option 1: Using Firebase Console (Recommended)');
console.log('-----------------------------------------------');
console.log('1. Go to: https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. Go to Authentication > Users');
console.log('4. Click "Add user"');
console.log(`5. Email: ${mockUserCredentials.email}`);
console.log(`6. Password: ${mockUserCredentials.password}`);
console.log('7. Click "Add user"');
console.log('8. Copy the User UID that is generated');
console.log('9. Go to Firestore Database');
console.log('10. Create collection "users" (if not exists)');
console.log('11. Add document with the User UID as document ID');
console.log('12. Add the user profile data from above\n');

console.log('Option 2: Using Firebase Admin SDK');
console.log('-----------------------------------');
console.log('1. Install: npm install firebase-admin');
console.log('2. Create service account key from Firebase Console');
console.log('3. Save as firebase-service-account.json');
console.log('4. Run: node scripts/registerMockUserAdmin.js\n');

console.log('Option 3: Register via App');
console.log('---------------------------');
console.log('1. Open the app');
console.log('2. Go to Sign Up screen');
console.log(`3. Email: ${mockUserCredentials.email}`);
console.log(`4. Password: ${mockUserCredentials.password}`);
console.log('5. Fill in health profile data during signup');
console.log('6. Complete profile setup\n');

console.log('✅ After registration, you can login with:');
console.log(`   Email: ${mockUserCredentials.email}`);
console.log(`   Password: ${mockUserCredentials.password}`);


