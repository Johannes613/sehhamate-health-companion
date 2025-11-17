/**
 * Medical Interpretation Module (FR-3.3)
 * Helps users interpret uploaded lab results and explains medical terms
 */

/**
 * Interpret lab results (FR-3.3.1, FR-3.3.2)
 * @param {object} labResult - Lab result data
 * @param {string} language - Language code ('ar' or 'en')
 * @returns {object} - Interpreted results with explanations
 */
export const interpretLabResults = (labResult, language = 'en') => {
  if (!labResult || !labResult.tests) {
    return {
      summary: language === 'ar' 
        ? 'لا توجد نتائج مختبر متاحة للتفسير.'
        : 'No lab results available for interpretation.',
      tests: [],
      language,
    };
  }
  
  const interpretations = labResult.tests.map(test => {
    return interpretTest(test, language);
  });
  
  return {
    summary: generateSummary(interpretations, language),
    tests: interpretations,
    language,
    formattedAt: new Date().toISOString(),
  };
};

/**
 * Interpret individual test result
 */
const interpretTest = (test, language) => {
  const { name, value, unit, referenceRange, status } = test;
  
  // Common lab tests and their explanations
  const testExplanations = {
    en: {
      'HbA1c': {
        name: 'Hemoglobin A1c',
        explanation: 'Measures average blood sugar over the past 2-3 months. Lower values indicate better diabetes control.',
        normal: '4.0-5.6%',
        interpretation: getHbA1cInterpretation(value, language),
      },
      'Fasting Glucose': {
        name: 'Fasting Blood Glucose',
        explanation: 'Measures blood sugar after fasting. Used to diagnose and monitor diabetes.',
        normal: '70-100 mg/dL',
        interpretation: getGlucoseInterpretation(value, language),
      },
      'Cholesterol': {
        name: 'Total Cholesterol',
        explanation: 'Measures total cholesterol in blood. High levels increase heart disease risk.',
        normal: '<200 mg/dL',
        interpretation: getCholesterolInterpretation(value, language),
      },
      'HDL': {
        name: 'HDL Cholesterol',
        explanation: 'Known as "good cholesterol". Higher levels are better for heart health.',
        normal: '>40 mg/dL (men), >50 mg/dL (women)',
        interpretation: getHDLInterpretation(value, language),
      },
      'LDL': {
        name: 'LDL Cholesterol',
        explanation: 'Known as "bad cholesterol". Lower levels reduce heart disease risk.',
        normal: '<100 mg/dL',
        interpretation: getLDLInterpretation(value, language),
      },
      'Triglycerides': {
        name: 'Triglycerides',
        explanation: 'Type of fat in blood. High levels increase heart disease risk.',
        normal: '<150 mg/dL',
        interpretation: getTriglyceridesInterpretation(value, language),
      },
    },
    ar: {
      'HbA1c': {
        name: 'الهيموجلوبين السكري',
        explanation: 'يقيس متوسط السكر في الدم خلال آخر 2-3 أشهر. القيم الأقل تشير إلى تحكم أفضل في مرض السكري.',
        normal: '4.0-5.6%',
        interpretation: getHbA1cInterpretation(value, 'ar'),
      },
      'Fasting Glucose': {
        name: 'سكر الدم الصائم',
        explanation: 'يقيس السكر في الدم بعد الصيام. يستخدم لتشخيص ومراقبة مرض السكري.',
        normal: '70-100 مجم/ديسيلتر',
        interpretation: getGlucoseInterpretation(value, 'ar'),
      },
      'Cholesterol': {
        name: 'الكوليسترول الكلي',
        explanation: 'يقيس إجمالي الكوليسترول في الدم. المستويات العالية تزيد من خطر أمراض القلب.',
        normal: '<200 مجم/ديسيلتر',
        interpretation: getCholesterolInterpretation(value, 'ar'),
      },
      'HDL': {
        name: 'الكوليسترول الحميد',
        explanation: 'المعروف باسم "الكوليسترول الجيد". المستويات الأعلى أفضل لصحة القلب.',
        normal: '>40 مجم/ديسيلتر (رجال)، >50 مجم/ديسيلتر (نساء)',
        interpretation: getHDLInterpretation(value, 'ar'),
      },
      'LDL': {
        name: 'الكوليسترول الضار',
        explanation: 'المعروف باسم "الكوليسترول السيئ". المستويات الأقل تقلل من خطر أمراض القلب.',
        normal: '<100 مجم/ديسيلتر',
        interpretation: getLDLInterpretation(value, 'ar'),
      },
      'Triglycerides': {
        name: 'الدهون الثلاثية',
        explanation: 'نوع من الدهون في الدم. المستويات العالية تزيد من خطر أمراض القلب.',
        normal: '<150 مجم/ديسيلتر',
        interpretation: getTriglyceridesInterpretation(value, 'ar'),
      },
    },
  };
  
  const explanations = testExplanations[language] || testExplanations.en;
  const testKey = Object.keys(explanations).find(key => 
    name.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(name.toLowerCase())
  );
  
  const explanation = testKey ? explanations[testKey] : {
    name: name,
    explanation: language === 'ar' 
      ? 'هذا اختبار طبي. استشر طبيبك للحصول على تفسير دقيق.'
      : 'This is a medical test. Consult your doctor for accurate interpretation.',
    normal: referenceRange || 'N/A',
    interpretation: status || 'Normal',
  };
  
  return {
    testName: explanation.name,
    value: `${value} ${unit || ''}`,
    referenceRange: explanation.normal,
    status: status || 'Normal',
    explanation: explanation.explanation,
    interpretation: explanation.interpretation,
    simplified: simplifyMedicalTerm(name, language),
  };
};

/**
 * Generate summary of all test results
 */
const generateSummary = (interpretations, language) => {
  const abnormalCount = interpretations.filter(t => 
    t.status && (t.status.toLowerCase().includes('high') || 
                 t.status.toLowerCase().includes('low') ||
                 t.status.toLowerCase().includes('مرتفع') ||
                 t.status.toLowerCase().includes('منخفض'))
  ).length;
  
  if (language === 'ar') {
    if (abnormalCount === 0) {
      return 'جميع نتائج الاختبارات ضمن النطاق الطبيعي. استمر في اتباع نمط حياة صحي.';
    } else {
      return `يوجد ${abnormalCount} نتيجة غير طبيعية. يُنصح بمراجعة طبيبك لمناقشة النتائج.`;
    }
  } else {
    if (abnormalCount === 0) {
      return 'All test results are within normal range. Continue maintaining a healthy lifestyle.';
    } else {
      return `There are ${abnormalCount} abnormal results. It is recommended to consult your doctor to discuss the results.`;
    }
  }
};

/**
 * Simplify medical terms (FR-3.3.2)
 */
const simplifyMedicalTerm = (term, language) => {
  const simplifications = {
    en: {
      'HbA1c': 'Average blood sugar over 2-3 months',
      'Hemoglobin A1c': 'Average blood sugar over 2-3 months',
      'Glucose': 'Blood sugar',
      'Cholesterol': 'Fat in blood',
      'HDL': 'Good cholesterol',
      'LDL': 'Bad cholesterol',
      'Triglycerides': 'Blood fats',
    },
    ar: {
      'HbA1c': 'متوسط السكر في الدم خلال 2-3 أشهر',
      'Hemoglobin A1c': 'متوسط السكر في الدم خلال 2-3 أشهر',
      'Glucose': 'سكر الدم',
      'Cholesterol': 'دهون في الدم',
      'HDL': 'الكوليسترول الجيد',
      'LDL': 'الكوليسترول السيئ',
      'Triglycerides': 'دهون الدم',
    },
  };
  
  const simpls = simplifications[language] || simplifications.en;
  return simpls[term] || term;
};

// Interpretation helper functions
const getHbA1cInterpretation = (value, language) => {
  const numValue = parseFloat(value);
  if (language === 'ar') {
    if (numValue < 5.7) return 'طبيعي - لا يوجد دليل على مرض السكري';
    if (numValue < 6.5) return 'مقدمات السكري - خطر متزايد للإصابة بمرض السكري';
    return 'مرض السكري - استشر طبيبك للعلاج';
  } else {
    if (numValue < 5.7) return 'Normal - No evidence of diabetes';
    if (numValue < 6.5) return 'Prediabetes - Increased risk of diabetes';
    return 'Diabetes - Consult your doctor for treatment';
  }
};

const getGlucoseInterpretation = (value, language) => {
  const numValue = parseFloat(value);
  if (language === 'ar') {
    if (numValue < 100) return 'طبيعي';
    if (numValue < 126) return 'مقدمات السكري';
    return 'مرض السكري - استشر طبيبك';
  } else {
    if (numValue < 100) return 'Normal';
    if (numValue < 126) return 'Prediabetes';
    return 'Diabetes - Consult your doctor';
  }
};

const getCholesterolInterpretation = (value, language) => {
  const numValue = parseFloat(value);
  if (language === 'ar') {
    if (numValue < 200) return 'مثالي';
    if (numValue < 240) return 'مرتفع قليلاً';
    return 'مرتفع - استشر طبيبك';
  } else {
    if (numValue < 200) return 'Optimal';
    if (numValue < 240) return 'Borderline high';
    return 'High - Consult your doctor';
  }
};

const getHDLInterpretation = (value, language) => {
  const numValue = parseFloat(value);
  if (language === 'ar') {
    if (numValue >= 60) return 'ممتاز - يحمي من أمراض القلب';
    if (numValue >= 40) return 'طبيعي';
    return 'منخفض - خطر متزايد لأمراض القلب';
  } else {
    if (numValue >= 60) return 'Excellent - Protects against heart disease';
    if (numValue >= 40) return 'Normal';
    return 'Low - Increased risk of heart disease';
  }
};

const getLDLInterpretation = (value, language) => {
  const numValue = parseFloat(value);
  if (language === 'ar') {
    if (numValue < 100) return 'مثالي';
    if (numValue < 130) return 'قريب من المثالي';
    if (numValue < 160) return 'مرتفع قليلاً';
    return 'مرتفع - استشر طبيبك';
  } else {
    if (numValue < 100) return 'Optimal';
    if (numValue < 130) return 'Near optimal';
    if (numValue < 160) return 'Borderline high';
    return 'High - Consult your doctor';
  }
};

const getTriglyceridesInterpretation = (value, language) => {
  const numValue = parseFloat(value);
  if (language === 'ar') {
    if (numValue < 150) return 'طبيعي';
    if (numValue < 200) return 'مرتفع قليلاً';
    return 'مرتفع - استشر طبيبك';
  } else {
    if (numValue < 150) return 'Normal';
    if (numValue < 200) return 'Borderline high';
    return 'High - Consult your doctor';
  }
};



