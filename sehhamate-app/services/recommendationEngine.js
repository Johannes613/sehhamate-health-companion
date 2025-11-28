/**
 * Recommendation Engine (FR-3.5)
 * Analyzes user profile to provide personalized recommendations
 */

/**
 * Generate personalized recommendations (FR-3.5.1, FR-3.5.2, FR-3.5.3)
 * @param {string} query - User query
 * @param {string} language - Language code
 * @param {object} userProfile - User profile data
 * @returns {object} - Personalized recommendations
 */
export const generatePersonalizedRecommendations = (query, language = 'en', userProfile = {}) => {
  const {
    diabetesType = '',
    allergies = [],
    dietaryRestrictions = [],
    dietaryPreferences = [],
    nutritionProfile = null,
    healthGoals = [],
  } = userProfile;
  
  // Analyze query context
  const queryLower = query.toLowerCase();
  const isMealQuery = queryLower.includes('meal') || queryLower.includes('food') || queryLower.includes('eat') ||
                      queryLower.includes('وجبة') || queryLower.includes('طعام') || queryLower.includes('أكل');
  const isExerciseQuery = queryLower.includes('exercise') || queryLower.includes('workout') || queryLower.includes('activity') ||
                          queryLower.includes('تمرين') || queryLower.includes('نشاط');
  const isNutritionQuery = queryLower.includes('nutrition') || queryLower.includes('calorie') || queryLower.includes('macro') ||
                           queryLower.includes('تغذية') || queryLower.includes('سعرات');
  
  let recommendations = [];
  
  // Meal recommendations (FR-3.5.1, FR-3.5.2, FR-3.5.3)
  if (isMealQuery) {
    recommendations = recommendations.concat(
      getMealRecommendations(diabetesType, allergies, dietaryRestrictions, dietaryPreferences, language)
    );
  }
  
  // Exercise recommendations
  if (isExerciseQuery) {
    recommendations = recommendations.concat(
      getExerciseRecommendations(diabetesType, language)
    );
  }
  
  // Nutrition recommendations
  if (isNutritionQuery && nutritionProfile) {
    recommendations = recommendations.concat(
      getNutritionRecommendations(nutritionProfile, language)
    );
  }
  
  // Health goals recommendations (FR-3.5.3)
  if (healthGoals && healthGoals.length > 0) {
    recommendations = recommendations.concat(
      getHealthGoalRecommendations(healthGoals, language)
    );
  }
  
  // If no specific recommendations, provide general personalized advice
  if (recommendations.length === 0) {
    recommendations = getGeneralPersonalizedAdvice(userProfile, language);
  }
  
  return {
    recommendations,
    personalized: true,
    basedOn: {
      diabetesType: !!diabetesType,
      allergies: allergies.length > 0,
      dietaryRestrictions: dietaryRestrictions.length > 0,
      healthGoals: healthGoals && healthGoals.length > 0,
    },
    language,
  };
};

/**
 * Get meal recommendations based on diabetes type and allergies (FR-3.5.1, FR-3.5.2)
 */
const getMealRecommendations = (diabetesType, allergies, dietaryRestrictions, dietaryPreferences, language) => {
  const recommendations = [];
  
  // Diabetes-specific recommendations (FR-3.5.1)
  if (diabetesType && typeof diabetesType === 'string') {
    const diabetesRecs = {
      en: {
        type1: "For Type 1 diabetes, coordinate meals with insulin. Include balanced carbs, proteins, and fats. Consider: grilled chicken with quinoa and vegetables, or salmon with sweet potato and broccoli.",
        type2: "For Type 2 diabetes, focus on low-glycemic foods. Try: Mediterranean-style meals with fish, whole grains, and plenty of vegetables. Avoid processed foods and added sugars.",
        prediabetes: "For prediabetes, emphasize whole foods and portion control. Consider: lean proteins, whole grains, and colorful vegetables. Limit refined carbs and sugars.",
      },
      ar: {
        type1: "للسكري من النوع الأول، قم بتنسيق الوجبات مع الأنسولين. اشمل الكربوهيدرات والبروتينات والدهون المتوازنة. فكر في: دجاج مشوي مع الكينوا والخضروات، أو سمك السلمون مع البطاطا الحلوة والبروكلي.",
        type2: "للسكري من النوع الثاني، ركز على الأطعمة منخفضة المؤشر الجلايسيمي. جرب: وجبات على الطريقة المتوسطية مع السمك والحبوب الكاملة والكثير من الخضروات. تجنب الأطعمة المصنعة والسكريات المضافة.",
        prediabetes: "لمقدمات السكري، ركز على الأطعمة الكاملة والتحكم في الحصص. فكر في: البروتينات الخالية من الدهون والحبوب الكاملة والخضروات الملونة. قلل من الكربوهيدرات المكررة والسكريات.",
      },
    };
    
    const langRecs = diabetesRecs[language] || diabetesRecs.en;
    const diabetesTypeLower = diabetesType.toLowerCase();
    if (diabetesTypeLower.includes('type 1') || diabetesTypeLower.includes('نوع 1')) {
      recommendations.push(langRecs.type1);
    } else if (diabetesTypeLower.includes('type 2') || diabetesTypeLower.includes('نوع 2')) {
      recommendations.push(langRecs.type2);
    } else if (diabetesTypeLower.includes('prediabetes') || diabetesTypeLower.includes('مقدمات')) {
      recommendations.push(langRecs.prediabetes);
    }
  }
  
  // Allergy-specific recommendations (FR-3.5.2)
  if (allergies && allergies.length > 0) {
    const allergyLabels = allergies.map(a => a.label || a).join(', ');
    const allergyRecs = {
      en: `Important: You have allergies to ${allergyLabels}. Always check ingredient labels carefully. Consider allergen-free alternatives and be cautious with cross-contamination.`,
      ar: `مهم: لديك حساسية من ${allergyLabels}. تحقق دائماً من ملصقات المكونات بعناية. فكر في البدائل الخالية من مسببات الحساسية وكن حذراً مع التلوث المتبادل.`,
    };
    recommendations.push(allergyRecs[language] || allergyRecs.en);
  }
  
  // Dietary preferences recommendations
  if (dietaryPreferences && dietaryPreferences.length > 0) {
    const prefs = dietaryPreferences.join(', ');
    const prefRecs = {
      en: `Based on your preferences (${prefs}), focus on meals that align with your dietary style while managing your health needs.`,
      ar: `بناءً على تفضيلاتك (${prefs})، ركز على الوجبات التي تتماشى مع نمطك الغذائي مع إدارة احتياجاتك الصحية.`,
    };
    recommendations.push(prefRecs[language] || prefRecs.en);
  }
  
  return recommendations;
};

/**
 * Get exercise recommendations
 */
const getExerciseRecommendations = (diabetesType, language) => {
  const recs = {
    en: {
      general: "Regular exercise helps manage blood sugar. Aim for 150 minutes of moderate activity per week, such as brisk walking, cycling, or swimming.",
      withDiabetes: "For diabetes management, combine aerobic exercise (walking, swimming) with strength training. Monitor blood sugar before and after exercise.",
    },
    ar: {
      general: "التمرين المنتظم يساعد في إدارة سكر الدم. استهدف 150 دقيقة من النشاط المعتدل أسبوعياً، مثل المشي السريع أو ركوب الدراجات أو السباحة.",
      withDiabetes: "لإدارة مرض السكري، اجمع بين التمارين الهوائية (المشي، السباحة) وتمارين القوة. راقب سكر الدم قبل وبعد التمرين.",
    },
  };
  
  const langRecs = recs[language] || recs.en;
  return diabetesType ? [langRecs.withDiabetes] : [langRecs.general];
};

/**
 * Get nutrition recommendations
 */
const getNutritionRecommendations = (nutritionProfile, language) => {
  if (!nutritionProfile) return [];
  
  const { calories, macronutrients } = nutritionProfile;
  const recs = {
    en: `Based on your profile, aim for approximately ${calories} calories per day. Target: ${macronutrients?.protein || 0}g protein, ${macronutrients?.carbohydrates || 0}g carbs, ${macronutrients?.fat || 0}g fat.`,
    ar: `بناءً على ملفك الشخصي، استهدف حوالي ${calories} سعرة حرارية يومياً. الهدف: ${macronutrients?.protein || 0} جم بروتين، ${macronutrients?.carbohydrates || 0} جم كربوهيدرات، ${macronutrients?.fat || 0} جم دهون.`,
  };
  
  return [recs[language] || recs.en];
};

/**
 * Get health goal recommendations (FR-3.5.3)
 */
const getHealthGoalRecommendations = (healthGoals, language) => {
  const recs = {
    en: `To achieve your health goals, maintain consistency in your diet and exercise routine. Track your progress regularly and adjust as needed.`,
    ar: `لتحقيق أهدافك الصحية، حافظ على الاتساق في نظامك الغذائي وروتين التمارين. تتبع تقدمك بانتظام واضبط حسب الحاجة.`,
  };
  
  return [recs[language] || recs.en];
};

/**
 * Get general personalized advice
 */
const getGeneralPersonalizedAdvice = (userProfile, language) => {
  const { diabetesType, allergies } = userProfile;
  
  const recs = {
    en: "Based on your health profile, I recommend maintaining a balanced diet, regular exercise, and consistent monitoring. Always consult with your healthcare provider for personalized medical advice.",
    ar: "بناءً على ملفك الصحي الشخصي، أنصح بالحفاظ على نظام غذائي متوازن وتمرين منتظم ومراقبة مستمرة. استشر دائماً مقدم الرعاية الصحية الخاص بك للحصول على نصيحة طبية شخصية.",
  };
  
  return [recs[language] || recs.en];
};



