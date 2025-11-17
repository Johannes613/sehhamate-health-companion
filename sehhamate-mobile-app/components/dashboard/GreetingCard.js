import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../utils/colorUtils';

export default function GreetingCard({ userName = 'Sarah', avatarUrl }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.greeting}>Hi, {userName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: -0.015,
  },
});


