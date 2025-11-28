/**
 * Allergen Detection Engine
 * Analyzes food items to detect allergens and assess risk levels
 * Implements FR-2.2.1, FR-2.2.2, FR-2.2.3, FR-2.2.5
 */

/**
 * Detect allergens in food items
 * @param {Array} foodItems - Array of detected food items
 * @param {Object} userAllergyProfile - User's allergy profile from generateInitialAllergyProfile
 * @returns {Object} Allergen detection results with risk levels
 */
export const detectAllergens = (foodItems, userAllergyProfile) => {
  if (!foodItems || foodItems.length === 0) {
    return {
      hasAllergens: false,
      detectedAllergens: [],
      riskLevel: 'low',
      warnings: [],
    };
  }

  // Handle both allergyProfile format and direct allergies array
  const hasAllergies = userAllergyProfile?.hasAllergies || (userAllergyProfile?.allergies && userAllergyProfile.allergies.length > 0);
  
  if (!userAllergyProfile || !hasAllergies) {
    return {
      hasAllergens: false,
      detectedAllergens: [],
      riskLevel: 'low',
      warnings: [],
      message: 'No allergies registered in your profile',
    };
  }

  const detectedAllergens = [];
  const warnings = [];
  const userAllergies = userAllergyProfile.allergies || [];

  // Analyze each food item
  foodItems.forEach(item => {
    const foodName = (item.name || '').toLowerCase();
    const foodText = JSON.stringify(item).toLowerCase();

    // Check each user allergy
    userAllergies.forEach(userAllergy => {
      const allergyLabel = (userAllergy.label || '').toLowerCase();
      const allergyCategory = userAllergy.category || categorizeAllergy(allergyLabel);
      
      // Check if allergen is present in food
      const isDetected = checkAllergenInFood(foodName, foodText, allergyCategory, allergyLabel);
      
      if (isDetected) {
        const riskLevel = calculateAllergenRiskLevel(userAllergy, item);
        
        detectedAllergens.push({
          allergen: userAllergy.label,
          category: allergyCategory,
          severity: userAllergy.severity || 'medium',
          riskLevel,
          detectedIn: item.name,
          confidence: item.confidence || 0.8,
          warning: generateAllergenWarning(userAllergy, item, riskLevel),
        });

        warnings.push({
          type: 'allergen',
          severity: riskLevel,
          title: `⚠️ ${userAllergy.label} Detected`,
          message: generateAllergenWarning(userAllergy, item, riskLevel),
          allergen: userAllergy.label,
          foodItem: item.name,
        });
      }
    });
  });

  // Calculate overall risk level
  const overallRiskLevel = calculateOverallRiskLevel(detectedAllergens);

  return {
    hasAllergens: detectedAllergens.length > 0,
    detectedAllergens,
    riskLevel: overallRiskLevel,
    warnings,
    safeToEat: detectedAllergens.length === 0,
    recommendation: generateRecommendation(detectedAllergens, overallRiskLevel),
  };
};

/**
 * Check if allergen is present in food
 */
const checkAllergenInFood = (foodName, foodText, category, allergenLabel) => {
  // Common allergen keywords
  const allergenKeywords = {
    tree_nuts_peanuts: [
      'nut', 'almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'brazil nut',
      'macadamia', 'peanut', 'groundnut', 'peanut butter', 'nut butter', 'marzipan', 'nougat',
      'praline', 'nutella', 'pesto', 'satay', 'pad thai'
    ],
    dairy: [
      'milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'whey', 'casein', 'lactose',
      'dairy', 'ghee', 'buttermilk', 'sour cream', 'ice cream', 'custard', 'pudding',
      'chocolate', 'mayonnaise', 'ranch', 'caesar'
    ],
    gluten: [
      'wheat', 'barley', 'rye', 'gluten', 'flour', 'bread', 'pasta', 'noodle', 'cereal',
      'cracker', 'biscuit', 'cookie', 'cake', 'pastry', 'beer', 'soy sauce', 'malt',
      'semolina', 'durum', 'spelt', 'kamut', 'triticale'
    ],
    shellfish: [
      'shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'mussel', 'clam', 'oyster',
      'scallop', 'shellfish', 'seafood', 'surimi', 'imitation crab'
    ],
    fish: [
      'fish', 'salmon', 'tuna', 'cod', 'halibut', 'mackerel', 'sardine', 'anchovy',
      'herring', 'trout', 'bass', 'tilapia'
    ],
    eggs: [
      'egg', 'albumin', 'albumen', 'lecithin', 'mayonnaise', 'mousse', 'meringue',
      'custard', 'hollandaise', 'béarnaise'
    ],
    soy: [
      'soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame', 'soy sauce', 'soybean',
      'textured vegetable protein', 'tvp', 'lecithin'
    ],
    sesame: [
      'sesame', 'tahini', 'sesame seed', 'sesame oil', 'benne', 'simsim'
    ],
  };

  const keywords = allergenKeywords[category] || [allergenLabel.toLowerCase()];
  
  // Check if any keyword appears in food name or text
  return keywords.some(keyword => 
    foodName.includes(keyword) || foodText.includes(keyword)
  );
};

/**
 * Categorize allergy
 */
const categorizeAllergy = (allergyLabel) => {
  const label = allergyLabel.toLowerCase();
  
  if (label.includes('nut') || label.includes('peanut')) {
    return 'tree_nuts_peanuts';
  } else if (label.includes('dairy') || label.includes('lactose') || label.includes('milk')) {
    return 'dairy';
  } else if (label.includes('gluten') || label.includes('wheat')) {
    return 'gluten';
  } else if (label.includes('shellfish')) {
    return 'shellfish';
  } else if (label.includes('fish') && !label.includes('shellfish')) {
    return 'fish';
  } else if (label.includes('egg')) {
    return 'eggs';
  } else if (label.includes('soy')) {
    return 'soy';
  } else if (label.includes('sesame')) {
    return 'sesame';
  }
  
  return 'other';
};

/**
 * Calculate risk level for detected allergen
 */
const calculateAllergenRiskLevel = (userAllergy, foodItem) => {
  const allergySeverity = userAllergy.severity || 'medium';
  const confidence = foodItem.confidence || 0.8;
  
  // High risk if high severity allergy detected with high confidence
  if (allergySeverity === 'high' && confidence > 0.7) {
    return 'high';
  }
  
  // Medium risk if medium severity or lower confidence
  if (allergySeverity === 'medium' || confidence < 0.8) {
    return 'medium';
  }
  
  // Low risk for low severity allergies
  return 'low';
};

/**
 * Calculate overall risk level from all detected allergens
 */
const calculateOverallRiskLevel = (detectedAllergens) => {
  if (detectedAllergens.length === 0) {
    return 'low';
  }

  const hasHighRisk = detectedAllergens.some(a => a.riskLevel === 'high');
  const hasMediumRisk = detectedAllergens.some(a => a.riskLevel === 'medium');
  
  if (hasHighRisk) {
    return 'high';
  } else if (hasMediumRisk) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Generate allergen warning message
 */
const generateAllergenWarning = (userAllergy, foodItem, riskLevel) => {
  const allergenName = userAllergy.label;
  const foodName = foodItem.name;
  
  if (riskLevel === 'high') {
    return `⚠️ WARNING: ${allergenName} detected in ${foodName}. DO NOT CONSUME. This could cause a severe allergic reaction.`;
  } else if (riskLevel === 'medium') {
    return `⚠️ CAUTION: ${allergenName} may be present in ${foodName}. Check ingredients carefully before consuming.`;
  } else {
    return `ℹ️ Note: ${allergenName} might be present in ${foodName}. Please verify ingredients.`;
  }
};

/**
 * Generate recommendation based on detected allergens
 */
const generateRecommendation = (detectedAllergens, overallRiskLevel) => {
  if (detectedAllergens.length === 0) {
    return 'No allergens detected. Safe to consume based on your allergy profile.';
  }

  if (overallRiskLevel === 'high') {
    return 'DO NOT CONSUME. This food contains allergens that pose a high risk to your health.';
  } else if (overallRiskLevel === 'medium') {
    return 'Exercise caution. Verify ingredients and consult with healthcare provider if uncertain.';
  } else {
    return 'Low risk detected. Please verify ingredients before consuming.';
  }
};

