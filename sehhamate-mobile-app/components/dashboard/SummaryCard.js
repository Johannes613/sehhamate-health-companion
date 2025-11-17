import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../utils/colorUtils';

export default function SummaryCard({ 
  title, 
  subtitle, 
  value, 
  unit = "",
  color = Colors.activityPurple,
  onPress,
  showChart = false,
  chartData = []
}) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
      
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      
      {showChart && chartData.length > 0 && (
        <View style={styles.chartContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height: item.height, backgroundColor: color }]} />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  unit: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 40,
    marginTop: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
