import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Colors } from '../../utils/colorUtils';

export default function MealSetupScreen({ navigation }) {
  const [selectedDishTypes, setSelectedDishTypes] = useState({
    breakfast: 'Toast',
    lunch: 'Stir-Fried',
    snack: 'Toast',
    dinner: 'Stir-Fried'
  });

  const [selectedIngredients, setSelectedIngredients] = useState({
    vegetables: ['Tomato', 'Spinach'],
    meat: ['Chicken'],
    fruit: ['Banana', 'Mango'],
    carbs: ['Rice', 'Bread', 'Oat']
  });

  const dishTypes = [
    'Toast', 'Stir-Fried', 'Grilled', 'Steamed', 'Baked', 'Raw/Salad', 'Soup', 'Smoothie'
  ];

  const ingredientOptions = {
    vegetables: [
      { name: 'Lettuce', icon: '🥬' },
      { name: 'Tomato', icon: '🍅' },
      { name: 'Spinach', icon: '🥬' },
      { name: 'Carrot', icon: '🥕' },
      { name: 'Broccoli', icon: '🥦' },
      { name: 'Cucumber', icon: '🥒' },
      { name: 'Potato', icon: '🥔' },
      { name: 'Sweet Potato', icon: '🍠' },
      { name: 'Peas', icon: '🟢' },
      { name: 'Cabbage', icon: '🥬' },
      { name: 'Chickpea', icon: '🟡' },
      { name: 'Corn', icon: '🌽' },
      { name: 'Mushroom', icon: '🍄' }
    ],
    meat: [
      { name: 'Chicken', icon: '🐔' },
      { name: 'Turkey', icon: '🦃' },
      { name: 'Tuna', icon: '🐟' },
      { name: 'Salmon', icon: '🐟' },
      { name: 'Beef', icon: '🥩' },
      { name: 'Pork', icon: '🐷' },
      { name: 'Shrimp', icon: '🦐' },
      { name: 'Egg', icon: '🥚' }
    ],
    fruit: [
      { name: 'Avocado', icon: '🥑' },
      { name: 'Apple', icon: '🍎' },
      { name: 'Blueberry', icon: '🫐' },
      { name: 'Banana', icon: '🍌' },
      { name: 'Mango', icon: '🥭' },
      { name: 'Strawberry', icon: '🍓' },
      { name: 'Blackberry', icon: '🫐' },
      { name: 'Kiwi', icon: '🥝' }
    ],
    carbs: [
      { name: 'Rice', icon: '🍚' },
      { name: 'Bread', icon: '🍞' },
      { name: 'Oat', icon: '🌾' },
      { name: 'Buckwheat', icon: '🌾' },
      { name: 'Quinoa', icon: '🌾' },
      { name: 'Macaroni', icon: '🍝' },
      { name: 'Noodle', icon: '🍜' },
      { name: 'Tortilla', icon: '🌯' }
    ]
  };

  const handleDishTypeSelect = (mealType, dishType) => {
    setSelectedDishTypes(prev => ({
      ...prev,
      [mealType]: dishType
    }));
  };

  const handleIngredientToggle = (category, ingredient) => {
    setSelectedIngredients(prev => ({
      ...prev,
      [category]: prev[category].includes(ingredient)
        ? prev[category].filter(item => item !== ingredient)
        : [...prev[category], ingredient]
    }));
  };

  const handleNext = () => {
    // Navigate to recommendations screen with selected preferences
    navigation.navigate('MealRecommendations', {
      dishTypes: selectedDishTypes,
      ingredients: selectedIngredients
    });
  };

  const renderDishTypeSelector = (mealType, title, iconName) => (
    <View style={styles.mealSection} key={mealType}>
      <View style={styles.mealHeader}>
        <Ionicons name={iconName} size={24} color={Colors.accent} />
        <Text style={styles.mealTitle}>{title}</Text>
      </View>
      <Text style={styles.mealSubtitle}>Select dish type</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dishTypeScrollView}
        contentContainerStyle={styles.dishTypeContainer}
      >
        {dishTypes.map((dishType) => (
          <TouchableOpacity
            key={dishType}
            style={[
              styles.dishTypeChip,
              selectedDishTypes[mealType] === dishType && styles.dishTypeChipSelected
            ]}
            onPress={() => handleDishTypeSelect(mealType, dishType)}
          >
            <Text style={[
              styles.dishTypeText,
              selectedDishTypes[mealType] === dishType && styles.dishTypeTextSelected
            ]}>
              {dishType}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderIngredientCategory = (category, title) => (
    <View style={styles.ingredientSection} key={category}>
      <Text style={styles.ingredientCategoryTitle}>{title}</Text>
      <View style={styles.ingredientGrid}>
        {ingredientOptions[category].map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.ingredientChip,
              selectedIngredients[category].includes(item.name) && styles.ingredientChipSelected
            ]}
            onPress={() => handleIngredientToggle(category, item.name)}
          >
            <Text style={styles.ingredientEmoji}>{item.icon}</Text>
            <Text style={[
              styles.ingredientText,
              selectedIngredients[category].includes(item.name) && styles.ingredientTextSelected
            ]}>
              {item.name}
            </Text>
            {selectedIngredients[category].includes(item.name) && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.accent} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScreenHeader 
        title="Setup Today Recommendation" 
        navigation={navigation}
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>
            This form is optional and please fill up below information for more customization
          </Text>
        </View>

        {/* Meal Type Selections */}
        <View style={styles.mealTypesContainer}>
          {renderDishTypeSelector('breakfast', 'Breakfast', 'sunny-outline')}
          {renderDishTypeSelector('lunch', 'Lunch', 'restaurant-outline')}
          {renderDishTypeSelector('snack', 'Snack', 'cafe-outline')}
          {renderDishTypeSelector('dinner', 'Dinner', 'moon-outline')}
        </View>

        {/* Favorite Ingredients */}
        <View style={styles.ingredientsContainer}>
          <Text style={styles.sectionTitle}>Favorite Ingredients</Text>
          {renderIngredientCategory('vegetables', 'Favorite Vege')}
          {renderIngredientCategory('meat', 'Favorite Meat')}
          {renderIngredientCategory('fruit', 'Favorite Fruit')}
          {renderIngredientCategory('carbs', 'Favorite Carb')}
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#00ff88', '#00cc6a']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>Generate Recommendations</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
  mealTypesContainer: {
    marginBottom: 30,
  },
  mealSection: {
    marginBottom: 24,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  mealSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  dishTypeScrollView: {
    marginHorizontal: -16,
  },
  dishTypeContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dishTypeChip: {
    backgroundColor: Colors.backgroundCardSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  dishTypeChipSelected: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
  },
  dishTypeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dishTypeTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  ingredientsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  ingredientSection: {
    marginBottom: 24,
  },
  ingredientCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
    marginBottom: 8,
    position: 'relative',
  },
  ingredientChipSelected: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
  },
  ingredientEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  ingredientTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 4,
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});
