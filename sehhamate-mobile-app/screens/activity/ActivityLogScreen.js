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
  addActivityLog, 
  getActivityLogs, 
  deleteNutritionLog, 
  getTodayDateRange,
  getWeekDateRange
} from '../../utils/firebaseHelpers';

const ACTIVITY_TYPES = [
  { id: 'walking', name: 'Walking', icon: 'walk', calories: 4 }, // per minute
  { id: 'running', name: 'Running', icon: 'fitness', calories: 12 },
  { id: 'cycling', name: 'Cycling', icon: 'bicycle', calories: 8 },
  { id: 'swimming', name: 'Swimming', icon: 'water', calories: 10 },
  { id: 'weightlifting', name: 'Weight Lifting', icon: 'barbell', calories: 6 },
  { id: 'yoga', name: 'Yoga', icon: 'flower', calories: 3 },
  { id: 'dancing', name: 'Dancing', icon: 'musical-notes', calories: 5 },
  { id: 'basketball', name: 'Basketball', icon: 'basketball', calories: 9 },
  { id: 'soccer', name: 'Soccer', icon: 'football', calories: 8 },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball', calories: 7 },
];

export default function ActivityLogScreen({ navigation }) {
  const { user } = useAuth();
  const [todayLogs, setTodayLogs] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Load activity logs
  const loadLogs = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Load today's activities
      const todayRange = getTodayDateRange();
      const todayResult = await getActivityLogs(user.id, todayRange);
      
      // Load this week's activities
      const weekRange = getWeekDateRange();
      const weekResult = await getActivityLogs(user.id, weekRange);
      
      if (todayResult.success) {
        setTodayLogs(todayResult.logs);
      }
      
      if (weekResult.success) {
        setWeeklyLogs(weekResult.logs);
      }
      
      console.log('Loaded activity logs - Today:', todayResult.logs?.length, 'Week:', weekResult.logs?.length);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      Alert.alert('Error', 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user]);

  // Add new activity log
  const handleAddActivity = async () => {
    if (!selectedActivity) {
      Alert.alert('Error', 'Please select an activity type');
      return;
    }

    if (!duration || isNaN(duration) || parseInt(duration) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    try {
      const durationMinutes = parseInt(duration);
      const estimatedCalories = Math.round(selectedActivity.calories * durationMinutes);
      
      const activityData = {
        type: selectedActivity.id,
        name: selectedActivity.name,
        duration: durationMinutes,
        calories: estimatedCalories,
        notes: notes.trim(),
        date: new Date().toISOString(),
      };

      const result = await addActivityLog(user.id, activityData);
      
      if (result.success) {
        Alert.alert('Success', 'Activity logged successfully!');
        setAddModalVisible(false);
        setSelectedActivity(null);
        setDuration('');
        setNotes('');
        loadLogs(); // Refresh the logs
      } else {
        Alert.alert('Error', result.error || 'Failed to log activity');
      }
    } catch (error) {
      console.error('Error adding activity log:', error);
      Alert.alert('Error', 'Failed to log activity');
    }
  };

  // Calculate totals
  const todayTotals = todayLogs.reduce(
    (acc, log) => ({
      duration: acc.duration + (log.duration || 0),
      calories: acc.calories + (log.calories || 0),
    }),
    { duration: 0, calories: 0 }
  );

  const weeklyTotals = weeklyLogs.reduce(
    (acc, log) => ({
      duration: acc.duration + (log.duration || 0),
      calories: acc.calories + (log.calories || 0),
    }),
    { duration: 0, calories: 0 }
  );

  return (
    <ScreenContainer>
      <ScreenHeaderWithBack
        title="Activity Log"
        navigation={navigation}
        rightComponent={
          <TouchableOpacity onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={24} color={Colors.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Activity Summary */}
        <LinearGradient
          colors={[Colors.backgroundCard, Colors.backgroundSecondary]}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>Activity Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Today</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{todayTotals.duration}</Text>
                  <Text style={styles.summaryLabel}>minutes</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{todayTotals.calories}</Text>
                  <Text style={styles.summaryLabel}>calories</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{weeklyTotals.duration}</Text>
                  <Text style={styles.summaryLabel}>minutes</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{weeklyTotals.calories}</Text>
                  <Text style={styles.summaryLabel}>calories</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activities</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : todayLogs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No activities logged today</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first activity</Text>
            </View>
          ) : (
            todayLogs.map((log) => (
              <LinearGradient
                key={log.id}
                colors={[Colors.backgroundCard, Colors.backgroundSecondary]}
                style={styles.logCard}
              >
                <View style={styles.logHeader}>
                  <View style={styles.activityIcon}>
                    <Ionicons 
                      name={ACTIVITY_TYPES.find(a => a.id === log.type)?.icon || 'fitness'} 
                      size={24} 
                      color={Colors.accent} 
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logName}>{log.name}</Text>
                    <Text style={styles.logTime}>
                      {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.logStats}>
                    <Text style={styles.statValue}>{log.duration} min</Text>
                    <Text style={styles.statValue}>{log.calories} cal</Text>
                  </View>
                </View>
                
                {log.notes ? (
                  <Text style={styles.logNotes}>{log.notes}</Text>
                ) : null}
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

      {/* Add Activity Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Activity</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Activity Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity Type *</Text>
                <View style={styles.activityGrid}>
                  {ACTIVITY_TYPES.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      style={[
                        styles.activityOption,
                        selectedActivity?.id === activity.id && styles.activityOptionSelected
                      ]}
                      onPress={() => setSelectedActivity(activity)}
                    >
                      <Ionicons 
                        name={activity.icon} 
                        size={24} 
                        color={selectedActivity?.id === activity.id ? Colors.backgroundPrimary : Colors.accent}
                      />
                      <Text style={[
                        styles.activityOptionText,
                        selectedActivity?.id === activity.id && styles.activityOptionTextSelected
                      ]}>
                        {activity.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (minutes) *</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Enter duration in minutes"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
                {selectedActivity && duration && !isNaN(duration) && (
                  <Text style={styles.calorieEstimate}>
                    Estimated calories: {Math.round(selectedActivity.calories * parseInt(duration))}
                  </Text>
                )}
              </View>

              {/* Notes Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about your workout..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
                <LinearGradient
                  colors={[Colors.accent, Colors.accentDark]}
                  style={styles.addButtonGradient}
                >
                  <Text style={styles.addButtonText}>Log Activity</Text>
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
    gap: 16,
  },
  summarySection: {
    
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
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
  section: {
    marginBottom: 24,
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
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logStats: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    minWidth: '45%',
  },
  activityOptionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  activityOptionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  activityOptionTextSelected: {
    color: Colors.backgroundPrimary,
    fontWeight: '600',
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  calorieEstimate: {
    fontSize: 12,
    color: Colors.accent,
    marginTop: 4,
    fontWeight: '600',
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


