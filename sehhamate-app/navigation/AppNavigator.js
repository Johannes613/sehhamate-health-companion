import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colorUtils';

// Import screens
import HomeScreen from '../screens/dashboard/HomeScreen';
import FoodScannerScreen from '../screens/food/FoodScannerScreen';
import LogsStackNavigator from './LogsStackNavigator';
import RecommendationsStackNavigator from './RecommendationsStackNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  console.log('AppNavigator - Rendering main app navigation');
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Logs') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Recommendations') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.borderPrimary,
          borderTopWidth: 1,
          paddingBottom: 20, // Increased bottom padding
          paddingTop: 8,
          height: 80, // Increased height to accommodate more padding
          paddingHorizontal: 20, // Added horizontal padding
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Scanner"
        component={FoodScannerScreen}
        options={{ title: 'Scanner' }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsStackNavigator}
        options={{ title: 'Logs' }}
      />
      <Tab.Screen
        name="Recommendations"
        component={RecommendationsStackNavigator}
        options={{ title: 'Recommendations' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
