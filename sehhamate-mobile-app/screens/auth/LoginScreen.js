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
import { validateEmail, validatePassword } from '../../utils/validation';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const { login, loading } = useAuth();

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
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };
    startPulse();
  }, []);

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs before attempting login
    let hasErrors = false;

    // For admin login, allow "admin" username without email validation
    if (loginType === 'admin' && email.trim().toLowerCase() === 'admin') {
      // Allow admin username, skip email validation
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error);
        hasErrors = true;
      }
    }

    // Validate password (allow shorter password for admin)
    if (loginType === 'admin' && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    } else if (loginType === 'user') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error);
        hasErrors = true;
      }
    }

    // If validation fails, don't proceed with login
    if (hasErrors) {
      return;
    }

    try {
      // Proceed with login
      console.log('Starting login process...', { loginType });
      const result = await login(email, password, loginType);
      
      if (!result.success) {
        // Only show error if login actually failed
        console.log('Login failed:', result.error);
        Alert.alert('Login Error', result.error);
      } else {
        // Clear any existing errors on successful login
        setEmailError('');
        setPasswordError('');
        console.log('Login successful - auth state should update automatically');
        
        // Small delay to ensure Firebase auth state change is processed
        setTimeout(() => {
          console.log('Login process completed');
        }, 100);
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Real-time email validation
  const handleEmailChange = (text) => {
    setEmail(text);
    // For admin login, allow "admin" username without email validation
    if (loginType === 'admin' && (text.trim().toLowerCase() === 'admin' || !text.trim())) {
      setEmailError('');
      return;
    }
    if (emailError && text.trim()) {
      const validation = validateEmail(text);
      if (validation.isValid) {
        setEmailError('');
      }
    }
  };

  // Real-time password validation  
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError && text) {
      const validation = validatePassword(text);
      if (validation.isValid) {
        setPasswordError('');
      }
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#0a0a0a', '#1a2a1a', '#2d2d33', '#1a1a2a']}
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
          showsVerticalScrollIndicator={false}
        >
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
                    colors={['#00ff88', '#4ECDC4', '#45B7D1']}
                    style={styles.logoCircle}
                  >
                    <Ionicons name="fitness-outline" size={32} color="#000" />
                  </LinearGradient>
                  <Text style={styles.logoText}>HealthSphere</Text>
                  <Text style={styles.logoSubtext}>AI</Text>
                </View>
              </Animated.View>

              {/* Welcome Text */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeSubtitle}>Continue your wellness journey</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {loginType === 'admin' ? 'Username or Email' : 'Email Address'}
                  </Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name={loginType === 'admin' ? 'person' : 'mail'} size={18} color="#00ff88" />
                    </View>
                    <TextInput
                      style={[styles.input, emailError && styles.inputError]}
                      placeholder={loginType === 'admin' ? 'Enter admin username' : 'Enter your email'}
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={email}
                      onChangeText={handleEmailChange}
                      keyboardType={loginType === 'admin' ? 'default' : 'email-address'}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : null}
                  {loginType === 'admin' && (
                    <Text style={styles.hintText}>
                      Default: admin / admin123
                    </Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="lock-closed" size={18} color="#00ff88" />
                    </View>
                    <TextInput
                      style={[styles.input, passwordError && styles.inputError]}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={password}
                      onChangeText={handlePasswordChange}
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
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>

                {/* Login Type Selector */}
                <View style={styles.loginTypeContainer}>
                  <TouchableOpacity
                    style={[styles.loginTypeButton, loginType === 'user' && styles.loginTypeButtonActive]}
                    onPress={() => setLoginType('user')}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="person" 
                      size={18} 
                      color={loginType === 'user' ? '#000' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text style={[styles.loginTypeText, loginType === 'user' && styles.loginTypeTextActive]}>
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.loginTypeButton, loginType === 'admin' && styles.loginTypeButtonActive]}
                    onPress={() => setLoginType('admin')}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="shield" 
                      size={18} 
                      color={loginType === 'admin' ? '#000' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text style={[styles.loginTypeText, loginType === 'admin' && styles.loginTypeTextActive]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#00ff88', '#4ECDC4', '#45B7D1']}
                    style={styles.loginGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <View style={styles.loginButtonContent}>
                        <Text style={styles.loginButtonText}>
                          {loginType === 'admin' ? 'Sign In as Admin' : 'Sign In'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
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

                {/* Sign Up Section */}
                <View style={styles.signUpSection}>
                  <Text style={styles.signUpText}>New to HealthSphere?</Text>
                  <TouchableOpacity
                    style={styles.signUpButton}
                    onPress={handleSignUp}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                    <Ionicons name="person-add" size={16} color="#00ff88" />
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
    top: height * 0.1,
    right: width * 0.1,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  orb2: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.05,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
  },
  orb3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: width * 0.05,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(69, 183, 209, 0.06)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  mainCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
  },
  cardGradient: {
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 3,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    gap: 24,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
  },
  inputIconContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    paddingRight: 16,
  },
  eyeButton: {
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  signUpSection: {
    alignItems: 'center',
    gap: 12,
  },
  signUpText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    gap: 8,
  },
  signUpButtonText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#ff4757',
    borderWidth: 1,
  },
  hintText: {
    fontSize: 12,
    color: '#00ff88',
    marginTop: 4,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  loginTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  loginTypeButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  loginTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loginTypeTextActive: {
    color: '#000',
  },
});

