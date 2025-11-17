import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SmartRecommendationsScreen from '../screens/recommendations/SmartRecommendationsScreen';
import MealSetupScreen from '../screens/recommendations/MealSetupScreen';
import MealRecommendationsScreen from '../screens/recommendations/MealRecommendationsScreen';
import DocumentUploadScreen from '../screens/documents/DocumentUploadScreen';

const Stack = createStackNavigator();

export default function RecommendationsStackNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Stack.Screen 
        name="SmartRecommendations" 
        component={SmartRecommendationsScreen} 
      />
      <Stack.Screen 
        name="MealSetup" 
        component={MealSetupScreen} 
      />
      <Stack.Screen 
        name="MealRecommendations" 
        component={MealRecommendationsScreen} 
      />
      <Stack.Screen 
        name="DocumentUpload" 
        component={DocumentUploadScreen} 
      />
    </Stack.Navigator>
  );
}
