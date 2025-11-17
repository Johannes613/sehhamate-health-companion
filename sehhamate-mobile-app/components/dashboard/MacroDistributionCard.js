import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function MacroDistributionCard({ protein = {}, carbs = {}, fat = {}, onPress }) {
  console.log('MacroDistributionCard - Rendering macro distribution card');
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const carbsAnim = useRef(new Animated.Value(0)).current;
  const proteinAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;

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

    // Animate donut segments with staggered timing
    setTimeout(() => {
      Animated.stagger(200, [
        Animated.timing(carbsAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(proteinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(fatAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }, 300);
  }, []);

  const macros = {
    carbs: { 
      current: carbs.current || 120, 
      goal: carbs.goal || 250, 
      percentage: Math.round(((carbs.current || 120) / (carbs.goal || 250)) * 100), 
      color: Colors.activityPurple 
    },
    protein: { 
      current: protein.current || 85, 
      goal: protein.goal || 150, 
      percentage: Math.round(((protein.current || 85) / (protein.goal || 150)) * 100), 
      color: Colors.warning 
    },
    fat: { 
      current: fat.current || 45, 
      goal: fat.goal || 67, 
      percentage: Math.round(((fat.current || 45) / (fat.goal || 67)) * 100), 
      color: Colors.danger 
    },
  };

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
              <Ionicons name="pie-chart" size={20} color={Colors.accent} />
              <Text style={styles.headerTitle}>Macros</Text>
            </View>
            <TouchableOpacity style={styles.expandButton}>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Main Content - Horizontal Layout */}
          <View style={styles.mainContent}>
            {/* Left Side - Donut Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.donutChart}>
                {/* Background Circle */}
                <View style={styles.chartBackground} />
                
                {/* Carbs Segment */}
                <Animated.View 
                  style={[
                    styles.chartSegment,
                    {
                      borderColor: macros.carbs.color,
                      transform: [
                        { rotate: '-90deg' },
                        {
                          rotate: carbsAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', `${macros.carbs.percentage * 1.2}deg`],
                          }),
                        },
                      ],
                    }
                  ]}
                />
                
                {/* Protein Segment */}
                <Animated.View 
                  style={[
                    styles.chartSegment,
                    {
                      borderColor: macros.protein.color,
                      transform: [
                        { rotate: `${macros.carbs.percentage * 1.2 - 90}deg` },
                        {
                          rotate: proteinAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', `${macros.protein.percentage * 1.2}deg`],
                          }),
                        },
                      ],
                    }
                  ]}
                />
                
                {/* Fat Segment */}
                <Animated.View 
                  style={[
                    styles.chartSegment,
                    {
                      borderColor: macros.fat.color,
                      transform: [
                        { rotate: `${(macros.carbs.percentage + macros.protein.percentage) * 1.2 - 90}deg` },
                        {
                          rotate: fatAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', `${macros.fat.percentage * 1.2}deg`],
                          }),
                        },
                      ],
                    }
                  ]}
                />
              </View>
            </View>

            {/* Right Side - Macro Legend */}
            <View style={styles.legendContainer}>
              {Object.entries(macros).map(([key, macro]) => (
                <View key={key} style={styles.macroItem}>
                  <View style={styles.macroHeader}>
                    <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
                    <Text style={styles.macroLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </Text>
                  </View>
                  <View style={styles.macroValues}>
                    <Text style={styles.macroCurrent}>{macro.current}g</Text>
                    <Text style={styles.macroSeparator}>/</Text>
                    <Text style={styles.macroGoal}>{macro.goal}g</Text>
                  </View>
                </View>
              ))}
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
  expandButton: {
    padding: 4,
  },
  chartContainer: {
    marginRight: 20,
  },
  donutChart: {
    width: 80,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: Colors.borderPrimary,
  },
  chartSegment: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  centerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  centerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  macroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  macroValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroCurrent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  macroSeparator: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textSecondary,
    marginHorizontal: 3,
  },
  macroGoal: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
