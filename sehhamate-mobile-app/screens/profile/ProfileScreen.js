import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../utils/colorUtils';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserProfile } = useAuth();
  const [selectedModal, setSelectedModal] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || 'Amelia Johnson',
    email: user?.email || 'amelia.johnson@email.com',
    phone: '+1 (555) 123-4567',
    age: user?.age || '28',
    height: user?.height || '165',
    weight: user?.weight || '65',
    gender: user?.gender || 'female',
    activityLevel: user?.activityLevel || 'moderately_active',
    dietaryPreferences: user?.dietaryPreferences || [],
    allergies: user?.allergies || []
  });

  const handleLogout = () => {
    console.log('Logout button pressed');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Logout cancelled'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('Logout confirmed');
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateUserProfile(editForm);
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    // Update form with current user data
    setEditForm({
      ...editForm,
      ...user,
    });
  };

  const handleSaveChanges = async () => {
    try {
      const result = await updateUserProfile(editForm);
      if (result.success) {
        Alert.alert('Success', 'Changes saved successfully!');
        setIsEditMode(false);
        
        // Recalculate daily requirements if physical stats changed
        if (editForm.age || editForm.weight || editForm.height || editForm.activityLevel) {
          console.log('Physical stats updated - daily requirements will be recalculated');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to save changes');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form to original user data
    setEditForm({
      ...editForm,
      ...user,
    });
  };

  const getBMI = () => {
    if (user?.weight && user?.height) {
      const weight = parseFloat(user.weight);
      const height = parseFloat(user.height) / 100;
      return (weight / (height * height)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMICategory = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#74B9FF' };
    if (bmiValue < 25) return { category: 'Normal', color: '#00ff88' };
    if (bmiValue < 30) return { category: 'Overweight', color: '#FFB020' };
    return { category: 'Obese', color: '#FF6B6B' };
  };

  const getActivityLevel = (level) => {
    const levels = {
      sedentary: 'Sedentary',
      moderately_active: 'Moderately Active',
      very_active: 'Very Active',
    };
    return levels[level] || 'Not Set';
  };

  const profileSections = [
    {
      id: 'basic',
      icon: 'person-outline',
      title: 'Basic Information',
      subtitle: `${user?.age || 'N/A'} years • ${user?.gender || 'N/A'} • BMI ${getBMI()}`,
      color: '#4ECDC4',
      onPress: () => setSelectedModal('basic'),
    },
    {
      id: 'physical',
      icon: 'fitness-outline',
      title: 'Physical Stats',
      subtitle: `${user?.weight || 'N/A'} kg • ${user?.height || 'N/A'} cm`,
      color: '#FF6B6B',
      onPress: () => setSelectedModal('physical'),
    },
    {
      id: 'activity',
      icon: 'walk-outline',
      title: 'Activity Level',
      subtitle: getActivityLevel(user?.activityLevel),
      color: '#45B7D1',
      onPress: () => setSelectedModal('activity'),
    },
    {
      id: 'nutrition',
      icon: 'flame-outline',
      title: 'Daily Requirements',
      subtitle: user?.dailyRequirements ? `${user.dailyRequirements.calories} cal/day` : 'Not calculated',
      color: '#FFB020',
      onPress: () => setSelectedModal('nutrition'),
    },
    {
      id: 'dietary',
      icon: 'leaf-outline',
      title: 'Dietary Preferences',
      subtitle: user?.dietaryPreferences?.length > 0 
        ? `${user.dietaryPreferences.length} preference${user.dietaryPreferences.length !== 1 ? 's' : ''}`
        : 'None set',
      color: '#7ED321',
      onPress: () => setSelectedModal('dietary'),
    },
    {
      id: 'allergies',
      icon: 'shield-outline',
      title: 'Allergies & Safety',
      subtitle: user?.allergies?.length > 0 
        ? `${user.allergies.length} allerg${user.allergies.length !== 1 ? 'ies' : 'y'} noted`
        : 'No allergies',
      color: '#FF4444',
      onPress: () => setSelectedModal('allergies'),
    },
  ];

  const statsData = [
    { label: 'Days Active', value: '28', icon: 'calendar-outline' },
    { label: 'Goals Met', value: '15', icon: 'trophy-outline' },
    { label: 'Streak', value: '7', icon: 'flame-outline' },
  ];

  const renderModalContent = () => {
    switch (selectedModal) {
      case 'basic':
        return (
          <View style={styles.detailSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Full Name</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textSecondary}
                />
              ) : (
                <Text style={styles.detailValue}>{user?.name || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.detailValue}>{user?.email || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age</Text>
              {isEditMode ? (
                <TextInput
                  style={styles.editInput}
                  value={editForm.age}
                  onChangeText={(text) => setEditForm({...editForm, age: text})}
                  placeholder="Enter your age"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.detailValue}>{user?.age ? `${user.age} years` : 'Not set'}</Text>
              )}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender</Text>
              {isEditMode ? (
                <View style={styles.genderOptions}>
                  {['male', 'female', 'other'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderOption,
                        editForm.gender === gender && styles.genderOptionSelected
                      ]}
                      onPress={() => setEditForm({...editForm, gender})}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        editForm.gender === gender && styles.genderOptionTextSelected
                      ]}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailValue}>{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}</Text>
              )}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>BMI</Text>
              <View style={styles.bmiContainer}>
                <Text style={styles.detailValue}>{getBMI()}</Text>
                {getBMI() !== 'N/A' && (
                  <View style={[styles.bmiBadge, { backgroundColor: getBMICategory(getBMI()).color + '20' }]}>
                    <Text style={[styles.bmiText, { color: getBMICategory(getBMI()).color }]}>
                      {getBMICategory(getBMI()).category}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );

      case 'physical':
        return (
          <View style={styles.detailSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              {isEditMode ? (
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.weight}
                    onChangeText={(text) => setEditForm({...editForm, weight: text})}
                    placeholder="Enter weight"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitText}>kg</Text>
                </View>
              ) : (
                <Text style={styles.detailValue}>{user?.weight ? `${user.weight} kg` : 'Not set'}</Text>
              )}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Height</Text>
              {isEditMode ? (
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.height}
                    onChangeText={(text) => setEditForm({...editForm, height: text})}
                    placeholder="Enter height"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                  <Text style={styles.unitText}>cm</Text>
                </View>
              ) : (
                <Text style={styles.detailValue}>{user?.height ? `${user.height} cm` : 'Not set'}</Text>
              )}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Body Mass Index</Text>
              <Text style={styles.detailValue}>{getBMI()}</Text>
            </View>
            {user?.dailyRequirements && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>BMR (Basal Metabolic Rate)</Text>
                <Text style={styles.detailValue}>{user.dailyRequirements.bmr || 'Not calculated'} cal/day</Text>
              </View>
            )}
          </View>
        );

      case 'activity':
        return (
          <View style={styles.detailSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Activity Level</Text>
              <Text style={styles.detailValue}>{getActivityLevel(user?.activityLevel)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailDescription}>
                {user?.activityLevel === 'sedentary' && 'Desk job, minimal walking, no regular exercise'}
                {user?.activityLevel === 'moderately_active' && 'Regular gym visits, sports, cycling'}
                {user?.activityLevel === 'very_active' && 'Daily workouts, training, physical job'}
                {!user?.activityLevel && 'Activity level not set'}
              </Text>
            </View>
            {user?.dailyRequirements && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>TDEE (Total Daily Energy Expenditure)</Text>
                <Text style={styles.detailValue}>{user.dailyRequirements.tdee || 'Not calculated'} cal/day</Text>
              </View>
            )}
          </View>
        );

      case 'nutrition':
        return (
          <View style={styles.detailSection}>
            {user?.dailyRequirements ? (
              <>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Daily Calories</Text>
                  <Text style={styles.detailValue}>{user.dailyRequirements.calories.toLocaleString()} kcal</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Protein</Text>
                  <Text style={styles.detailValue}>{user.dailyRequirements.protein}g</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Carbohydrates</Text>
                  <Text style={styles.detailValue}>{user.dailyRequirements.carbohydrates}g</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Fat</Text>
                  <Text style={styles.detailValue}>{user.dailyRequirements.fat}g</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Macro Distribution</Text>
                  <View style={styles.macroDistribution}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroPercentage}>
                        {Math.round((user.dailyRequirements.protein * 4 / user.dailyRequirements.calories) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroPercentage}>
                        {Math.round((user.dailyRequirements.carbohydrates * 4 / user.dailyRequirements.calories) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <Text style={styles.macroPercentage}>
                        {Math.round((user.dailyRequirements.fat * 9 / user.dailyRequirements.calories) * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.notSetContainer}>
                <Ionicons name="information-circle-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.notSetText}>Daily requirements not calculated</Text>
                <Text style={styles.notSetSubtext}>Complete your profile setup to see personalized nutrition targets</Text>
              </View>
            )}
          </View>
        );

      case 'dietary':
        return (
          <View style={styles.detailSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Dietary Preferences</Text>
              {user?.dietaryPreferences?.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {user.dietaryPreferences.map((pref, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>
                        {pref.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailValue}>No dietary preferences set</Text>
              )}
            </View>
          </View>
        );

      case 'allergies':
        return (
          <View style={styles.detailSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Food Allergies</Text>
              {user?.allergies?.length > 0 ? (
                <View style={styles.allergiesContainer}>
                  {user.allergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyItem}>
                      <View style={[styles.severityDot, { backgroundColor: allergy.severity === 'high' ? '#FF4444' : '#FFB020' }]} />
                      <Text style={styles.allergyText}>{allergy.label}</Text>
                      <View style={[styles.severityBadge, { backgroundColor: allergy.severity === 'high' ? '#FF4444' : '#FFB020' }]}>
                        <Text style={styles.severityText}>{allergy.severity.toUpperCase()}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.safetyNote}>
                    <Ionicons name="warning" size={16} color={Colors.danger} />
                    <Text style={styles.safetyText}>
                      Always inform healthcare providers and restaurants about your allergies
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.detailValue}>No allergies recorded</Text>
              )}
            </View>
          </View>
        );

      default:
        return <Text style={styles.detailValue}>Content not available</Text>;
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader 
        title="Profile" 
        navigation={navigation}
        rightIcon="settings-outline"
        onRightPress={() => Alert.alert('Settings', 'Settings coming soon!')}
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#2D2D33', '#1C1C22']}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{user?.name || 'Amelia Johnson'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'amelia.johnson@email.com'}</Text>
            
            <View style={styles.statsContainer}>
              {statsData.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Ionicons name={stat.icon} size={20} color={Colors.accent} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {profileSections.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem} 
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.backgroundSecondary, Colors.backgroundCard]}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuItemIcon, { backgroundColor: item.color + '30' }]}>
                      <Ionicons name={item.icon} size={24} color={item.color} />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.menuItemRight}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff3b30', '#ff6b6b']}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.textPrimary} />
              <Text style={styles.logoutText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleSaveProfile}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.age}
                    onChangeText={(text) => setEditForm({...editForm, age: text})}
                    placeholder="Age"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.height}
                    onChangeText={(text) => setEditForm({...editForm, height: text})}
                    placeholder="Height"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.weight}
                  onChangeText={(text) => setEditForm({...editForm, weight: text})}
                  placeholder="Weight"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Detail Modals */}
      {selectedModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => {
                  setSelectedModal(null);
                  setIsEditMode(false);
                }}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {profileSections.find(s => s.id === selectedModal)?.title}
                </Text>
                {isEditMode ? (
                  <View style={styles.editModeButtons}>
                    <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleEnterEditMode}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {renderModalContent()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundPrimary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuItem: {
    marginBottom: 8,
  },
  menuItemGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuItemRight: {
    alignItems: 'center',
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 30,
    zIndex: 10,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  modalScrollView: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // New styles for profile detail modals
  detailModalContent: {
    backgroundColor: Colors.backgroundPrimary,
    margin: 20,
    marginTop: 80,
    borderRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
  detailSection: {
    padding: 24,
  },
  detailItem: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  detailDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bmiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  macroDistribution: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  macroPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  notSetContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  notSetText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  notSetSubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  allergiesContainer: {
    marginTop: 8,
  },
  allergyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    marginBottom: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  allergyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.danger + '10',
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  safetyText: {
    fontSize: 12,
    color: Colors.danger,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  // Edit mode styles
  editModeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  editInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    flex: 1,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  genderOptionTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
