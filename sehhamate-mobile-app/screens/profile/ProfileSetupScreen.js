import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';
import { useAuth } from '../../contexts/AuthContext';
import ScreenContainer from '../../components/ui/ScreenContainer';

// Import step components
import BasicInfoStep from '../../components/profile/BasicInfoStep';
import DietaryPreferencesStep from '../../components/profile/DietaryPreferencesStep';
import AllergyInfoStep from '../../components/profile/AllergyInfoStep';
import ActivityLevelStep from '../../components/profile/ActivityLevelStep';
import RequirementsPreview from '../../components/profile/RequirementsPreview';

// Import analysis engines (FR-1.4.3, FR-1.4.4)
import { generateInitialNutritionProfile } from '../../services/nutritionAnalysisEngine';
import { generateInitialAllergyProfile } from '../../services/allergyAnalysisEngine';

const { width } = Dimensions.get('window');

const STEPS = [
  { 
    id: 'basic', 
    title: 'Basic Information', 
    subtitle: 'Tell us about yourself',
    icon: 'person-outline'
  },
  { 
    id: 'dietary', 
    title: 'Dietary Preferences', 
    subtitle: 'Your eating style',
    icon: 'leaf-outline'
  },
  { 
    id: 'allergies', 
    title: 'Allergy Information', 
    subtitle: 'Keep you safe',
    icon: 'shield-outline'
  },
  { 
    id: 'activity', 
    title: 'Activity Level', 
    subtitle: 'How active are you?',
    icon: 'fitness-outline'
  },
  { 
    id: 'preview', 
    title: 'Your Daily Requirements', 
    subtitle: 'Review your personalized plan',
    icon: 'analytics-outline'
  },
];

export default function ProfileSetupScreen() {
  const { completeProfileSetup, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    // Basic Info
    age: '',
    weight: '',
    height: '',
    gender: '',
    // Dietary Preferences
    dietaryPreferences: [],
    // Allergies (merge with signup data if available)
    allergies: user?.allergies || [],
    // Activity Level
    activityLevel: '',
    // Include data from signup if available (FR-1.1.3, FR-1.1.4, FR-1.1.5)
    diabetesType: user?.diabetesType || '',
    dietaryRestrictions: user?.dietaryRestrictions || [],
  });

  // Animation references
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in the current step
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / STEPS.length,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStep]);

  const updateProfileData = (data) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      // Animate out current step
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(width);
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Animate out current step
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-width);
      });
    }
  };

  const handleComplete = async () => {
    try {
      // Generate initial nutrition profile using Nutrition Analysis Engine (FR-1.4.3)
      const nutritionProfile = generateInitialNutritionProfile({
        ...profileData,
        // Include diabetes type and dietary restrictions from signup if available
        diabetesType: profileData.diabetesType || null,
        dietaryRestrictions: profileData.dietaryRestrictions || [],
      });

      // Generate initial allergy profile using Allergy Analysis Engine (FR-1.4.4)
      const allergyProfile = generateInitialAllergyProfile({
        allergies: profileData.allergies || [],
        diabetesType: profileData.diabetesType || null,
        dietaryRestrictions: profileData.dietaryRestrictions || [],
      });

      // Calculate daily requirements (legacy support)
      const requirements = calculateDailyRequirements(profileData);
      
      const completeProfile = {
        ...profileData,
        dailyRequirements: requirements, // Keep for backward compatibility
        nutritionProfile, // New comprehensive nutrition profile (FR-1.4.3)
        allergyProfile, // New comprehensive allergy profile (FR-1.4.4)
        setupCompleted: true,
        setupDate: new Date().toISOString(),
      };

      await completeProfileSetup(completeProfile);
      
      Alert.alert(
        'Setup Complete!',
        'Your personalized nutrition and allergy profiles have been generated. Welcome to SehhaMate!',
        [{ text: 'Get Started', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
      console.error('Profile setup error:', error);
    }
  };

  const calculateDailyRequirements = (data) => {
    const { age, weight, height, gender, activityLevel } = data;
    
    // Basic Metabolic Rate (BMR) calculation using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * parseFloat(weight)) + (4.799 * parseFloat(height)) - (5.677 * parseFloat(age));
    } else {
      bmr = 447.593 + (9.247 * parseFloat(weight)) + (3.098 * parseFloat(height)) - (4.330 * parseFloat(age));
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      moderately_active: 1.55,
      very_active: 1.725,
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
    
    // Macro distribution (example ratios)
    const calories = Math.round(tdee);
    const protein = Math.round((calories * 0.25) / 4); // 25% of calories, 4 cal/g
    const carbs = Math.round((calories * 0.45) / 4); // 45% of calories, 4 cal/g
    const fat = Math.round((calories * 0.30) / 9); // 30% of calories, 9 cal/g

    return {
      calories,
      protein,
      carbohydrates: carbs,
      fat,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return profileData.age && profileData.weight && profileData.height && profileData.gender;
      case 1: // Dietary Preferences
        return true; // Optional step
      case 2: // Allergies
        return true; // Optional step
      case 3: // Activity Level
        return profileData.activityLevel;
      case 4: // Preview
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: profileData,
      onUpdate: updateProfileData,
      onNext: handleNext,
      canProceed: canProceed(),
    };

    switch (currentStep) {
      case 0:
        return <BasicInfoStep {...stepProps} />;
      case 1:
        return <DietaryPreferencesStep {...stepProps} />;
      case 2:
        return <AllergyInfoStep {...stepProps} />;
      case 3:
        return <ActivityLevelStep {...stepProps} />;
      case 4:
        return <RequirementsPreview 
          {...stepProps} 
          requirements={calculateDailyRequirements(profileData)}
          onComplete={handleComplete}
        />;
      default:
        return null;
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScreenContainer>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
                <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={styles.headerCenter}>
              <Text style={styles.stepCounter}>
                Step {currentStep + 1} of {STEPS.length}
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: progressWidth }
                ]} 
              />
            </View>
          </View>

          {/* Step Info */}
          <View style={styles.stepInfo}>
            <View style={styles.stepIconContainer}>
              <LinearGradient
                colors={['#00ff88', '#00cc6a']}
                style={styles.stepIconGradient}
              >
                <Ionicons 
                  name={STEPS[currentStep].icon} 
                  size={24} 
                  color={Colors.primary} 
                />
              </LinearGradient>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{STEPS[currentStep].title}</Text>
              <Text style={styles.stepSubtitle}>{STEPS[currentStep].subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Step Content */}
        <Animated.View 
          style={[
            styles.stepContainer,
            {
              transform: [{ translateX: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <ScrollView 
            style={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStep()}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderPrimary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconContainer: {
    marginRight: 15,
  },
  stepIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

