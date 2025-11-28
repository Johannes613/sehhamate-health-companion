/**
 * Health Chatbot Screen (FR-3)
 * AI-Powered Bilingual Health Assistant
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';
import { useAuth } from '../../contexts/AuthContext';
import ScreenHeader from '../../components/ui/ScreenHeader';

// Import services
import { detectLanguage } from '../../services/languageDetectionService';
import { processHealthQuery } from '../../services/knowledgeBaseEngine';
import { interpretLabResults } from '../../services/medicalInterpretationService';
import { generatePersonalizedRecommendations } from '../../services/recommendationEngine';
import { generateGeminiResponse, interpretLabResultsWithGemini, isGeminiConfigured } from '../../services/geminiService';

export default function HealthChatbotScreen({ navigation, route }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [useOpenAI, setUseOpenAI] = useState(false);
  const scrollViewRef = useRef(null);
  const labResult = route?.params?.labResult || null;

  // Define handleLabResultInterpretation before it's used in useEffect
  const handleLabResultInterpretation = useCallback(async (labResult) => {
    setIsTyping(true);
    
    try {
      let interpretation;
      
      if (useOpenAI) {
        // Use OpenAI for lab result interpretation
        interpretation = await interpretLabResultsWithGemini(labResult, currentLanguage);
      } else {
        // Use local interpretation service
        interpretation = interpretLabResults(labResult, currentLanguage);
      }
      
      let botMessageText;
      
      if (interpretation.source === 'openai' || interpretation.source === 'gemini') {
        botMessageText = interpretation.summary;
      } else {
        botMessageText = interpretation.summary + '\n\n' + 
          interpretation.tests.map(t => 
            `${t.testName}: ${t.value}\n${t.interpretation}\n${t.explanation}`
          ).join('\n\n');
      }
      
      const botMessage = {
        id: Date.now(),
        text: botMessageText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'lab_result',
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error interpreting lab results:', error);
    } finally {
      setIsTyping(false);
    }
  }, [useOpenAI, currentLanguage]);

  // Check if OpenAI is configured on mount
  useEffect(() => {
    try {
      // Check OpenAI configuration
      const configured = isGeminiConfigured();
      setUseOpenAI(configured);
    } catch (error) {
      console.error('[CHATBOT] Error checking OpenAI config:', error);
      setUseOpenAI(false);
    }
  }, []);

  // Initialize with welcome message on mount only
  useEffect(() => {
    try {
      // Only set welcome message once on initial mount
      const welcomeMessage = {
        id: Date.now(),
        text: currentLanguage === 'ar'
          ? 'مرحباً! أنا مساعدك الصحي الذكي. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I\'m your AI health assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('[CHATBOT] Error setting welcome message:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Handle lab result interpretation after component is fully mounted
  useEffect(() => {
    if (labResult && useOpenAI !== undefined && handleLabResultInterpretation) {
      try {
        // Use a small delay to ensure component is fully initialized
        const timer = setTimeout(() => {
          handleLabResultInterpretation(labResult).catch(error => {
            console.error('[CHATBOT] Error in handleLabResultInterpretation:', error);
          });
        }, 1000);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('[CHATBOT] Error setting up lab result interpretation:', error);
      }
    }
  }, [labResult, useOpenAI, handleLabResultInterpretation]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return;
    }

    // Detect language from user input (FR-3.1.3)
    const detectedLanguage = detectLanguage(inputText);
    setCurrentLanguage(detectedLanguage);
    
    const query = inputText.trim();
    
    const userMessage = {
      id: Date.now(),
      text: query,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Add user message to state and get updated messages for conversation history
    let updatedMessages;
    setMessages(prev => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });
    
    setInputText('');
    setIsTyping(true);

    try {
      let botResponseText;
      let responseType = 'general';
      
      // SIMPLIFIED: Always try OpenAI first, fall back to local KB if it fails
      const openAIConfigured = isGeminiConfigured();
      
      // ALWAYS use OpenAI when API key exists
      if (openAIConfigured) {
        // Use OpenAI API for response - use updatedMessages instead of messages to include current user message
        const conversationHistory = (updatedMessages || messages).filter(m => m.sender !== 'system');
        
        const geminiResponse = await generateGeminiResponse(
          query,
          detectedLanguage,
          user,
          conversationHistory
        );
        
        // Always use the response from OpenAI (it may be a fallback if API failed)
        botResponseText = geminiResponse.text;
        responseType = (geminiResponse.source === 'openai' || geminiResponse.source === 'gemini') ? 'openai' : 'fallback';
      } else {
        // Use local knowledge base (fallback)
        const healthResponse = processHealthQuery(query, detectedLanguage, user);
        
        // Get personalized recommendations (FR-3.5)
        const recommendations = generatePersonalizedRecommendations(
          query,
          detectedLanguage,
          user
        );

        // Combine responses
        botResponseText = healthResponse.answer;
        
        if (recommendations.recommendations && recommendations.recommendations.length > 0) {
          botResponseText += '\n\n' + recommendations.recommendations.join('\n\n');
        }
        
        responseType = healthResponse.type;
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: responseType,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error('\n\n');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ CHATBOT: ERROR PROCESSING MESSAGE');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Message:', error.message);
      if (error.stack) {
        console.error('❌ Error Stack:', error.stack.split('\n').slice(0, 10).join('\n'));
      }
      console.error('═══════════════════════════════════════════════════════════\n\n');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: currentLanguage === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLanguage);
    
    // Add language switch message
    const switchMessage = {
      id: Date.now(),
      text: newLanguage === 'ar'
        ? 'تم التبديل إلى العربية'
        : 'Switched to English',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'system',
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  const renderMessage = (message, index) => {
    if (!message || !message.id) {
      console.error('[CHATBOT] ⚠️ Invalid message object:', message);
      return null;
    }
    
    const isUser = message.sender === 'user';
    const isSystem = message.type === 'system';

    return (
      <View
        key={message.id || `message-${index}`}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && !isSystem && (
          <View style={styles.botAvatar}>
            <Ionicons name="medical" size={20} color={Colors.accent} />
          </View>
        )}
        <LinearGradient
          colors={
            isUser
              ? ['#00ff88', '#00cc6a']
              : isSystem
              ? [Colors.backgroundSecondary, Colors.backgroundCard]
              : [Colors.backgroundSecondary, Colors.backgroundCard]
          }
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
            isSystem && styles.systemMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.botMessageText,
              isSystem && styles.systemMessageText,
            ]}
          >
            {message.text}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </LinearGradient>
        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={currentLanguage === 'ar' ? 'المساعد الصحي' : 'Health Assistant'}
        navigation={navigation}
        rightComponent={
          <View style={styles.headerButtons}>
            {useOpenAI && (
              <Ionicons
                name="sparkles"
                size={20}
                color={Colors.accent}
                style={{ marginRight: 4 }}
              />
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.languageButton}>
                {currentLanguage === 'ar' ? 'EN' : 'AR'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages && messages.length > 0 ? messages.map((message, index) => renderMessage(message, index)) : null}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.botAvatar}>
                <Ionicons name="medical" size={20} color={Colors.accent} />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={Colors.accent} />
                <Text style={styles.typingText}>
                  {currentLanguage === 'ar' ? 'يكتب...' : 'Typing...'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              currentLanguage === 'ar'
                ? 'اكتب رسالتك...'
                : 'Type your message...'
            }
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
            textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <LinearGradient
              colors={
                inputText.trim() && !isTyping
                  ? ['#00ff88', '#00cc6a']
                  : [Colors.borderPrimary, Colors.borderPrimary]
              }
              style={styles.sendButtonGradient}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim() && !isTyping
                    ? Colors.primary
                    : Colors.textTertiary
                }
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  chatContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  languageButton: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  userMessageBubble: {
    borderColor: 'transparent',
  },
  botMessageBubble: {
    borderColor: Colors.borderPrimary,
  },
  systemMessageBubble: {
    maxWidth: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  botMessageText: {
    color: Colors.textPrimary,
  },
  systemMessageText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderPrimary,
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

