/**
 * Goal Management Service
 * Manages user health goals and progress tracking
 * Implements FR-5.3.1, FR-5.3.2
 */

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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a new health goal
 * FR-5.3.1: Allow users to define personal health goals
 */
export const createHealthGoal = async (userId, goalData) => {
  try {
    if (!userId || !goalData) {
      throw new Error('User ID and goal data are required');
    }

    const goalsRef = collection(db, 'health_goals');
    const goal = {
      userId,
      title: goalData.title,
      description: goalData.description || '',
      category: goalData.category || 'general', // 'weight', 'glucose', 'nutrition', 'exercise', 'general'
      targetValue: goalData.targetValue,
      currentValue: goalData.currentValue || 0,
      unit: goalData.unit || '',
      startDate: goalData.startDate || Timestamp.now(),
      targetDate: goalData.targetDate || null,
      status: 'active', // 'active', 'completed', 'paused', 'cancelled'
      progress: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(goalsRef, goal);
    console.log('Health goal created:', docRef.id);
    return { success: true, id: docRef.id, goal: { ...goal, id: docRef.id } };
  } catch (error) {
    console.error('Error creating health goal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's health goals
 */
export const getUserGoals = async (userId, status = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const goalsRef = collection(db, 'health_goals');
    // Only query by userId to avoid composite index requirement
    // We'll sort in JavaScript
    let q = query(
      goalsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Safely convert timestamps
      const safeToDate = (ts) => {
        if (!ts) return null;
        if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
        if (ts instanceof Date) return ts;
        return new Date(ts);
      };
      
      goals.push({
        id: doc.id,
        ...data,
        startDate: safeToDate(data.startDate) || new Date(),
        targetDate: safeToDate(data.targetDate) || null,
        createdAt: safeToDate(data.createdAt) || new Date(),
        updatedAt: safeToDate(data.updatedAt) || new Date(),
      });
    });

    // Sort by createdAt in JavaScript (descending)
    goals.sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA; // Descending order
    });

    // Filter by status if provided
    const filteredGoals = status ? goals.filter(g => g.status === status) : goals;

    return { success: true, goals: filteredGoals };
  } catch (error) {
    console.error('Error getting user goals:', error);
    return { success: false, error: error.message, goals: [] };
  }
};

/**
 * Update goal progress
 * FR-5.3.2: Monitor progress towards each health goal
 */
export const updateGoalProgress = async (goalId, currentValue, additionalData = {}) => {
  try {
    if (!goalId) {
      throw new Error('Goal ID is required');
    }

    const goalRef = doc(db, 'health_goals', goalId);
    const goalDoc = await getDoc(goalRef);

    if (!goalDoc.exists()) {
      throw new Error('Goal not found');
    }

    const goalData = goalDoc.data();
    const targetValue = goalData.targetValue;
    const progress = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
    
    // Determine status based on progress
    let status = goalData.status;
    if (progress >= 100 && status === 'active') {
      status = 'completed';
    }

    const updateData = {
      currentValue,
      progress: Math.round(progress),
      status,
      updatedAt: Timestamp.now(),
      ...additionalData,
    };

    await updateDoc(goalRef, updateData);
    console.log('Goal progress updated:', goalId, 'Progress:', progress + '%');

    return {
      success: true,
      goal: {
        id: goalId,
        ...goalData,
        ...updateData,
      },
    };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update goal
 */
export const updateGoal = async (goalId, updateData) => {
  try {
    if (!goalId) {
      throw new Error('Goal ID is required');
    }

    const goalRef = doc(db, 'health_goals', goalId);
    await updateDoc(goalRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete goal
 */
export const deleteGoal = async (goalId) => {
  try {
    if (!goalId) {
      throw new Error('Goal ID is required');
    }

    const goalRef = doc(db, 'health_goals', goalId);
    await deleteDoc(goalRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get goal progress statistics
 */
export const getGoalProgressStats = async (userId) => {
  try {
    const result = await getUserGoals(userId);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const goals = result.goals;
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    const averageProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length
      : 0;

    const onTrackGoals = activeGoals.filter(g => (g.progress || 0) >= 50).length;
    const behindGoals = activeGoals.filter(g => (g.progress || 0) < 50 && (g.progress || 0) > 0).length;
    const notStartedGoals = activeGoals.filter(g => (g.progress || 0) === 0).length;

    return {
      success: true,
      statistics: {
        total: goals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        averageProgress: Math.round(averageProgress),
        onTrack: onTrackGoals,
        behind: behindGoals,
        notStarted: notStartedGoals,
      },
      goals: activeGoals,
    };
  } catch (error) {
    console.error('Error getting goal progress stats:', error);
    return { success: false, error: error.message };
  }
};



