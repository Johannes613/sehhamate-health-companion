import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function CircularProgressCard({ 
  progress, 
  value, 
  label, 
  subtitle, 
  color = Colors.accent,
  onPress 
}) {
  console.log('CircularProgressCard - Rendering progress card:', { progress, value, label });
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [progress]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();
    
    if (onPress) onPress();
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['#2D2D33', '#1C1C22']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.circleContainer}>
              <Animated.View 
                style={[
                  styles.outerRing,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <View style={[styles.outerCircle, { borderColor: color + '30' }]} />
              </Animated.View>
              
              <View style={styles.innerCircle}>
                <Animated.View 
                  style={[
                    styles.progressCircle,
                    {
                      borderColor: color,
                      borderWidth: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    }
                  ]}
                />
              </View>
              
              <View style={styles.centerContent}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${progress}%`,
                backgroundColor: color 
              }]} />
            </View>
            <Text style={styles.progressText}>{progress}% Complete</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '47%', // Slightly less than 48% to account for spacing
    marginBottom: 16,
    marginHorizontal: 0, // Ensure no horizontal margins
  },
  animatedContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 20, // Add borderRadius to match the card
  },
  card: {
    borderRadius: 20,
    padding: 12, // Reduced padding to ensure content fits
    height: 160, // Fixed height to match other cards
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  circleContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 70,
    height: 70,
  },
  outerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  innerCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
