import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <LinearGradient 
      colors={[Colors.backgroundPrimary, Colors.backgroundSecondary]} 
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 8,
  },
});



