/**
 * Alert Service
 * Manages threshold alerts and notifications
 * Implements FR-5.4.1, FR-5.4.2, FR-5.4.3
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  getDocs, 
  query, 
  where, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Alert } from 'react-native';

/**
 * Check glucose readings and issue warnings if they exceed safe thresholds
 * FR-5.4.1: Issue warnings when glucose readings exceed safe thresholds
 */
export const checkGlucoseThresholds = async (userId, glucoseValue, unit = 'mg/dL') => {
  try {
    // Define safe thresholds (can be customized per user)
    const thresholds = {
      low: 70,   // Hypoglycemia threshold
      high: 180, // Hyperglycemia threshold
      criticalLow: 54,  // Critical hypoglycemia
      criticalHigh: 250, // Critical hyperglycemia
    };

    let alertLevel = null;
    let message = '';
    let severity = 'info';

    // Check thresholds
    if (glucoseValue < thresholds.criticalLow) {
      alertLevel = 'critical';
      severity = 'critical';
      message = `CRITICAL: Your glucose level (${glucoseValue} ${unit}) is dangerously low. Seek immediate medical attention.`;
    } else if (glucoseValue < thresholds.low) {
      alertLevel = 'warning';
      severity = 'high';
      message = `WARNING: Your glucose level (${glucoseValue} ${unit}) is below the safe threshold (${thresholds.low} ${unit}). Consider consuming fast-acting carbohydrates.`;
    } else if (glucoseValue > thresholds.criticalHigh) {
      alertLevel = 'critical';
      severity = 'critical';
      message = `CRITICAL: Your glucose level (${glucoseValue} ${unit}) is dangerously high. Seek immediate medical attention.`;
    } else if (glucoseValue > thresholds.high) {
      alertLevel = 'warning';
      severity = 'high';
      message = `WARNING: Your glucose level (${glucoseValue} ${unit}) exceeds the safe threshold (${thresholds.high} ${unit}). Monitor closely and consider medication adjustment.`;
    }

    // If alert is needed, log it
    if (alertLevel) {
      await logAlert(userId, {
        type: 'glucose',
        severity,
        message,
        value: glucoseValue,
        unit,
        threshold: alertLevel === 'critical' 
          ? (glucoseValue < thresholds.low ? thresholds.criticalLow : thresholds.criticalHigh)
          : (glucoseValue < thresholds.low ? thresholds.low : thresholds.high),
        timestamp: Timestamp.now(),
      });

      // Show alert to user
      Alert.alert(
        severity === 'critical' ? 'Critical Alert' : 'Glucose Alert',
        message,
        [{ text: 'OK' }]
      );
    }

    return {
      success: true,
      alertLevel,
      message,
      severity,
      inRange: !alertLevel,
    };
  } catch (error) {
    console.error('Error checking glucose thresholds:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check meal sugar level and send notification if it exceeds user-defined limits
 * FR-5.4.2: Send notifications when scanned meal sugar level exceeds user-defined limits
 */
export const checkMealSugarThreshold = async (userId, mealData, userSugarLimit = null) => {
  try {
    // Get user's sugar limit preference (default: 50g per meal)
    let sugarLimit = userSugarLimit || 50;

    // Try to get from user profile
    if (!userSugarLimit) {
      try {
        const userQuery = query(
          collection(db, 'users'),
          where('id', '==', userId),
          limit(1)
        );
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          sugarLimit = userData.sugarLimitPerMeal || 50;
        }
      } catch (e) {
        console.log('Could not fetch user sugar limit, using default');
      }
    }

    const mealSugar = mealData.sugar || mealData.nutrition?.sugar || 0;
    const mealTitle = mealData.title || mealData.name || 'This meal';

    let alertLevel = null;
    let message = '';
    let severity = 'info';

    // Check if sugar exceeds limit
    if (mealSugar > sugarLimit * 1.5) {
      alertLevel = 'critical';
      severity = 'high';
      message = `HIGH SUGAR ALERT: ${mealTitle} contains ${mealSugar.toFixed(1)}g of sugar, which is ${((mealSugar / sugarLimit) * 100).toFixed(0)}% of your daily meal limit (${sugarLimit}g). Consider reducing portion size or choosing alternatives.`;
    } else if (mealSugar > sugarLimit) {
      alertLevel = 'warning';
      severity = 'medium';
      message = `Sugar Alert: ${mealTitle} contains ${mealSugar.toFixed(1)}g of sugar, exceeding your meal limit of ${sugarLimit}g. Monitor your intake for the rest of the day.`;
    }

    // If alert is needed, log it
    if (alertLevel) {
      await logAlert(userId, {
        type: 'meal_sugar',
        severity,
        message,
        value: mealSugar,
        unit: 'g',
        threshold: sugarLimit,
        mealData: {
          title: mealTitle,
          calories: mealData.calories || mealData.nutrition?.calories || 0,
        },
        timestamp: Timestamp.now(),
      });

      // Show alert to user
      Alert.alert(
        'Sugar Alert',
        message,
        [{ text: 'OK' }]
      );
    }

    return {
      success: true,
      alertLevel,
      message,
      severity,
      sugarAmount: mealSugar,
      limit: sugarLimit,
      withinLimit: !alertLevel,
    };
  } catch (error) {
    console.error('Error checking meal sugar threshold:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Log alert to user's history
 * FR-5.4.3: Log all alerts triggered in user's history for review
 */
export const logAlert = async (userId, alertData) => {
  try {
    if (!userId || !alertData) {
      throw new Error('User ID and alert data are required');
    }

    const alertsRef = collection(db, 'user_alerts');
    const alert = {
      userId,
      type: alertData.type, // 'glucose', 'meal_sugar', 'allergen', 'medication_interaction', etc.
      severity: alertData.severity || 'info', // 'info', 'low', 'medium', 'high', 'critical'
      message: alertData.message,
      value: alertData.value || null,
      unit: alertData.unit || '',
      threshold: alertData.threshold || null,
      metadata: alertData.metadata || {},
      mealData: alertData.mealData || null,
      read: false,
      timestamp: alertData.timestamp || Timestamp.now(),
      date: new Date().toISOString().split('T')[0],
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(alertsRef, alert);
    console.log('Alert logged:', docRef.id);
    return { success: true, id: docRef.id, alert: { ...alert, id: docRef.id } };
  } catch (error) {
    console.error('Error logging alert:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's alert history
 */
export const getUserAlerts = async (userId, options = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const {
      severity = null,
      type = null,
      read = null,
      limitCount = 50,
      startDate = null,
      endDate = null,
    } = options;

    const alertsRef = collection(db, 'user_alerts');
    // Only query by userId to avoid composite index requirement
    // We'll sort and filter in JavaScript
    let q = query(
      alertsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    let alerts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Safely convert timestamps
      const safeToDate = (ts) => {
        if (!ts) return new Date();
        if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
        if (ts instanceof Date) return ts;
        return new Date(ts);
      };
      
      alerts.push({
        id: doc.id,
        ...data,
        timestamp: safeToDate(data.timestamp),
        createdAt: safeToDate(data.createdAt),
      });
    });

    // Sort by timestamp in JavaScript (descending)
    alerts.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
      return timeB - timeA; // Descending order
    });

    // Apply filters
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }
    if (type) {
      alerts = alerts.filter(a => a.type === type);
    }
    if (read !== null) {
      alerts = alerts.filter(a => a.read === read);
    }
    if (startDate || endDate) {
      alerts = alerts.filter(alert => {
        const alertDate = alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.date || alert.timestamp);
        if (startDate && alertDate < new Date(startDate)) return false;
        if (endDate && alertDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply limit after filtering
    if (limitCount) {
      alerts = alerts.slice(0, limitCount);
    }

    return { success: true, alerts };
  } catch (error) {
    console.error('Error getting user alerts:', error);
    return { success: false, error: error.message, alerts: [] };
  }
};

/**
 * Mark alert as read
 */
export const markAlertAsRead = async (alertId) => {
  try {
    if (!alertId) {
      throw new Error('Alert ID is required');
    }

    const alertRef = doc(db, 'user_alerts', alertId);
    await updateDoc(alertRef, {
      read: true,
      readAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get alert statistics
 */
export const getAlertStatistics = async (userId, timePeriod = '30d') => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90));

    const result = await getUserAlerts(userId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      limitCount: 1000,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const alerts = result.alerts || [];
    
    const statistics = {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
        info: alerts.filter(a => a.severity === 'info').length,
      },
      byType: {
        glucose: alerts.filter(a => a.type === 'glucose').length,
        meal_sugar: alerts.filter(a => a.type === 'meal_sugar').length,
        allergen: alerts.filter(a => a.type === 'allergen').length,
        medication_interaction: alerts.filter(a => a.type === 'medication_interaction').length,
        other: alerts.filter(a => !['glucose', 'meal_sugar', 'allergen', 'medication_interaction'].includes(a.type)).length,
      },
      unread: alerts.filter(a => !a.read).length,
      read: alerts.filter(a => a.read).length,
    };

    return { success: true, statistics, alerts };
  } catch (error) {
    console.error('Error getting alert statistics:', error);
    return { success: false, error: error.message };
  }
};

