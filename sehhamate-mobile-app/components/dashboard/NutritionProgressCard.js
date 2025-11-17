import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function NutritionProgressCard({ currentCalories = 1360, goalCalories = 2000, onPress }) {
  console.log('NutritionProgressCard - Rendering nutrition progress card');
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress after card appears
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 300);
  }, []);

  const progress = Math.round((currentCalories / goalCalories) * 100);
  const remaining = Math.max(0, goalCalories - currentCalories);

  const animatedRotation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${progress * 3.6}deg`],
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Animated.View 
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['#2D2D33', '#1C1C22']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="flame" size={20} color={Colors.accent} />
              <Text style={styles.headerTitle}>Daily Calories</Text>
            </View>
            <View style={styles.goalBadge}>
              <Text style={styles.goalText}>Goal</Text>
            </View>
          </View>

          {/* Main Content - Horizontal Layout */}
          <View style={styles.mainContent}>
            {/* Left Side - Progress Circle */}
            <View style={styles.progressContainer}>
              <View style={styles.circleContainer}>
                {/* Background Circle */}
                <View style={styles.backgroundCircle} />
                
                {/* Progress Circle */}
                <Animated.View 
                  style={[
                    styles.progressCircle,
                    {
                      transform: [
                        { rotate: '-90deg' },
                        { rotate: animatedRotation },
                      ],
                    }
                  ]}
                />
                
                {/* Center Content */}
                <View style={styles.centerContent}>
                  <Text style={styles.progressValue}>{progress}%</Text>
                  <Text style={styles.progressLabel}>of goal</Text>
                </View>
              </View>
            </View>

            {/* Right Side - Calories Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Calories</Text>
              <View style={styles.calorieRow}>
                <Text style={styles.currentCalories}>{currentCalories}</Text>
                <Text style={styles.calorieSeparator}>/</Text>
                <Text style={styles.calorieGoal}>{goalCalories}</Text>
              </View>
              <Text style={styles.remainingText}>Remaining: {remaining} kcal</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 20,
    height: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  goalBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  goalText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.accent,
  },
  progressContainer: {
    marginRight: 20,
  },
  circleContainer: {
    width: 80,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: Colors.borderPrimary,
  },
  progressCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: Colors.accent,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  currentCalories: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  calorieSeparator: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  calorieGoal: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  calorieUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
