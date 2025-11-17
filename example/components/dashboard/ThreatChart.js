import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ThreatChart = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.placeholderText}>Chart will be rendered here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  },
  placeholderText: {
    color: '#6C757D',
    fontStyle: 'italic',
  }
});

export default ThreatChart;