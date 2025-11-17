import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';

const COMMON_ALLERGIES = [
  {
    id: 'peanuts',
    label: 'Peanuts',
    description: 'Peanuts and peanut products',
    icon: 'ellipse',
    severity: 'high',
  },
  {
    id: 'dairy',
    label: 'Dairy',
    description: 'Milk, cheese, yogurt',
    icon: 'water',
    severity: 'medium',
  },
  {
    id: 'shellfish',
    label: 'Shellfish',
    description: 'Shrimp, crab, lobster',
    icon: 'fish',
    severity: 'high',
  },
];

const SEVERITY_COLORS = {
  high: '#FF4444',
  medium: '#FFB020',
  low: '#00ff88',
};

export default function AllergyInfoStep({ data, onUpdate, onNext }) {
  const [selectedAllergies, setSelectedAllergies] = useState(
    data.allergies || []
  );
  const [customAllergy, setCustomAllergy] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
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

  const handleAllergyToggle = (allergyId) => {
    let newAllergies;
    
    const existingAllergy = selectedAllergies.find(a => a.id === allergyId);
    
    if (existingAllergy) {
      newAllergies = selectedAllergies.filter(a => a.id !== allergyId);
    } else {
      const allergyInfo = COMMON_ALLERGIES.find(a => a.id === allergyId);
      newAllergies = [...selectedAllergies, {
        id: allergyInfo.id,
        label: allergyInfo.label,
        severity: allergyInfo.severity,
        type: 'common',
      }];
    }
    
    setSelectedAllergies(newAllergies);
    onUpdate({ allergies: newAllergies });
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      const customId = `custom_${Date.now()}`;
      const newAllergy = {
        id: customId,
        label: customAllergy.trim(),
        severity: 'medium',
        type: 'custom',
      };
      
      const newAllergies = [...selectedAllergies, newAllergy];
      setSelectedAllergies(newAllergies);
      onUpdate({ allergies: newAllergies });
      setCustomAllergy('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustomAllergy = (allergyId) => {
    const newAllergies = selectedAllergies.filter(a => a.id !== allergyId);
    setSelectedAllergies(newAllergies);
    onUpdate({ allergies: newAllergies });
  };

  const handleNext = () => {
    if (selectedAllergies.length > 0) {
      Alert.alert(
        'Important Safety Notice',
        'Please always inform healthcare providers and restaurants about your allergies. This app is for informational purposes only.',
        [
          { text: 'I Understand', onPress: onNext }
        ]
      );
    } else {
      onNext();
    }
  };

  const renderAllergyCard = (allergy, index) => {
    const isSelected = selectedAllergies.some(a => a.id === allergy.id);
    const severityColor = SEVERITY_COLORS[allergy.severity];

    return (
      <Animated.View
        key={allergy.id}
        style={[
          styles.allergyCard,
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
        <TouchableOpacity
          onPress={() => handleAllergyToggle(allergy.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isSelected
                ? ['rgba(255, 68, 68, 0.2)', 'rgba(255, 68, 68, 0.1)']
                : [Colors.backgroundSecondary, Colors.backgroundCard]
            }
            style={[
              styles.allergyGradient,
              isSelected && { borderColor: severityColor },
            ]}
          >
            {/* Header */}
            <View style={styles.allergyHeader}>
              <View style={styles.allergyIcon}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: isSelected ? severityColor : Colors.borderPrimary },
                  ]}
                >
                  <Ionicons
                    name={allergy.icon}
                    size={20}
                    color={isSelected ? Colors.textPrimary : severityColor}
                  />
                </View>
                <View
                  style={[styles.severityIndicator, { backgroundColor: severityColor }]}
                />
              </View>
              
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.danger} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.allergyContent}>
              <Text
                style={[
                  styles.allergyLabel,
                  isSelected && styles.allergyLabelSelected,
                ]}
              >
                {allergy.label}
              </Text>
              <Text
                style={[
                  styles.allergyDescription,
                  isSelected && styles.allergyDescriptionSelected,
                ]}
              >
                {allergy.description}
              </Text>
              <View style={styles.severityBadge}>
                <Text
                  style={[
                    styles.severityText,
                    { color: severityColor },
                  ]}
                >
                  {allergy.severity.toUpperCase()} RISK
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCustomAllergies = () => {
    const customAllergies = selectedAllergies.filter(a => a.type === 'custom');
    
    if (customAllergies.length === 0) return null;

    return (
      <View style={styles.customAllergiesSection}>
        <Text style={styles.sectionTitle}>Your Custom Allergies</Text>
        {customAllergies.map((allergy) => (
          <View key={allergy.id} style={styles.customAllergyItem}>
            <LinearGradient
              colors={['rgba(255, 176, 32, 0.2)', 'rgba(255, 176, 32, 0.1)']}
              style={styles.customAllergyGradient}
            >
              <Text style={styles.customAllergyText}>{allergy.label}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveCustomAllergy(allergy.id)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
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
      <View style={styles.content}>
        <Text style={styles.description}>
          Help us keep you safe by letting us know about any food allergies or intolerances you have.
        </Text>

        <View style={styles.warningBanner}>
          <LinearGradient
            colors={['rgba(255, 68, 68, 0.1)', 'rgba(255, 68, 68, 0.05)']}
            style={styles.warningGradient}
          >
            <Ionicons name="warning" size={20} color={Colors.danger} />
            <Text style={styles.warningText}>
              This information is critical for your safety
            </Text>
          </LinearGradient>
        </View>

        {/* Selected Count */}
        {selectedAllergies.length > 0 && (
          <View style={styles.selectedCount}>
            <LinearGradient
              colors={['#FF4444', '#FF6B6B']}
              style={styles.countBadge}
            >
              <Ionicons name="shield" size={16} color={Colors.textPrimary} />
              <Text style={styles.countText}>
                {selectedAllergies.length} allerg{selectedAllergies.length === 1 ? 'y' : 'ies'} noted
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Allergies Grid */}
        <ScrollView 
          style={styles.allergiesContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Common Allergies</Text>
          <View style={styles.allergiesGrid}>
            {COMMON_ALLERGIES.map((allergy, index) => renderAllergyCard(allergy, index))}
          </View>

          {/* Custom Allergies */}
          {renderCustomAllergies()}

          {/* Add Custom Allergy */}
          <View style={styles.customSection}>
            {!showCustomInput ? (
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => setShowCustomInput(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[Colors.backgroundSecondary, Colors.backgroundCard]}
                  style={styles.addCustomGradient}
                >
                  <Ionicons name="add-circle-outline" size={24} color={Colors.accent} />
                  <Text style={styles.addCustomText}>Add Custom Allergy</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  value={customAllergy}
                  onChangeText={setCustomAllergy}
                  placeholder="Enter allergy name..."
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                />
                <View style={styles.customInputButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomAllergy('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      !customAllergy.trim() && styles.addButtonDisabled,
                    ]}
                    onPress={handleAddCustomAllergy}
                    disabled={!customAllergy.trim()}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onNext}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>No allergies</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  warningBanner: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  warningGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.danger,
    marginLeft: 8,
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  allergiesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  allergiesGrid: {
    gap: 12,
    marginBottom: 30,
  },
  allergyCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  allergyGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allergyIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  allergyContent: {
    flex: 1,
  },
  allergyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  allergyLabelSelected: {
    color: Colors.textPrimary,
  },
  allergyDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  allergyDescriptionSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  severityBadge: {
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customAllergiesSection: {
    marginBottom: 20,
  },
  customAllergyItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  customAllergyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.3)',
  },
  customAllergyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  removeButton: {
    marginLeft: 8,
  },
  customSection: {
    marginBottom: 20,
  },
  addCustomButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addCustomGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    borderStyle: 'dashed',
  },
  addCustomText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accent,
    marginLeft: 8,
  },
  customInputContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  customInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.borderPrimary,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
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

