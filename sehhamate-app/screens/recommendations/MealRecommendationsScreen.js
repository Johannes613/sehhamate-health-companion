import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Image,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Colors } from '../../utils/colorUtils';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useAuth } from '../../contexts/AuthContext';
import { addUserMealPlan } from '../../utils/firebaseHelpers';

export default function MealRecommendationsScreen({ navigation, route }) {
  const { dishTypes, ingredients, savedMealPlan } = route.params || {};
  const { addMealPlan } = useMealPlan();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    if (savedMealPlan) {
      // If we have a saved meal plan, use it directly
      setRecommendations(savedMealPlan);
      setLoading(false);
    } else {
      // Otherwise generate new recommendations
      generateRecommendations();
    }
  }, [savedMealPlan]);

  const generateRecommendations = () => {
    setLoading(true);
    
    // Generate meal recommendations
    setTimeout(() => {
      const recommendations = {
        meals: {
          breakfast: {
            name: `${dishTypes?.breakfast || 'Grilled'} Chicken with spinach and potato`,
            calories: 768,
            protein: 46,
            carbs: 61,
            fat: 20,
            fiber: 8,
            sugar: 12,
            sodium: 420,
            cholesterol: 95,
            vitamins: ['Vitamin A', 'Vitamin C', 'Iron', 'Calcium'],
            ingredients: ingredients?.vegetables?.slice(0, 2) || ['spinach', 'potato'],
            cookingTime: '25 minutes',
            difficulty: 'Medium',
            servings: 1,
            instructions: [
              'Season chicken with herbs and spices',
              'Heat oil in a pan over medium heat',
              'Cook chicken for 6-8 minutes per side',
              'Steam spinach and potato separately',
              'Serve chicken with vegetables'
            ],
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
          },
          lunch: {
            name: `${dishTypes?.lunch || 'Stir-Fried'} Chicken with spinach and potato`,
            calories: 893,
            protein: 53,
            carbs: 71,
            fat: 23,
            fiber: 9,
            sugar: 8,
            sodium: 520,
            cholesterol: 110,
            vitamins: ['Vitamin B6', 'Vitamin K', 'Potassium', 'Magnesium'],
            ingredients: ingredients?.meat?.slice(0, 1).concat(ingredients?.vegetables?.slice(0, 2)) || ['chicken', 'spinach', 'potato'],
            cookingTime: '20 minutes',
            difficulty: 'Easy',
            servings: 1,
            instructions: [
              'Cut chicken into bite-sized pieces',
              'Heat wok or large pan with oil',
              'Stir-fry chicken until golden brown',
              'Add vegetables and stir-fry for 3-4 minutes',
              'Season with soy sauce and serve hot'
            ],
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'
          },
          snack: {
            name: `${dishTypes?.snack || 'Toast'} Rice with tomato and peas`,
            calories: 255,
            protein: 15,
            carbs: 20,
            fat: 6,
            fiber: 4,
            sugar: 5,
            sodium: 180,
            cholesterol: 0,
            vitamins: ['Vitamin C', 'Folate', 'Fiber', 'Antioxidants'],
            ingredients: ingredients?.carbs?.slice(0, 1).concat(ingredients?.vegetables?.slice(0, 2)) || ['rice', 'tomato', 'peas'],
            cookingTime: '15 minutes',
            difficulty: 'Easy',
            servings: 1,
            instructions: [
              'Cook rice according to package instructions',
              'Dice tomatoes and blanch peas',
              'Mix rice with vegetables',
              'Season with herbs and olive oil',
              'Serve warm as a healthy snack'
            ],
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
          },
          dinner: {
            name: `${dishTypes?.dinner || 'Stir-Fried'} Rice with mushroom and cabbage`,
            calories: 638,
            protein: 38,
            carbs: 51,
            fat: 17,
            fiber: 7,
            sugar: 9,
            sodium: 480,
            cholesterol: 75,
            vitamins: ['Vitamin D', 'Selenium', 'Vitamin K', 'Folate'],
            ingredients: ingredients?.carbs?.slice(0, 1).concat(ingredients?.vegetables?.slice(-2)) || ['rice', 'mushroom', 'cabbage'],
            cookingTime: '30 minutes',
            difficulty: 'Medium',
            servings: 1,
            instructions: [
              'Cook rice and set aside',
              'Slice mushrooms and shred cabbage',
              'Heat oil in large pan or wok',
              'Stir-fry mushrooms until golden',
              'Add cabbage and rice, stir-fry until heated through',
              'Season and serve hot'
            ],
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'
          }
        },
        totalNutrients: {
          calories: 2554,
          protein: 152,
          carbs: 203,
          fat: 66
        }
      };
      
      setRecommendations(recommendations);
      setLoading(false);
    }, 1500);
  };

  const handleSaveMealPlan = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to save meal plans');
      return;
    }

    try {
      // Save the complete meal plan to logs
      const mealPlanData = {
        id: Date.now(),
        type: 'meal_plan',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(), // Use ISO string for Firebase
        title: 'AI Generated Meal Plan',
        description: `Daily meal recommendations: ${recommendations.totalNutrients.calories} cal total`,
        imageUrl: recommendations.meals.breakfast.image,
        recommendations: recommendations,
        dishTypes: dishTypes,
        ingredients: ingredients,
        generated: true,
        userId: user.id // Add userId for Firebase
      };

      // Save to Firebase first
      const firebaseResult = await addUserMealPlan(user.id, mealPlanData);
      
      if (firebaseResult.success) {
        // Add meal plan to local context
        addMealPlan(mealPlanData);
        console.log('Meal plan saved to Firebase and context:', mealPlanData);

        // Show success alert
        Alert.alert(
          'Meal Plan Saved',
          'Your personalized meal plan has been saved to your daily logs!',
          [
            {
              text: 'View in Logs',
              onPress: () => navigation.navigate('Logs')
            },
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save meal plan. Please try again.');
        console.error('Firebase save error:', firebaseResult.error);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Alert.alert('Error', 'Failed to save meal plan. Please try again.');
    }
  };

  const handleMealPress = (mealType, mealData) => {
    setSelectedMeal({ type: mealType, data: mealData });
    setDetailModalVisible(true);
  };

  const handleRegenerateRecommendations = () => {
    Alert.alert(
      'Regenerate Recommendations',
      'Would you like to generate new meal recommendations based on your preferences?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Regenerate',
          onPress: generateRecommendations
        }
      ]
    );
  };

  const renderMealCard = (mealType, mealData, iconName) => (
    <TouchableOpacity 
      style={styles.mealCard} 
      key={mealType} 
      activeOpacity={0.8}
      onPress={() => handleMealPress(mealType, mealData)}
    >
      <LinearGradient
        colors={['#2D2D33', '#1C1C22']}
        style={styles.mealCardGradient}
      >
        <View style={styles.mealCardHeader}>
          <View style={styles.mealHeaderLeft}>
            <Ionicons name={iconName} size={20} color={Colors.accent} />
            <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          </View>
          <Text style={styles.caloriesBadge}>{mealData.calories} cal</Text>
        </View>
        
        <View style={styles.mealImageContainer}>
          <Image 
            source={{ uri: mealData.image }}
            style={styles.mealImage}
            resizeMode="cover"
          />
          <View style={styles.mealImageOverlay}>
            <Ionicons name="heart-outline" size={20} color={Colors.textPrimary} />
          </View>
        </View>
        
        <Text style={styles.mealName}>{mealData.name}</Text>
        
        <View style={styles.macroContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{mealData.protein}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{mealData.carbs}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{mealData.fat}g</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderNutrientGoalsCard = () => (
    <View style={styles.nutrientGoalsContainer}>
      <LinearGradient
        colors={['#2D2D33', '#1C1C22']}
        style={styles.nutrientGoalsGradient}
      >
        <View style={styles.nutrientGoalsHeader}>
          <Ionicons name="target-outline" size={24} color={Colors.accent} />
          <Text style={styles.nutrientGoalsTitle}>Target Nutrient Goals</Text>
        </View>
        
        <Text style={styles.nutrientGoalsSubtitle}>
          According to your data, here are meal recommendations for you today.
        </Text>
        
        <View style={styles.nutrientGrid}>
          <View style={styles.nutrientColumn}>
            <Text style={styles.nutrientColumnTitle}>Breakfast</Text>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Calories:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.breakfast.calories}kcal</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Protein:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.breakfast.protein}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Carb:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.breakfast.carbs}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Fat:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.breakfast.fat}g</Text>
            </View>
          </View>
          
          <View style={styles.nutrientColumn}>
            <Text style={styles.nutrientColumnTitle}>Lunch</Text>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Calories:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.lunch.calories}kcal</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Protein:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.lunch.protein}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Carb:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.lunch.carbs}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Fat:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.lunch.fat}g</Text>
            </View>
          </View>
          
          <View style={styles.nutrientColumn}>
            <Text style={styles.nutrientColumnTitle}>Snack</Text>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Calories:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.snack.calories}kcal</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Protein:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.snack.protein}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Carb:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.snack.carbs}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Fat:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.snack.fat}g</Text>
            </View>
          </View>
          
          <View style={styles.nutrientColumn}>
            <Text style={styles.nutrientColumnTitle}>Dinner</Text>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Calories:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.dinner.calories}kcal</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Protein:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.dinner.protein}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Carb:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.dinner.carbs}g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Fat:</Text>
              <Text style={styles.nutrientValue}>{recommendations?.meals.dinner.fat}g</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.totalNutrients}>
          <Text style={styles.totalNutrientsTitle}>Daily Total</Text>
          <Text style={styles.totalNutrientsText}>
            {recommendations?.totalNutrients.calories} cal • {recommendations?.totalNutrients.protein}g protein • {recommendations?.totalNutrients.carbs}g carbs • {recommendations?.totalNutrients.fat}g fat
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader 
          title="Today Recommendation" 
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="restaurant-outline" size={64} color={Colors.accent} />
          <Text style={styles.loadingText}>Generating personalized meal recommendations...</Text>
          <Text style={styles.loadingSubtext}>
            Based on your preferences and nutritional needs
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader 
        title="Today Recommendation" 
        navigation={navigation}
        rightIcon="refresh-outline"
        onRightPress={handleRegenerateRecommendations}
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>
            According to your data, here are meal recommendations for you today.
          </Text>
        </View>

        {/* Meal Recommendations */}
        <View style={styles.mealsContainer}>
          {recommendations && (
            <>
              {renderMealCard('breakfast', recommendations.meals.breakfast, 'sunny-outline')}
              {renderMealCard('lunch', recommendations.meals.lunch, 'restaurant-outline')}
              {renderMealCard('snack', recommendations.meals.snack, 'cafe-outline')}
              {renderMealCard('dinner', recommendations.meals.dinner, 'moon-outline')}
            </>
          )}
        </View>

        {/* Target Nutrient Goals */}
        {recommendations && renderNutrientGoalsCard()}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveMealPlan}>
            <LinearGradient
              colors={['#00ff88', '#00cc6a']}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="bookmark-outline" size={20} color={Colors.textPrimary} />
              <Text style={styles.saveButtonText}>Save Meal Plan</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.setupButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.setupButtonText}>Modify Preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Detailed Meal Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <LinearGradient
              colors={['#2D2D33', '#1C1C22']}
              style={styles.detailModalGradient}
            >
              {/* Modal Header */}
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>
                  {selectedMeal?.type?.charAt(0).toUpperCase() + selectedMeal?.type?.slice(1)} Details
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.detailModalBody} 
                showsVerticalScrollIndicator={false}
              >
                {selectedMeal && (
                  <>
                    {/* Meal Image */}
                    <View style={styles.detailImageContainer}>
                      <Image 
                        source={{ uri: selectedMeal.data.image }}
                        style={styles.detailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.detailImageOverlay}>
                        <View style={styles.detailCaloriesBadge}>
                          <Text style={styles.detailCaloriesText}>{selectedMeal.data.calories} cal</Text>
                        </View>
                      </View>
                    </View>

                    {/* Meal Name */}
                    <Text style={styles.detailMealName}>{selectedMeal.data.name}</Text>

                    {/* Meal Info */}
                    <View style={styles.detailInfoGrid}>
                      <View style={styles.detailInfoItem}>
                        <Ionicons name="time-outline" size={20} color={Colors.accent} />
                        <Text style={styles.detailInfoText}>{selectedMeal.data.cookingTime}</Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Ionicons name="bar-chart-outline" size={20} color={Colors.accent} />
                        <Text style={styles.detailInfoText}>{selectedMeal.data.difficulty}</Text>
                      </View>
                      <View style={styles.detailInfoItem}>
                        <Ionicons name="people-outline" size={20} color={Colors.accent} />
                        <Text style={styles.detailInfoText}>{selectedMeal.data.servings} serving</Text>
                      </View>
                    </View>

                    {/* Nutrition Information */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Nutrition Information</Text>
                      <View style={styles.nutritionDetailGrid}>
                        <View style={styles.nutritionDetailRow}>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Calories</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.calories}</Text>
                          </View>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Protein</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.protein}g</Text>
                          </View>
                        </View>
                        <View style={styles.nutritionDetailRow}>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Carbs</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.carbs}g</Text>
                          </View>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Fat</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.fat}g</Text>
                          </View>
                        </View>
                        <View style={styles.nutritionDetailRow}>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Fiber</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.fiber}g</Text>
                          </View>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Sugar</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.sugar}g</Text>
                          </View>
                        </View>
                        <View style={styles.nutritionDetailRow}>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Sodium</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.sodium}mg</Text>
                          </View>
                          <View style={styles.nutritionDetailItem}>
                            <Text style={styles.nutritionDetailLabel}>Cholesterol</Text>
                            <Text style={styles.nutritionDetailValue}>{selectedMeal.data.cholesterol}mg</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Vitamins & Minerals */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Vitamins & Minerals</Text>
                      <View style={styles.vitaminsContainer}>
                        {selectedMeal.data.vitamins.map((vitamin, index) => (
                          <View key={index} style={styles.vitaminChip}>
                            <Text style={styles.vitaminText}>{vitamin}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Ingredients */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Ingredients</Text>
                      <View style={styles.ingredientsContainer}>
                        {selectedMeal.data.ingredients.map((ingredient, index) => (
                          <View key={index} style={styles.ingredientItem}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                            <Text style={styles.ingredientText}>{ingredient}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Cooking Instructions */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Cooking Instructions</Text>
                      <View style={styles.instructionsContainer}>
                        {selectedMeal.data.instructions.map((instruction, index) => (
                          <View key={index} style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                              <Text style={styles.instructionNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.instructionText}>{instruction}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
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
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  headerSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  mealsContainer: {
    marginBottom: 30,
  },
  mealCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mealCardGradient: {
    padding: 16,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  caloriesBadge: {
    backgroundColor: Colors.accent + '20',
    color: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  mealImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  mealImageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  nutrientGoalsContainer: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nutrientGoalsGradient: {
    padding: 20,
  },
  nutrientGoalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientGoalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  nutrientGoalsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  nutrientGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  nutrientColumn: {
    width: '48%',
    marginBottom: 20,
  },
  nutrientColumnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 12,
    textAlign: 'center',
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutrientLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  nutrientValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalNutrients: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderPrimary,
    alignItems: 'center',
  },
  totalNutrientsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  totalNutrientsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  setupButton: {
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  detailModalContent: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  detailModalGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    minHeight: 600,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  detailModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  detailImageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  detailCaloriesBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailCaloriesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  detailMealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 30,
  },
  detailInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingVertical: 16,
  },
  detailInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  nutritionDetailGrid: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
  },
  nutritionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionDetailItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  nutritionDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  nutritionDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  vitaminsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vitaminChip: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  vitaminText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  ingredientsContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  instructionsContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
});
