import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colorUtils';

export default function CircularProgress({ 
  consumed, 
  goal, 
  label, 
  color = Colors.accent,
  size = 120,
  strokeWidth = 8 
}) {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const angle = (percentage / 100) * 360;

  // Create arc segments for visual progress
  const createArcStyle = (startAngle, sweepAngle, arcColor) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    borderColor: arcColor,
    borderTopColor: sweepAngle >= 90 ? arcColor : 'transparent',
    borderRightColor: sweepAngle >= 180 ? arcColor : sweepAngle >= 90 ? arcColor : 'transparent',
    borderBottomColor: sweepAngle >= 270 ? arcColor : sweepAngle >= 180 ? arcColor : 'transparent',
    borderLeftColor: sweepAngle >= 360 ? arcColor : sweepAngle >= 270 ? arcColor : 'transparent',
    transform: [{ rotate: `${startAngle}deg` }],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <View style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#404040'
        }
      ]} />
      
      {/* Progress Arc */}
      {percentage > 0 && (
        <View style={createArcStyle(-90, angle, color)} />
      )}
      
      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text style={styles.progressValue}>
          {consumed.toFixed(1)}{label === 'Calories' ? '' : 'g'}
        </Text>
        <Text style={styles.progressLabel}>Goal</Text>
        <Text style={styles.progressGoal}>
          {goal}{label === 'Calories' ? '' : 'g'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressGoal: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
