/**
 * Voice Interaction Service (FR-3.4)
 * Generates spoken responses using text-to-speech technology
 * 
 * Note: Requires expo-speech package
 * Install: npx expo install expo-speech
 */

let Speech = null;
try {
  Speech = require('expo-speech');
} catch (error) {
  console.warn('expo-speech not installed. Voice features will be disabled.');
  console.warn('To enable voice features, run: npx expo install expo-speech');
}

/**
 * Speak text using TTS (FR-3.4.1, FR-3.4.2, FR-3.4.3)
 * @param {string} text - Text to speak
 * @param {string} language - Language code ('ar' or 'en')
 * @param {object} options - Speech options
 */
export const speakText = async (text, language = 'en', options = {}) => {
  if (!Speech) {
    console.warn('Voice features disabled: expo-speech not installed');
    return;
  }
  
  if (!text || text.trim().length === 0) {
    return;
  }
  
  // Map language codes to TTS language codes
  const languageMap = {
    'ar': 'ar-SA', // Arabic (Saudi Arabia)
    'en': 'en-US', // English (US)
  };
  
  const ttsLanguage = languageMap[language] || 'en-US';
  
  const defaultOptions = {
    language: ttsLanguage,
    pitch: 1.0,
    rate: 0.9, // Slightly slower for clarity
    volume: 1.0,
    quality: Speech.VoiceQuality?.Enhanced || undefined,
    ...options,
  };
  
  try {
    // Stop any ongoing speech
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      Speech.stop();
    }
    
    // Speak the text
    await Speech.speak(text, defaultOptions);
  } catch (error) {
    console.error('Error speaking text:', error);
    // Fallback: continue silently if TTS fails
  }
};

/**
 * Stop current speech
 */
export const stopSpeaking = async () => {
  if (!Speech) return;
  
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      Speech.stop();
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};

/**
 * Check if speech is currently playing
 * @returns {Promise<boolean>} - True if speaking
 */
export const isSpeaking = async () => {
  if (!Speech) return false;
  
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Error checking speech status:', error);
    return false;
  }
};

/**
 * Get available voices for a language
 * @param {string} language - Language code
 * @returns {Promise<Array>} - Available voices
 */
export const getAvailableVoices = async (language = 'en') => {
  if (!Speech) return [];
  
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const languagePrefix = language === 'ar' ? 'ar' : 'en';
    return voices.filter(voice => voice.language.startsWith(languagePrefix));
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
};

