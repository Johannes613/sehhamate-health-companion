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

const DIETARY_OPTIONS = [
  {
    id: 'none',
    label: 'No Restrictions',
    description: 'I eat everything',
    icon: 'restaurant-outline',
    color: '#4A90E2',
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat, but dairy and eggs are okay',
    icon: 'leaf-outline',
    color: '#7ED321',
  },
  {
    id: 'vegan',
    label: 'Vegan',
    description: 'Plant-based diet only',
    icon: 'flower-outline',
    color: '#50E3C2',
  },
  {
    id: 'pescatarian',
    label: 'Pescatarian',
    description: 'Fish and seafood, but no meat',
    icon: 'fish-outline',
    color: '#5AC8FA',
  },
];

export default function DietaryPreferencesStep({ data, onUpdate, onNext }) {
  const [selectedPreferences, setSelectedPreferences] = useState(
    data.dietaryPreferences || []
  );
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const handlePreferenceToggle = (preferenceId) => {
    let newPreferences;
    
    if (preferenceId === 'none') {
      // If "No Restrictions" is selected, clear all other preferences
      newPreferences = selectedPreferences.includes('none') ? [] : ['none'];
    } else {
      // Remove "No Restrictions" if any specific diet is selected
      const filteredPrefs = selectedPreferences.filter(p => p !== 'none');
      
      if (filteredPrefs.includes(preferenceId)) {
        newPreferences = filteredPrefs.filter(p => p !== preferenceId);
      } else {
        newPreferences = [...filteredPrefs, preferenceId];
      }
    }
    
    setSelectedPreferences(newPreferences);
    onUpdate({ dietaryPreferences: newPreferences });
  };

  const handleNext = () => {
    onNext();
  };

  const renderPreferenceCard = (option, index) => {
    const isSelected = selectedPreferences.includes(option.id);
    const animationDelay = index * 100;

    return (
      <Animated.View
        key={option.id}
        style={[
          styles.preferenceCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 50 + animationDelay / 10],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePreferenceToggle(option.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isSelected
                ? [option.color, `${option.color}80`]
                : [Colors.backgroundSecondary, Colors.backgroundCard]
            }
            style={[
              styles.preferenceGradient,
              isSelected && styles.preferenceGradientSelected,
            ]}
          >
            {/* Selection Indicator */}
            <View style={styles.preferenceHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : Colors.borderPrimary },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={isSelected ? Colors.textPrimary : option.color}
                />
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.preferenceContent}>
              <Text
                style={[
                  styles.preferenceLabel,
                  isSelected && styles.preferenceLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.preferenceDescription,
                  isSelected && styles.preferenceDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
      <View style={styles.content}>
        <Text style={styles.description}>
          Select any dietary preferences or restrictions you follow. This helps us provide better nutrition recommendations.
        </Text>

        <Text style={styles.subtitle}>
          You can select multiple options or skip this step entirely.
        </Text>

        {/* Selected Count */}
        {selectedPreferences.length > 0 && (
          <View style={styles.selectedCount}>
            <LinearGradient
              colors={['#00ff88', '#00cc6a']}
              style={styles.countBadge}
            >
              <Text style={styles.countText}>
                {selectedPreferences.length} selected
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Preferences Grid */}
        <ScrollView 
          style={styles.preferencesContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.preferencesGrid}>
            {DIETARY_OPTIONS.map((option, index) => renderPreferenceCard(option, index))}
          </View>
        </ScrollView>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00ff88', '#00cc6a']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 25,
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  preferencesContainer: {
    flex: 1,
  },
  preferencesGrid: {
    gap: 12,
  },
  preferenceCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  preferenceGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  preferenceGradientSelected: {
    borderColor: 'transparent',
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    marginLeft: 8,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  preferenceLabelSelected: {
    color: Colors.textPrimary,
  },
  preferenceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  preferenceDescriptionSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 2,
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
});

