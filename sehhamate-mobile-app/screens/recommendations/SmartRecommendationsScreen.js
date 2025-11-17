import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Colors } from '../../utils/colorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getUserRecommendations, 
  addUserRecommendation, 
  markRecommendationAsRead,
  addUserInteraction 
} from '../../utils/firebaseHelpers';

const { width } = Dimensions.get('window');

export default function SmartRecommendationsScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tips');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInteractions, setUserInteractions] = useState({});

  const healthTips = [
    {
      id: 1,
      title: 'Reduce Sodium Intake',
      description: 'Due to your hypertension medication, it\'s recommended to limit sodium intake today. High sodium can interfere with your medication\'s effectiveness.',
      category: 'Dietary Advice',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
      priority: 'high',
      timeToRead: '2 min read',
      detailedContent: `Sodium and Blood Pressure: A Critical Connection

Your current medication regimen includes antihypertensive drugs that work by helping your body eliminate excess sodium. However, when you consume high-sodium foods, you're essentially working against your medication.

Key Points:
• Limit daily sodium intake to 1,500-2,300mg
• Avoid processed foods, canned soups, and fast food
• Read nutrition labels carefully
• Use herbs and spices instead of salt for flavoring

Foods to Avoid:
- Processed meats (bacon, ham, sausages)
- Canned vegetables and soups
- Fast food and restaurant meals
- Salty snacks (chips, pretzels, nuts)
- Condiments (soy sauce, ketchup, mustard)

Healthy Alternatives:
- Fresh fruits and vegetables
- Lean proteins (chicken, fish, beans)
- Whole grains
- Low-sodium seasonings

Remember: Even small reductions in sodium intake can significantly improve your blood pressure control and medication effectiveness.`,
    },
    {
      id: 2,
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain proper hydration and support your medication effectiveness.',
      category: 'Hydration',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop',
      priority: 'medium',
      timeToRead: '1 min read',
      detailedContent: `The Importance of Hydration for Medication Effectiveness

Proper hydration is crucial for your body to process medications effectively and maintain overall health.

Why Hydration Matters:
• Helps kidneys filter medications properly
• Prevents medication side effects
• Maintains blood volume for proper circulation
• Supports overall organ function

Daily Hydration Goals:
- Aim for 8-10 glasses of water daily
- Increase intake during exercise or hot weather
- Monitor urine color (should be light yellow)
- Drink water with meals and medications

Signs of Dehydration:
- Dark yellow urine
- Dry mouth and throat
- Fatigue and dizziness
- Headaches
- Reduced urine output

Tips for Staying Hydrated:
- Carry a water bottle with you
- Set reminders on your phone
- Drink water before, during, and after meals
- Choose water over sugary drinks
- Eat water-rich foods (cucumbers, watermelon, oranges)

Remember: Proper hydration helps your medications work more effectively and reduces the risk of side effects.`,
    },
    {
      id: 3,
      title: 'Exercise Regularly',
      description: 'Aim for 30 minutes of moderate exercise daily. This helps with blood pressure control and overall cardiovascular health.',
      category: 'Fitness',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      priority: 'high',
      timeToRead: '3 min read',
      detailedContent: `Exercise and Cardiovascular Health: A Comprehensive Guide

Regular physical activity is one of the most effective ways to manage blood pressure and improve overall cardiovascular health.

Benefits of Regular Exercise:
• Lowers blood pressure naturally
• Strengthens heart muscle
• Improves circulation
• Reduces stress and anxiety
• Helps maintain healthy weight
• Boosts energy levels

Recommended Exercise Types:
1. Aerobic Exercise (30 minutes daily):
   - Walking, jogging, or running
   - Cycling or swimming
   - Dancing or aerobics classes
   - Elliptical or rowing machine

2. Strength Training (2-3 times weekly):
   - Light weightlifting
   - Bodyweight exercises
   - Resistance bands
   - Yoga or Pilates

3. Flexibility and Balance:
   - Stretching exercises
   - Tai Chi or yoga
   - Balance exercises

Exercise Guidelines:
- Start slowly and gradually increase intensity
- Aim for 150 minutes of moderate activity weekly
- Include both cardio and strength training
- Listen to your body and rest when needed
- Consult your doctor before starting new exercises

Safety Tips:
- Warm up before exercise
- Stay hydrated during workouts
- Monitor your heart rate
- Stop if you experience chest pain or dizziness
- Exercise in comfortable, well-ventilated areas

Remember: Consistency is key. Even 10-15 minutes of daily activity can make a significant difference in your health.`,
    },
    {
      id: 4,
      title: 'Monitor Blood Pressure',
      description: 'Check your blood pressure regularly and keep a log. This helps track the effectiveness of your medication.',
      category: 'Monitoring',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
      priority: 'medium',
      timeToRead: '2 min read',
      detailedContent: `Blood Pressure Monitoring: Your Health Dashboard

Regular blood pressure monitoring is essential for tracking your medication effectiveness and overall cardiovascular health.

Why Monitor Blood Pressure:
• Track medication effectiveness
• Identify patterns and triggers
• Early detection of complications
• Better communication with healthcare providers
• Peace of mind and confidence

Monitoring Schedule:
- Check BP 2-3 times daily when starting new medication
- Once daily for stable patients
- Before and after exercise
- When experiencing symptoms
- Before and after meals (if recommended)

How to Measure Accurately:
1. Rest for 5 minutes before measuring
2. Sit in a comfortable position
3. Keep your arm at heart level
4. Use a properly fitted cuff
5. Take multiple readings and average them
6. Record readings in a log or app

Target Blood Pressure Ranges:
- Normal: <120/80 mmHg
- Elevated: 120-129/<80 mmHg
- Stage 1 Hypertension: 130-139/80-89 mmHg
- Stage 2 Hypertension: ≥140/≥90 mmHg

What to Record:
- Date and time of measurement
- Blood pressure readings (systolic/diastolic)
- Heart rate
- Any symptoms or activities
- Medication taken
- Stress levels or triggers

When to Contact Your Doctor:
- Consistently high readings (>140/90)
- Sudden changes in readings
- Symptoms like headache, dizziness, or chest pain
- Difficulty controlling blood pressure

Remember: Your blood pressure log is a valuable tool for managing your health and communicating with your healthcare team.`,
    },
  ];

  const mealSuggestions = [
    {
      id: 1,
      title: 'Mediterranean Quinoa Salad',
      description: 'A light and refreshing salad with quinoa, cucumbers, tomatoes, and a lemon vinaigrette. Low in sodium and rich in nutrients.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      calories: '320',
      prepTime: '15 min',
      difficulty: 'Easy',
      tags: ['Low Sodium', 'Vegetarian', 'High Protein'],
    },
    {
      id: 2,
      title: 'Baked Salmon with Asparagus',
      description: 'A heart-healthy option with baked salmon seasoned with herbs and served with steamed asparagus. Naturally low in sodium.',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      calories: '450',
      prepTime: '25 min',
      difficulty: 'Medium',
      tags: ['Omega-3', 'Low Sodium', 'High Protein'],
    },
    {
      id: 3,
      title: 'Grilled Chicken with Sweet Potato',
      description: 'Lean protein with complex carbohydrates. Perfect for maintaining stable blood sugar levels.',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
      calories: '380',
      prepTime: '20 min',
      difficulty: 'Easy',
      tags: ['Lean Protein', 'Low Fat', 'High Fiber'],
    },
    {
      id: 4,
      title: 'Vegetarian Buddha Bowl',
      description: 'A colorful bowl packed with roasted vegetables, quinoa, and tahini dressing. Perfect for a nutritious lunch.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      calories: '290',
      prepTime: '30 min',
      difficulty: 'Easy',
      tags: ['Vegetarian', 'High Fiber', 'Antioxidants'],
    },
  ];

  const renderTipCard = (tip) => (
    <TouchableOpacity 
      key={tip.id} 
      style={[
        styles.tipCard,
        tip.isUserRecommendation && styles.userRecommendationCard,
        tip.read && styles.readRecommendationCard
      ]}
      onPress={() => handleTipPressWithLogging(tip)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={tip.isUserRecommendation ? ['#003d2e', '#002d21'] : ['#2D2D33', '#1C1C22']}
        style={styles.tipCardGradient}
      >
        {tip.isUserRecommendation && (
          <View style={styles.personalizedBadge}>
            <Ionicons name="person" size={12} color={Colors.accent} />
            <Text style={styles.personalizedText}>Personalized</Text>
          </View>
        )}
        <View style={styles.tipCardContent}>
          <View style={styles.tipCardText}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <View style={[styles.priorityBadge, styles[`priority${tip.priority}`]]}>
                <Text style={styles.priorityText}>{tip.priority?.toUpperCase() || 'MEDIUM'}</Text>
              </View>
            </View>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
            <View style={styles.tipFooter}>
              <View style={styles.timeToRead}>
                <Ionicons name="time-outline" size={14} color="#ababab" />
                <Text style={styles.timeToReadText}>{tip.timeToRead}</Text>
              </View>
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedTip(tip);
                  setIsModalVisible(true);
                }}
              >
                <Text style={styles.readMoreText}>Read More</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.tipCardImage}>
            <Image 
              source={{ uri: tip.imageUrl }} 
              style={styles.tipImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMealCard = (meal) => (
    <TouchableOpacity 
      key={meal.id} 
      style={styles.mealCard}
      onPress={() => handleMealPress(meal)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#2D2D33', '#1C1C22']}
        style={styles.mealCardGradient}
      >
        <View style={styles.mealImageContainer}>
          <Image 
            source={{ uri: meal.imageUrl }} 
            style={styles.mealImage}
            resizeMode="cover"
          />
          <View style={styles.mealOverlay}>
            <View style={styles.mealStats}>
              <View style={styles.mealStat}>
                <Ionicons name="flame-outline" size={12} color="#FFFFFF" />
                <Text style={styles.mealStatText}>{meal.calories} cal</Text>
              </View>
              <View style={styles.mealStat}>
                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                <Text style={styles.mealStatText}>{meal.prepTime}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.mealCardContent}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
          <View style={styles.mealTags}>
            {meal.tags.map((tag, index) => (
              <View key={index} style={styles.mealTag}>
                <Text style={styles.mealTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleTipPress = (tip) => {
    setSelectedTip(tip);
    setIsModalVisible(true);
  };

  const handleMealPress = (meal) => {
    // Log user interaction
    if (user?.id) {
      logUserInteraction('meal_view', { mealId: meal.id, mealTitle: meal.title });
    }
    
    Alert.alert(
      meal.title,
      `${meal.description}\n\nCalories: ${meal.calories}\nPrep Time: ${meal.prepTime}\nDifficulty: ${meal.difficulty}`,
      [{ text: 'OK' }]
    );
  };

  // Load user-specific recommendations and interactions
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const result = await getUserRecommendations(user.id);
        if (result.success) {
          setUserRecommendations(result.recommendations);
          console.log('Loaded user recommendations:', result.recommendations.length);
        }
      } catch (error) {
        console.error('Error loading user recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Log user interactions
  const logUserInteraction = async (type, data) => {
    if (!user?.id) return;
    
    try {
      await addUserInteraction(user.id, {
        type,
        data,
        screen: 'recommendations',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  // Enhanced tip press handler with Firebase logging
  const handleTipPressWithLogging = async (tip) => {
    // Log user interaction
    await logUserInteraction('tip_view', { 
      tipId: tip.id, 
      tipTitle: tip.title,
      category: tip.category 
    });

    // Mark as read if it's a user-specific recommendation
    if (tip.isUserRecommendation) {
      try {
        await markRecommendationAsRead(tip.id);
        // Update local state
        setUserRecommendations(prev => 
          prev.map(rec => 
            rec.id === tip.id ? { ...rec, read: true } : rec
          )
        );
      } catch (error) {
        console.error('Error marking recommendation as read:', error);
      }
    }

    setSelectedTip(tip);
    setIsModalVisible(true);
  };

  // Add user-specific recommendation
  const addPersonalizedRecommendation = async (recommendationData) => {
    if (!user?.id) return;
    
    try {
      const result = await addUserRecommendation(user.id, {
        ...recommendationData,
        personalizedFor: user.id,
        source: 'user_generated'
      });
      
      if (result.success) {
        // Refresh recommendations
        const updatedResult = await getUserRecommendations(user.id);
        if (updatedResult.success) {
          setUserRecommendations(updatedResult.recommendations);
        }
        Alert.alert('Success', 'Personal recommendation added successfully!');
      }
    } catch (error) {
      console.error('Error adding personal recommendation:', error);
      Alert.alert('Error', 'Failed to add personal recommendation');
    }
  };

  // Combine default tips with user recommendations
  const getAllRecommendations = () => {
    const defaultTips = healthTips.map(tip => ({ ...tip, isUserRecommendation: false }));
    const userTips = userRecommendations.map(rec => ({ 
      ...rec, 
      isUserRecommendation: true,
      imageUrl: rec.imageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
    }));
    
    // Sort by priority and date
    return [...userTips, ...defaultTips].sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      if (a.isUserRecommendation && !b.isUserRecommendation) return -1;
      if (b.isUserRecommendation && !a.isUserRecommendation) return 1;
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader 
        title="Recommendations" 
        navigation={navigation}
        rightComponent={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('DocumentUpload')}
          >
            <Ionicons name="document-attach" size={24} color={Colors.accent} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tips' && styles.activeTab]} 
            onPress={() => setActiveTab('tips')}
          >
            <Ionicons 
              name="bulb-outline" 
              size={20} 
              color={activeTab === 'tips' ? Colors.textPrimary : '#ababab'} 
            />
            <Text style={[styles.tabText, activeTab === 'tips' && styles.activeTabText]}>
              Health Tips
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'meals' && styles.activeTab]} 
            onPress={() => setActiveTab('meals')}
          >
            <Ionicons 
              name="restaurant-outline" 
              size={20} 
              color={activeTab === 'meals' ? Colors.textPrimary : '#ababab'} 
            />
            <Text style={[styles.tabText, activeTab === 'meals' && styles.activeTabText]}>
              Meal Ideas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Document Upload Card at Top */}
        <TouchableOpacity
          style={styles.documentUploadCard}
          onPress={() => navigation.navigate('DocumentUpload')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4ECDC4', '#45B7D1', '#ff6b6b']}
            style={styles.documentUploadGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.documentUploadContent}>
              <View style={styles.documentUploadIconContainer}>
                <Ionicons name="document-text" size={32} color="#000" />
              </View>
              <View style={styles.documentUploadText}>
                <Text style={styles.documentUploadTitle}>Upload Medical Documents</Text>
                <Text style={styles.documentUploadSubtitle}>
                  Upload lab reports and prescriptions for AI analysis
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {activeTab === 'tips' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Health Tips</Text>
              <Text style={styles.sectionSubtitle}>
                Personalized recommendations based on your health profile
              </Text>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>Loading personalized recommendations...</Text>
              </View>
            ) : (
              getAllRecommendations().map(renderTipCard)
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meal Suggestions</Text>
              <Text style={styles.sectionSubtitle}>
                Based on your pantry inventory and dietary preferences
              </Text>
            </View>

            {/* Generate Meal Plan Button */}
            <TouchableOpacity 
              style={styles.generateMealPlanButton} 
              onPress={() => navigation.navigate('MealSetup')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00ff88', '#00cc6a']}
                style={styles.generateMealPlanGradient}
              >
                <View style={styles.generateMealPlanContent}>
                  <View style={styles.generateMealPlanLeft}>
                    <Ionicons name="restaurant-outline" size={32} color={Colors.textPrimary} />
                    <View style={styles.generateMealPlanText}>
                      <Text style={styles.generateMealPlanTitle}>Generate Daily Meal Plan</Text>
                      <Text style={styles.generateMealPlanSubtitle}>
                        Create personalized recommendations based on your preferences
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color={Colors.textPrimary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.mealScrollContainer}
              contentContainerStyle={styles.mealScrollContent}
            >
              {mealSuggestions.map(renderMealCard)}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Read More Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#2D2D33', '#1C1C22']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedTip?.title}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalContentText}>{selectedTip?.detailedContent}</Text>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#474747',
    backgroundColor: Colors.backgroundPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 32,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingTop: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ababab',
    letterSpacing: 0.015,
  },
  activeTabText: {
    color: Colors.textPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerButton: {
    padding: 8,
  },
  documentUploadCard: {
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  documentUploadGradient: {
    padding: 20,
  },
  documentUploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  documentUploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentUploadText: {
    flex: 1,
  },
  documentUploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  documentUploadSubtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.015,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ababab',
    fontWeight: 'normal',
  },
  tipCard: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tipCardGradient: {
    borderRadius: 16,
  },
  tipCardContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  tipCardText: {
    flex: 2,
    gap: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipCategory: {
    fontSize: 12,
    color: '#ababab',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityhigh: {
    backgroundColor: '#FF6B6B',
  },
  prioritymedium: {
    backgroundColor: '#4ECDC4',
  },
  prioritylow: {
    backgroundColor: '#45B7D1',
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tipTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#ababab',
    fontWeight: 'normal',
    lineHeight: 20,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeToRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeToReadText: {
    fontSize: 12,
    color: '#ababab',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  tipCardImage: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tipImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    aspectRatio: 4/3,
  },
  mealScrollContainer: {
    marginHorizontal: -16,
  },
  mealScrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  mealCard: {
    width: width * 0.45,
    minWidth: 180,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mealCardGradient: {
    borderRadius: 16,
  },
  mealImageContainer: {
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  mealOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
  },
  mealStats: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  mealStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealStatText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mealCardContent: {
    padding: 16,
    gap: 8,
  },
  mealTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 12,
    color: '#ababab',
    fontWeight: 'normal',
    lineHeight: 16,
  },
  mealTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  mealTag: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealTagText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#474747',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalContentText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  generateMealPlanButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateMealPlanGradient: {
    padding: 20,
  },
  generateMealPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generateMealPlanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  generateMealPlanText: {
    marginLeft: 16,
    flex: 1,
  },
  generateMealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  generateMealPlanSubtitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.8,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  userRecommendationCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  readRecommendationCard: {
    opacity: 0.7,
  },
  personalizedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.accent}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  personalizedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.accent,
  },
});

