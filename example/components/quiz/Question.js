import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Question = ({ number, text }) => (
  <View style={styles.container}>
    <Text style={styles.number}>Question {number}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    marginBottom: 24,
  },
  number: { 
    color: '#8A63D2', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  text: { 
    color: '#212529', 
    fontSize: 20, 
    fontWeight: '600', 
    lineHeight: 28 
  },
});
