/**
 * Simple Line Chart Component
 * Displays trend data as a line chart
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../utils/colorUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 200;
const PADDING = 20;

export default function SimpleLineChart({ data, label, color = Colors.accent, unit = '' }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // Calculate min and max values
  const values = data.map(d => d.value || d.average || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Calculate points for the line
  const points = data.map((item, index) => {
    const value = item.value || item.average || 0;
    const x = PADDING + (index / (data.length - 1 || 1)) * (CHART_WIDTH - PADDING * 2);
    const y = CHART_HEIGHT - PADDING - ((value - minValue) / range) * (CHART_HEIGHT - PADDING * 2);
    return { x, y, value, label: item.label || item.date || '' };
  });

  // Generate Y-axis labels
  const yAxisLabels = [];
  const numLabels = 5;
  for (let i = 0; i <= numLabels; i++) {
    const value = minValue + (range * i) / numLabels;
    yAxisLabels.push(value.toFixed(range < 10 ? 1 : 0));
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {yAxisLabels.reverse().map((label, index) => (
            <Text key={index} style={styles.yAxisLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          {yAxisLabels.map((_, index) => (
            <View
              key={index}
              style={[
                styles.gridLine,
                {
                  top: (index / (yAxisLabels.length - 1)) * (CHART_HEIGHT - PADDING * 2) + PADDING,
                },
              ]}
            />
          ))}

          {/* Line path */}
          <View style={styles.lineContainer}>
            {points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = points[index - 1];
              const distance = Math.sqrt(
                Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
              );
              const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: distance,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: color,
                    },
                  ]}
                />
              );
            })}

            {/* Data points */}
            {points.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                    backgroundColor: color,
                  },
                ]}
              />
            ))}
          </View>

          {/* X-axis labels */}
          <View style={styles.xAxis}>
            {points
              .filter((_, index) => index % Math.ceil(points.length / 5) === 0 || index === points.length - 1)
              .map((point, index) => (
                <Text key={index} style={styles.xAxisLabel} numberOfLines={1}>
                  {point.label.substring(5) || ''}
                </Text>
              ))}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: color }]} />
          <Text style={styles.legendText}>
            Min: {minValue.toFixed(range < 10 ? 1 : 0)} {unit} | Max: {maxValue.toFixed(range < 10 ? 1 : 0)} {unit}
          </Text>
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
    flexDirection: 'row',
    height: CHART_HEIGHT + 30,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.borderPrimary,
    opacity: 0.3,
  },
  lineContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 30,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.backgroundPrimary,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
  },
  xAxisLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    maxWidth: 50,
  },
  legend: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noDataText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    padding: 20,
  },
});



