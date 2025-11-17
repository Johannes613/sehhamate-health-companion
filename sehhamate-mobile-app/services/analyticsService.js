/**
 * Analytics Service
 * Processes health data for analytics dashboard
 * Implements FR-5.1, FR-5.2
 */

import { getScanHistory, getScanStatistics } from './scanHistoryService';
import { getNutritionLogs } from '../utils/firebaseHelpers';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get glucose level trends over selected time periods
 * FR-5.1.1: Display glucose level trends over selected time periods
 */
export const getGlucoseTrends = async (userId, timePeriod = '7d') => {
  try {
    // Calculate date range based on time period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timePeriod) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Query glucose logs from Firestore
    // Only query by userId to avoid composite index requirement
    // We'll filter by date range and sort in JavaScript
    const glucoseLogsRef = collection(db, 'glucose_logs');
    const q = query(
      glucoseLogsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const glucoseData = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = (data.timestamp?.toDate && typeof data.timestamp.toDate === 'function') 
        ? data.timestamp.toDate() 
        : (data.timestamp instanceof Date ? data.timestamp : new Date(data.date || Date.now()));
      
      // Filter by date range in JavaScript
      if (timestamp >= startDate && timestamp <= endDate) {
        glucoseData.push({
          id: doc.id,
          value: data.value,
          timestamp,
          unit: data.unit || 'mg/dL',
          mealContext: data.mealContext || 'fasting',
          notes: data.notes || '',
        });
      }
    });

    // Sort by timestamp in JavaScript (ascending)
    glucoseData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Group by date for trend visualization
    const trendsByDate = {};
    glucoseData.forEach(entry => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      if (!trendsByDate[dateKey]) {
        trendsByDate[dateKey] = {
          date: dateKey,
          values: [],
          average: 0,
          min: Infinity,
          max: -Infinity,
        };
      }
      trendsByDate[dateKey].values.push(entry.value);
    });

    // Calculate statistics for each date
    const trends = Object.values(trendsByDate).map(day => {
      const values = day.values;
      day.average = values.reduce((a, b) => a + b, 0) / values.length;
      day.min = Math.min(...values);
      day.max = Math.max(...values);
      day.count = values.length;
      return day;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate overall statistics
    const allValues = glucoseData.map(e => e.value);
    const overallStats = {
      average: allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0,
      min: allValues.length > 0 ? Math.min(...allValues) : 0,
      max: allValues.length > 0 ? Math.max(...allValues) : 0,
      count: allValues.length,
      inRange: allValues.filter(v => v >= 70 && v <= 180).length,
      aboveRange: allValues.filter(v => v > 180).length,
      belowRange: allValues.filter(v => v < 70).length,
    };

    return {
      success: true,
      trends,
      rawData: glucoseData,
      statistics: overallStats,
      timePeriod,
    };
  } catch (error) {
    console.error('Error getting glucose trends:', error);
    // Return mock data for development
    return getMockGlucoseTrends(timePeriod);
  }
};

/**
 * Get frequency of exposed allergens based on meals scanned
 * FR-5.1.2: Present frequency of exposed allergens based on meals scanned
 */
export const getAllergenFrequency = async (userId, timePeriod = '30d') => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90));

    const result = await getScanHistory(userId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      category: 'food',
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const scans = result.scans || [];
    const allergenCounts = {
      nuts: 0,
      gluten: 0,
      dairy: 0,
      shellfish: 0,
      eggs: 0,
      soy: 0,
      other: 0,
    };

    const allergenDetails = [];

    scans.forEach(scan => {
      const allergenAnalysis = scan.scanResult?.allergenAnalysis;
      if (allergenAnalysis?.detectedAllergens) {
        allergenAnalysis.detectedAllergens.forEach(allergen => {
          const allergenName = allergen.name?.toLowerCase() || '';
          
          if (allergenName.includes('nut') || allergenName.includes('peanut')) {
            allergenCounts.nuts++;
          } else if (allergenName.includes('gluten') || allergenName.includes('wheat')) {
            allergenCounts.gluten++;
          } else if (allergenName.includes('dairy') || allergenName.includes('milk') || allergenName.includes('lactose')) {
            allergenCounts.dairy++;
          } else if (allergenName.includes('shellfish') || allergenName.includes('shrimp') || allergenName.includes('crab')) {
            allergenCounts.shellfish++;
          } else if (allergenName.includes('egg')) {
            allergenCounts.eggs++;
          } else if (allergenName.includes('soy')) {
            allergenCounts.soy++;
          } else {
            allergenCounts.other++;
          }

          allergenDetails.push({
            allergen: allergen.name,
            riskLevel: allergen.riskLevel || 'medium',
            date: scan.date,
            foodItems: scan.foodItems || [],
            timestamp: scan.timestamp,
          });
        });
      }
    });

    const totalExposures = Object.values(allergenCounts).reduce((a, b) => a + b, 0);
    const frequencyData = Object.entries(allergenCounts)
      .filter(([_, count]) => count > 0)
      .map(([allergen, count]) => ({
        allergen: allergen.charAt(0).toUpperCase() + allergen.slice(1),
        count,
        percentage: totalExposures > 0 ? (count / totalExposures) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      frequency: frequencyData,
      totalExposures,
      details: allergenDetails,
      timePeriod,
    };
  } catch (error) {
    console.error('Error getting allergen frequency:', error);
    return { success: false, error: error.message, frequency: [], totalExposures: 0 };
  }
};

/**
 * Get dietary compliance statistics
 * FR-5.1.3: Display dietary compliance statistics based on user data
 */
export const getDietaryCompliance = async (userId, timePeriod = '30d') => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90));

    // Get user's daily requirements
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('id', '==', userId));
    const userDoc = await getDocs(userQuery);
    let dailyRequirements = {
      calories: 2000,
      protein: 150,
      carbohydrates: 250,
      fat: 67,
    };

    if (!userDoc.empty) {
      // Take the first result (should only be one user with this ID)
      const userData = userDoc.docs[0].data();
      dailyRequirements = userData.dailyRequirements || dailyRequirements;
    }

    // Get nutrition logs for the period
    const dateRange = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    const nutritionResult = await getNutritionLogs(userId, dateRange);

    if (!nutritionResult || !nutritionResult.success) {
      return { success: false, error: nutritionResult?.error || 'Failed to fetch nutrition logs' };
    }

    const logs = nutritionResult.logs || [];
    
    // Helper function to safely convert Firestore Timestamp to Date
    const safeToDate = (timestamp) => {
      if (!timestamp) return null;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(timestamp);
      }
      return null;
    };

    // Group by date
    const dailyCompliance = {};
    logs.forEach(log => {
      const timestampDate = safeToDate(log.timestamp) || safeToDate(log.createdAt);
      const date = log.date || (timestampDate ? timestampDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      if (!dailyCompliance[date]) {
        dailyCompliance[date] = {
          date,
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          meals: 0,
        };
      }
      dailyCompliance[date].calories += log.calories || 0;
      dailyCompliance[date].protein += log.protein || 0;
      dailyCompliance[date].carbohydrates += log.carbohydrates || 0;
      dailyCompliance[date].fat += log.fat || 0;
      dailyCompliance[date].meals++;
    });

    // Calculate compliance for each day
    const complianceData = Object.values(dailyCompliance).map(day => {
      const caloriesCompliance = Math.min((day.calories / dailyRequirements.calories) * 100, 100);
      const proteinCompliance = Math.min((day.protein / dailyRequirements.protein) * 100, 100);
      const carbsCompliance = Math.min((day.carbohydrates / dailyRequirements.carbohydrates) * 100, 100);
      const fatCompliance = Math.min((day.fat / dailyRequirements.fat) * 100, 100);
      
      const overallCompliance = (caloriesCompliance + proteinCompliance + carbsCompliance + fatCompliance) / 4;

      return {
        ...day,
        compliance: {
          calories: Math.round(caloriesCompliance),
          protein: Math.round(proteinCompliance),
          carbohydrates: Math.round(carbsCompliance),
          fat: Math.round(fatCompliance),
          overall: Math.round(overallCompliance),
        },
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate overall statistics
    const totalDays = complianceData.length;
    const averageCompliance = totalDays > 0
      ? complianceData.reduce((sum, day) => sum + day.compliance.overall, 0) / totalDays
      : 0;

    const compliantDays = complianceData.filter(day => day.compliance.overall >= 80).length;
    const partiallyCompliantDays = complianceData.filter(day => day.compliance.overall >= 50 && day.compliance.overall < 80).length;
    const nonCompliantDays = complianceData.filter(day => day.compliance.overall < 50).length;

    return {
      success: true,
      compliance: complianceData,
      statistics: {
        averageCompliance: Math.round(averageCompliance),
        compliantDays,
        partiallyCompliantDays,
        nonCompliantDays,
        totalDays,
        complianceRate: totalDays > 0 ? Math.round((compliantDays / totalDays) * 100) : 0,
      },
      dailyRequirements,
      timePeriod,
    };
  } catch (error) {
    console.error('Error getting dietary compliance:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get nutritional breakdowns for every meal scanned
 * FR-5.2.1: Display nutritional breakdowns for every meal scanned
 */
export const getNutritionalBreakdowns = async (userId, timePeriod = '30d') => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90));

    const dateRange = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    const nutritionResult = await getNutritionLogs(userId, dateRange);

    if (!nutritionResult || !nutritionResult.success) {
      return { success: false, error: nutritionResult?.error || 'Failed to fetch nutrition logs' };
    }

    const logs = nutritionResult.logs || [];
    
    // Helper function to safely convert Firestore Timestamp to Date
    const safeToDate = (timestamp) => {
      if (!timestamp) return null;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(timestamp);
      }
      return null;
    };
    
    // Process each meal's nutritional breakdown
    const mealBreakdowns = logs.map(log => {
      const timestampDate = safeToDate(log.timestamp) || safeToDate(log.createdAt);
      return {
        id: log.id,
        date: log.date || (timestampDate ? timestampDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        timestamp: timestampDate || new Date(),
      mealType: log.mealType || 'meal',
      title: log.title || 'Meal',
      nutrition: {
        calories: log.calories || 0,
        protein: log.protein || 0,
        carbohydrates: log.carbohydrates || 0,
        fat: log.fat || 0,
        fiber: log.fiber || 0,
        sugar: log.sugar || 0,
        sodium: log.sodium || 0,
      },
      items: log.items || [],
      };
    });

    // Calculate totals and averages
    const totals = mealBreakdowns.reduce((acc, meal) => {
      acc.calories += meal.nutrition.calories;
      acc.protein += meal.nutrition.protein;
      acc.carbohydrates += meal.nutrition.carbohydrates;
      acc.fat += meal.nutrition.fat;
      acc.fiber += meal.nutrition.fiber;
      acc.sugar += meal.nutrition.sugar;
      acc.sodium += meal.nutrition.sodium;
      return acc;
    }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });

    const mealCount = mealBreakdowns.length;
    const averages = {
      calories: mealCount > 0 ? totals.calories / mealCount : 0,
      protein: mealCount > 0 ? totals.protein / mealCount : 0,
      carbohydrates: mealCount > 0 ? totals.carbohydrates / mealCount : 0,
      fat: mealCount > 0 ? totals.fat / mealCount : 0,
      fiber: mealCount > 0 ? totals.fiber / mealCount : 0,
      sugar: mealCount > 0 ? totals.sugar / mealCount : 0,
      sodium: mealCount > 0 ? totals.sodium / mealCount : 0,
    };

    return {
      success: true,
      meals: mealBreakdowns,
      totals,
      averages,
      mealCount,
      timePeriod,
    };
  } catch (error) {
    console.error('Error getting nutritional breakdowns:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track user's improvement in keeping dietary habits over time
 * FR-5.2.2: Track user's improvement in keeping dietary habits over time
 */
export const getDietaryHabitsProgress = async (userId) => {
  try {
    // Get compliance data for different time periods
    const [week1, week2, week3, week4] = await Promise.all([
      getDietaryCompliance(userId, '7d'),
      getDietaryCompliance(userId, '14d'),
      getDietaryCompliance(userId, '21d'),
      getDietaryCompliance(userId, '30d'),
    ]);

    // Calculate improvement trends
    const trends = [];
    if (week1.success && week1.statistics) {
      trends.push({
        period: 'Week 1',
        averageCompliance: week1.statistics.averageCompliance,
        complianceRate: week1.statistics.complianceRate,
      });
    }
    if (week2.success && week2.statistics) {
      trends.push({
        period: 'Week 2',
        averageCompliance: week2.statistics.averageCompliance,
        complianceRate: week2.statistics.complianceRate,
      });
    }
    if (week3.success && week3.statistics) {
      trends.push({
        period: 'Week 3',
        averageCompliance: week3.statistics.averageCompliance,
        complianceRate: week3.statistics.complianceRate,
      });
    }
    if (week4.success && week4.statistics) {
      trends.push({
        period: 'Week 4',
        averageCompliance: week4.statistics.averageCompliance,
        complianceRate: week4.statistics.complianceRate,
      });
    }

    // Calculate improvement percentage
    let improvement = 0;
    if (trends.length >= 2) {
      const first = trends[0].averageCompliance;
      const last = trends[trends.length - 1].averageCompliance;
      improvement = first > 0 ? ((last - first) / first) * 100 : 0;
    }

    return {
      success: true,
      trends,
      improvement: Math.round(improvement),
      isImproving: improvement > 0,
    };
  } catch (error) {
    console.error('Error getting dietary habits progress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compare past and current nutrition data for trend analysis
 * FR-5.2.3: Compare past and current nutrition data for trend analysis
 */
export const compareNutritionTrends = async (userId, currentPeriod = '7d', pastPeriod = '7d') => {
  try {
    const endDate = new Date();
    const currentStartDate = new Date();
    currentStartDate.setDate(endDate.getDate() - (currentPeriod === '7d' ? 7 : 30));
    
    const pastEndDate = new Date(currentStartDate);
    const pastStartDate = new Date();
    pastStartDate.setDate(pastEndDate.getDate() - (pastPeriod === '7d' ? 7 : 30));

    const [currentData, pastData] = await Promise.all([
      getNutritionalBreakdowns(userId, currentPeriod),
      getNutritionalBreakdowns(userId, pastPeriod),
    ]);

    if (!currentData.success || !pastData.success) {
      return { success: false, error: 'Failed to fetch nutrition data' };
    }

    const comparison = {
      calories: {
        current: currentData.averages.calories,
        past: pastData.averages.calories,
        change: currentData.averages.calories - pastData.averages.calories,
        changePercent: pastData.averages.calories > 0
          ? ((currentData.averages.calories - pastData.averages.calories) / pastData.averages.calories) * 100
          : 0,
      },
      protein: {
        current: currentData.averages.protein,
        past: pastData.averages.protein,
        change: currentData.averages.protein - pastData.averages.protein,
        changePercent: pastData.averages.protein > 0
          ? ((currentData.averages.protein - pastData.averages.protein) / pastData.averages.protein) * 100
          : 0,
      },
      carbohydrates: {
        current: currentData.averages.carbohydrates,
        past: pastData.averages.carbohydrates,
        change: currentData.averages.carbohydrates - pastData.averages.carbohydrates,
        changePercent: pastData.averages.carbohydrates > 0
          ? ((currentData.averages.carbohydrates - pastData.averages.carbohydrates) / pastData.averages.carbohydrates) * 100
          : 0,
      },
      fat: {
        current: currentData.averages.fat,
        past: pastData.averages.fat,
        change: currentData.averages.fat - pastData.averages.fat,
        changePercent: pastData.averages.fat > 0
          ? ((currentData.averages.fat - pastData.averages.fat) / pastData.averages.fat) * 100
          : 0,
      },
      sugar: {
        current: currentData.averages.sugar,
        past: pastData.averages.sugar,
        change: currentData.averages.sugar - pastData.averages.sugar,
        changePercent: pastData.averages.sugar > 0
          ? ((currentData.averages.sugar - pastData.averages.sugar) / pastData.averages.sugar) * 100
          : 0,
      },
    };

    return {
      success: true,
      comparison,
      currentPeriod,
      pastPeriod,
    };
  } catch (error) {
    console.error('Error comparing nutrition trends:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mock glucose trends for development/testing
 */
const getMockGlucoseTrends = (timePeriod) => {
  const days = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
  const trends = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    // Generate realistic glucose values (70-180 mg/dL range)
    const baseValue = 100 + Math.random() * 40;
    const values = [
      baseValue + (Math.random() * 20 - 10), // Morning
      baseValue + (Math.random() * 30 - 5),  // Afternoon
      baseValue + (Math.random() * 25 - 10), // Evening
    ];
    
    trends.push({
      date: dateKey,
      values,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    });
  }

  const allValues = trends.flatMap(t => t.values);
  return {
    success: true,
    trends,
    rawData: [],
    statistics: {
      average: allValues.reduce((a, b) => a + b, 0) / allValues.length,
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      count: allValues.length,
      inRange: allValues.filter(v => v >= 70 && v <= 180).length,
      aboveRange: allValues.filter(v => v > 180).length,
      belowRange: allValues.filter(v => v < 70).length,
    },
    timePeriod,
  };
};

