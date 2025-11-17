/**
 * Scan History Management Service
 * Manages scan results storage and retrieval
 * Implements FR-2.4.1, FR-2.4.2, FR-2.4.3, FR-2.4.4
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Save scan result to history
 * FR-2.4.1: Store all scan results in user's personal history
 */
export const saveScanToHistory = async (userId, scanResult) => {
  try {
    if (!userId || !scanResult) {
      throw new Error('User ID and scan result are required');
    }

    const scanHistoryRef = collection(db, 'scan_history');
    const scanData = {
      userId,
      type: scanResult.type || 'food', // 'food' or 'medication'
      scanResult: scanResult,
      timestamp: Timestamp.now(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for easy filtering
      category: scanResult.type || 'food',
      // Extract key information for filtering
      foodItems: scanResult.type === 'food' ? (scanResult.items || []).map(i => i.name) : [],
      medication: scanResult.type === 'medication' ? scanResult.medication : null,
      hasAllergens: scanResult.allergenAnalysis?.hasAllergens || false,
      hasInteractions: scanResult.interactionAnalysis?.overallRisk !== 'low' || false,
      riskLevel: scanResult.allergenAnalysis?.riskLevel || scanResult.interactionAnalysis?.overallRisk || 'low',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(scanHistoryRef, scanData);
    console.log('Scan saved to history:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving scan to history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's scan history
 * FR-2.4.2: Allow users to view details of previous scans
 */
export const getScanHistory = async (userId, options = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const {
      category = null, // Filter by 'food' or 'medication'
      date = null, // Filter by specific date (YYYY-MM-DD)
      startDate = null, // Filter by date range start
      endDate = null, // Filter by date range end
      limitCount = 50, // Limit number of results
    } = options;

    const scanHistoryRef = collection(db, 'scan_history');
    // Only query by userId to avoid composite index requirement
    // We'll sort and filter in JavaScript
    let q = query(
      scanHistoryRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    let scans = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Safely convert timestamp
      const timestamp = data.timestamp?.toDate 
        ? (typeof data.timestamp.toDate === 'function' ? data.timestamp.toDate() : new Date(data.timestamp))
        : (data.timestamp instanceof Date ? data.timestamp : new Date(data.date || Date.now()));
      
      scans.push({ 
        id: doc.id, 
        ...data,
        timestamp 
      });
    });

    // Sort by timestamp in JavaScript (descending)
    scans.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
      return timeB - timeA; // Descending order
    });

    // Apply filters in JavaScript
    if (category) {
      scans = scans.filter(scan => scan.category === category || scan.type === category);
    }

    if (date) {
      scans = scans.filter(scan => scan.date === date);
    }

    if (startDate || endDate) {
      scans = scans.filter(scan => {
        const scanDate = new Date(scan.date);
        if (startDate && scanDate < new Date(startDate)) return false;
        if (endDate && scanDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply limit after filtering
    if (limitCount) {
      scans = scans.slice(0, limitCount);
    }

    return { success: true, scans };
  } catch (error) {
    console.error('Error getting scan history:', error);
    return { success: false, error: error.message, scans: [] };
  }
};

/**
 * Get scan history by category
 * FR-2.4.3: Enable filtering of scan history by category
 */
export const getScanHistoryByCategory = async (userId, category) => {
  return getScanHistory(userId, { category });
};

/**
 * Get scan history by date range
 * FR-2.4.3: Enable filtering of scan history by date
 */
export const getScanHistoryByDateRange = async (userId, startDate, endDate) => {
  return getScanHistory(userId, { startDate, endDate });
};

/**
 * Get scan statistics for trend analysis
 * FR-2.4.4: Retain scan data for future trend analysis
 */
export const getScanStatistics = async (userId, dateRange = null) => {
  try {
    const options = dateRange 
      ? { startDate: dateRange.start, endDate: dateRange.end }
      : {};
    
    const result = await getScanHistory(userId, { ...options, limitCount: 1000 });
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const scans = result.scans || [];
    
    const statistics = {
      totalScans: scans.length,
      foodScans: scans.filter(s => s.type === 'food').length,
      medicationScans: scans.filter(s => s.type === 'medication').length,
      scansWithAllergens: scans.filter(s => s.hasAllergens).length,
      scansWithInteractions: scans.filter(s => s.hasInteractions).length,
      riskDistribution: {
        high: scans.filter(s => s.riskLevel === 'high').length,
        medium: scans.filter(s => s.riskLevel === 'medium').length,
        low: scans.filter(s => s.riskLevel === 'low').length,
      },
      mostScannedFoods: getMostScannedItems(scans.filter(s => s.type === 'food')),
      mostScannedMedications: getMostScannedItems(scans.filter(s => s.type === 'medication')),
      dailyScanCount: getDailyScanCount(scans),
    };

    return { success: true, statistics };
  } catch (error) {
    console.error('Error getting scan statistics:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper: Get most scanned items
 */
const getMostScannedItems = (scans) => {
  const itemCounts = {};
  
  scans.forEach(scan => {
    if (scan.type === 'food' && scan.foodItems) {
      scan.foodItems.forEach(item => {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      });
    } else if (scan.type === 'medication' && scan.medication) {
      itemCounts[scan.medication] = (itemCounts[scan.medication] || 0) + 1;
    }
  });

  return Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([item, count]) => ({ item, count }));
};

/**
 * Helper: Get daily scan count
 */
const getDailyScanCount = (scans) => {
  const dailyCounts = {};
  
  scans.forEach(scan => {
    const date = scan.date || new Date(scan.timestamp?.toDate() || scan.createdAt?.toDate()).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  return dailyCounts;
};




