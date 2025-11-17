import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Image, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { getActivityLogs, getNutritionLogs, getWeekDateRange, getTodayDateRange } from '../../utils/firebaseHelpers';

const { width: screenWidth } = Dimensions.get('window');

export default function ActivityHeatmap({ onPress, refreshTrigger }) {
  const { user } = useAuth();
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Load real user activity data from Firebase
  useEffect(() => {
    const loadUserActivityData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get the last 7 days of data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dateRange = {
          start: sevenDaysAgo.toISOString(),
          end: new Date().toISOString()
        };

        // Load activity and nutrition data
        const [activityResult, nutritionResult] = await Promise.all([
          getActivityLogs(user.id, dateRange),
          getNutritionLogs(user.id, dateRange)
        ]);

        // Process the data into weekly format
        const weekData = processWeeklyData(
          activityResult.success ? activityResult.logs : [],
          nutritionResult.success ? nutritionResult.logs : []
        );

        setActivityData(weekData);
        console.log('Activity heatmap data loaded:', weekData);
      } catch (error) {
        console.error('Error loading activity data:', error);
        // Set empty data on error
        setActivityData(getEmptyWeekData());
      } finally {
        setLoading(false);
      }
    };

    loadUserActivityData();
  }, [user, refreshTrigger]);

  // Process real user data into weekly heatmap format
  const processWeeklyData = (activityLogs, nutritionLogs) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const dayName = days[dayOfWeek];
      
      // Filter activities for this day
      const dayActivities = activityLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === date.toDateString();
      });

      // Filter nutrition for this day
      const dayNutrition = nutritionLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === date.toDateString();
      });

      // Calculate totals for the day
      const totalDuration = dayActivities.reduce((sum, log) => sum + (log.duration || 0), 0);
      const totalCaloriesBurned = dayActivities.reduce((sum, log) => sum + (log.calories || 0), 0);
      const totalCaloriesConsumed = dayNutrition.reduce((sum, log) => sum + (log.calories || 0), 0);
      const activityCount = dayActivities.length;
      
      // Calculate intensity based on activity (0-1 scale)
      // Base intensity on duration and activity count
      let intensity = 0;
      if (totalDuration > 0) {
        intensity = Math.min(totalDuration / 60, 1); // Normalize to 60 minutes = 1.0
        intensity = Math.max(intensity, activityCount * 0.1); // Minimum based on activity count
      }

      // Determine color based on intensity
      let color = '#333333'; // Default (no activity)
      if (intensity >= 0.8) color = '#00ff88';
      else if (intensity >= 0.6) color = '#00cc6a';
      else if (intensity >= 0.4) color = '#00994d';
      else if (intensity >= 0.2) color = '#006633';
      else if (intensity > 0) color = '#004d26';

      weekData.push({
        day: dayName,
        date: date.toDateString(),
        intensity: intensity,
        color: color,
        steps: Math.round(totalDuration * 100), // Estimate steps from duration
        calories: totalCaloriesBurned,
        caloriesConsumed: totalCaloriesConsumed,
        duration: totalDuration > 0 ? `${totalDuration}min` : '0min',
        activities: dayActivities,
        nutrition: dayNutrition,
        activityCount: activityCount
      });
    }

    return weekData;
  };

  // Generate empty week data for new users
  const getEmptyWeekData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      
      weekData.push({
        day: days[dayOfWeek],
        date: date.toDateString(),
        intensity: 0,
        color: '#333333',
        steps: 0,
        calories: 0,
        caloriesConsumed: 0,
        duration: '0min',
        activities: [],
        nutrition: [],
        activityCount: 0
      });
    }
    
    return weekData;
  };

  const handlePress = () => {
    setModalVisible(true);
    if (onPress) onPress();
  };

  const getConsistencyScore = () => {
    const activeDays = activityData.filter(day => day.intensity > 0.3).length;
    const avgIntensity = activityData.reduce((sum, day) => sum + day.intensity, 0) / activityData.length;
    const consistency = (activeDays / 7) * 100;
    return Math.round(consistency);
  };

  const getConsistencyLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: '#00ff88', icon: 'trophy' };
    if (score >= 60) return { level: 'Good', color: '#00cc6a', icon: 'checkmark-circle' };
    if (score >= 40) return { level: 'Fair', color: '#ff9500', icon: 'alert-circle' };
    return { level: 'Poor', color: '#ff3b30', icon: 'close-circle' };
  };

  const consistencyScore = getConsistencyScore();
  const consistencyLevel = getConsistencyLevel(consistencyScore);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity Heatmap</Text>
          <Text style={styles.subtitle}>Weekly Overview</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading your activity data...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeValue,
          transform: [{ scale: scaleValue }]
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Activity Heatmap</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Animated.View 
        style={[
          styles.heatmapContainer,
          { transform: [{ scale: pulseValue }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.heatmapCard}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2D2D33', '#1C1C22']}
            style={styles.heatmapPlaceholder}
          >
            {/* Map-like background image */}
            <Image
              source={{ 
                uri: 'https://images.unsplash.com/photo-1524661135-4231f5bbda7b?w=800&h=400&fit=crop&crop=center'
              }}
              style={styles.heatmapImage}
              resizeMode="cover"
            />
            
            {/* Activity overlay with heatmap visualization */}
            <View style={styles.activityOverlay}>
              <View style={styles.activityGrid}>
                {activityData.map((activity, index) => (
                  <View key={index} style={styles.activityDay}>
                    <View 
                      style={[
                        styles.activityDot,
                        { 
                          backgroundColor: activity.color,
                          opacity: activity.intensity
                        }
                      ]} 
                    />
                    <Text style={styles.dayLabel}>{activity.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Gradient overlay for better text readability */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.overlayContent}>
                <View style={styles.overlayHeader}>
                  <Ionicons name="location-outline" size={24} color={Colors.accent} />
                  <Text style={styles.overlayText}>Weekly Activity Map</Text>
                </View>
                <Text style={styles.overlaySubtext}>Your fitness journey visualized</Text>
                
                {/* Activity summary */}
                <View style={styles.activitySummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Active Days</Text>
                    <Text style={styles.summaryValue}>5/7</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Avg. Intensity</Text>
                    <Text style={styles.summaryValue}>72%</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Activity Consistency</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Consistency Score Section */}
              <View style={styles.consistencyScoreContainer}>
                <LinearGradient
                  colors={['#2D2D33', '#1C1C22']}
                  style={styles.consistencyScoreGradient}
                >
                  <View style={styles.consistencyScoreHeader}>
                    <Ionicons name={consistencyLevel.icon} size={40} color={consistencyLevel.color} />
                    <Text style={[styles.consistencyScoreValue, { color: consistencyLevel.color }]}>
                      {consistencyScore}%
                    </Text>
                  </View>
                  <Text style={styles.consistencyScoreLevel}>{consistencyLevel.level}</Text>
                  <Text style={styles.consistencyScoreDescription}>
                    Your activity consistency score indicates how regularly you engage in physical activity.
                    A higher score means you're more consistent with your fitness routine.
                  </Text>
                </LinearGradient>
              </View>

              {/* Activity Details Section */}
              <View style={styles.activityDetailsHeader}>
                <Ionicons name="fitness" size={24} color={Colors.accent} />
                <Text style={styles.activityDetailsTitle}>Weekly Activity Details</Text>
              </View>
              
              <View style={styles.activityDetailsGrid}>
                {/* Header Row */}
                <View style={styles.activityDetailHeader}>
                  <View style={styles.activityDetailItemHeader}>
                    <View style={styles.activityDetailDotPlaceholder} />
                    <Text style={styles.activityDetailHeaderLabel}>Day</Text>
                  </View>
                  <View style={styles.activityDetailValues}>
                    <Text style={styles.activityDetailHeaderLabel}>Steps</Text>
                    <Text style={styles.activityDetailHeaderLabel}>Cal</Text>
                    <Text style={styles.activityDetailHeaderLabel}>Time</Text>
                  </View>
                </View>
                
                {activityData.map((day, index) => (
                  <View key={index} style={[
                    styles.activityDetailItem,
                    index === activityData.length - 1 && styles.activityDetailItemLast
                  ]}>
                    <View style={styles.activityDetailItemHeader}>
                      <View style={[styles.activityDetailDot, { backgroundColor: day.color }]} />
                      <Text style={styles.activityDetailLabel}>{day.day}</Text>
                    </View>
                    <View style={styles.activityDetailValues}>
                      <Text style={styles.activityDetailValue}>{day.steps.toLocaleString()}</Text>
                      <Text style={styles.activityDetailValue}>{day.calories}</Text>
                      <Text style={styles.activityDetailValue}>{day.duration}</Text>
                    </View>
                    {day.activities.length > 0 && (
                      <View style={styles.dayActivitiesContainer}>
                        <Text style={styles.dayActivitiesTitle}>Activities:</Text>
                        {day.activities.map((activity, actIndex) => (
                          <Text key={actIndex} style={styles.dayActivityItem}>
                            • {activity.name} ({activity.duration}min)
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Summary Stats */}
              <View style={styles.summaryStatsContainer}>
                <Text style={styles.summaryStatsTitle}>Weekly Summary</Text>
                <View style={styles.summaryStatsGrid}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>
                      {activityData.reduce((sum, day) => sum + day.steps, 0).toLocaleString()}
                    </Text>
                    <Text style={styles.summaryStatLabel}>Total Steps</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>
                      {activityData.reduce((sum, day) => sum + day.calories, 0)}
                    </Text>
                    <Text style={styles.summaryStatLabel}>Total Calories</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>
                      {activityData.filter(day => day.intensity > 0.3).length}/7
                    </Text>
                    <Text style={styles.summaryStatLabel}>Active Days</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  infoButton: {
    padding: 8,
  },
  heatmapContainer: {
    paddingVertical: 12,
  },
  heatmapCard: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heatmapPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heatmapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  activityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  activityDay: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overlayText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  overlaySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
  },
  activitySummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: screenWidth * 0.95,
    maxHeight: '85%',
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  modalHeaderSpacer: {
    width: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  modalScrollView: {
    padding: 10,
  },
  consistencyScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  consistencyScoreGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  consistencyScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consistencyScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  consistencyScoreLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  consistencyScoreDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  activityDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityDetailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  activityDetailsGrid: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
    padding: 12,
  },
  activityDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  activityDetailItemLast: {
    borderBottomWidth: 0,
  },
  activityDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
    backgroundColor: Colors.backgroundPrimary,
  },
  activityDetailHeaderLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  activityDetailItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.4,
  },
  activityDetailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activityDetailDotPlaceholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activityDetailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  activityDetailValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 0.6,
    marginLeft: 8,
  },
  activityDetailValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginLeft: 2,
    flex: 1,
  },
  summaryStatsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 15,
  },
  summaryStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  summaryStatItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  summaryStatLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  dayActivitiesContainer: {
    marginTop: 8,
    paddingLeft: 28,
  },
  dayActivitiesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayActivityItem: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
});
