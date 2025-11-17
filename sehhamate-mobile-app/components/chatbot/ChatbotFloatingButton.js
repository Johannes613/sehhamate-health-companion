/**
 * Chatbot Floating Button Component
 * Displays a floating button to open the health chatbot
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function ChatbotFloatingButton({ onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.floatingButton, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#00ff88', '#00cc6a']}
        style={styles.gradient}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



