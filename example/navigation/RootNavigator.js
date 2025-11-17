import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Text } from 'react-native';

import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { ChatsCircle } from "phosphor-react-native";
import AppNavigator from './AppNavigator'; 
import AuthStackNavigator from './AuthStackNavigator';
import QuizStackNavigator from './QuizStackNavigator';
import ChatbotModal from '../components/modals/ChatbotModal';
import { useAuth } from '../contexts/AuthContext';

const RootStack = createStackNavigator();

const MainAppWrapper = () => {
    const [isChatVisible, setChatVisible] = useState(false);
    return (
        <View style={{ flex: 1 }}>
            <AppNavigator />
            <TouchableOpacity style={fabStyles.fabChatbot} onPress={() => setChatVisible(true)}>
                <ChatsCircle color="#FFFFFF" size={32} weight="fill" />
            </TouchableOpacity>
            <ChatbotModal isVisible={isChatVisible} onClose={() => setChatVisible(false)} />
        </View>
    );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingView}>
        <ActivityIndicator size="large" color="#8A63D2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <RootStack.Screen name="MainApp" component={MainAppWrapper} />
        
          <RootStack.Screen 
            name="QuizStack" 
            component={QuizStackNavigator} 
            options={{ 
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }} 
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

const fabStyles = StyleSheet.create({
    fabChatbot: {
        position: "absolute",
        bottom: 110,
        right: 20,
        width: 60,
        height: 60,
        backgroundColor: "#8A63D2",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        zIndex: 10,
    },
});

const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    backgroundColor: '#F5F6F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#8A63D2',
  },
});

export default RootNavigator;
