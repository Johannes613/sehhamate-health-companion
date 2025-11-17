import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ScreenContainer from '../components/ui/ScreenContainer';
import { User, Envelope, Lock } from 'phosphor-react-native';
import { useAuth } from '../contexts/AuthContext';
import zxcvbn from 'zxcvbn';
import { savePasswordStrength } from '../utils/SavePasswordStrength';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignUp = async () => {
    if (name === '' || email === '' || password === '') {
      Alert.alert("Authentication Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Authentication Error", "Password must be at least 6 characters long.");
      return;
    }

    const strength = zxcvbn(password);
    const strengthScore = strength.score * 25; 

    setLoading(true);
    try {
      const userCredential = await signup(email, password, name);
      await savePasswordStrength(strengthScore);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Sign-up Failed", "This email address is already in use.");
      } else {
        Alert.alert("Sign-up Failed", "Please check your email format.");
      }
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your cybersecurity training today.</Text>

        <View style={styles.inputContainer}>
          <User color="#6C757D" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6C757D"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Envelope color="#6C757D" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#6C757D"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock color="#6C757D" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6C757D"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
  title: { color: '#212529', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#6C757D', fontSize: 16, textAlign: 'center', marginBottom: 40 },
  inputContainer: {
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 20,
  },
  inputIcon: { marginHorizontal: 16 },
  input: { flex: 1, color: '#212529', fontSize: 16, paddingVertical: 16 },
  button: {
    backgroundColor: '#8A63D2',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 58,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#6C757D', fontSize: 14 },
  linkText: { color: '#8A63D2', fontSize: 14, fontWeight: 'bold' },
});

export default SignUpScreen;
