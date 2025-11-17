/**
 * Nutrition Analysis Engine
 * Generates initial nutrition profile based on user-provided data
 * Implements FR-1.4.3
 */

/**
 * Generate initial nutrition profile based on user data
 * @param {Object} userData - User profile data including:
 *   - age, weight, height, gender
 *   - activityLevel
 *   - diabetesType (optional)
 *   - dietaryRestrictions (optional array)
 *   - dietaryPreferences (optional array)
 * @returns {Object} Initial nutrition profile
 */
export const generateInitialNutritionProfile = (userData) => {
  const {
    age,
    weight,
    height,
    gender,
    activityLevel,
    diabetesType,
    dietaryRestrictions = [],
    dietaryPreferences = [],
  } = userData;

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
  } else {
    bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
  }

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = Math.round(bmr * multiplier);

  // Adjust calories based on diabetes type
  let adjustedCalories = tdee;
  let macroAdjustments = {
    protein: 0.25,  // 25% default
    carbohydrates: 0.45,  // 45% default
    fat: 0.30,  // 30% default
  };

  // Diabetes-specific adjustments
  if (diabetesType === 'type1') {
    // Type 1: Focus on consistent carb intake, moderate protein
    macroAdjustments = {
      protein: 0.20,
      carbohydrates: 0.40,  // Controlled carbs
      fat: 0.40,
    };
    adjustedCalories = Math.round(tdee * 0.95); // Slight reduction for better control
  } else if (diabetesType === 'type2') {
    // Type 2: Lower carb, higher protein and healthy fats
    macroAdjustments = {
      protein: 0.30,
      carbohydrates: 0.30,  // Reduced carbs
      fat: 0.40,
    };
    adjustedCalories = Math.round(tdee * 0.90); // Calorie reduction for weight management
  } else if (diabetesType === 'prediabetes') {
    // Prediabetes: Moderate carb reduction, increased protein
    macroAdjustments = {
      protein: 0.28,
      carbohydrates: 0.35,
      fat: 0.37,
    };
    adjustedCalories = Math.round(tdee * 0.92);
  }

  // Adjust for dietary preferences (only 4 valid options: 'none', 'vegetarian', 'vegan', 'pescatarian')
  if (dietaryPreferences.includes('pescatarian')) {
    macroAdjustments = {
      protein: 0.25,
      carbohydrates: 0.40,
      fat: 0.35,  // Emphasis on healthy fats from fish
    };
  } else if (dietaryPreferences.includes('vegetarian')) {
    macroAdjustments = {
      protein: 0.20,
      carbohydrates: 0.45,
      fat: 0.35,
    };
  } else if (dietaryPreferences.includes('vegan')) {
    macroAdjustments = {
      protein: 0.20,
      carbohydrates: 0.50,
      fat: 0.30,
    };
  }

  // Calculate macronutrient targets
  const protein = Math.round((adjustedCalories * macroAdjustments.protein) / 4); // 4 cal/g
  const carbohydrates = Math.round((adjustedCalories * macroAdjustments.carbohydrates) / 4); // 4 cal/g
  const fat = Math.round((adjustedCalories * macroAdjustments.fat) / 9); // 9 cal/g

  // Calculate fiber recommendations (14g per 1000 calories)
  const fiber = Math.round((adjustedCalories / 1000) * 14);

  // Calculate sugar limits (especially important for diabetes)
  let sugarLimit;
  if (diabetesType === 'type1' || diabetesType === 'type2') {
    sugarLimit = Math.round(adjustedCalories * 0.05 / 4); // 5% of calories from added sugars
  } else if (diabetesType === 'prediabetes') {
    sugarLimit = Math.round(adjustedCalories * 0.08 / 4); // 8% of calories
  } else {
    sugarLimit = Math.round(adjustedCalories * 0.10 / 4); // 10% of calories (WHO recommendation)
  }

  // Sodium recommendations (varies by health condition)
  let sodiumLimit = 2300; // Default: 2300mg (WHO recommendation)
  if (diabetesType === 'type2') {
    sodiumLimit = 2000; // Lower for better blood pressure control
  }

  // Generate meal timing recommendations
  const mealTiming = generateMealTimingRecommendations(diabetesType, dietaryPreferences);

  // Generate food group recommendations
  const foodGroups = generateFoodGroupRecommendations(dietaryPreferences, dietaryRestrictions);

  // Generate special considerations
  const specialConsiderations = generateSpecialConsiderations(
    diabetesType,
    dietaryPreferences,
    dietaryRestrictions
  );

  return {
    // Basic metrics
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: adjustedCalories,
    
    // Macronutrients
    protein: {
      target: protein,
      min: Math.round(protein * 0.9),
      max: Math.round(protein * 1.1),
      unit: 'g',
    },
    carbohydrates: {
      target: carbohydrates,
      min: Math.round(carbohydrates * 0.9),
      max: Math.round(carbohydrates * 1.1),
      unit: 'g',
    },
    fat: {
      target: fat,
      min: Math.round(fat * 0.9),
      max: Math.round(fat * 1.1),
      unit: 'g',
    },
    
    // Micronutrients and other targets
    fiber: {
      target: fiber,
      min: Math.round(fiber * 0.8),
      unit: 'g',
    },
    sugar: {
      limit: sugarLimit,
      unit: 'g',
    },
    sodium: {
      limit: sodiumLimit,
      unit: 'mg',
    },
    
    // Meal planning
    mealTiming,
    foodGroups,
    
    // Special considerations
    specialConsiderations,
    
    // Profile metadata
    generatedAt: new Date().toISOString(),
    version: '1.0',
    basedOn: {
      diabetesType: diabetesType || 'none',
      dietaryPreferences: dietaryPreferences.length > 0 ? dietaryPreferences : ['none'],
      activityLevel,
    },
  };
};

/**
 * Generate meal timing recommendations based on user profile
 */
const generateMealTimingRecommendations = (diabetesType, dietaryPreferences) => {
  const recommendations = {
    frequency: 3, // Default: 3 meals per day
    snacks: 2, // Default: 2 snacks
    timing: [],
    notes: [],
  };

  if (diabetesType === 'type1' || diabetesType === 'type2') {
    recommendations.frequency = 3;
    recommendations.snacks = 2;
    recommendations.timing = [
      { meal: 'breakfast', time: '08:00', carbs: '30-45g' },
      { meal: 'snack', time: '10:30', carbs: '15-20g' },
      { meal: 'lunch', time: '13:00', carbs: '45-60g' },
      { meal: 'snack', time: '16:00', carbs: '15-20g' },
      { meal: 'dinner', time: '19:00', carbs: '45-60g' },
    ];
    recommendations.notes.push('Consistent meal timing helps maintain stable blood glucose levels');
    recommendations.notes.push('Space meals 3-4 hours apart');
  } else if (diabetesType === 'prediabetes') {
    recommendations.frequency = 3;
    recommendations.snacks = 1;
    recommendations.timing = [
      { meal: 'breakfast', time: '08:00', carbs: '30-40g' },
      { meal: 'lunch', time: '13:00', carbs: '40-50g' },
      { meal: 'snack', time: '16:00', carbs: '15-20g' },
      { meal: 'dinner', time: '19:00', carbs: '40-50g' },
    ];
    recommendations.notes.push('Regular meal timing can help prevent progression to Type 2 diabetes');
  } else {
    recommendations.timing = [
      { meal: 'breakfast', time: '08:00' },
      { meal: 'lunch', time: '13:00' },
      { meal: 'dinner', time: '19:00' },
    ];
  }

  return recommendations;
};

/**
 * Generate food group recommendations
 */
const generateFoodGroupRecommendations = (dietaryPreferences, dietaryRestrictions) => {
  const recommendations = {
    vegetables: { servings: 5, priority: 'high' },
    fruits: { servings: 2, priority: 'high' },
    grains: { servings: 6, priority: 'medium' },
    protein: { servings: 5, priority: 'high' },
    dairy: { servings: 3, priority: 'medium' },
    fats: { servings: 3, priority: 'medium' },
  };

  // Adjust based on dietary preferences (only 4 valid options: 'none', 'vegetarian', 'vegan', 'pescatarian')
  if (dietaryPreferences.includes('vegetarian')) {
    recommendations.protein.servings = 6; // More plant-based proteins
    recommendations.dairy.servings = 4;
  } else if (dietaryPreferences.includes('vegan')) {
    recommendations.protein.servings = 7; // More plant-based proteins
    recommendations.dairy.servings = 0;
  } else if (dietaryPreferences.includes('pescatarian')) {
    recommendations.protein.servings = 5; // Fish and seafood focus
    recommendations.dairy.servings = 3;
  }

  // Adjust for restrictions (gluten and dairy restrictions are handled via dietaryRestrictions array)
  if (dietaryRestrictions.includes('gluten_free') || dietaryRestrictions.includes('Gluten')) {
    recommendations.grains.note = 'Choose gluten-free grains (quinoa, rice, oats)';
  }
  if (dietaryRestrictions.includes('dairy_free') || dietaryRestrictions.includes('Dairy')) {
    recommendations.dairy.servings = 0;
    recommendations.dairy.note = 'Use dairy alternatives (almond milk, coconut milk)';
  }

  return recommendations;
};

/**
 * Generate special considerations based on user profile
 */
const generateSpecialConsiderations = (diabetesType, dietaryPreferences, dietaryRestrictions) => {
  const considerations = [];

  if (diabetesType === 'type1') {
    considerations.push({
      type: 'blood_glucose',
      priority: 'high',
      message: 'Monitor blood glucose before and after meals. Count carbohydrates for insulin dosing.',
    });
    considerations.push({
      type: 'carb_consistency',
      priority: 'high',
      message: 'Maintain consistent carbohydrate intake at meals to help stabilize blood glucose.',
    });
  } else if (diabetesType === 'type2') {
    considerations.push({
      type: 'weight_management',
      priority: 'high',
      message: 'Focus on portion control and weight management to improve insulin sensitivity.',
    });
    considerations.push({
      type: 'carb_quality',
      priority: 'high',
      message: 'Choose complex carbohydrates with low glycemic index (whole grains, vegetables).',
    });
    considerations.push({
      type: 'sugar_avoidance',
      priority: 'high',
      message: 'Limit added sugars and sugary beverages. Read food labels carefully.',
    });
  } else if (diabetesType === 'prediabetes') {
    considerations.push({
      type: 'prevention',
      priority: 'high',
      message: 'Lifestyle changes can prevent progression to Type 2 diabetes. Focus on whole foods and regular physical activity.',
    });
  }

  // Dietary preference considerations (only 4 valid options: 'none', 'vegetarian', 'vegan', 'pescatarian')
  if (dietaryPreferences.includes('vegan')) {
    considerations.push({
      type: 'nutrition',
      priority: 'high',
      message: 'Ensure adequate intake of Vitamin B12, Iron, and Omega-3 fatty acids. Consider fortified foods or supplements.',
    });
  } else if (dietaryPreferences.includes('vegetarian')) {
    considerations.push({
      type: 'nutrition',
      priority: 'medium',
      message: 'Focus on plant-based protein sources (legumes, tofu, tempeh) and ensure adequate Iron and Vitamin B12 intake.',
    });
  } else if (dietaryPreferences.includes('pescatarian')) {
    considerations.push({
      type: 'nutrition',
      priority: 'low',
      message: 'Include a variety of fish and seafood for optimal Omega-3 intake. Choose low-mercury options.',
    });
  }

  if (dietaryRestrictions.length > 0) {
    considerations.push({
      type: 'allergies',
      priority: 'high',
      message: `Always check food labels for: ${dietaryRestrictions.join(', ')}. When in doubt, avoid the food.`,
    });
  }

  return considerations;
};


