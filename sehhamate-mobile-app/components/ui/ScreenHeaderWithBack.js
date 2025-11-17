import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';

const ScreenHeaderWithBack = ({ 
  title, 
  navigation, 
  rightComponent,
  onBackPress
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightSection}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

export default ScreenHeaderWithBack;


