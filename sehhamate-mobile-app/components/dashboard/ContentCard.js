import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function ContentCard({ 
  title, 
  value, 
  subtitle, 
  onPress, 
  icon, 
  status = 'normal',
  gradient = ['#2D2D33', '#1C1C22']
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'danger':
        return '#FF3B30';
      case 'normal':
      default:
        return Colors.accent;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'close-circle';
      case 'normal':
      default:
        return 'information-circle';
    }
  };

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
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <LinearGradient
          colors={gradient}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name={icon} size={20} color={getStatusColor()} style={styles.icon} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
            </View>
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.value, { color: getStatusColor() }]}>{value}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.metric}>
              <Ionicons name="trending-up" size={14} color={getStatusColor()} />
              <Text style={[styles.metricText, { color: getStatusColor() }]}>+12%</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  animatedContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 20,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
