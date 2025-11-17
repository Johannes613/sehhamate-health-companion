import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';

const NavButton = ({ title, icon, onPress }) => {
  return (
    
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.content}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
              <CaretRight color="#6C757D" size={20} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F6F7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NavButton;