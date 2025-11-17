/**
 * OpenAI API Service
 * Integrates with OpenAI GPT for chatbot responses
 * 
 * Using the same implementation as the working HTML test
 */

// OpenAI API Configuration - API key should be set via environment variable
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_MODEL = 'gpt-4.1-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Log API key on module load
console.log('🔑 OPENAI SERVICE LOADED');
console.log('🔑 API Key configured:', !!OPENAI_API_KEY);
console.log('🔑 Model:', OPENAI_MODEL);

/**
 * Generate response using OpenAI API
 * @param {string} prompt - User message/prompt
 * @param {string} language - Language code ('ar' or 'en')
 * @param {object} userProfile - User profile data for personalization
 * @param {array} conversationHistory - Previous messages for context
 * @returns {Promise<object>} - Response object with text and metadata
 */
export const generateGeminiResponse = async (prompt, language = 'en', userProfile = {}, conversationHistory = []) => {
  // Check if API key is configured
  if (!OPENAI_API_KEY || OPENAI_API_KEY === '' || OPENAI_API_KEY === 'undefined') {
    console.error('[OPENAI] ❌ ERROR: OpenAI API key not found or invalid!');
    return getFallbackResponse(prompt, language, userProfile);
  }

  try {
    // Build system context from user profile
    const systemContext = buildSystemContext(userProfile, language);
    
    // Build messages array for OpenAI API - following the exact same structure as the HTML test
    const messages = [];
    
    // Add system message with context if available
    if (systemContext && systemContext.trim()) {
      messages.push({
        role: 'system',
        content: systemContext,
      });
    }
    
    // Add conversation history (last 6 messages for context)
    conversationHistory.slice(-6).forEach(msg => {
      messages.push({
        role: msg.sender === 'bot' || msg.sender === 'model' ? 'assistant' : 'user',
        content: msg.text,
      });
    });
    
    // Add current user prompt
    messages.push({
      role: 'user',
      content: prompt,
    });
    
    // Prepare the payload - EXACT same structure as the working HTML test
    const payload = {
      model: OPENAI_MODEL,
      messages: messages,
    };
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorBody = await response.json();
      const errorMessage = errorBody.error?.message || 'Unknown error';
      console.error('[OPENAI] ❌ API Error:', errorMessage);
      throw new Error(`OpenAI API Error: ${errorMessage}`);
    }
    
    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content || 
      (language === 'ar' 
        ? 'عذراً، لم أتمكن من معالجة ذلك. يرجى المحاولة مرة أخرى.'
        : 'Sorry, I couldn\'t process that. Please try again.');
    
    return {
      text: responseText.trim(),
      language,
      source: 'openai',
      success: true,
    };
  } catch (error) {
    console.error('[OPENAI] ❌ Error:', error.message);
    // Return fallback response
    return getFallbackResponse(prompt, language, userProfile);
  }
};

/**
 * Build system context from user profile
 */
const buildSystemContext = (userProfile, language) => {
  const parts = [];
  
  if (language === 'ar') {
    parts.push('أنت مساعد صحي ذكي متخصص في إدارة مرض السكري، معلومات الحساسية، تفسير نتائج المختبرات، والتوصيات الغذائية الشخصية.');
    
    if (userProfile.diabetesType) {
      parts.push(`المستخدم لديه: ${userProfile.diabetesType}`);
    }
    
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      const allergiesList = userProfile.allergies.map(a => a.label || a).join(', ');
      parts.push(`الحساسيات: ${allergiesList}`);
    }
    
    if (userProfile.dietaryRestrictions && userProfile.dietaryRestrictions.length > 0) {
      const restrictionsList = userProfile.dietaryRestrictions.join(', ');
      parts.push(`القيود الغذائية: ${restrictionsList}`);
    }
    
    parts.push('قدم نصائح مفيدة ودقيقة باللغة العربية بناءً على ملف المستخدم.');
  } else {
    parts.push('You are an intelligent health assistant specialized in diabetes management, allergy information, lab result interpretation, and personalized dietary recommendations.');
    
    if (userProfile.diabetesType) {
      parts.push(`User has: ${userProfile.diabetesType}`);
    }
    
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      const allergiesList = userProfile.allergies.map(a => a.label || a).join(', ');
      parts.push(`Allergies: ${allergiesList}`);
    }
    
    if (userProfile.dietaryRestrictions && userProfile.dietaryRestrictions.length > 0) {
      const restrictionsList = userProfile.dietaryRestrictions.join(', ');
      parts.push(`Dietary Restrictions: ${restrictionsList}`);
    }
    
    parts.push('Provide helpful and accurate advice in English based on the user\'s profile.');
  }
  
  return parts.join('\n');
};

/**
 * Get fallback response when API fails
 */
const getFallbackResponse = (prompt, language, userProfile) => {
  const { processHealthQuery } = require('./knowledgeBaseEngine');
  const { generatePersonalizedRecommendations } = require('./recommendationEngine');
  
  const healthResponse = processHealthQuery(prompt, language, userProfile);
  const recommendations = generatePersonalizedRecommendations(
    prompt,
    userProfile.diabetesType,
    userProfile.allergies || [],
    userProfile.dietaryRestrictions || [],
    userProfile.dietaryPreferences || [],
    language
  );
  
  let responseText = healthResponse.answer || '';
  
  if (recommendations.recommendations && recommendations.recommendations.length > 0) {
    responseText += '\n\n' + recommendations.recommendations.join('\n');
  }
  
  return {
    text: responseText || (language === 'ar' 
      ? 'أنا هنا لمساعدتك في أسئلتك الصحية! يمكنني المساعدة في إدارة مرض السكري، معلومات الحساسية، تفسير نتائج المختبرات، والتوصيات الغذائية الشخصية. ماذا تريد أن تعرف؟'
      : 'I\'m here to help with your health questions! I can assist with diabetes management, allergen information, lab result interpretation, and personalized dietary recommendations. What would you like to know?'),
    language,
    source: 'fallback',
    success: true,
  };
};

/**
 * Check if OpenAI is configured (always returns true since key is hardcoded)
 */
export const isGeminiConfigured = () => {
  return !!(OPENAI_API_KEY && OPENAI_API_KEY !== '' && OPENAI_API_KEY !== 'undefined');
};

/**
 * Interpret lab results using OpenAI
 */
export const interpretLabResultsWithGemini = async (labResult, language = 'en') => {
  try {
    const systemContext = language === 'ar'
      ? 'أنت خبير في تفسير نتائج المختبرات الطبية. اشرح النتائج بطريقة بسيطة وواضحة. حدد القيم الطبيعية وأي نتائج غير طبيعية.'
      : 'You are an expert in interpreting medical lab results. Explain the results in simple and clear terms. Identify normal ranges and any abnormal results.';

    const labDataText = JSON.stringify(labResult.tests || [], null, 2);
    const prompt = `${systemContext}\n\nLab Results:\n${labDataText}\n\nPlease interpret these lab results and explain them in simple terms.`;

    const response = await generateGeminiResponse(prompt, language, {}, []);
    
    return {
      summary: response.text,
      tests: labResult.tests || [],
      language,
      source: 'openai',
      formattedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error interpreting lab results with OpenAI:', error);
    // Fallback to local interpretation
    const { interpretLabResults } = require('./medicalInterpretationService');
    return interpretLabResults(labResult, language);
  }
};
