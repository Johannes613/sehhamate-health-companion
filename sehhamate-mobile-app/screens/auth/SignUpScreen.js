import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../utils/colorUtils';
import { validateEmail, validatePassword, validateName, validatePhoneNumber, formatPhoneNumber } from '../../utils/validation';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  // Registration method: 'email' or 'phone'
  const [registrationMethod, setRegistrationMethod] = useState('email');
  
  // Basic info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Health profile fields (FR-1.1.3, FR-1.1.4, FR-1.1.5)
  const [diabetesType, setDiabetesType] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  
  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { signUp, loading } = useAuth();
  
  // Common allergy options
  const allergyOptions = ['Nuts', 'Peanuts', 'Dairy', 'Lactose', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Sesame'];
  
  // Common dietary restriction options
  const dietaryRestrictionOptions = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Low Sugar', 'Low Sodium', 'Low Fat', 'Low Carb', 'Keto', 'Paleo'];
  
  // Diabetes type options
  const diabetesTypeOptions = ['Type 1 Diabetes', 'Type 2 Diabetes', 'Prediabetes', 'Gestational Diabetes', 'None'];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for logo
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };
    startPulse();
  }, []);

  // Toggle allergy selection
  const toggleAllergy = (allergy) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  // Toggle dietary restriction selection
  const toggleDietaryRestriction = (restriction) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleSignUp = async () => {
    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error);
      return;
    }

    // Validate based on registration method
    if (registrationMethod === 'email') {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error);
        return;
      }
    } else {
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error);
        return;
      }
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    // Prepare health profile data
    const healthProfileData = {
      diabetesType: diabetesType || null,
      allergies: allergies,
      dietaryRestrictions: dietaryRestrictions,
    };

    // Call signUp with appropriate identifier
    const identifier = registrationMethod === 'email' ? email : formatPhoneNumber(phoneNumber);
    const result = await signUp(name, identifier, password, confirmPassword, registrationMethod, healthProfileData);
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#0a0a0a', '#2a1a1a', '#2d2d33', '#1a1a2a']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.orb2, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.orb3, { transform: [{ scale: pulseAnim }] }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          bounces={true}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Main Content Card */}
          <Animated.View 
            style={[
              styles.mainCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(45, 45, 51, 0.9)', 'rgba(28, 28, 34, 0.9)']}
              style={styles.cardGradient}
            >
              {/* Logo Section */}
              <Animated.View style={[styles.logoSection, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#ff6b6b', '#4ECDC4', '#45B7D1']}
                    style={styles.logoCircle}
                  >
                    <Ionicons name="person-add" size={28} color="#000" />
                  </LinearGradient>
                  <Text style={styles.logoText}>Join SehhaMate</Text>
                  <Text style={styles.logoSubtext}>Health Companion</Text>
                </View>
              </Animated.View>

              {/* Welcome Text */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Create Account</Text>
                <Text style={styles.welcomeSubtitle}>Start your personalized wellness journey</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Name Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="person" size={18} color="#ff6b6b" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setNameError('');
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                </View>

                {/* Registration Method Selector */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Registration Method</Text>
                  <View style={styles.methodSelector}>
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        registrationMethod === 'email' && styles.methodButtonActive
                      ]}
                      onPress={() => setRegistrationMethod('email')}
                    >
                      <Ionicons 
                        name="mail" 
                        size={18} 
                        color={registrationMethod === 'email' ? '#000' : 'rgba(255, 255, 255, 0.6)'} 
                      />
                      <Text style={[
                        styles.methodButtonText,
                        registrationMethod === 'email' && styles.methodButtonTextActive
                      ]}>
                        Email
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        registrationMethod === 'phone' && styles.methodButtonActive
                      ]}
                      onPress={() => setRegistrationMethod('phone')}
                    >
                      <Ionicons 
                        name="call" 
                        size={18} 
                        color={registrationMethod === 'phone' ? '#000' : 'rgba(255, 255, 255, 0.6)'} 
                      />
                      <Text style={[
                        styles.methodButtonText,
                        registrationMethod === 'phone' && styles.methodButtonTextActive
                      ]}>
                        Phone
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Email or Phone Input */}
                {registrationMethod === 'email' ? (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="mail" size={18} color="#4ECDC4" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          setEmailError('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="call" size={18} color="#4ECDC4" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="+971501234567 or 0501234567"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={phoneNumber}
                        onChangeText={(text) => {
                          setPhoneNumber(text);
                          setPhoneError('');
                        }}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                  </View>
                )}

                {/* Diabetes Type Selection (FR-1.1.3) */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Diabetes Type (Optional)</Text>
                  <View style={styles.dropdownContainer}>
                    {diabetesTypeOptions.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.optionChip,
                          diabetesType === type && styles.optionChipSelected
                        ]}
                        onPress={() => setDiabetesType(type === diabetesType ? '' : type)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          diabetesType === type && styles.optionChipTextSelected
                        ]}>
                          {type}
                        </Text>
                        {diabetesType === type && (
                          <Ionicons name="checkmark-circle" size={16} color="#000" style={{ marginLeft: 6 }} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Allergy Selection (FR-1.1.4) */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Allergies (Select all that apply)</Text>
                  <View style={styles.chipContainer}>
                    {allergyOptions.map((allergy) => (
                      <TouchableOpacity
                        key={allergy}
                        style={[
                          styles.chip,
                          allergies.includes(allergy) && styles.chipSelected
                        ]}
                        onPress={() => toggleAllergy(allergy)}
                      >
                        <Text style={[
                          styles.chipText,
                          allergies.includes(allergy) && styles.chipTextSelected
                        ]}>
                          {allergy}
                        </Text>
                        {allergies.includes(allergy) && (
                          <Ionicons name="close-circle" size={14} color="#000" style={{ marginLeft: 4 }} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dietary Restrictions Selection (FR-1.1.5) */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Dietary Restrictions (Select all that apply)</Text>
                  <View style={styles.chipContainer}>
                    {dietaryRestrictionOptions.map((restriction) => (
                      <TouchableOpacity
                        key={restriction}
                        style={[
                          styles.chip,
                          dietaryRestrictions.includes(restriction) && styles.chipSelected
                        ]}
                        onPress={() => toggleDietaryRestriction(restriction)}
                      >
                        <Text style={[
                          styles.chipText,
                          dietaryRestrictions.includes(restriction) && styles.chipTextSelected
                        ]}>
                          {restriction}
                        </Text>
                        {dietaryRestrictions.includes(restriction) && (
                          <Ionicons name="close-circle" size={14} color="#000" style={{ marginLeft: 4 }} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="lock-closed" size={18} color="#45B7D1" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Create a password"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setPasswordError('');
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={18}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="shield-checkmark" size={18} color="#ff6b6b" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setConfirmPasswordError('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={18}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                </View>

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#4ECDC4', '#45B7D1']}
                    style={styles.signUpGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <View style={styles.signUpButtonContent}>
                        <Text style={styles.signUpButtonText}>Create Account</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#000" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerCircle}>
                    <Text style={styles.dividerText}>or</Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* Login Section */}
                <View style={styles.loginSection}>
                  <Text style={styles.loginText}>Already have an account?</Text>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Ionicons name="log-in" size={16} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Floating orbs for visual appeal
  orb1: {
    position: 'absolute',
    top: height * 0.08,
    right: width * 0.08,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  orb2: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.03,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
  },
  orb3: {
    position: 'absolute',
    bottom: height * 0.15,
    right: width * 0.02,
    width: 95,
    height: 95,
    borderRadius: 47.5,
    backgroundColor: 'rgba(69, 183, 209, 0.06)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
    marginTop: 60,
  },
  cardGradient: {
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  logoSubtext: {
    fontSize: 11,
    color: '#ff6b6b',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 2.5,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    gap: 20,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 52,
  },
  inputIconContainer: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    paddingRight: 14,
  },
  eyeButton: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsContainer: {
    paddingVertical: 8,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  termsLink: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  signUpButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signUpGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signUpButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  loginSection: {
    alignItems: 'center',
    gap: 10,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    gap: 6,
  },
  loginButtonText: {
    color: '#4ECDC4',
    fontSize: 13,
    fontWeight: '600',
  },
  // Error text style
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Registration method selector
  methodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  methodButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  methodButtonTextActive: {
    color: '#000',
  },
  // Chip styles for allergies and dietary restrictions
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  chipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  // Dropdown/option chip styles for diabetes type
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: '48%',
  },
  optionChipSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  optionChipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
});

