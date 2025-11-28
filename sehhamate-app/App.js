import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import RootNavigator from './navigation/RootNavigator';
import IntroScreen from './components/intro/IntroScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show intro screen for 3.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <MealPlanProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#0a0a0a" />
            {isLoading ? <IntroScreen /> : <RootNavigator />}
          </NavigationContainer>
        </SafeAreaProvider>
      </MealPlanProvider>
    </AuthProvider>
  );
}
