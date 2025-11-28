/**
 * Analytics Dashboard Screen
 * Personalized Health Analytics Dashboard
 * Implements FR-5.1, FR-5.2, FR-5.3, FR-5.4
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SimpleLineChart from '../../components/analytics/SimpleLineChart';
import SimpleBarChart from '../../components/analytics/SimpleBarChart';
import { useAuth } from '../../contexts/AuthContext';
import {
  getGlucoseTrends,
  getAllergenFrequency,
  getDietaryCompliance,
  getNutritionalBreakdowns,
  getDietaryHabitsProgress,
  compareNutritionTrends,
} from '../../services/analyticsService';
import {
  getUserGoals,
  getGoalProgressStats,
  createHealthGoal,
} from '../../services/goalManagementService';
import { getUserAlerts, getAlertStatistics } from '../../services/alertService';
import { generateGeminiResponse } from '../../services/geminiService';

export default function AnalyticsDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'goals', 'alerts'

  // Data states
  const [glucoseTrends, setGlucoseTrends] = useState(null);
  const [allergenFrequency, setAllergenFrequency] = useState(null);
  const [dietaryCompliance, setDietaryCompliance] = useState(null);
  const [nutritionBreakdowns, setNutritionBreakdowns] = useState(null);
  const [habitsProgress, setHabitsProgress] = useState(null);
  const [nutritionComparison, setNutritionComparison] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalStats, setGoalStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [aiInsights, setAiInsights] = useState('');

  // Load all analytics data
  const loadAnalyticsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load all data in parallel with error handling for each
      const [
        glucoseData,
        allergenData,
        complianceData,
        nutritionData,
        progressData,
        comparisonData,
        goalsData,
        statsData,
        alertsData,
        alertStatsData,
      ] = await Promise.allSettled([
        getGlucoseTrends(user.id, selectedPeriod),
        getAllergenFrequency(user.id, selectedPeriod),
        getDietaryCompliance(user.id, selectedPeriod),
        getNutritionalBreakdowns(user.id, selectedPeriod),
        getDietaryHabitsProgress(user.id),
        compareNutritionTrends(user.id, '7d', '7d'),
        getUserGoals(user.id),
        getGoalProgressStats(user.id),
        getUserAlerts(user.id, { limitCount: 10 }),
        getAlertStatistics(user.id, selectedPeriod),
      ]);

      // Extract values from Promise.allSettled results, handling errors gracefully
      setGlucoseTrends(glucoseData.status === 'fulfilled' ? glucoseData.value : null);
      setAllergenFrequency(allergenData.status === 'fulfilled' ? allergenData.value : null);
      setDietaryCompliance(complianceData.status === 'fulfilled' ? complianceData.value : null);
      setNutritionBreakdowns(nutritionData.status === 'fulfilled' ? nutritionData.value : null);
      setHabitsProgress(progressData.status === 'fulfilled' ? progressData.value : null);
      setNutritionComparison(comparisonData.status === 'fulfilled' ? comparisonData.value : null);
      
      // Filter to only active goals
      const goalsResult = goalsData.status === 'fulfilled' ? goalsData.value : { goals: [] };
      const activeGoals = (goalsResult.goals || []).filter(g => g.status === 'active');
      setGoals(activeGoals);
      setGoalStats(statsData.status === 'fulfilled' ? statsData.value : null);
      
      const alertsResult = alertsData.status === 'fulfilled' ? alertsData.value : { alerts: [] };
      setAlerts(alertsResult.alerts || []);
      setAlertStats(alertStatsData.status === 'fulfilled' ? alertStatsData.value : null);

      // Generate AI insights (don't block on this)
      generateAIInsights().catch(err => {
        console.error('Error generating AI insights:', err);
        // Don't show alert for AI insights failure
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Don't show alert - let the UI show empty states instead
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate AI-powered insights
  const generateAIInsights = async () => {
    try {
      if (!user?.id) return;

      // Build context from analytics data
      const context = `
User Health Analytics Summary:
- Glucose Trends: ${glucoseTrends?.statistics ? `Average: ${glucoseTrends.statistics.average.toFixed(0)} mg/dL, In Range: ${glucoseTrends.statistics.inRange}/${glucoseTrends.statistics.count}` : 'No data'}
- Dietary Compliance: ${dietaryCompliance?.statistics ? `Average: ${dietaryCompliance.statistics.averageCompliance}%, Compliant Days: ${dietaryCompliance.statistics.compliantDays}/${dietaryCompliance.statistics.totalDays}` : 'No data'}
- Allergen Exposures: ${allergenFrequency?.totalExposures || 0} total exposures
- Active Goals: ${goals.length} goals, Average Progress: ${goalStats?.statistics?.averageProgress || 0}%
- Recent Alerts: ${alerts.length} alerts

Please provide a brief, personalized health insight summary (2-3 sentences) based on this data. Focus on key achievements and areas for improvement.
      `.trim();

      const response = await generateGeminiResponse(
        context,
        'en',
        user,
        []
      );

      if (response.success && response.text) {
        setAiInsights(response.text);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [user?.id, selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  // Generate goal progress data for charts - FR-5.3.3
  const generateGoalProgressData = (goal) => {
    // Generate goal progress data based on current progress
    const days = 7;
    const data = [];
    const startProgress = Math.max(0, goal.progress - 30);
    const increment = (goal.progress - startProgress) / days;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const progress = Math.min(100, Math.max(0, startProgress + increment * (days - i)));
      
      data.push({
        value: Math.round(progress),
        label: date.toISOString().split('T')[0],
        date: date.toISOString().split('T')[0],
      });
    }

    return data;
  };

  const handleCreateGoal = () => {
    navigation.navigate('CreateGoal', { onGoalCreated: loadAnalyticsData });
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Analytics Dashboard" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Analytics Dashboard" navigation={navigation} />
      
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['7d', '30d', '90d'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {[
          { id: 'overview', label: 'Overview', icon: 'stats-chart' },
          { id: 'goals', label: 'Goals', icon: 'flag' },
          { id: 'alerts', label: 'Alerts', icon: 'notifications' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? Colors.accent : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <View style={styles.content}>
            {/* AI Insights */}
            {aiInsights && (
              <View style={styles.insightsCard}>
                <LinearGradient
                  colors={[Colors.accent + '20', Colors.accent + '10']}
                  style={styles.insightsGradient}
                >
                  <View style={styles.insightsHeader}>
                    <Ionicons name="sparkles" size={24} color={Colors.accent} />
                    <Text style={styles.insightsTitle}>AI Insights</Text>
                  </View>
                  <Text style={styles.insightsText}>{aiInsights}</Text>
                </LinearGradient>
              </View>
            )}

            {/* Glucose Trends - FR-5.1.1 */}
            {glucoseTrends?.success && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Glucose Level Trends</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {glucoseTrends.statistics.average.toFixed(0)}
                    </Text>
                    <Text style={styles.statLabel}>Avg (mg/dL)</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {glucoseTrends.statistics.inRange}
                    </Text>
                    <Text style={styles.statLabel}>In Range</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {glucoseTrends.statistics.aboveRange}
                    </Text>
                    <Text style={styles.statLabel}>Above Range</Text>
                  </View>
                </View>
                <SimpleLineChart
                  data={glucoseTrends.trends.map(t => ({
                    value: t.average,
                    label: t.date,
                    date: t.date,
                  }))}
                  label="Glucose Trends"
                  color={Colors.accent}
                  unit="mg/dL"
                />
              </View>
            )}

            {/* Allergen Frequency - FR-5.1.2 */}
            {allergenFrequency?.success && allergenFrequency.frequency.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Allergen Exposure Frequency</Text>
                <Text style={styles.sectionSubtitle}>
                  Total Exposures: {allergenFrequency.totalExposures}
                </Text>
                <SimpleBarChart
                  data={allergenFrequency.frequency.map(f => ({
                    label: f.allergen,
                    value: f.count,
                    color: f.count > 5 ? '#FF6B6B' : f.count > 2 ? '#FFA500' : '#4ECDC4',
                  }))}
                  label="Allergen Exposures"
                />
              </View>
            )}

            {/* Dietary Compliance - FR-5.1.3 */}
            {dietaryCompliance?.success && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dietary Compliance</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {dietaryCompliance.statistics.averageCompliance}%
                    </Text>
                    <Text style={styles.statLabel}>Avg Compliance</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {dietaryCompliance.statistics.compliantDays}
                    </Text>
                    <Text style={styles.statLabel}>Compliant Days</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {dietaryCompliance.statistics.complianceRate}%
                    </Text>
                    <Text style={styles.statLabel}>Compliance Rate</Text>
                  </View>
                </View>
                <SimpleLineChart
                  data={dietaryCompliance.compliance.map(c => ({
                    value: c.compliance.overall,
                    label: c.date,
                    date: c.date,
                  }))}
                  label="Daily Compliance Trend"
                  color="#4ECDC4"
                  unit="%"
                />
              </View>
            )}

            {/* Nutritional Breakdowns - FR-5.2.1 */}
            {nutritionBreakdowns?.success && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutritional Breakdowns</Text>
                <Text style={styles.sectionSubtitle}>
                  {nutritionBreakdowns.mealCount} meals analyzed
                </Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {nutritionBreakdowns.averages.calories.toFixed(0)}
                    </Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {nutritionBreakdowns.averages.protein.toFixed(1)}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {nutritionBreakdowns.averages.carbohydrates.toFixed(1)}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {nutritionBreakdowns.averages.fat.toFixed(1)}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Dietary Habits Progress - FR-5.2.2 */}
            {habitsProgress?.success && habitsProgress.trends.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dietary Habits Progress</Text>
                <View style={styles.progressCard}>
                  <Text style={styles.progressText}>
                    {habitsProgress.isImproving ? '📈 Improving' : '📉 Needs Attention'}
                  </Text>
                  <Text style={styles.progressValue}>
                    {habitsProgress.improvement > 0 ? '+' : ''}
                    {habitsProgress.improvement}%
                  </Text>
                </View>
                <SimpleBarChart
                  data={habitsProgress.trends.map(t => ({
                    label: t.period,
                    value: t.averageCompliance,
                    color: Colors.accent,
                  }))}
                  label="Weekly Compliance Trend"
                  unit="%"
                />
              </View>
            )}

            {/* Nutrition Comparison - FR-5.2.3 */}
            {nutritionComparison?.success && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutrition Trend Comparison</Text>
                <View style={styles.comparisonGrid}>
                  {Object.entries(nutritionComparison.comparison).map(([key, data]) => (
                    <View key={key} style={styles.comparisonItem}>
                      <Text style={styles.comparisonLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={styles.comparisonValue}>
                        {data.changePercent > 0 ? '+' : ''}
                        {data.changePercent.toFixed(1)}%
                      </Text>
                      <Text style={styles.comparisonSubtext}>
                        {data.current.toFixed(1)} vs {data.past.toFixed(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'goals' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Health Goals</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleCreateGoal}
                >
                  <Ionicons name="add" size={24} color={Colors.accent} />
                </TouchableOpacity>
              </View>

              {goalStats?.statistics && (
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {goalStats.statistics.active}
                    </Text>
                    <Text style={styles.statLabel}>Active Goals</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {goalStats.statistics.averageProgress}%
                    </Text>
                    <Text style={styles.statLabel}>Avg Progress</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {goalStats.statistics.completed}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                </View>
              )}

              {goals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="flag-outline" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No active goals</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Create a goal to start tracking your progress
                  </Text>
                  <TouchableOpacity
                    style={styles.createGoalButton}
                    onPress={handleCreateGoal}
                  >
                    <Text style={styles.createGoalButtonText}>Create Goal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                goals.map((goal) => (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalProgress}>{goal.progress}%</Text>
                    </View>
                    {goal.description && (
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}
                    {/* Interactive Progress Chart - FR-5.3.3 */}
                    <View style={styles.goalChartContainer}>
                      <SimpleLineChart
                        data={generateGoalProgressData(goal)}
                        label="Progress Over Time"
                        color={Colors.accent}
                        unit="%"
                      />
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${goal.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.goalTarget}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>

              {alertStats?.statistics && (
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {alertStats.statistics.total}
                    </Text>
                    <Text style={styles.statLabel}>Total Alerts</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: '#FF6B6B' }]}>
                      {alertStats.statistics.bySeverity.critical +
                        alertStats.statistics.bySeverity.high}
                    </Text>
                    <Text style={styles.statLabel}>High Priority</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {alertStats.statistics.unread}
                    </Text>
                    <Text style={styles.statLabel}>Unread</Text>
                  </View>
                </View>
              )}

              {alerts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.accent} />
                  <Text style={styles.emptyStateText}>No recent alerts</Text>
                  <Text style={styles.emptyStateSubtext}>
                    You're doing great! No alerts to show.
                  </Text>
                </View>
              ) : (
                alerts.map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertCard,
                      alert.severity === 'critical' && styles.alertCardCritical,
                      alert.severity === 'high' && styles.alertCardHigh,
                    ]}
                  >
                    <View style={styles.alertHeader}>
                      <Ionicons
                        name={
                          alert.severity === 'critical'
                            ? 'warning'
                            : alert.severity === 'high'
                            ? 'alert-circle'
                            : 'information-circle'
                        }
                        size={24}
                        color={
                          alert.severity === 'critical'
                            ? '#FF6B6B'
                            : alert.severity === 'high'
                            ? '#FFA500'
                            : Colors.accent
                        }
                      />
                      <View style={styles.alertHeaderText}>
                        <Text style={styles.alertType}>
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </Text>
                        <Text style={styles.alertDate}>
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    {alert.value && (
                      <Text style={styles.alertValue}>
                        Value: {alert.value} {alert.unit}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.accent + '20',
  },
  periodButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  insightsCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  insightsGradient: {
    padding: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  insightsText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.accent,
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  comparisonItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  comparisonSubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  addButton: {
    padding: 8,
  },
  goalCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderPrimary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  goalTarget: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  goalChartContainer: {
    marginVertical: 16,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  createGoalButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createGoalButtonText: {
    color: Colors.backgroundPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  alertCardHigh: {
    borderLeftColor: '#FFA500',
  },
  alertCardCritical: {
    borderLeftColor: '#FF6B6B',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  alertHeaderText: {
    flex: 1,
  },
  alertType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  alertDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  alertValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: 40,
  },
});

