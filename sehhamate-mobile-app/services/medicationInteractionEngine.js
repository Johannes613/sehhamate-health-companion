/**
 * Medication Interaction Analysis Engine
 * Detects potential food-drug and allergy-drug interactions
 * Implements FR-2.3.3, FR-2.3.4
 */

/**
 * Analyze medication for interactions with user's dietary data and allergies
 * @param {Object} medicationData - Medication information from scanner
 * @param {Object} userProfile - User profile including allergies and dietary data
 * @returns {Object} Interaction analysis results
 */
export const analyzeMedicationInteractions = (medicationData, userProfile) => {
  const interactions = {
    foodDrugInteractions: [],
    allergyDrugInteractions: [],
    overallRisk: 'low',
    warnings: [],
    recommendations: [],
  };

  if (!medicationData || !medicationData.medication) {
    return interactions;
  }

  const medicationName = (medicationData.medication || '').toLowerCase();
  const genericName = (medicationData.genericName || '').toLowerCase();
  const activeSubstance = (medicationData.activeSubstance || genericName || medicationName).toLowerCase();

  // Check food-drug interactions
  if (userProfile.dietaryRestrictions || userProfile.dietaryPreferences) {
    interactions.foodDrugInteractions = checkFoodDrugInteractions(
      activeSubstance,
      medicationName,
      userProfile.dietaryRestrictions || [],
      userProfile.dietaryPreferences || [],
      userProfile.diabetesType
    );
  }

  // Check allergy-drug interactions
  if (userProfile.allergyProfile && userProfile.allergyProfile.hasAllergies) {
    interactions.allergyDrugInteractions = checkAllergyDrugInteractions(
      activeSubstance,
      medicationName,
      userProfile.allergyProfile.allergies || []
    );
  }

  // Calculate overall risk
  interactions.overallRisk = calculateInteractionRisk(
    interactions.foodDrugInteractions,
    interactions.allergyDrugInteractions
  );

  // Generate warnings
  interactions.warnings = generateInteractionWarnings(interactions);
  
  // Generate recommendations
  interactions.recommendations = generateInteractionRecommendations(interactions);

  return interactions;
};

/**
 * Check for food-drug interactions
 */
const checkFoodDrugInteractions = (activeSubstance, medicationName, dietaryRestrictions, dietaryPreferences, diabetesType) => {
  const interactions = [];

  // Common food-drug interaction database
  const foodDrugInteractions = {
    // Warfarin interactions
    'warfarin': [
      {
        food: 'vitamin k',
        restriction: 'high_vitamin_k',
        severity: 'high',
        message: 'Warfarin interacts with Vitamin K. Maintain consistent intake of Vitamin K-rich foods (leafy greens, broccoli).',
        recommendation: 'Keep your intake of Vitamin K-rich foods consistent. Sudden changes can affect medication effectiveness.',
      },
      {
        food: 'alcohol',
        restriction: 'alcohol',
        severity: 'medium',
        message: 'Alcohol can increase the risk of bleeding when taking Warfarin.',
        recommendation: 'Limit or avoid alcohol consumption while on Warfarin.',
      },
    ],
    // MAOIs interactions
    'maoi': [
      {
        food: 'tyramine',
        restriction: 'high_tyramine',
        severity: 'high',
        message: 'MAOIs interact with tyramine-rich foods. Can cause dangerous blood pressure spikes.',
        recommendation: 'Avoid aged cheeses, cured meats, fermented foods, and certain alcoholic beverages.',
      },
    ],
    // Grapefruit interactions
    'grapefruit': [
      {
        food: 'grapefruit',
        restriction: 'grapefruit',
        severity: 'high',
        message: 'Grapefruit can interact with many medications, increasing their effects.',
        recommendation: 'Avoid grapefruit and grapefruit juice while taking this medication.',
      },
    ],
    // Diabetes medications
    'metformin': [
      {
        food: 'alcohol',
        restriction: 'alcohol',
        severity: 'high',
        message: 'Alcohol can increase the risk of lactic acidosis when taking Metformin.',
        recommendation: 'Avoid excessive alcohol consumption. Consult your doctor about safe alcohol limits.',
      },
    ],
    'insulin': [
      {
        food: 'carbohydrates',
        restriction: 'carb_management',
        severity: 'medium',
        message: 'Insulin requires careful carbohydrate management.',
        recommendation: 'Monitor blood glucose levels and adjust insulin based on carbohydrate intake.',
      },
    ],
  };

  // Check for interactions
  Object.keys(foodDrugInteractions).forEach(key => {
    if (activeSubstance.includes(key) || medicationName.includes(key)) {
      foodDrugInteractions[key].forEach(interaction => {
        // Check if user has relevant dietary restriction or preference
        const hasRelevantRestriction = dietaryRestrictions.some(r => 
          r.toLowerCase().includes(interaction.restriction) ||
          r.toLowerCase().includes(interaction.food)
        );

        // Check diabetes-specific interactions
        if (diabetesType && interaction.restriction === 'carb_management') {
          interactions.push({
            type: 'food_drug',
            medication: medicationName,
            food: interaction.food,
            severity: interaction.severity,
            message: interaction.message,
            recommendation: interaction.recommendation,
            category: 'diabetes_management',
          });
        } else if (hasRelevantRestriction || interaction.restriction === 'alcohol') {
          interactions.push({
            type: 'food_drug',
            medication: medicationName,
            food: interaction.food,
            severity: interaction.severity,
            message: interaction.message,
            recommendation: interaction.recommendation,
          });
        }
      });
    }
  });

  // Check for grapefruit interaction (common with many medications)
  const grapefruitInteractingDrugs = [
    'atorvastatin', 'simvastatin', 'lovastatin', 'felodipine', 'nifedipine',
    'cyclosporine', 'tacrolimus', 'buspirone', 'sertraline', 'carbamazepine'
  ];

  if (grapefruitInteractingDrugs.some(drug => activeSubstance.includes(drug) || medicationName.includes(drug))) {
    interactions.push({
      type: 'food_drug',
      medication: medicationName,
      food: 'grapefruit',
      severity: 'high',
      message: 'This medication interacts with grapefruit. Can increase medication levels in blood.',
      recommendation: 'Avoid grapefruit and grapefruit juice while taking this medication.',
    });
  }

  return interactions;
};

/**
 * Check for allergy-drug interactions
 */
const checkAllergyDrugInteractions = (activeSubstance, medicationName, userAllergies) => {
  const interactions = [];

  // Common allergy-drug interactions
  const allergyDrugInteractions = {
    // Penicillin and related antibiotics
    'penicillin': {
      allergens: ['penicillin', 'antibiotic'],
      severity: 'high',
      message: 'Penicillin allergy detected. This medication contains penicillin or related compounds.',
      recommendation: 'DO NOT TAKE. Inform your doctor immediately about your penicillin allergy.',
    },
    // Sulfa drugs
    'sulfa': {
      allergens: ['sulfa', 'sulfonamide'],
      severity: 'high',
      message: 'Sulfa allergy detected. This medication contains sulfonamides.',
      recommendation: 'DO NOT TAKE. Inform your doctor about your sulfa allergy.',
    },
    // Aspirin/NSAIDs
    'aspirin': {
      allergens: ['aspirin', 'nsaid', 'ibuprofen'],
      severity: 'high',
      message: 'Aspirin/NSAID allergy detected. This medication contains aspirin or NSAIDs.',
      recommendation: 'DO NOT TAKE. Use alternative pain relief medications.',
    },
    // Iodine contrast
    'iodine': {
      allergens: ['iodine', 'contrast'],
      severity: 'medium',
      message: 'Iodine allergy detected. This medication may contain iodine.',
      recommendation: 'Consult your doctor before taking. Alternative medications may be available.',
    },
  };

  // Check each user allergy
  userAllergies.forEach(userAllergy => {
    const allergyLabel = (userAllergy.label || '').toLowerCase();
    const allergyCategory = userAllergy.category || 'other';

    // Check for direct medication allergies
    Object.keys(allergyDrugInteractions).forEach(medKey => {
      const interaction = allergyDrugInteractions[medKey];
      
      if (interaction.allergens.some(allergen => allergyLabel.includes(allergen))) {
        // Check if medication contains the allergen
        if (activeSubstance.includes(medKey) || medicationName.includes(medKey)) {
          interactions.push({
            type: 'allergy_drug',
            medication: medicationName,
            allergen: userAllergy.label,
            severity: interaction.severity,
            message: interaction.message,
            recommendation: interaction.recommendation,
          });
        }
      }
    });

    // Check for cross-reactivity (e.g., penicillin and cephalosporins)
    if (allergyLabel.includes('penicillin')) {
      const cephalosporins = ['cef', 'cephalexin', 'ceftriaxone', 'cefuroxime'];
      if (cephalosporins.some(ceph => activeSubstance.includes(ceph) || medicationName.includes(ceph))) {
        interactions.push({
          type: 'allergy_drug',
          medication: medicationName,
          allergen: userAllergy.label,
          severity: 'medium',
          message: 'Penicillin allergy detected. Cephalosporins may cross-react with penicillin.',
          recommendation: 'Consult your doctor. Cephalosporins may cause allergic reactions in penicillin-allergic patients.',
        });
      }
    }
  });

  return interactions;
};

/**
 * Calculate overall interaction risk
 */
const calculateInteractionRisk = (foodDrugInteractions, allergyDrugInteractions) => {
  const allInteractions = [...foodDrugInteractions, ...allergyDrugInteractions];
  
  if (allInteractions.length === 0) {
    return 'low';
  }

  const hasHighRisk = allInteractions.some(i => i.severity === 'high');
  const hasMediumRisk = allInteractions.some(i => i.severity === 'medium');

  if (hasHighRisk) {
    return 'high';
  } else if (hasMediumRisk) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Generate interaction warnings
 */
const generateInteractionWarnings = (interactions) => {
  const warnings = [];

  // High risk warnings
  interactions.allergyDrugInteractions
    .filter(i => i.severity === 'high')
    .forEach(interaction => {
      warnings.push({
        type: 'allergy_drug',
        severity: 'high',
        title: '🚨 CRITICAL: Allergy-Drug Interaction',
        message: interaction.message,
        recommendation: interaction.recommendation,
      });
    });

  interactions.foodDrugInteractions
    .filter(i => i.severity === 'high')
    .forEach(interaction => {
      warnings.push({
        type: 'food_drug',
        severity: 'high',
        title: '⚠️ WARNING: Food-Drug Interaction',
        message: interaction.message,
        recommendation: interaction.recommendation,
      });
    });

  // Medium risk warnings
  [...interactions.allergyDrugInteractions, ...interactions.foodDrugInteractions]
    .filter(i => i.severity === 'medium')
    .forEach(interaction => {
      warnings.push({
        type: interaction.type,
        severity: 'medium',
        title: '⚠️ CAUTION: Potential Interaction',
        message: interaction.message,
        recommendation: interaction.recommendation,
      });
    });

  return warnings;
};

/**
 * Generate interaction recommendations
 */
const generateInteractionRecommendations = (interactions) => {
  const recommendations = [];

  if (interactions.overallRisk === 'high') {
    recommendations.push({
      priority: 'high',
      message: 'DO NOT TAKE this medication without consulting your healthcare provider immediately.',
    });
  } else if (interactions.overallRisk === 'medium') {
    recommendations.push({
      priority: 'medium',
      message: 'Consult your healthcare provider before taking this medication.',
    });
    recommendations.push({
      priority: 'medium',
      message: 'Review the interactions and follow dietary recommendations carefully.',
    });
  } else {
    recommendations.push({
      priority: 'low',
      message: 'No significant interactions detected. Continue to monitor for any adverse effects.',
    });
  }

  return recommendations;
};




