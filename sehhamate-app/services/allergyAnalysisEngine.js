/**
 * Allergy Analysis Engine
 * Generates initial allergy profile based on user-provided information
 * Implements FR-1.4.4
 */

/**
 * Generate initial allergy profile based on user information
 * @param {Object} userData - User data including:
 *   - allergies (array of allergy objects with id, label, severity, type)
 *   - diabetesType (optional)
 *   - dietaryRestrictions (optional array)
 * @returns {Object} Initial allergy profile
 */
export const generateInitialAllergyProfile = (userData) => {
  const {
    allergies = [],
    diabetesType,
    dietaryRestrictions = [],
  } = userData;

  // If no allergies provided, return a default safe profile
  if (!allergies || allergies.length === 0) {
    return {
      hasAllergies: false,
      allergies: [],
      riskLevel: 'low',
      alertSettings: {
        enabled: true,
        severity: 'all', // 'all', 'high', 'high_medium'
      },
      crossReactivity: [],
      hiddenSources: [],
      safeAlternatives: [],
      emergencyInfo: {
        hasActionPlan: false,
        actionPlan: null,
      },
      generatedAt: new Date().toISOString(),
      version: '1.0',
    };
  }

  // Analyze allergies and generate profile
  const analyzedAllergies = analyzeAllergies(allergies);
  const riskLevel = calculateOverallRiskLevel(analyzedAllergies);
  const crossReactivity = identifyCrossReactivity(analyzedAllergies);
  const hiddenSources = identifyHiddenSources(analyzedAllergies);
  const safeAlternatives = generateSafeAlternatives(analyzedAllergies, dietaryRestrictions);
  const emergencyInfo = generateEmergencyInfo(analyzedAllergies, riskLevel);

  // Generate alert settings based on risk level
  const alertSettings = generateAlertSettings(riskLevel, analyzedAllergies);

  // Generate dietary recommendations
  const dietaryRecommendations = generateDietaryRecommendations(
    analyzedAllergies,
    diabetesType,
    dietaryRestrictions
  );

  return {
    hasAllergies: true,
    allergies: analyzedAllergies,
    riskLevel,
    alertSettings,
    crossReactivity,
    hiddenSources,
    safeAlternatives,
    emergencyInfo,
    dietaryRecommendations,
    generatedAt: new Date().toISOString(),
    version: '1.0',
  };
};

/**
 * Analyze individual allergies and extract key information
 */
const analyzeAllergies = (allergies) => {
  return allergies.map(allergy => {
    const label = allergy?.label || allergy || 'Unknown';
    const analysis = {
      id: allergy?.id || Date.now(),
      label: label,
      severity: allergy?.severity || 'medium',
      type: allergy?.type || 'common',
      category: categorizeAllergy(label),
      commonNames: getCommonNames(label),
      riskScore: calculateRiskScore({ ...allergy, label }),
    };

    return analysis;
  });
};

/**
 * Categorize allergy by type
 */
const categorizeAllergy = (label) => {
  if (!label || typeof label !== 'string') {
    return 'other';
  }
  const labelLower = label.toLowerCase();
  
  if (labelLower.includes('nut') || labelLower.includes('peanut')) {
    return 'tree_nuts_peanuts';
  } else if (labelLower.includes('dairy') || labelLower.includes('lactose') || labelLower.includes('milk')) {
    return 'dairy';
  } else if (labelLower.includes('gluten') || labelLower.includes('wheat')) {
    return 'gluten';
  } else if (labelLower.includes('shellfish') || labelLower.includes('shrimp') || labelLower.includes('crab')) {
    return 'shellfish';
  } else if (labelLower.includes('fish')) {
    return 'fish';
  } else if (labelLower.includes('egg')) {
    return 'eggs';
  } else if (labelLower.includes('soy')) {
    return 'soy';
  } else if (labelLower.includes('sesame')) {
    return 'sesame';
  } else {
    return 'other';
  }
};

/**
 * Get common names and variations for an allergy
 */
const getCommonNames = (label) => {
  if (!label || typeof label !== 'string') {
    return [label || 'Unknown'];
  }
  const labelLower = label.toLowerCase();
  const commonNames = [label];

  // Tree nuts
  if (labelLower.includes('nut') && !labelLower.includes('peanut')) {
    commonNames.push('almonds', 'walnuts', 'cashews', 'pistachios', 'hazelnuts', 'pecans', 'brazil nuts', 'macadamia nuts');
  }
  
  // Peanuts
  if (labelLower.includes('peanut')) {
    commonNames.push('groundnuts', 'goobers', 'monkey nuts');
  }
  
  // Dairy
  if (labelLower.includes('dairy') || labelLower.includes('lactose') || labelLower.includes('milk')) {
    commonNames.push('milk', 'cheese', 'yogurt', 'butter', 'cream', 'whey', 'casein', 'lactose');
  }
  
  // Gluten
  if (labelLower.includes('gluten') || labelLower.includes('wheat')) {
    commonNames.push('wheat', 'barley', 'rye', 'triticale', 'semolina', 'durum', 'spelt', 'kamut');
  }
  
  // Shellfish
  if (labelLower.includes('shellfish')) {
    commonNames.push('shrimp', 'prawns', 'crab', 'lobster', 'crayfish', 'mussels', 'clams', 'oysters', 'scallops');
  }
  
  // Fish
  if (labelLower.includes('fish') && !labelLower.includes('shellfish')) {
    commonNames.push('salmon', 'tuna', 'cod', 'halibut', 'mackerel', 'sardines', 'anchovies');
  }
  
  // Eggs
  if (labelLower.includes('egg')) {
    commonNames.push('chicken eggs', 'duck eggs', 'quail eggs', 'albumin', 'lecithin');
  }
  
  // Soy
  if (labelLower.includes('soy')) {
    commonNames.push('soybeans', 'soya', 'tofu', 'tempeh', 'miso', 'edamame', 'soy sauce');
  }
  
  // Sesame
  if (labelLower.includes('sesame')) {
    commonNames.push('tahini', 'sesame seeds', 'sesame oil', 'benne seeds');
  }

  return [...new Set(commonNames)]; // Remove duplicates
};

/**
 * Calculate risk score for an allergy (0-100)
 */
const calculateRiskScore = (allergy) => {
  let score = 50; // Base score

  // Adjust based on severity
  if (allergy.severity === 'high') {
    score += 30;
  } else if (allergy.severity === 'medium') {
    score += 15;
  } else if (allergy.severity === 'low') {
    score += 5;
  }

  // Adjust based on category (some allergies are more dangerous)
  const category = categorizeAllergy(allergy.label);
  if (category === 'tree_nuts_peanuts' || category === 'shellfish') {
    score += 15; // These are common severe allergens
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate overall risk level
 */
const calculateOverallRiskLevel = (analyzedAllergies) => {
  if (analyzedAllergies.length === 0) {
    return 'low';
  }

  const highSeverityCount = analyzedAllergies.filter(a => a.severity === 'high').length;
  const averageRiskScore = analyzedAllergies.reduce((sum, a) => sum + a.riskScore, 0) / analyzedAllergies.length;

  if (highSeverityCount >= 2 || averageRiskScore >= 75) {
    return 'high';
  } else if (highSeverityCount >= 1 || averageRiskScore >= 60) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Identify cross-reactivity between allergies
 */
const identifyCrossReactivity = (analyzedAllergies) => {
  const crossReactions = [];

  // Tree nuts cross-reactivity
  const hasTreeNuts = analyzedAllergies.some(a => a.category === 'tree_nuts_peanuts');
  if (hasTreeNuts) {
    crossReactions.push({
      type: 'tree_nuts',
      message: 'If allergic to one tree nut, you may be allergic to others. Consult an allergist before trying new tree nuts.',
      relatedAllergens: ['almonds', 'walnuts', 'cashews', 'pistachios', 'hazelnuts'],
    });
  }

  // Peanuts and tree nuts (not true cross-reactivity but often co-occur)
  const hasPeanuts = analyzedAllergies.some(a => a.label && typeof a.label === 'string' && a.label.toLowerCase().includes('peanut'));
  if (hasPeanuts && hasTreeNuts) {
    crossReactions.push({
      type: 'peanut_tree_nut',
      message: 'Peanuts and tree nuts are different, but many people are allergic to both. Exercise caution.',
    });
  }

  // Shellfish cross-reactivity
  const hasShellfish = analyzedAllergies.some(a => a.category === 'shellfish');
  if (hasShellfish) {
    crossReactions.push({
      type: 'shellfish',
      message: 'If allergic to one type of shellfish, you may be allergic to others. Avoid all shellfish unless cleared by an allergist.',
      relatedAllergens: ['shrimp', 'crab', 'lobster', 'mussels', 'clams'],
    });
  }

  // Fish cross-reactivity
  const hasFish = analyzedAllergies.some(a => a.category === 'fish');
  if (hasFish) {
    crossReactions.push({
      type: 'fish',
      message: 'Fish allergies can cross-react between species. Consult an allergist before trying new fish.',
    });
  }

  return crossReactions;
};

/**
 * Identify hidden sources of allergens
 */
const identifyHiddenSources = (analyzedAllergies) => {
  const hiddenSources = [];

  analyzedAllergies.forEach(allergy => {
    const category = allergy.category;
    const sources = [];

    if (category === 'tree_nuts_peanuts') {
      sources.push(
        'Baked goods (cookies, cakes, pastries)',
        'Candy and chocolate',
        'Cereals and granola',
        'Nut butters and spreads',
        'Salad dressings',
        'Asian cuisine (often uses peanut oil)',
        'Marzipan and nougat',
        'Some vegetarian meat substitutes'
      );
    } else if (category === 'dairy') {
      sources.push(
        'Baked goods',
        'Processed meats (may contain casein)',
        'Non-dairy creamers (may contain casein)',
        'Some medications and supplements',
        'Caramel coloring',
        'Lactose in some medications'
      );
    } else if (category === 'gluten') {
      sources.push(
        'Soy sauce',
        'Beer and malt beverages',
        'Processed foods (check labels)',
        'Some medications',
        'Soups and sauces (may use flour as thickener)',
        'Imitation seafood'
      );
    } else if (category === 'shellfish') {
      sources.push(
        'Fish stock and bouillon',
        'Surimi (imitation crab)',
        'Some Asian sauces',
        'Caesar salad dressing (may contain anchovies)',
        'Worcestershire sauce'
      );
    } else if (category === 'eggs') {
      sources.push(
        'Mayonnaise',
        'Marshmallows',
        'Pasta (some types)',
        'Foam on cocktails',
        'Some vaccines (consult doctor)',
        'Baked goods'
      );
    } else if (category === 'soy') {
      sources.push(
        'Vegetable oil (may contain soy)',
        'Lecithin (often from soy)',
        'Tofu and tempeh',
        'Soy sauce',
        'Many processed foods',
        'Some Asian cuisines'
      );
    }

    if (sources.length > 0) {
      hiddenSources.push({
        allergen: allergy.label,
        category,
        sources,
      });
    }
  });

  return hiddenSources;
};

/**
 * Generate safe alternatives for allergens
 */
const generateSafeAlternatives = (analyzedAllergies, dietaryRestrictions) => {
  const alternatives = [];

  analyzedAllergies.forEach(allergy => {
    const category = allergy.category;
    const alt = {
      allergen: allergy.label,
      category,
      alternatives: [],
    };

    if (category === 'dairy') {
      alt.alternatives = [
        'Almond milk, coconut milk, oat milk, rice milk',
        'Dairy-free cheese alternatives',
        'Coconut yogurt or soy yogurt',
        'Plant-based butter (margarine, coconut oil)',
      ];
    } else if (category === 'gluten') {
      alt.alternatives = [
        'Gluten-free grains: rice, quinoa, buckwheat, millet, amaranth',
        'Gluten-free flours: almond flour, coconut flour, rice flour',
        'Gluten-free pasta and bread',
      ];
    } else if (category === 'tree_nuts_peanuts') {
      alt.alternatives = [
        'Sunflower seed butter, pumpkin seed butter',
        'Sesame seeds and tahini (if not allergic)',
        'Coconut (if not allergic)',
        'Seeds: pumpkin, sunflower, chia, flax',
      ];
    } else if (category === 'eggs') {
      alt.alternatives = [
        'Flax eggs (1 tbsp ground flax + 3 tbsp water)',
        'Applesauce or mashed banana in baking',
        'Commercial egg replacers',
        'Aquafaba (chickpea water) for meringues',
      ];
    } else if (category === 'soy') {
      alt.alternatives = [
        'Other legumes: chickpeas, lentils, black beans',
        'Coconut aminos instead of soy sauce',
        'Other plant-based proteins',
      ];
    }

    if (alt.alternatives.length > 0) {
      alternatives.push(alt);
    }
  });

  return alternatives;
};

/**
 * Generate emergency information and action plan
 */
const generateEmergencyInfo = (analyzedAllergies, riskLevel) => {
  const hasHighRisk = riskLevel === 'high' || analyzedAllergies.some(a => a.severity === 'high');

  return {
    hasActionPlan: hasHighRisk,
    actionPlan: hasHighRisk ? {
      steps: [
        'If you experience symptoms (hives, swelling, difficulty breathing, dizziness), use epinephrine auto-injector immediately if prescribed',
        'Call emergency services (911) immediately',
        'Lie down with legs elevated if feeling faint',
        'Do not drive yourself to the hospital',
        'Inform medical personnel about your allergies',
      ],
      medications: 'Carry epinephrine auto-injector at all times if prescribed',
      emergencyContacts: 'Keep emergency contact information easily accessible',
    } : null,
    riskLevel,
  };
};

/**
 * Generate alert settings based on risk level
 */
const generateAlertSettings = (riskLevel, analyzedAllergies) => {
  return {
    enabled: true,
    severity: riskLevel === 'high' ? 'all' : riskLevel === 'medium' ? 'high_medium' : 'high',
    soundEnabled: riskLevel === 'high',
    vibrationEnabled: true,
    showNotifications: true,
    scanBeforeEating: riskLevel === 'high',
  };
};

/**
 * Generate dietary recommendations based on allergies
 */
const generateDietaryRecommendations = (analyzedAllergies, diabetesType, dietaryRestrictions) => {
  const recommendations = [];

  // General recommendations
  recommendations.push({
    type: 'label_reading',
    priority: 'high',
    message: 'Always read food labels carefully. Look for allergen warnings and ingredient lists.',
  });

  recommendations.push({
    type: 'restaurant_communication',
    priority: 'high',
    message: 'Always inform restaurant staff about your allergies. Ask about ingredients and preparation methods.',
  });

  // Diabetes-specific recommendations with allergies
  if (diabetesType && analyzedAllergies.length > 0) {
    recommendations.push({
      type: 'diabetes_allergy_management',
      priority: 'high',
      message: 'Managing both diabetes and allergies requires careful meal planning. Focus on whole, unprocessed foods when possible.',
    });
  }

  // Specific recommendations based on allergy categories
  const hasNutAllergy = analyzedAllergies.some(a => a.category === 'tree_nuts_peanuts');
  if (hasNutAllergy) {
    recommendations.push({
      type: 'nut_allergy',
      priority: 'high',
      message: 'Be cautious with baked goods, chocolates, and Asian cuisines. Many processed foods may contain traces of nuts.',
    });
  }

  const hasDairyAllergy = analyzedAllergies.some(a => a.category === 'dairy');
  if (hasDairyAllergy) {
    recommendations.push({
      type: 'dairy_allergy',
      priority: 'medium',
      message: 'Check non-dairy products as they may still contain casein or whey. Look for "dairy-free" labels, not just "lactose-free".',
    });
  }

  return recommendations;
};




