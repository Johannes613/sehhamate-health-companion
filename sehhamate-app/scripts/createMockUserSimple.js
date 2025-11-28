/**
 * Simple script to create mock user data in Firebase
 * Uses the Firebase SDK from the app (no admin SDK needed)
 * 
 * Run with: node scripts/createMockUserSimple.js
 * 
 * Note: This requires Firebase to be initialized. You may need to adjust
 * the import path based on your project structure.
 */

// For Node.js environment, we'll use a different approach
// This script can be run in the app or adapted for Node.js

const mockUserData = {
  // Basic Info
  id: 'mock_user_001',
  name: 'Ahmed Al-Mansoori',
  email: 'ahmed.almansoori@example.com',
  phoneNumber: '+971501234567',
  
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

// Export for use in other scripts
module.exports = { mockUserData };

// If running directly, print the data
if (require.main === module) {
  console.log('📋 Mock User Data:');
  console.log(JSON.stringify(mockUserData, null, 2));
  console.log('\n💡 To use this data:');
  console.log('   1. Copy the JSON above');
  console.log('   2. Go to Firebase Console > Firestore Database');
  console.log('   3. Create a new document in the "users" collection');
  console.log('   4. Set document ID to: mock_user_001');
  console.log('   5. Paste the JSON data (or add fields manually)');
}


