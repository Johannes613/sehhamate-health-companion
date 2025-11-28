import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DailyLogsScreen from '../screens/logs/DailyLogsScreen';
import NutritionLogScreen from '../screens/nutrition/NutritionLogScreen';
import ActivityLogScreen from '../screens/activity/ActivityLogScreen';
import DocumentUploadScreen from '../screens/documents/DocumentUploadScreen';
import AnalyticsDashboardScreen from '../screens/analytics/AnalyticsDashboardScreen';

const Stack = createStackNavigator();

export default function LogsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DailyLogs"
        component={DailyLogsScreen}
      />
      <Stack.Screen
        name="NutritionLog"
        component={NutritionLogScreen}
      />
      <Stack.Screen
        name="ActivityLog"
        component={ActivityLogScreen}
      />
      <Stack.Screen
        name="DocumentUpload"
        component={DocumentUploadScreen}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsDashboardScreen}
      />
    </Stack.Navigator>
  );
}
