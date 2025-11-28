/**
 * Language Detection Service (FR-3.1.3)
 * Automatically detects the user's selected language during a chat session
 */

/**
 * Detect language from text input
 * @param {string} text - User input text
 * @returns {string} - Detected language code ('ar' for Arabic, 'en' for English)
 */
export const detectLanguage = (text) => {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }

  // Arabic Unicode range: U+0600 to U+06FF
  const arabicPattern = /[\u0600-\u06FF]/;
  
  // Check if text contains Arabic characters
  if (arabicPattern.test(text)) {
    return 'ar';
  }
  
  // Default to English
  return 'en';
};

/**
 * Get language name from code
 * @param {string} langCode - Language code ('ar' or 'en')
 * @returns {string} - Language name
 */
export const getLanguageName = (langCode) => {
  const languages = {
    'ar': 'Arabic',
    'en': 'English',
  };
  return languages[langCode] || 'English';
};

/**
 * Check if text is Arabic
 * @param {string} text - Text to check
 * @returns {boolean} - True if Arabic
 */
export const isArabic = (text) => {
  return detectLanguage(text) === 'ar';
};

/**
 * Check if text is English
 * @param {string} text - Text to check
 * @returns {boolean} - True if English
 */
export const isEnglish = (text) => {
  return detectLanguage(text) === 'en';
};



