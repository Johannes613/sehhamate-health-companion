import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import AuthStackNavigator from './AuthStackNavigator';
import AppNavigator from './AppNavigator';
import AdminNavigator from './AdminNavigator';
import ProfileSetupScreen from '../screens/profile/ProfileSetupScreen';
import HealthChatbotScreen from '../screens/chatbot/HealthChatbotScreen';
import MedicationScannerScreen from '../screens/medication/MedicationScannerScreen';
import LoadingScreen from '../components/ui/LoadingScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, profileSetupCompleted, loading, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  console.log('RootNavigator - isAuthenticated:', isAuthenticated);
  console.log('RootNavigator - profileSetupCompleted:', profileSetupCompleted);
  console.log('RootNavigator - loading:', loading);

  // Show loading screen while Firebase initializes
  // Add a maximum timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout - forcing navigation');
        setLoadingTimeout(true);
      }, 5000); // 5 second maximum
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);
  
  if (loading && !loadingTimeout) {
    return <LoadingScreen message="Initializing..." />;
  }
  
  // If loading timeout occurred, show auth screen anyway
  if (loadingTimeout && !isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
        <Stack.Screen 
          name="HealthChatbot" 
          component={HealthChatbotScreen}
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      ) : isAdmin ? (
        // Admin users go directly to admin dashboard
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : !profileSetupCompleted ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <Stack.Screen name="App" component={AppNavigator} />
      )}
      {/* Chatbot screen accessible from anywhere */}
      <Stack.Screen 
        name="HealthChatbot" 
        component={HealthChatbotScreen}
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }}
      />
      {/* Medication Scanner screen */}
      <Stack.Screen 
        name="MedicationScanner" 
        component={MedicationScannerScreen}
        options={{ 
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

