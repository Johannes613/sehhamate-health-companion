/**
 * Admin Navigator
 * Navigation for admin users
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

// Import admin management screens
// import UserManagementScreen from '../screens/admin/UserManagementScreen';
// import RoleManagementScreen from '../screens/admin/RoleManagementScreen';
// import AIModelManagementScreen from '../screens/admin/AIModelManagementScreen';
// import SystemMonitoringScreen from '../screens/admin/SystemMonitoringScreen';
// import DataManagementScreen from '../screens/admin/DataManagementScreen';
// import IssueResolutionScreen from '../screens/admin/IssueResolutionScreen';
// import FalsePositiveAlertsScreen from '../screens/admin/FalsePositiveAlertsScreen';

// Component for admin management screens
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ui/ScreenContainer';
import ScreenHeader from '../components/ui/ScreenHeader';
import { Colors } from '../utils/colorUtils';

const PlaceholderScreen = ({ navigation, route }) => {
  return (
    <ScreenContainer>
      <ScreenHeader title={route.params?.title || 'Coming Soon'} navigation={navigation} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Ionicons name="construct" size={64} color={Colors.accent} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 20, marginBottom: 10 }}>
          {route.params?.title || 'Admin Feature'}
        </Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>
          This feature is available for admin users.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      {/* Admin management screens - only User Management and Role Management */}
      <Stack.Screen
        name="UserManagement"
        component={PlaceholderScreen}
        initialParams={{ title: 'User Management' }}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="RoleManagement"
        component={PlaceholderScreen}
        initialParams={{ title: 'Role & Permissions' }}
        options={{ title: 'Role & Permissions' }}
      />
    </Stack.Navigator>
  );
}

