import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import CircularProgress from '../../components/ui/CircularProgress';
import { Colors } from '../../utils/colorUtils';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  addUserMealPlan, 
  getUserMealPlans, 
  addUserInteraction,
  getTodayDateRange,
  addNutritionLog
} from '../../utils/firebaseHelpers';

export default function DailyLogsScreen({ navigation }) {
  const { user } = useAuth();
  const { mealPlans, addMealPlan } = useMealPlan();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [userMealPlans, setUserMealPlans] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  // Food tracking states
  const [addFoodModalVisible, setAddFoodModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [portion, setPortion] = useState('1');
  const [newItem, setNewItem] = useState({
    type: 'meal', // 'meal' or 'medication'
    time: '',
    title: '',
    description: '',
  });

  // Daily nutrition goals
  const dailyGoals = {
    calories: 2554,
    protein: 154,
    carbs: 206,
    fat: 68
  };

  // Food tracking data
  const [mealData, setMealData] = useState({
    breakfast: {
      foods: [
        {
          id: 1,
          name: 'idly',
          portion: '2 pieces',
          calories: 232.04,
          protein: 6.59,
          carbs: 46.47,
          fat: 1.76
        }
      ]
    },
    lunch: {
      foods: [
        {
          id: 2,
          name: 'chicken fried rice',
          portion: '1 cup',
          calories: 288.25,
          protein: 18.56,
          carbs: 24.99,
          fat: 12.12
        }
      ]
    },
    snack: {
      foods: [
        {
          id: 3,
          name: 'apple',
          portion: '1 medium',
          calories: 115.96,
          protein: 0.58,
          carbs: 30.80,
          fat: 0.38
        }
      ]
    },
    dinner: {
      foods: [
        {
          id: 4,
          name: 'rice, chicken curry',
          portion: '1 plate',
          calories: 448.66,
          protein: 32.50,
          carbs: 52.03,
          fat: 11.30
        }
      ]
    }
  });

  // Food database
  const foodDatabase = [
    {
      id: 1,
      name: 'Apple',
      category: 'Fruits',
      nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      unit: 'medium (182g)'
    },
    {
      id: 2,
      name: 'Banana',
      category: 'Fruits',
      nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      unit: 'medium (118g)'
    },
    {
      id: 3,
      name: 'Chicken Breast',
      category: 'Protein',
      nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      unit: '100g'
    },
    {
      id: 4,
      name: 'White Rice',
      category: 'Grains',
      nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      unit: '100g cooked'
    },
    {
      id: 5,
      name: 'Idly',
      category: 'Indian',
      nutrition: { calories: 116, protein: 3.3, carbs: 23.2, fat: 0.9 },
      unit: 'piece (60g)'
    },
    {
      id: 6,
      name: 'Chicken Fried Rice',
      category: 'Mixed Dishes',
      nutrition: { calories: 288, protein: 18.6, carbs: 25, fat: 12.1 },
      unit: 'cup (200g)'
    },
    {
      id: 7,
      name: 'Broccoli',
      category: 'Vegetables',
      nutrition: { calories: 25, protein: 3, carbs: 5, fat: 0.3 },
      unit: '100g'
    },
    {
      id: 8,
      name: 'Salmon',
      category: 'Protein',
      nutrition: { calories: 208, protein: 22, carbs: 0, fat: 12 },
      unit: '100g'
    }
  ];

  const [medications, setMedications] = useState([
    {
      id: 1,
      type: 'medication',
      time: '9:00 AM',
      title: 'Medication A',
      description: '1 tablet',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      type: 'medication',
      time: '1:00 PM',
      title: 'Medication B',
      description: '2 tablets',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
    }
  ]);

  // Keyboard event handlers
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Log meal plans for debugging
  useEffect(() => {
    console.log('Current meal plans in logs:', mealPlans.length, mealPlans);
  }, [mealPlans]);

  // Calculate total consumed nutrition
  const calculateTotalNutrition = () => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    Object.values(mealData).forEach(meal => {
      meal.foods.forEach(food => {
        totals.calories += food.calories;
        totals.protein += food.protein;
        totals.carbs += food.carbs;
        totals.fat += food.fat;
      });
    });
    
    return totals;
  };

  // Calculate meal totals
  const calculateMealTotal = (mealFoods) => {
    return mealFoods.reduce((total, food) => ({
      calories: total.calories + food.calories,
      protein: total.protein + food.protein,
      carbs: total.carbs + food.carbs,
      fat: total.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totalConsumed = calculateTotalNutrition();
  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Test function to add a sample meal plan (for debugging)
  const addTestMealPlan = () => {
    const testMealPlan = {
      id: Date.now(),
      type: 'meal_plan',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      title: 'AI Generated Meal Plan',
      description: 'Daily meal recommendations: 2554 cal total',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      recommendations: {
        meals: {
          breakfast: { calories: 768 },
          lunch: { calories: 893 },
          snack: { calories: 255 },
          dinner: { calories: 638 }
        },
        totalNutrients: { calories: 2554 }
      },
      dishTypes: { breakfast: 'Grilled', lunch: 'Stir-Fried', snack: 'Toast', dinner: 'Stir-Fried' },
      ingredients: { vegetables: ['spinach', 'potato'], meat: ['chicken'] },
      generated: true
    };
    addMealPlan(testMealPlan);
    console.log('Test meal plan added');
  };

  const getDefaultImage = (type) => {
    if (type === 'meal') {
      return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop';
    } else {
      return 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop';
    }
  };

  // Food tracking functions
  const handleAddFood = (mealType) => {
    setSelectedMeal(mealType);
    setAddFoodModalVisible(true);
    setSearchQuery('');
    setSelectedFood(null);
    setPortion('1');
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
  };

  const handleSaveFood = async () => {
    if (!selectedFood || !portion) {
      Alert.alert('Error', 'Please select a food and enter portion size');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to save food items');
      return;
    }

    try {
      const portionMultiplier = parseFloat(portion) || 1;
      const newFood = {
        id: Date.now(),
        name: selectedFood.name.toLowerCase(),
        portion: `${portion} ${selectedFood.unit}`,
        calories: selectedFood.nutrition.calories * portionMultiplier,
        protein: selectedFood.nutrition.protein * portionMultiplier,
        carbs: selectedFood.nutrition.carbs * portionMultiplier,
        fat: selectedFood.nutrition.fat * portionMultiplier
      };

      // Create nutrition log data for Firebase
      const nutritionLogData = {
        id: newFood.id,
        userId: user.id,
        date: new Date().toISOString(),
        mealType: selectedMeal,
        foodName: newFood.name,
        portion: newFood.portion,
        calories: newFood.calories,
        protein: newFood.protein,
        carbs: newFood.carbs,
        fat: newFood.fat,
        timestamp: new Date().toISOString(),
        type: 'food_log'
      };

      // Save to Firebase
      const firebaseResult = await addNutritionLog(user.id, nutritionLogData);
      
      if (firebaseResult.success) {
        // Add to local state
        setMealData(prev => ({
          ...prev,
          [selectedMeal]: {
            ...prev[selectedMeal],
            foods: [...prev[selectedMeal].foods, newFood]
          }
        }));

        setAddFoodModalVisible(false);
        setSelectedFood(null);
        setPortion('1');
        setSearchQuery('');
        
        console.log('Food item saved to Firebase:', nutritionLogData);
      } else {
        Alert.alert('Error', 'Failed to save food item. Please try again.');
        console.error('Firebase save error:', firebaseResult.error);
      }
    } catch (error) {
      console.error('Error saving food item:', error);
      Alert.alert('Error', 'Failed to save food item. Please try again.');
    }
  };

  const removeFood = async (mealType, foodId) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to remove food items');
      return;
    }

    try {
      // Remove from local state first for immediate UI update
      setMealData(prev => ({
        ...prev,
        [mealType]: {
          ...prev[mealType],
          foods: prev[mealType].foods.filter(food => food.id !== foodId)
        }
      }));

      // TODO: Add Firebase delete function for nutrition logs
      // For now, we'll just log the removal
      console.log('Food item removed from meal:', { mealType, foodId, userId: user.id });
      
    } catch (error) {
      console.error('Error removing food item:', error);
      // Revert local state change if Firebase operation fails
      // This would require more complex state management
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setIsDetailModalVisible(true);
    setIsEditing(false);
  };

  const handleEditItem = () => {
    setIsEditing(true);
    setNewItem({
      type: selectedItem.type || 'meal',
      time: selectedItem.time,
      title: selectedItem.title,
      description: selectedItem.description
    });
    setIsDetailModalVisible(false);
    setIsModalVisible(true);
  };

  const handleDeleteItem = () => {
    if (selectedItem.type === 'meal' || !selectedItem.type) {
      setMeals(prev => prev.filter(item => item.id !== selectedItem.id));
    } else {
      setMedications(prev => prev.filter(item => item.id !== selectedItem.id));
    }
    setIsDetailModalVisible(false);
    setSelectedItem(null);
  };

  const handleAddItem = async () => {
    if (!newItem.time || !newItem.title || !newItem.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to save items');
      return;
    }

    try {
      if (isEditing && selectedItem) {
        // Update existing item
        const updatedItem = {
          ...selectedItem,
          ...newItem,
          imageUrl: getDefaultImage(newItem.type)
        };

        if (selectedItem.type === 'meal' || !selectedItem.type) {
          setMeals(prev => prev.map(item => 
            item.id === selectedItem.id ? updatedItem : item
          ));
        } else {
          setMedications(prev => prev.map(item => 
            item.id === selectedItem.id ? updatedItem : item
          ));
        }

        // TODO: Add Firebase update function for existing items
        console.log('Item updated locally:', updatedItem);
      } else {
        // Add new item
        const newItemWithId = {
          id: Date.now(),
          ...newItem,
          imageUrl: getDefaultImage(newItem.type),
          userId: user.id,
          date: new Date().toISOString(),
          timestamp: new Date().toISOString()
        };

        if (newItem.type === 'meal') {
          setMeals(prev => [newItemWithId, ...prev]);
          
          // Save meal to Firebase as nutrition log
          const nutritionLogData = {
            id: newItemWithId.id,
            userId: user.id,
            date: new Date().toISOString(),
            mealType: 'manual',
            foodName: newItem.title,
            portion: newItem.description,
            calories: 0, // User will need to specify
            protein: 0,
            carbs: 0,
            fat: 0,
            timestamp: new Date().toISOString(),
            type: 'food_log',
            source: 'manual_entry'
          };

          const firebaseResult = await addNutritionLog(user.id, nutritionLogData);
          if (firebaseResult.success) {
            console.log('Manual meal saved to Firebase:', nutritionLogData);
          } else {
            console.error('Firebase save error:', firebaseResult.error);
          }
        } else {
          setMedications(prev => [newItemWithId, ...prev]);
          
          // Save medication to Firebase as activity log
          const activityLogData = {
            id: newItemWithId.id,
            userId: user.id,
            date: new Date().toISOString(),
            type: 'medication_log',
            title: newItem.title,
            description: newItem.description,
            timestamp: new Date().toISOString()
          };

          const firebaseResult = await addUserInteraction(user.id, activityLogData);
          if (firebaseResult.success) {
            console.log('Medication saved to Firebase:', activityLogData);
          } else {
            console.error('Firebase save error:', firebaseResult.error);
          }
        }
      }

      // Reset form
      setNewItem({
        type: 'meal',
        time: '',
        title: '',
        description: '',
      });
      setIsEditing(false);
      setSelectedItem(null);
      setIsModalVisible(false);
      
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  // Load user meal plans from Firebase
  useEffect(() => {
    const loadUserMealPlans = async () => {
      if (!user?.id) return;

      try {
        setLoadingUserData(true);
        const todayRange = getTodayDateRange();
        const result = await getUserMealPlans(user.id, todayRange);
        
        if (result.success) {
          setUserMealPlans(result.mealPlans);
          console.log('Loaded user meal plans:', result.mealPlans.length);
        }
      } catch (error) {
        console.error('Error loading user meal plans:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserMealPlans();
  }, [user]);

  // Save meal plan to Firebase
  const saveMealPlanToFirebase = async (mealData) => {
    if (!user?.id) return;

    try {
      const mealPlanData = {
        type: 'meal_log',
        title: mealData.title,
        description: mealData.description,
        time: mealData.time,
        imageUrl: mealData.imageUrl,
        category: 'user_generated',
        mealType: determineMealType(mealData.time),
        date: new Date().toISOString()
      };

      const result = await addUserMealPlan(user.id, mealPlanData);
      if (result.success) {
        console.log('Meal plan saved to Firebase:', result.id);
        
        // Log user interaction
        await addUserInteraction(user.id, {
          type: 'meal_logged',
          data: { mealTitle: mealData.title, mealType: mealPlanData.mealType },
          screen: 'daily_logs',
          timestamp: new Date().toISOString()
        });

        // Refresh user meal plans
        const todayRange = getTodayDateRange();
        const updatedResult = await getUserMealPlans(user.id, todayRange);
        if (updatedResult.success) {
          setUserMealPlans(updatedResult.mealPlans);
        }
      }
    } catch (error) {
      console.error('Error saving meal plan to Firebase:', error);
    }
  };

  // Determine meal type based on time
  const determineMealType = (time) => {
    if (!time) return 'snack';
    
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 19) return 'dinner';
    return 'snack';
  };

  // Combine default meal plans with user meal plans
  const getAllMealPlans = () => {
    const defaultPlans = mealPlans.map(plan => ({ ...plan, isUserGenerated: false }));
    const userPlans = userMealPlans.map(plan => ({ 
      ...plan, 
      isUserGenerated: true,
      id: plan.id || Math.random().toString(),
      chef: user?.name || 'You',
      rating: 5.0,
      cookTime: '30 min',
      difficulty: 'Easy'
    }));
    
    // Sort by date/time
    return [...userPlans, ...defaultPlans].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const renderLogItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.logItem} 
      activeOpacity={0.8}
      onPress={() => handleItemPress(item)}
    >
      <LinearGradient
        colors={['#2D2D33', '#1C1C22']}
        style={styles.logCard}
      >
        <View style={styles.logContent}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.timeText}>{item.time}</Text>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
          <View style={styles.openIconContainer}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProgressCircle = (consumed, goal, label, color) => {
    const percentage = Math.min((consumed / goal) * 100, 100);

    return (
      <View style={styles.progressContainer}>
        <CircularProgress
          consumed={consumed}
          goal={goal}
          label={label}
          color={color}
          size={120}
          strokeWidth={8}
        />
        <Text style={styles.progressTitle}>{label} Consumed</Text>
        <Text style={styles.progressPercentage}>Reached {percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  const renderMealSection = (mealType, mealLabel, iconName) => {
    const mealFoods = mealData[mealType].foods;
    const mealTotal = calculateMealTotal(mealFoods);

    return (
      <View style={styles.mealSection} key={mealType}>
        <LinearGradient
          colors={['#2D2D33', '#1C1C22']}
          style={styles.mealCard}
        >
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleContainer}>
              <Ionicons name={iconName} size={24} color={Colors.accent} />
              <Text style={styles.mealTitle}>{mealLabel}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addFoodButton}
              onPress={() => handleAddFood(mealType)}
            >
              <Text style={styles.addFoodText}>Add Food</Text>
            </TouchableOpacity>
          </View>

          {mealFoods.map((food, index) => (
            <View key={food.id} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name},</Text>
                <Text style={styles.foodPortion}>{food.portion}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFood(mealType, food.id)}
              >
                <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.mealTotals}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionItem}>Protein: {mealTotal.protein.toFixed(1)}g</Text>
              <Text style={styles.nutritionItem}>Carb: {mealTotal.carbs.toFixed(1)}g</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionItem}>Fat: {mealTotal.fat.toFixed(1)}g</Text>
              <Text style={styles.nutritionItem}>Calorie: {mealTotal.calories.toFixed(2)}kcal</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderMealPlanCard = (mealPlan) => (
    <TouchableOpacity 
      key={mealPlan.id} 
      style={styles.mealPlanItem} 
      activeOpacity={0.8}
      onPress={() => handleMealPlanPress(mealPlan)}
    >
      <LinearGradient
        colors={['#00ff88', '#00cc6a']}
        style={styles.mealPlanCard}
      >
        <View style={styles.mealPlanHeader}>
          <View style={styles.mealPlanIconContainer}>
            <Ionicons name="restaurant" size={24} color={Colors.textPrimary} />
          </View>
          <View style={styles.mealPlanTextContainer}>
            <Text style={styles.mealPlanTitle}>{mealPlan.title}</Text>
            <Text style={styles.mealPlanDescription}>{mealPlan.description}</Text>
            <Text style={styles.mealPlanTime}>Generated at {mealPlan.time}</Text>
          </View>
          <View style={styles.aiLabelContainer}>
            <Text style={styles.aiLabel}>AI</Text>
          </View>
        </View>
        
        <View style={styles.mealPlanPreview}>
          <View style={styles.mealPreviewItem}>
            <Text style={styles.mealPreviewLabel}>Breakfast</Text>
            <Text style={styles.mealPreviewCalories}>{mealPlan.recommendations?.meals.breakfast.calories} cal</Text>
          </View>
          <View style={styles.mealPreviewItem}>
            <Text style={styles.mealPreviewLabel}>Lunch</Text>
            <Text style={styles.mealPreviewCalories}>{mealPlan.recommendations?.meals.lunch.calories} cal</Text>
          </View>
          <View style={styles.mealPreviewItem}>
            <Text style={styles.mealPreviewLabel}>Snack</Text>
            <Text style={styles.mealPreviewCalories}>{mealPlan.recommendations?.meals.snack.calories} cal</Text>
          </View>
          <View style={styles.mealPreviewItem}>
            <Text style={styles.mealPreviewLabel}>Dinner</Text>
            <Text style={styles.mealPreviewCalories}>{mealPlan.recommendations?.meals.dinner.calories} cal</Text>
          </View>
        </View>
        
        <View style={styles.mealPlanFooter}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.textPrimary} />
          <Text style={styles.mealPlanStatus}>Tap to view full meal plan</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleMealPlanPress = (mealPlan) => {
    console.log('Navigating to meal plan:', mealPlan);
    navigation.navigate('Recommendations', {
      screen: 'MealRecommendations',
      params: {
        dishTypes: mealPlan.dishTypes,
        ingredients: mealPlan.ingredients,
        savedMealPlan: mealPlan.recommendations
      }
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader 
        title="Food Tracking" 
        navigation={navigation}
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('DocumentUpload')}
            >
              <Ionicons name="document-attach" size={22} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('NutritionLog')}
            >
              <Ionicons name="nutrition" size={22} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('ActivityLog')}
            >
              <Ionicons name="fitness" size={22} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="stats-chart" size={22} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* AI Meal Plans Section */}
        {(mealPlans.length > 0 || userMealPlans.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>
              Meal Plans
              {userMealPlans.length > 0 && (
                <Text style={styles.userDataIndicator}> • {userMealPlans.length} personal</Text>
              )}
            </Text>
            {loadingUserData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.accent} />
                <Text style={styles.loadingText}>Loading your meal plans...</Text>
              </View>
            ) : (
              getAllMealPlans().map(renderMealPlanCard)
            )}
          </>
        )}

        {/* Food Tracking Sections */}
        <View style={styles.mealsContainer}>
          {renderMealSection('breakfast', 'Breakfast', 'sunny-outline')}
          {renderMealSection('lunch', 'Lunch', 'restaurant-outline')}
          {renderMealSection('snack', 'Snack', 'cafe-outline')}
          {renderMealSection('dinner', 'Dinner', 'moon-outline')}
        </View>

        {/* Today Consumption */}
        <View style={styles.consumptionSection}>
          <Text style={styles.sectionTitle}>Today Consumption</Text>
          
          <View style={styles.progressGrid}>
            {renderProgressCircle(totalConsumed.calories, dailyGoals.calories, 'Calories', '#00ff88')}
            {renderProgressCircle(totalConsumed.protein, dailyGoals.protein, 'Protein', '#4ECDC4')}
            {renderProgressCircle(totalConsumed.carbs, dailyGoals.carbs, 'Carb', '#00ff88')}
            {renderProgressCircle(totalConsumed.fat, dailyGoals.fat, 'Fat', '#4ECDC4')}
          </View>
        </View>

        {/* Medications Section */}
        <Text style={styles.sectionTitle}>Medications</Text>
        {medications.map(renderLogItem)}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setSelectedItem(null);
          setNewItem({
            type: 'meal',
            time: '',
            title: '',
            description: '',
          });
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.modalContent, { 
                marginTop: keyboardHeight > 0 ? 0 : 0,
                marginBottom: 0,
                maxHeight: keyboardHeight > 0 ? '95%' : '95%'
              }]}>
                <LinearGradient
                  colors={['#2D2D33', '#1C1C22']}
                  style={styles.modalGradient}
                >
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => {
                        setIsModalVisible(false);
                        setIsEditing(false);
                        setSelectedItem(null);
                        setNewItem({
                          type: 'meal',
                          time: '',
                          title: '',
                          description: '',
                        });
                      }}
                    >
                      <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  {/* Form */}
                  <ScrollView 
                    style={styles.form} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.formContent}
                  >
                    {/* Type Selection */}
                    <View style={styles.typeSelector}>
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          newItem.type === 'meal' && styles.typeButtonActive
                        ]}
                        onPress={() => setNewItem(prev => ({ ...prev, type: 'meal' }))}
                      >
                        <Ionicons 
                          name="restaurant" 
                          size={20} 
                          color={newItem.type === 'meal' ? Colors.accent : Colors.textSecondary} 
                        />
                        <Text style={[
                          styles.typeButtonText,
                          newItem.type === 'meal' && styles.typeButtonTextActive
                        ]}>
                          Meal
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          newItem.type === 'medication' && styles.typeButtonActive
                        ]}
                        onPress={() => setNewItem(prev => ({ ...prev, type: 'medication' }))}
                      >
                        <Ionicons 
                          name="medical" 
                          size={20} 
                          color={newItem.type === 'medication' ? Colors.accent : Colors.textSecondary} 
                        />
                        <Text style={[
                          styles.typeButtonText,
                          newItem.type === 'medication' && styles.typeButtonTextActive
                        ]}>
                          Medication
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Time Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Time</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., 8:00 AM"
                        placeholderTextColor={Colors.textTertiary}
                        value={newItem.time}
                        onChangeText={(text) => setNewItem(prev => ({ ...prev, time: text }))}
                      />
                    </View>

                    {/* Title Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Title</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={newItem.type === 'meal' ? "e.g., Breakfast" : "e.g., Aspirin"}
                        placeholderTextColor={Colors.textTertiary}
                        value={newItem.title}
                        onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
                      />
                    </View>

                    {/* Description Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        placeholder={newItem.type === 'meal' ? "e.g., Oatmeal with berries" : "e.g., 1 tablet"}
                        placeholderTextColor={Colors.textTertiary}
                        value={newItem.description}
                        onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    {/* Add Button */}
                    <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                      <Text style={styles.addButtonText}>{isEditing ? 'Update Item' : 'Add Item'}</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDetailModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.detailModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={['#2D2D33', '#1C1C22']}
              style={styles.detailModalGradient}
            >
              {/* Detail Modal Header */}
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>Item Details</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsDetailModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Item Details */}
              {selectedItem && (
                <View style={styles.detailContent}>
                  <View style={styles.detailImageContainer}>
                    <Image 
                      source={{ uri: selectedItem.imageUrl }} 
                      style={styles.detailImage}
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View style={styles.detailInfo}>
                    <View style={styles.detailRow}>
                      <Ionicons 
                        name={selectedItem.type === 'medication' ? 'medical' : 'restaurant'} 
                        size={20} 
                        color={Colors.accent} 
                      />
                      <Text style={styles.detailType}>
                        {selectedItem.type === 'medication' ? 'Medication' : 'Meal'}
                      </Text>
                    </View>
                    
                    <Text style={styles.detailTime}>{selectedItem.time}</Text>
                    <Text style={styles.detailTitle}>{selectedItem.title}</Text>
                    <Text style={styles.detailDescription}>{selectedItem.description}</Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.detailActions}>
                    <TouchableOpacity 
                      style={[styles.detailButton, styles.editButton]} 
                      onPress={handleEditItem}
                    >
                      <Ionicons name="create" size={20} color={Colors.textPrimary} />
                      <Text style={styles.detailButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.detailButton, styles.deleteButton]} 
                      onPress={handleDeleteItem}
                    >
                      <Ionicons name="trash" size={20} color="#FF6B6B" />
                      <Text style={[styles.detailButtonText, { color: '#FF6B6B' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add Food Modal */}
      <Modal
        visible={addFoodModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddFoodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#2D2D33', '#1C1C22']}
              style={styles.modalGradient}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Food to {selectedMeal}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setAddFoodModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search food items..."
                  placeholderTextColor={Colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Food List */}
              <ScrollView style={styles.foodList} showsVerticalScrollIndicator={false}>
                {filteredFoods.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={[
                      styles.foodOption,
                      selectedFood?.id === food.id && styles.selectedFoodOption
                    ]}
                    onPress={() => handleSelectFood(food)}
                  >
                    <View style={styles.foodOptionInfo}>
                      <Text style={styles.foodOptionName}>{food.name}</Text>
                      <Text style={styles.foodOptionDetails}>
                        {food.nutrition.calories} cal per {food.unit}
                      </Text>
                      <Text style={styles.foodOptionNutrition}>
                        P: {food.nutrition.protein}g • C: {food.nutrition.carbs}g • F: {food.nutrition.fat}g
                      </Text>
                    </View>
                    {selectedFood?.id === food.id && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Portion Input */}
              {selectedFood && (
                <View style={styles.portionContainer}>
                  <Text style={styles.portionLabel}>Portion Size</Text>
                  <View style={styles.portionInputContainer}>
                    <TextInput
                      style={styles.portionInput}
                      placeholder="1"
                      placeholderTextColor={Colors.textSecondary}
                      value={portion}
                      onChangeText={setPortion}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.portionUnit}>{selectedFood.unit}</Text>
                  </View>
                  
                  {/* Nutrition Preview */}
                  <View style={styles.nutritionPreview}>
                    <Text style={styles.previewTitle}>Nutrition (for {portion} {selectedFood.unit})</Text>
                    <View style={styles.previewGrid}>
                      <Text style={styles.previewItem}>
                        Calories: {(selectedFood.nutrition.calories * (parseFloat(portion) || 1)).toFixed(1)}
                      </Text>
                      <Text style={styles.previewItem}>
                        Protein: {(selectedFood.nutrition.protein * (parseFloat(portion) || 1)).toFixed(1)}g
                      </Text>
                      <Text style={styles.previewItem}>
                        Carbs: {(selectedFood.nutrition.carbs * (parseFloat(portion) || 1)).toFixed(1)}g
                      </Text>
                      <Text style={styles.previewItem}>
                        Fat: {(selectedFood.nutrition.fat * (parseFloat(portion) || 1)).toFixed(1)}g
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Save Button */}
              {selectedFood && (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveFood}>
                  <LinearGradient
                    colors={['#00ff88', '#00cc6a']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Add to {selectedMeal}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  logItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  textContainer: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 'normal',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  openIconContainer: {
    position: 'absolute',
    top: '50%',
    right: 16,
    transform: [{ translateY: -16 }],
    backgroundColor: Colors.backgroundCardSecondary,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 16,
  },
  formContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCardSecondary,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: Colors.accent + '20',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  typeButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: Colors.accent,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.backgroundCardSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Detail Modal Styles
  detailModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailModalGradient: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailModalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailContent: {
    gap: 20,
  },
  detailImageContainer: {
    alignItems: 'center',
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  detailInfo: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailType: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  detailTime: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  detailTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailDescription: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.accent,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Meal Plan Styles
  mealPlanItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mealPlanCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  mealPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealPlanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealPlanTextContainer: {
    flex: 1,
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.9,
    marginBottom: 2,
  },
  mealPlanTime: {
    fontSize: 12,
    color: Colors.textPrimary,
    opacity: 0.7,
  },
  aiLabelContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  mealPlanPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  mealPreviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  mealPreviewLabel: {
    fontSize: 10,
    color: Colors.textPrimary,
    opacity: 0.8,
    marginBottom: 4,
    fontWeight: '500',
  },
  mealPreviewCalories: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  mealPlanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealPlanStatus: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginLeft: 6,
    fontWeight: '500',
  },
  // Food Tracking Styles
  mealsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  mealSection: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mealCard: {
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  addFoodButton: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  addFoodText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSecondary,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  foodPortion: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  mealTotals: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSecondary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutritionItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  consumptionSection: {
    padding: 20,
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressContainer: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  progressPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  // Food Modal Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    margin: 20,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodOption: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  selectedFoodOption: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '10',
  },
  foodOptionInfo: {
    flex: 1,
  },
  foodOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  foodOptionDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  foodOptionNutrition: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  portionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderPrimary,
  },
  portionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  portionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  portionInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  portionUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  nutritionPreview: {
    marginTop: 16,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  previewItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: '48%',
    marginBottom: 4,
  },
  saveButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  userDataIndicator: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
