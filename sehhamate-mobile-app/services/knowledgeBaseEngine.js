/**
 * Knowledge Base Engine (FR-3.2)
 * Processes user queries about food safety for diabetics and allergen content
 */

/**
 * Process health-related queries (FR-3.2.1, FR-3.2.2)
 * @param {string} query - User query
 * @param {string} language - Language code ('ar' or 'en')
 * @param {object} userProfile - User profile data
 * @returns {object} - Response object with answer and metadata
 */
export const processHealthQuery = (query, language = 'en', userProfile = {}) => {
  const queryLower = query.toLowerCase();
  
  // Diabetes-related queries (FR-3.2.1)
  const diabetesKeywords = {
    en: ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'insulin', 'carb', 'carbohydrate', 'sugar', 'glycemic'],
    ar: ['سكري', 'سكر', 'جلوكوز', 'أنسولين', 'كربوهيدرات', 'مؤشر جلايسيمي'],
  };
  
  // Allergen-related queries (FR-3.2.2)
  const allergenKeywords = {
    en: ['allergy', 'allergen', 'nuts', 'peanuts', 'gluten', 'dairy', 'milk', 'shellfish', 'allergic'],
    ar: ['حساسية', 'مكسرات', 'فول سوداني', 'جلوتين', 'ألبان', 'حليب', 'مأكولات بحرية'],
  };
  
  const keywords = language === 'ar' ? {
    diabetes: diabetesKeywords.ar,
    allergen: allergenKeywords.ar,
  } : {
    diabetes: diabetesKeywords.en,
    allergen: allergenKeywords.en,
  };
  
  // Check query type
  const isDiabetesQuery = keywords.diabetes.some(keyword => queryLower.includes(keyword));
  const isAllergenQuery = keywords.allergen.some(keyword => queryLower.includes(keyword));
  
  // Get personalized response based on query type
  if (isDiabetesQuery) {
    return getDiabetesResponse(query, language, userProfile);
  } else if (isAllergenQuery) {
    return getAllergenResponse(query, language, userProfile);
  } else {
    return getGeneralResponse(query, language);
  }
};

/**
 * Get diabetes-related response (FR-3.2.1)
 */
const getDiabetesResponse = (query, language, userProfile) => {
  const diabetesType = (userProfile?.diabetesType && typeof userProfile.diabetesType === 'string') 
    ? userProfile.diabetesType 
    : '';
  const responses = {
    en: {
      general: "For diabetes management, it's important to monitor carbohydrate intake, maintain stable blood sugar levels, and follow a balanced diet. Focus on whole grains, lean proteins, and plenty of vegetables.",
      type1: "For Type 1 diabetes, coordinate your meals with insulin timing. Count carbohydrates carefully and maintain consistent meal times. Always carry fast-acting glucose for emergencies.",
      type2: "For Type 2 diabetes, focus on portion control, low-glycemic foods, and regular physical activity. Monitor your blood sugar regularly and work with your healthcare team.",
      prediabetes: "For prediabetes, lifestyle changes can prevent progression to Type 2 diabetes. Focus on whole foods, reduce added sugars, and increase physical activity.",
    },
    ar: {
      general: "لإدارة مرض السكري، من المهم مراقبة تناول الكربوهيدرات والحفاظ على مستويات السكر في الدم مستقرة واتباع نظام غذائي متوازن. ركز على الحبوب الكاملة والبروتينات الخالية من الدهون والكثير من الخضروات.",
      type1: "للسكري من النوع الأول، قم بتنسيق وجباتك مع توقيت الأنسولين. احسب الكربوهيدرات بعناية وحافظ على أوقات الوجبات ثابتة. احمل دائماً جلوكوز سريع المفعول للطوارئ.",
      type2: "للسكري من النوع الثاني، ركز على التحكم في الحصص والأطعمة منخفضة المؤشر الجلايسيمي والنشاط البدني المنتظم. راقب سكر الدم بانتظام واعمل مع فريق الرعاية الصحية الخاص بك.",
      prediabetes: "لمقدمات السكري، يمكن أن تمنع تغييرات نمط الحياة التقدم إلى السكري من النوع الثاني. ركز على الأطعمة الكاملة وقلل من السكريات المضافة وزد النشاط البدني.",
    },
  };
  
  const langResponses = responses[language] || responses.en;
  
  let response = langResponses.general;
  if (diabetesType) {
    const diabetesTypeLower = diabetesType.toLowerCase();
    if (diabetesTypeLower.includes('type 1') || diabetesTypeLower.includes('نوع 1')) {
      response = langResponses.type1;
    } else if (diabetesTypeLower.includes('type 2') || diabetesTypeLower.includes('نوع 2')) {
      response = langResponses.type2;
    } else if (diabetesTypeLower.includes('prediabetes') || diabetesTypeLower.includes('مقدمات')) {
      response = langResponses.prediabetes;
    }
  }
  
  return {
    answer: response,
    type: 'diabetes',
    language,
    personalized: !!diabetesType,
  };
};

/**
 * Get allergen-related response (FR-3.2.2)
 */
const getAllergenResponse = (query, language, userProfile) => {
  const allergies = userProfile.allergies || [];
  const allergyLabels = allergies.map(a => a.label || a).join(', ');
  
  const responses = {
    en: {
      general: "When checking for allergens, always read food labels carefully. Look for common allergens like nuts, dairy, gluten, shellfish, and eggs. When in doubt, avoid the food or contact the manufacturer.",
      withAllergies: `Based on your profile, you have allergies to: ${allergyLabels}. Always check ingredient lists carefully and avoid foods that may contain these allergens. Be cautious with processed foods and cross-contamination.`,
    },
    ar: {
      general: "عند التحقق من مسببات الحساسية، اقرأ ملصقات الطعام بعناية دائماً. ابحث عن مسببات الحساسية الشائعة مثل المكسرات والألبان والجلوتين والمأكولات البحرية والبيض. عند الشك، تجنب الطعام أو اتصل بالشركة المصنعة.",
      withAllergies: `بناءً على ملفك الشخصي، لديك حساسية من: ${allergyLabels}. تحقق دائماً من قوائم المكونات بعناية وتجنب الأطعمة التي قد تحتوي على هذه المواد المسببة للحساسية. كن حذراً مع الأطعمة المصنعة والتلوث المتبادل.`,
    },
  };
  
  const langResponses = responses[language] || responses.en;
  const response = allergies.length > 0 ? langResponses.withAllergies : langResponses.general;
  
  return {
    answer: response,
    type: 'allergen',
    language,
    personalized: allergies.length > 0,
  };
};

/**
 * Get general health response
 */
const getGeneralResponse = (query, language) => {
  const responses = {
    en: "I'm here to help with your health questions! I can assist with diabetes management, allergen information, lab result interpretation, and personalized dietary recommendations. What would you like to know?",
    ar: "أنا هنا لمساعدتك في أسئلتك الصحية! يمكنني المساعدة في إدارة مرض السكري ومعلومات مسببات الحساسية وتفسير نتائج المختبر والتوصيات الغذائية الشخصية. ماذا تريد أن تعرف؟",
  };
  
  return {
    answer: responses[language] || responses.en,
    type: 'general',
    language,
    personalized: false,
  };
};



