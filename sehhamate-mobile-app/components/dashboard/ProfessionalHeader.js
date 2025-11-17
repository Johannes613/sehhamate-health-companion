import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';

export default function ProfessionalHeader({ userName = 'Sarah', onProfilePress }) {
  const getCurrentDate = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.time}>3:27</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={16} color={Colors.textPrimary} />
          <Ionicons name="wifi" size={16} color={Colors.textPrimary} />
          <Ionicons name="battery-full" size={16} color={Colors.textPrimary} />
        </View>
        <TouchableOpacity onPress={onProfilePress} style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerContent}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.date}>{getCurrentDate()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.activityPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerContent: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});


