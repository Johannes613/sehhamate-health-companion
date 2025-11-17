/**
 * Quick script to add mock user data to Firebase Firestore
 * Uses Firebase Admin SDK
 * 
 * Usage: node scripts/addMockUserToFirebase.js
 */

// Mock user data
const mockUserData = {
  id: 'mock_user_001',
  name: 'Ahmed Al-Mansoori',
  email: 'ahmed.almansoori@example.com',
  phoneNumber: '+971501234567',
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

console.log('📋 Mock User Data JSON:');
console.log(JSON.stringify(mockUserData, null, 2));
console.log('\n✅ Copy the JSON above and paste it into Firebase Console:');
console.log('   1. Go to: https://console.firebase.google.com/');
console.log('   2. Select your project');
console.log('   3. Go to Firestore Database');
console.log('   4. Create collection "users" (if not exists)');
console.log('   5. Add document with ID: mock_user_001');
console.log('   6. Paste the JSON data above');


