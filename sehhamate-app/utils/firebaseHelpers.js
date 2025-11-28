import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Nutrition logging functions
export const addNutritionLog = async (userId, nutritionData) => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      console.warn('⚠️ Firebase not initialized - nutrition log will not be saved');
      return { 
        success: false, 
        error: 'Firebase is not configured. Please set up Firebase to save nutrition logs.',
        skipped: true 
      };
    }

    const nutritionRef = collection(db, 'nutrition_logs');
    const logData = {
      userId,
      ...nutritionData,
      date: nutritionData.date || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(nutritionRef, logData);
    console.log('Nutrition log added:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding nutrition log:', error);
    return { success: false, error: error.message };
  }
};

export const updateNutritionLog = async (logId, nutritionData) => {
  try {
    const logRef = doc(db, 'nutrition_logs', logId);
    const updateData = {
      ...nutritionData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(logRef, updateData);
    console.log('Nutrition log updated:', logId);
    return { success: true };
  } catch (error) {
    console.error('Error updating nutrition log:', error);
    return { success: false, error: error.message };
  }
};

export const deleteNutritionLog = async (logId) => {
  try {
    const logRef = doc(db, 'nutrition_logs', logId);
    await deleteDoc(logRef);
    console.log('Nutrition log deleted:', logId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    return { success: false, error: error.message };
  }
};

export const getNutritionLogs = async (userId, dateRange = null) => {
  try {
    const nutritionRef = collection(db, 'nutrition_logs');
    
    // Only filter by userId to avoid composite index requirement
    const q = query(
      nutritionRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    // Filter by date range in JavaScript if provided
    let filteredLogs = logs;
    if (dateRange) {
      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Sort by date in JavaScript
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, logs: filteredLogs };
  } catch (error) {
    console.error('Error getting nutrition logs:', error);
    return { success: false, error: error.message, logs: [] };
  }
};

// Activity logging functions
export const addActivityLog = async (userId, activityData) => {
  try {
    const activityRef = collection(db, 'activity_logs');
    const logData = {
      userId,
      ...activityData,
      date: activityData.date || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(activityRef, logData);
    console.log('Activity log added:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding activity log:', error);
    return { success: false, error: error.message };
  }
};

export const getActivityLogs = async (userId, dateRange = null) => {
  try {
    const activityRef = collection(db, 'activity_logs');
    
    // Only filter by userId to avoid composite index requirement
    const q = query(
      activityRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    // Filter by date range in JavaScript if provided
    let filteredLogs = logs;
    if (dateRange) {
      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Sort by date in JavaScript
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, logs: filteredLogs };
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return { success: false, error: error.message, logs: [] };
  }
};

// User preferences functions
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      preferences: {
        ...preferences,
        updatedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    console.log('User preferences updated:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: error.message };
  }
};

// Health metrics functions
export const addHealthMetric = async (userId, metricData) => {
  try {
    const metricsRef = collection(db, 'health_metrics');
    const logData = {
      userId,
      ...metricData,
      date: metricData.date || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(metricsRef, logData);
    console.log('Health metric added:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding health metric:', error);
    return { success: false, error: error.message };
  }
};

export const getHealthMetrics = async (userId, metricType = null, dateRange = null) => {
  try {
    const metricsRef = collection(db, 'health_metrics');
    
    // Only filter by userId to avoid composite index requirement
    const q = query(
      metricsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const metrics = [];
    
    querySnapshot.forEach((doc) => {
      metrics.push({ id: doc.id, ...doc.data() });
    });

    // Filter by metric type in JavaScript if provided
    let filteredMetrics = metrics;
    if (metricType) {
      filteredMetrics = filteredMetrics.filter(metric => metric.type === metricType);
    }

    // Filter by date range in JavaScript if provided
    if (dateRange) {
      filteredMetrics = filteredMetrics.filter(metric => {
        const metricDate = new Date(metric.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return metricDate >= startDate && metricDate <= endDate;
      });
    }

    // Sort by date in JavaScript
    filteredMetrics.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, metrics: filteredMetrics };
  } catch (error) {
    console.error('Error getting health metrics:', error);
    return { success: false, error: error.message, metrics: [] };
  }
};

// Utility function to get today's date range
export const getTodayDateRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

// Utility function to get week date range
export const getWeekDateRange = () => {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return {
    start: oneWeekAgo.toISOString(),
    end: today.toISOString()
  };
};

// User recommendations functions
export const addUserRecommendation = async (userId, recommendationData) => {
  try {
    const recommendationsRef = collection(db, 'user_recommendations');
    const logData = {
      userId,
      ...recommendationData,
      date: recommendationData.date || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(recommendationsRef, logData);
    console.log('User recommendation added:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding user recommendation:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRecommendations = async (userId, dateRange = null) => {
  try {
    const recommendationsRef = collection(db, 'user_recommendations');
    
    // Only filter by userId to avoid composite index requirement
    const q = query(
      recommendationsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const recommendations = [];
    
    querySnapshot.forEach((doc) => {
      recommendations.push({ id: doc.id, ...doc.data() });
    });

    // Filter by date range in JavaScript if provided
    let filteredRecommendations = recommendations;
    if (dateRange) {
      filteredRecommendations = recommendations.filter(rec => {
        const recDate = new Date(rec.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return recDate >= startDate && recDate <= endDate;
      });
    }

    // Sort by date in JavaScript
    filteredRecommendations.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, recommendations: filteredRecommendations };
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    return { success: false, error: error.message, recommendations: [] };
  }
};

export const markRecommendationAsRead = async (recommendationId) => {
  try {
    const recommendationRef = doc(db, 'user_recommendations', recommendationId);
    await updateDoc(recommendationRef, {
      read: true,
      readAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Recommendation marked as read:', recommendationId);
    return { success: true };
  } catch (error) {
    console.error('Error marking recommendation as read:', error);
    return { success: false, error: error.message };
  }
};

// Meal plan functions
export const addUserMealPlan = async (userId, mealPlanData) => {
  try {
    const mealPlansRef = collection(db, 'user_meal_plans');
    const logData = {
      userId,
      ...mealPlanData,
      date: mealPlanData.date || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(mealPlansRef, logData);
    console.log('User meal plan added:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding user meal plan:', error);
    return { success: false, error: error.message };
  }
};

export const getUserMealPlans = async (userId, dateRange = null) => {
  try {
    const mealPlansRef = collection(db, 'user_meal_plans');
    
    // Only filter by userId to avoid composite index requirement
    const q = query(
      mealPlansRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const mealPlans = [];
    
    querySnapshot.forEach((doc) => {
      mealPlans.push({ id: doc.id, ...doc.data() });
    });

    // Filter by date range in JavaScript if provided
    let filteredMealPlans = mealPlans;
    if (dateRange) {
      filteredMealPlans = mealPlans.filter(plan => {
        const planDate = new Date(plan.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return planDate >= startDate && planDate <= endDate;
      });
    }

    // Sort by date in JavaScript
    filteredMealPlans.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, mealPlans: filteredMealPlans };
  } catch (error) {
    console.error('Error getting user meal plans:', error);
    return { success: false, error: error.message, mealPlans: [] };
  }
};

// User interaction tracking
export const addUserInteraction = async (userId, interactionData) => {
  try {
    const interactionsRef = collection(db, 'user_interactions');
    const logData = {
      userId,
      ...interactionData,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(interactionsRef, logData);
    console.log('User interaction logged:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error logging user interaction:', error);
    return { success: false, error: error.message };
  }
};

// User preferences and settings
export const updateUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      settings: {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    console.log('User settings updated:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { success: false, error: error.message };
  }
};
