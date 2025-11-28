import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', icon: 'male' },
  { id: 'female', label: 'Female', icon: 'female' },
  { id: 'other', label: 'Other', icon: 'person' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: 'help-circle-outline' },
];

export default function BasicInfoStep({ data, onUpdate, onNext, canProceed }) {
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  
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

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'age':
        if (!value || isNaN(value) || parseInt(value) < 13 || parseInt(value) > 120) {
          newErrors.age = 'Please enter a valid age (13-120)';
        } else {
          delete newErrors.age;
        }
        break;
      case 'weight':
        if (!value || isNaN(value) || parseFloat(value) < 30 || parseFloat(value) > 300) {
          newErrors.weight = 'Please enter a valid weight (30-300 kg)';
        } else {
          delete newErrors.weight;
        }
        break;
      case 'height':
        if (!value || isNaN(value) || parseInt(value) < 100 || parseInt(value) > 250) {
          newErrors.height = 'Please enter a valid height (100-250 cm)';
        } else {
          delete newErrors.height;
        }
        break;
      case 'gender':
        if (!value) {
          newErrors.gender = 'Please select your gender';
        } else {
          delete newErrors.gender;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
    validateField(field, value);
  };

  const handleGenderSelect = (gender) => {
    onUpdate({ gender });
    validateField('gender', gender);
  };

  const handleNext = () => {
    // Validate all fields
    const isValid = validateField('age', data.age) &&
                   validateField('weight', data.weight) &&
                   validateField('height', data.height) &&
                   validateField('gender', data.gender);
    
    if (isValid) {
      onNext();
    } else {
      Alert.alert('Please Complete All Fields', 'Make sure all information is filled out correctly.');
    }
  };

  const renderInputField = (field, placeholder, unit, keyboardType = 'numeric') => {
    const isFocused = focusedField === field;
    const hasError = errors[field];
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{placeholder}</Text>
        <View style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}>
          <TextInput
            style={styles.input}
            value={data[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={`Enter your ${placeholder ? placeholder.toLowerCase() : 'information'}`}
            placeholderTextColor={Colors.textTertiary}
            keyboardType={keyboardType}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            maxLength={field === 'age' ? 3 : 6}
          />
          {unit && (
            <Text style={styles.inputUnit}>{unit}</Text>
          )}
        </View>
        {hasError && (
          <Text style={styles.errorText}>{hasError}</Text>
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
        }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.description}>
          Help us personalize your nutrition plan by sharing some basic information about yourself.
        </Text>

        {/* Age Input */}
        {renderInputField('age', 'Age', 'years')}

        {/* Weight Input */}
        {renderInputField('weight', 'Weight', 'kg', 'decimal-pad')}

        {/* Height Input */}
        {renderInputField('height', 'Height', 'cm')}

        {/* Gender Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderContainer}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.genderOption,
                  data.gender === option.id && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect(option.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    data.gender === option.id
                      ? ['#00ff88', '#00cc6a']
                      : [Colors.backgroundSecondary, Colors.backgroundSecondary]
                  }
                  style={styles.genderOptionGradient}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={
                      data.gender === option.id ? Colors.primary : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.genderOptionText,
                      data.gender === option.id && styles.genderOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}
        </View>

        {/* BMI Preview */}
        {data.weight && data.height && (
          <View style={styles.bmiPreview}>
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundCard]}
              style={styles.bmiContainer}
            >
              <View style={styles.bmiHeader}>
                <Ionicons name="fitness-outline" size={20} color={Colors.accent} />
                <Text style={styles.bmiTitle}>BMI Preview</Text>
              </View>
              <Text style={styles.bmiValue}>
                {(parseFloat(data.weight) / Math.pow(parseFloat(data.height) / 100, 2)).toFixed(1)}
              </Text>
              <Text style={styles.bmiLabel}>Body Mass Index</Text>
            </LinearGradient>
          </View>
        )}
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
              Continue
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
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: Colors.accent,
    backgroundColor: Colors.backgroundCard,
  },
  inputContainerError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  genderOptionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  genderOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bmiPreview: {
    marginTop: 10,
  },
  bmiContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 4,
  },
  bmiLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
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

