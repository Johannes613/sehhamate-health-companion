import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeaderWithBack from '../../components/ui/ScreenHeaderWithBack';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../utils/colorUtils';
import { 
  addNutritionLog, 
  getNutritionLogs, 
  deleteNutritionLog, 
  getTodayDateRange 
} from '../../utils/firebaseHelpers';

export default function NutritionLogScreen({ navigation }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newLog, setNewLog] = useState({
    food: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
    serving: '',
  });

  // Load nutrition logs
  const loadLogs = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const todayRange = getTodayDateRange();
      const result = await getNutritionLogs(user.id, todayRange);
      
      if (result.success) {
        setLogs(result.logs);
        console.log('Loaded nutrition logs:', result.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load nutrition logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user]);

  // Add new nutrition log
  const handleAddLog = async () => {
    if (!newLog.food.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    if (!newLog.calories || isNaN(newLog.calories)) {
      Alert.alert('Error', 'Please enter valid calories');
      return;
    }

    try {
      const logData = {
        food: newLog.food.trim(),
        calories: parseFloat(newLog.calories) || 0,
        protein: parseFloat(newLog.protein) || 0,
        carbohydrates: parseFloat(newLog.carbohydrates) || 0,
        fat: parseFloat(newLog.fat) || 0,
        serving: newLog.serving.trim() || '1 serving',
        meal: 'snack', // Default meal type
        date: new Date().toISOString(),
      };

      const result = await addNutritionLog(user.id, logData);
      
      if (result.success) {
        Alert.alert('Success', 'Food logged successfully!');
        setAddModalVisible(false);
        setNewLog({
          food: '',
          calories: '',
          protein: '',
          carbohydrates: '',
          fat: '',
          serving: '',
        });
        loadLogs(); // Refresh the logs
      } else {
        Alert.alert('Error', result.error || 'Failed to log food');
      }
    } catch (error) {
      console.error('Error adding log:', error);
      Alert.alert('Error', 'Failed to log food');
    }
  };

  // Delete nutrition log
  const handleDeleteLog = async (logId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this nutrition entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteNutritionLog(logId);
              if (result.success) {
                Alert.alert('Success', 'Entry deleted successfully');
                loadLogs(); // Refresh the logs
              } else {
                Alert.alert('Error', result.error || 'Failed to delete entry');
              }
            } catch (error) {
              console.error('Error deleting log:', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  // Calculate totals
  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbohydrates: acc.carbohydrates + (log.carbohydrates || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  const dailyGoals = user?.dailyRequirements || {
    calories: 2000,
    protein: 150,
    carbohydrates: 250,
    fat: 67,
  };

  return (
    <ScreenContainer>
      <ScreenHeaderWithBack
        title="Nutrition Log"
        navigation={navigation}
        rightComponent={
          <TouchableOpacity onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={24} color={Colors.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Daily Summary */}
        <LinearGradient
          colors={[Colors.backgroundCard, Colors.backgroundSecondary]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totals.calories)}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
              <Text style={styles.summaryGoal}>/ {dailyGoals.calories}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totals.protein)}g</Text>
              <Text style={styles.summaryLabel}>Protein</Text>
              <Text style={styles.summaryGoal}>/ {dailyGoals.protein}g</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totals.carbohydrates)}g</Text>
              <Text style={styles.summaryLabel}>Carbs</Text>
              <Text style={styles.summaryGoal}>/ {dailyGoals.carbohydrates}g</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totals.fat)}g</Text>
              <Text style={styles.summaryLabel}>Fat</Text>
              <Text style={styles.summaryGoal}>/ {dailyGoals.fat}g</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Food Entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Loading entries...</Text>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No food logged today</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first entry</Text>
            </View>
          ) : (
            logs.map((log) => (
              <LinearGradient
                key={log.id}
                colors={[Colors.backgroundCard, Colors.backgroundSecondary]}
                style={styles.logCard}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logFood}>{log.food}</Text>
                    <Text style={styles.logServing}>{log.serving}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteLog(log.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.logNutrition}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(log.calories || 0)}</Text>
                    <Text style={styles.nutritionLabel}>cal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(log.protein || 0)}g</Text>
                    <Text style={styles.nutritionLabel}>protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(log.carbohydrates || 0)}g</Text>
                    <Text style={styles.nutritionLabel}>carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(log.fat || 0)}g</Text>
                    <Text style={styles.nutritionLabel}>fat</Text>
                  </View>
                </View>
              </LinearGradient>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accentDark]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={Colors.backgroundPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add Food Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food Entry</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newLog.food}
                  onChangeText={(text) => setNewLog({ ...newLog, food: text })}
                  placeholder="e.g., Grilled Chicken Breast"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Serving Size</Text>
                <TextInput
                  style={styles.input}
                  value={newLog.serving}
                  onChangeText={(text) => setNewLog({ ...newLog, serving: text })}
                  placeholder="e.g., 1 cup, 100g"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  value={newLog.calories}
                  onChangeText={(text) => setNewLog({ ...newLog, calories: text })}
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={newLog.protein}
                    onChangeText={(text) => setNewLog({ ...newLog, protein: text })}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={newLog.carbohydrates}
                    onChangeText={(text) => setNewLog({ ...newLog, carbohydrates: text })}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  value={newLog.fat}
                  onChangeText={(text) => setNewLog({ ...newLog, fat: text })}
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddLog}>
                <LinearGradient
                  colors={[Colors.accent, Colors.accentDark]}
                  style={styles.addButtonGradient}
                >
                  <Text style={styles.addButtonText}>Add Entry</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryGoal: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  logCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logInfo: {
    flex: 1,
  },
  logFood: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logServing: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  logNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  addButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.backgroundPrimary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


