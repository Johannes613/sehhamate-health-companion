import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colorUtils';

export default function ActivityRing({ progress = 0.6, goal = 150, current = 90, title = "Move" }) {
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        {/* Background ring */}
        <View style={[styles.ring, styles.backgroundRing]} />
        {/* Progress ring overlay */}
        <View style={[styles.ring, styles.progressRing, { 
          borderColor: Colors.activityRed,
          borderWidth: strokeWidth,
        }]} />
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.currentValue}>{current}</Text>
          <Text style={styles.goalText}>/ {goal} CAL</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
  },
  backgroundRing: {
    borderWidth: 8,
    borderColor: Colors.borderPrimary,
  },
  progressRing: {
    borderWidth: 8,
    borderColor: Colors.activityRed,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  goalText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
