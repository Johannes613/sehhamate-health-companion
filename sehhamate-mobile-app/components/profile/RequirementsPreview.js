import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';

export default function RequirementsPreview({ 
  data, 
  requirements, 
  onComplete 
}) {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Auto-confirm countdown state
  const [countdown, setCountdown] = useState(3);
  const [isAutoConfirming, setIsAutoConfirming] = useState(true);
  const countdownTimerRef = useRef(null);
  const autoConfirmTimerRef = useRef(null);

  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate progress bars after initial animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  // Auto-confirm countdown effect
  useEffect(() => {
    // Start 3-second auto-confirm countdown
    if (isAutoConfirming) {
      // Countdown timer (updates every second)
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-confirm timer (triggers after 3 seconds)
      autoConfirmTimerRef.current = setTimeout(() => {
        setIsAutoConfirming(false);
        onComplete();
      }, 3000);
    }

    // Cleanup timers on unmount or when auto-confirm is cancelled
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoConfirming]); // onComplete is stable from parent, only run when isAutoConfirming changes

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#74B9FF' };
    if (bmi < 25) return { category: 'Normal', color: '#00ff88' };
    if (bmi < 30) return { category: 'Overweight', color: '#FFB020' };
    return { category: 'Obese', color: '#FF6B6B' };
  };

  const getActivityLevel = (level) => {
    const levels = {
      sedentary: 'Sedentary',
      moderately_active: 'Moderately Active',
      very_active: 'Very Active',
    };
    return levels[level] || 'Unknown';
  };

  const calculateBMI = () => {
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height) / 100; // Convert cm to meters
    return weight / (height * height);
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);

  const macroBreakdown = [
    {
      name: 'Protein',
      amount: requirements.protein,
      unit: 'g',
      percentage: Math.round((requirements.protein * 4 / requirements.calories) * 100),
      color: '#FF6B6B',
      icon: 'fitness-outline',
      dailyServings: '6-8 servings',
    },
    {
      name: 'Carbohydrates',
      amount: requirements.carbohydrates,
      unit: 'g',
      percentage: Math.round((requirements.carbohydrates * 4 / requirements.calories) * 100),
      color: '#4ECDC4',
      icon: 'leaf-outline',
      dailyServings: '8-10 servings',
    },
    {
      name: 'Fat',
      amount: requirements.fat,
      unit: 'g',
      percentage: Math.round((requirements.fat * 9 / requirements.calories) * 100),
      color: '#FFB020',
      icon: 'water-outline',
      dailyServings: '3-4 servings',
    },
  ];

  const profileSummary = [
    {
      label: 'Age',
      value: `${data.age} years`,
      icon: 'calendar-outline',
    },
    {
      label: 'Weight',
      value: `${data.weight} kg`,
      icon: 'scale-outline',
    },
    {
      label: 'Height',
      value: `${data.height} cm`,
      icon: 'resize-outline',
    },
    {
      label: 'Gender',
      value: data.gender.charAt(0).toUpperCase() + data.gender.slice(1),
      icon: 'person-outline',
    },
  ];

  const renderProfileSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Profile</Text>
      <View style={styles.profileGrid}>
        {profileSummary.map((item, index) => (
          <View key={item.label} style={styles.profileItem}>
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundCard]}
              style={styles.profileItemGradient}
            >
              <Ionicons name={item.icon} size={20} color={Colors.accent} />
              <Text style={styles.profileItemLabel}>{item.label}</Text>
              <Text style={styles.profileItemValue}>{item.value}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBMICard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Body Mass Index</Text>
      <LinearGradient
        colors={[bmiInfo.color + '20', bmiInfo.color + '10']}
        style={styles.bmiCard}
      >
        <View style={styles.bmiHeader}>
          <View style={styles.bmiIconContainer}>
            <Ionicons name="body-outline" size={24} color={bmiInfo.color} />
          </View>
          <View style={styles.bmiContent}>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>
              {bmiInfo.category}
            </Text>
          </View>
        </View>
        <Text style={styles.bmiDescription}>
          Your BMI is calculated from your height and weight
        </Text>
      </LinearGradient>
    </View>
  );

  const renderCalorieRequirements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Calorie Requirements</Text>
      <LinearGradient
        colors={['#00ff88', '#00cc6a']}
        style={styles.calorieCard}
      >
        <View style={styles.calorieHeader}>
          <Ionicons name="flame" size={32} color={Colors.primary} />
          <View style={styles.calorieContent}>
            <Text style={styles.calorieValue}>
              {requirements.calories.toLocaleString()}
            </Text>
            <Text style={styles.calorieLabel}>Calories per day</Text>
          </View>
        </View>
        <View style={styles.calorieBreakdown}>
          <View style={styles.calorieBreakdownItem}>
            <Text style={styles.calorieBreakdownLabel}>BMR</Text>
            <Text style={styles.calorieBreakdownValue}>
              {requirements.bmr.toLocaleString()}
            </Text>
          </View>
          <View style={styles.calorieBreakdownItem}>
            <Text style={styles.calorieBreakdownLabel}>Activity</Text>
            <Text style={styles.calorieBreakdownValue}>
              {getActivityLevel(data.activityLevel)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderMacroBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>
      <View style={styles.macroGrid}>
        {macroBreakdown.map((macro, index) => (
          <Animated.View
            key={macro.name}
            style={[
              styles.macroCard,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + index * 10],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[macro.color + '20', macro.color + '10']}
              style={styles.macroCardGradient}
            >
              <View style={styles.macroHeader}>
                <View 
                  style={[
                    styles.macroIconContainer,
                    { backgroundColor: macro.color + '30' }
                  ]}
                >
                  <Ionicons name={macro.icon} size={20} color={macro.color} />
                </View>
                <Text style={styles.macroPercentage}>{macro.percentage}%</Text>
              </View>
              
              <Text style={styles.macroName}>{macro.name}</Text>
              <Text style={styles.macroAmount}>
                {macro.amount}{macro.unit}
              </Text>
              <Text style={styles.macroServings}>{macro.dailyServings}</Text>
              
              {/* Progress bar */}
              <View style={styles.macroProgressContainer}>
                <View style={styles.macroProgressTrack}>
                  <Animated.View
                    style={[
                      styles.macroProgressFill,
                      {
                        backgroundColor: macro.color,
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${macro.percentage}%`],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderDietaryInfo = () => {
    if (data.dietaryPreferences?.length === 0 && data.allergies?.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Information</Text>
        
        {data.dietaryPreferences?.length > 0 && (
          <View style={styles.dietarySection}>
            <Text style={styles.dietarySubtitle}>Preferences</Text>
            <View style={styles.dietaryTags}>
              {data.dietaryPreferences.map((pref) => (
                <View key={pref} style={styles.dietaryTag}>
                  <LinearGradient
                    colors={['#00ff88', '#00cc6a']}
                    style={styles.dietaryTagGradient}
                  >
                    <Text style={styles.dietaryTagText}>
                      {pref.replace('_', ' ').toUpperCase()}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.allergies?.length > 0 && (
          <View style={styles.dietarySection}>
            <Text style={styles.dietarySubtitle}>Allergies</Text>
            <View style={styles.allergyWarning}>
              <LinearGradient
                colors={['rgba(255, 68, 68, 0.1)', 'rgba(255, 68, 68, 0.05)']}
                style={styles.allergyWarningGradient}
              >
                <Ionicons name="warning" size={16} color={Colors.danger} />
                <Text style={styles.allergyWarningText}>
                  {data.allergies.length} allerg{data.allergies.length === 1 ? 'y' : 'ies'} noted
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Personalized Plan</Text>
          <Text style={styles.description}>
            Based on your profile, here are your daily nutrition requirements
          </Text>
        </View>

        {renderProfileSummary()}
        {renderBMICard()}
        {renderCalorieRequirements()}
        {renderMacroBreakdown()}
        {renderDietaryInfo()}

        <View style={styles.disclaimer}>
          <LinearGradient
            colors={[Colors.backgroundSecondary, Colors.backgroundCard]}
            style={styles.disclaimerGradient}
          >
            <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              These recommendations are estimates based on general guidelines. 
              Consult with a healthcare professional for personalized advice.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        {/* Auto-confirm countdown indicator */}
        {isAutoConfirming && countdown > 0 && (
          <View style={styles.autoConfirmBanner}>
            <LinearGradient
              colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 204, 106, 0.1)']}
              style={styles.autoConfirmGradient}
            >
              <Ionicons name="time-outline" size={16} color={Colors.accent} />
              <Text style={styles.autoConfirmText}>
                Auto-confirming in {countdown} second{countdown !== 1 ? 's' : ''}...
              </Text>
            </LinearGradient>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            // Cancel auto-confirm if user clicks manually
            if (isAutoConfirming) {
              setIsAutoConfirming(false);
              if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
              }
              if (autoConfirmTimerRef.current) {
                clearTimeout(autoConfirmTimerRef.current);
              }
            }
            onComplete();
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00ff88', '#00cc6a']}
            style={styles.completeButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.completeButtonText}>Complete Setup</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profileItem: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileItemGradient: {
    padding: 16,
    alignItems: 'center',
  },
  profileItemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  profileItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bmiCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiIconContainer: {
    marginRight: 16,
  },
  bmiContent: {
    flex: 1,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  bmiCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  bmiDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  calorieCard: {
    borderRadius: 16,
    padding: 20,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieContent: {
    marginLeft: 16,
    flex: 1,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  calorieLabel: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  calorieBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calorieBreakdownItem: {
    alignItems: 'center',
  },
  calorieBreakdownLabel: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 4,
  },
  calorieBreakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  macroGrid: {
    gap: 12,
  },
  macroCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  macroCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  macroName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  macroAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  macroServings: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  macroProgressContainer: {
    marginTop: 8,
  },
  macroProgressTrack: {
    height: 6,
    backgroundColor: Colors.borderPrimary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dietarySection: {
    marginBottom: 16,
  },
  dietarySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryTag: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dietaryTagGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dietaryTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  allergyWarning: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  allergyWarningGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  allergyWarningText: {
    fontSize: 12,
    color: Colors.danger,
    marginLeft: 8,
  },
  disclaimer: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disclaimerGradient: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    paddingTop: 20,
  },
  autoConfirmBanner: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  autoConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  autoConfirmText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.accent,
    marginLeft: 8,
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
});

