import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { getNutritionLogs, getActivityLogs, getTodayDateRange, getWeekDateRange } from '../../utils/firebaseHelpers';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ModernHeader from '../../components/dashboard/ModernHeader';
import StatCard from '../../components/dashboard/StatCard';
import CircularProgressCard from '../../components/dashboard/CircularProgressCard';
import ContentCard from '../../components/dashboard/ContentCard';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import NutritionProgressCard from '../../components/dashboard/NutritionProgressCard';
import MacroDistributionCard from '../../components/dashboard/MacroDistributionCard';
import ChatbotFloatingButton from '../../components/chatbot/ChatbotFloatingButton';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../utils/colorUtils';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  console.log('HomeScreen - Rendering home screen');
  
  // Get user's daily requirements or use defaults
  const dailyRequirements = user?.dailyRequirements || {
    calories: 2000,
    protein: 150,
    carbohydrates: 250,
    fat: 67,
  };

  // State for real-time nutrition and activity data
  const [currentIntake, setCurrentIntake] = useState({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });

  const [todayLogs, setTodayLogs] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load today's nutrition data from Firebase
  const loadTodayNutrition = async () => {
    if (!user?.id) return;

    try {
      const todayRange = getTodayDateRange();
      const result = await getNutritionLogs(user.id, todayRange);
      
      if (result.success) {
        const logs = result.logs;
        let totalIntake = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

        logs.forEach((log) => {
          totalIntake.calories += log.calories || 0;
          totalIntake.protein += log.protein || 0;
          totalIntake.carbohydrates += log.carbohydrates || 0;
          totalIntake.fat += log.fat || 0;
        });

        setTodayLogs(logs);
        setCurrentIntake(totalIntake);
        console.log('Loaded nutrition data:', logs.length, 'entries, total:', totalIntake);
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    }
  };

  // Load weekly activity data from Firebase
  const loadWeeklyActivity = async () => {
    if (!user?.id) return;

    try {
      const weekRange = getWeekDateRange();
      const result = await getActivityLogs(user.id, weekRange);
      
      if (result.success) {
        setWeeklyActivity(result.logs);
        console.log('Loaded activity data:', result.logs.length, 'entries');
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  };

  // Load user data when component mounts or user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        setLoading(true);
        await Promise.all([
          loadTodayNutrition(),
          loadWeeklyActivity()
        ]);
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);
  
  const handleCardPress = (type) => {
    console.log('Card pressed:', type);
    switch (type) {
      case 'nutrition':
        navigation.navigate('Logs', { 
          screen: 'NutritionLog' 
        });
        break;
      case 'macros':
        navigation.navigate('Logs', { 
          screen: 'NutritionLog' 
        });
        break;
      case 'heart':
        Alert.alert('Heart Rate', 'Heart rate monitoring feature coming soon!');
        break;
      case 'water':
        Alert.alert('Water Intake', 'Water tracking feature coming soon!');
        break;
      case 'medications':
        navigation.navigate('MedicationScanner');
        break;
      case 'alerts':
        Alert.alert('Alerts', 'You have 1 new health recommendation. Check your notifications!');
        break;
      case 'activity':
        Alert.alert('Activity Heatmap', 'Detailed activity tracking coming soon!');
        break;
      default:
        Alert.alert('Feature', 'This feature is coming soon!');
        break;
    }
  };

  return (
    <ScreenContainer>
      <ModernHeader userName={user?.name || 'User'} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Nutrition Card - Full Width */}
        <View style={styles.fullWidthSection}>
          <NutritionProgressCard
            currentCalories={currentIntake.calories}
            goalCalories={dailyRequirements.calories}
            onPress={() => handleCardPress('nutrition')}
          />
        </View>

        {/* Macro Distribution Card - Full Width */}
        <View style={styles.fullWidthSection}>
          <MacroDistributionCard
            protein={{
              current: currentIntake.protein,
              goal: dailyRequirements.protein,
            }}
            carbs={{
              current: currentIntake.carbohydrates,
              goal: dailyRequirements.carbohydrates,
            }}
            fat={{
              current: currentIntake.fat,
              goal: dailyRequirements.fat,
            }}
            onPress={() => handleCardPress('macros')}
          />
        </View>

        {/* Bottom Row - Two Cards Side by Side */}
        <View style={styles.grid}>
          <StatCard
            icon="heart"
            color="#F2994A"
            value="72"
            label="bpm"
            subtitle="Heart Rate"
            onPress={() => handleCardPress('heart')}
            gradient={['#2D2D33', '#1C1C22']}
          />
          <StatCard
            icon="water"
            color="#4A90E2"
            value="6"
            label="glasses"
            subtitle="Water Intake"
            onPress={() => handleCardPress('water')}
            gradient={['#2D2D33', '#1C1C22']}
          />
        </View>

        {/* Content Cards Section */}
        <View style={styles.contentSection}>
          <ContentCard
            title="Nutrition"
            value={`${currentIntake.calories} / ${dailyRequirements.calories}`}
            subtitle="Calories consumed today"
            onPress={() => handleCardPress('nutrition')}
            icon="restaurant-outline"
            status="normal"
          />
          
          <ContentCard
            title="Medications"
            value="All Clear"
            subtitle="No interactions detected"
            onPress={() => handleCardPress('medications')}
            icon="medical-outline"
            status="success"
          />
          
          <ContentCard
            title="Alerts"
            value="1"
            subtitle="New recommendation"
            onPress={() => handleCardPress('alerts')}
            icon="notifications-outline"
            status="warning"
          />
        </View>

        {/* Activity Heatmap Section */}
        <ActivityHeatmap 
          onPress={() => handleCardPress('activity')} 
          refreshTrigger={currentIntake} // Trigger refresh when nutrition changes
        />
      </ScrollView>
      
      {/* Floating Chatbot Button */}
      <ChatbotFloatingButton
        onPress={() => {
          // Navigate to chatbot using root navigator
          navigation.getParent()?.navigate('HealthChatbot');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullWidthSection: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
  },
  contentSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});
