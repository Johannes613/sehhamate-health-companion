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

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise',
    details: 'Desk job, minimal walking, no regular exercise',
    multiplier: 1.2,
    icon: 'bed-outline',
    color: '#FF6B6B',
    calorieBonus: 0,
  },
  {
    id: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    details: 'Regular gym visits, sports, cycling',
    multiplier: 1.55,
    icon: 'bicycle-outline',
    color: '#4ECDC4',
    calorieBonus: 400,
  },
  {
    id: 'very_active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    details: 'Daily workouts, training, physical job',
    multiplier: 1.725,
    icon: 'fitness-outline',
    color: '#45B7D1',
    calorieBonus: 600,
  },
];

export default function ActivityLevelStep({ data, onUpdate, onNext, canProceed }) {
  const [selectedLevel, setSelectedLevel] = useState(data.activityLevel || '');
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef(
    ACTIVITY_LEVELS.map(() => new Animated.Value(1))
  ).current;

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
    ]).start();
  }, []);

  const handleLevelSelect = (levelId) => {
    // Animate the selected card
    const levelIndex = ACTIVITY_LEVELS.findIndex(l => l.id === levelId);
    if (levelIndex !== -1) {
      Animated.sequence([
        Animated.timing(scaleAnims[levelIndex], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[levelIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setSelectedLevel(levelId);
    onUpdate({ activityLevel: levelId });
  };

  const handleNext = () => {
    if (selectedLevel) {
      onNext();
    }
  };

  const getEstimatedCalories = (level) => {
    // Basic estimation based on average person
    const baseCalories = 1800; // Base for moderate adult
    return Math.round(baseCalories * level.multiplier);
  };

  const renderActivityCard = (level, index) => {
    const isSelected = selectedLevel === level.id;
    const estimatedCalories = getEstimatedCalories(level);

    return (
      <Animated.View
        key={level.id}
        style={[
          styles.activityCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 50 + index * 20],
                }),
              },
              { scale: scaleAnims[index] },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleLevelSelect(level.id)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              isSelected
                ? [level.color, `${level.color}80`]
                : [Colors.backgroundSecondary, Colors.backgroundCard]
            }
            style={[
              styles.activityGradient,
              isSelected && styles.activityGradientSelected,
            ]}
          >
            {/* Header */}
            <View style={styles.activityHeader}>
              <View style={styles.activityIconContainer}>
                <View
                  style={[
                    styles.iconBackground,
                    {
                      backgroundColor: isSelected 
                        ? 'rgba(255,255,255,0.2)' 
                        : `${level.color}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={level.icon}
                    size={28}
                    color={isSelected ? Colors.textPrimary : level.color}
                  />
                </View>
              </View>
              
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <LinearGradient
                    colors={['#00ff88', '#00cc6a']}
                    style={styles.selectedBadgeGradient}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.activityContent}>
              <Text
                style={[
                  styles.activityLabel,
                  isSelected && styles.activityLabelSelected,
                ]}
              >
                {level.label}
              </Text>
              <Text
                style={[
                  styles.activityDescription,
                  isSelected && styles.activityDescriptionSelected,
                ]}
              >
                {level.description}
              </Text>
              <Text
                style={[
                  styles.activityDetails,
                  isSelected && styles.activityDetailsSelected,
                ]}
              >
                {level.details}
              </Text>
            </View>

            {/* Metrics */}
            <View style={styles.activityMetrics}>
              <View style={styles.metricItem}>
                <Text
                  style={[
                    styles.metricLabel,
                    isSelected && styles.metricLabelSelected,
                  ]}
                >
                  Est. Daily Calories
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    isSelected && styles.metricValueSelected,
                  ]}
                >
                  ~{estimatedCalories.toLocaleString()}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text
                  style={[
                    styles.metricLabel,
                    isSelected && styles.metricLabelSelected,
                  ]}
                >
                  Activity Multiplier
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    isSelected && styles.metricValueSelected,
                  ]}
                >
                  {level.multiplier}x
                </Text>
              </View>
            </View>

            {/* Activity Level Indicator */}
            <View style={styles.levelIndicator}>
              <View style={styles.levelBarContainer}>
                {[1, 2, 3].map((bar) => (
                  <View
                    key={bar}
                    style={[
                      styles.levelBar,
                      {
                        backgroundColor: 
                          bar <= ACTIVITY_LEVELS.findIndex(l => l.id === level.id) + 1
                            ? (isSelected ? Colors.textPrimary : level.color)
                            : Colors.borderPrimary,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const selectedLevelData = ACTIVITY_LEVELS.find(l => l.id === selectedLevel);

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
      <View style={styles.content}>
        <Text style={styles.description}>
          Your activity level helps us calculate your daily calorie needs more accurately.
        </Text>

        <Text style={styles.subtitle}>
          Choose the option that best describes your typical week.
        </Text>

        {/* Selected Level Preview */}
        {selectedLevelData && (
          <View style={styles.selectedPreview}>
            <LinearGradient
              colors={['#00ff88', '#00cc6a']}
              style={styles.previewGradient}
            >
              <View style={styles.previewContent}>
                <Ionicons 
                  name={selectedLevelData.icon} 
                  size={20} 
                  color={Colors.primary} 
                />
                <Text style={styles.previewText}>
                  {selectedLevelData.label} Selected
                </Text>
              </View>
              <Text style={styles.previewCalories}>
                ~{getEstimatedCalories(selectedLevelData).toLocaleString()} cal/day
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Activity Levels */}
        <ScrollView 
          style={styles.levelsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.levelsGrid}>
            {ACTIVITY_LEVELS.map((level, index) => renderActivityCard(level, index))}
          </View>
        </ScrollView>
      </View>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              canProceed
                ? ['#00ff88', '#00cc6a']
                : [Colors.borderPrimary, Colors.borderPrimary]
            }
            style={styles.nextButtonGradient}
          >
            <Text
              style={[
                styles.nextButtonText,
                !canProceed && styles.nextButtonTextDisabled,
              ]}
            >
              Continue to Summary
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={canProceed ? Colors.primary : Colors.textTertiary}
            />
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 25,
  },
  selectedPreview: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  previewCalories: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  levelsContainer: {
    flex: 1,
  },
  levelsGrid: {
    gap: 16,
  },
  activityCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  activityGradientSelected: {
    borderColor: 'transparent',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIconContainer: {
    flex: 1,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedBadgeGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    marginBottom: 16,
  },
  activityLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  activityLabelSelected: {
    color: Colors.textPrimary,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  activityDescriptionSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  activityDetails: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  activityDetailsSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  activityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricLabelSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metricValueSelected: {
    color: Colors.textPrimary,
  },
  levelIndicator: {
    alignItems: 'center',
  },
  levelBarContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  levelBar: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  footer: {
    paddingTop: 20,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 8,
  },
  nextButtonTextDisabled: {
    color: Colors.textTertiary,
  },
});

