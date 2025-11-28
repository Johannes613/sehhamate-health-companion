/**
 * Simple Bar Chart Component
 * Displays data as a bar chart
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../utils/colorUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 200;
const PADDING = 20;

export default function SimpleBarChart({ data, label, color = Colors.accent, unit = '' }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // Calculate max value for scaling
  const values = data.map(d => d.value || d.count || 0);
  const maxValue = Math.max(...values, 1);
  const barWidth = (CHART_WIDTH - PADDING * 2) / data.length - 5;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chartContainer}>
        <View style={styles.chartArea}>
          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const value = item.value || item.count || 0;
              const height = (value / maxValue) * (CHART_HEIGHT - PADDING * 2);
              return (
                <View key={index} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 2),
                        backgroundColor: item.color || color,
                        width: barWidth,
                      },
                    ]}
                  >
                    {value > 0 && (
                      <Text style={styles.barValue} numberOfLines={1}>
                        {value.toFixed(value < 10 ? 1 : 0)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.barLabel} numberOfLines={2}>
                    {item.label || item.name || ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  chartContainer: {
    height: CHART_HEIGHT + 50,
  },
  chartArea: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT - PADDING,
    paddingHorizontal: PADDING,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 2,
  },
  barValue: {
    fontSize: 9,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 60,
  },
  noDataText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    padding: 20,
  },
});



