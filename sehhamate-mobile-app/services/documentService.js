// Document Service (FR-1.2.3)
// Simulates document upload and processing - returns mock results
// No actual Firebase upload or storage

/**
 * Simulate document upload (no actual upload to Firebase)
 * @param {Object} file - File object with uri, type, name
 * @param {string} userId - User ID
 * @param {string} documentType - Type of document ('lab_report' or 'prescription')
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Simulated upload result
 */
export const uploadDocument = async (file, userId, documentType, onProgress = null) => {
  try {
    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress(progress);
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          // Simulate successful upload
          resolve({
            success: true,
            downloadURL: `mock://documents/${userId}/${documentType}/${Date.now()}`,
            fileName: file.name || 'document',
            storagePath: `documents/${userId}/${documentType}/${file.name || 'document'}`
          });
        }
      }, 200); // Update every 200ms
    });
  } catch (error) {
    console.error('Error simulating upload:', error);
    throw error;
  }
};

/**
 * Simulate saving document metadata (no actual Firestore save)
 * @param {Object} documentData - Document metadata
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Mock document ID
 */
export const saveDocumentMetadata = async (documentData, userId) => {
  // Simulate saving - just return a mock ID
  return `mock_doc_${Date.now()}`;
};

/**
 * Generate mock lab report analysis
 */
const generateMockLabReport = () => {
  return {
    documentType: 'lab_report',
    status: 'processed',
    extractedData: {
      patientName: 'Sample Patient',
      date: new Date().toISOString().split('T')[0],
      labName: 'Medical Laboratory Center',
      tests: [
        {
          name: 'Fasting Blood Glucose',
          value: 95,
          unit: 'mg/dL',
          normalRange: '70-100 mg/dL',
          status: 'normal',
          interpretation: 'Within normal range'
        },
        {
          name: 'HbA1c',
          value: 5.8,
          unit: '%',
          normalRange: '< 5.7%',
          status: 'slightly_elevated',
          interpretation: 'Slightly above normal. Monitor closely.'
        },
        {
          name: 'Total Cholesterol',
          value: 185,
          unit: 'mg/dL',
          normalRange: '< 200 mg/dL',
          status: 'normal',
          interpretation: 'Within normal range'
        },
        {
          name: 'HDL Cholesterol',
          value: 55,
          unit: 'mg/dL',
          normalRange: '> 40 mg/dL',
          status: 'normal',
          interpretation: 'Good cholesterol level'
        },
        {
          name: 'LDL Cholesterol',
          value: 110,
          unit: 'mg/dL',
          normalRange: '< 100 mg/dL',
          status: 'slightly_elevated',
          interpretation: 'Slightly elevated. Consider dietary changes.'
        },
        {
          name: 'Triglycerides',
          value: 120,
          unit: 'mg/dL',
          normalRange: '< 150 mg/dL',
          status: 'normal',
          interpretation: 'Within normal range'
        },
        {
          name: 'Complete Blood Count (CBC)',
          value: 'Normal',
          status: 'normal',
          interpretation: 'All CBC parameters within normal limits'
        }
      ],
      summary: 'Most test results are within normal ranges. HbA1c is slightly elevated, suggesting pre-diabetes. LDL cholesterol is slightly above optimal. Overall health status is good with minor areas for improvement.',
      recommendations: [
        'Continue monitoring blood glucose levels',
        'Consider dietary modifications to lower LDL cholesterol',
        'Maintain regular exercise routine',
        'Schedule follow-up in 3 months'
      ]
    },
    analysis: {
      overallHealth: 'good',
      riskFactors: ['slightly_elevated_hba1c', 'slightly_elevated_ldl'],
      priority: 'medium',
      nextSteps: 'Follow-up monitoring recommended'
    }
  };
};

/**
 * Generate mock prescription analysis
 */
const generateMockPrescription = () => {
  return {
    documentType: 'prescription',
    status: 'processed',
    extractedData: {
      patientName: 'Sample Patient',
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'Endocrinology',
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals to reduce stomach upset',
          purpose: 'Blood glucose control',
          warnings: ['May cause gastrointestinal side effects', 'Avoid alcohol consumption'],
          interactions: []
        },
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take at bedtime',
          purpose: 'Cholesterol management',
          warnings: ['May cause muscle pain', 'Report any unusual muscle weakness'],
          interactions: []
        },
        {
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          instructions: 'Take with food',
          purpose: 'Cardiovascular protection',
          warnings: ['May increase bleeding risk', 'Avoid if allergic to aspirin'],
          interactions: []
        }
      ],
      summary: 'Prescription includes medications for diabetes management (Metformin), cholesterol control (Atorvastatin), and cardiovascular protection (Aspirin). All medications are standard and well-tolerated.',
      recommendations: [
        'Take Metformin with meals to minimize side effects',
        'Monitor for any muscle pain while on Atorvastatin',
        'Continue daily Aspirin as prescribed for heart health',
        'Follow up with doctor in 1 month to assess medication effectiveness'
      ],
      refillInfo: {
        metformin: 'Refill available in 25 days',
        atorvastatin: 'Refill available in 25 days',
        aspirin: 'Available over-the-counter'
      }
    },
    analysis: {
      medicationCount: 3,
      hasInteractions: false,
      adherenceScore: 'good',
      priority: 'high',
      nextSteps: 'Follow medication schedule as prescribed'
    }
  };
};

/**
 * Process document and return mock analysis (FR-1.2.3)
 * @param {string} documentUrl - URL of the document (not used in mock)
 * @param {string} documentType - Type of document ('lab_report' or 'prescription')
 * @returns {Promise<Object>} - Mock extracted health information
 */
export const processDocument = async (documentUrl, documentType) => {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock data based on document type
    const mockData = documentType === 'lab_report' 
      ? generateMockLabReport()
      : generateMockPrescription();
    
    return {
      success: true,
      extractedData: mockData.extractedData,
      analysis: mockData.analysis
    };
  } catch (error) {
    console.error('Error processing document:', error);
    return {
      success: false,
      error: error.message,
      extractedData: null
    };
  }
};

/**
 * Complete document upload workflow (simulated)
 * @param {Object} file - File object
 * @param {string} userId - User ID
 * @param {string} documentType - Type of document
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Complete upload and processing result
 */
export const uploadAndProcessDocument = async (file, userId, documentType, onProgress = null) => {
  try {
    // Step 1: Simulate upload to Firebase Storage
    const uploadResult = await uploadDocument(file, userId, documentType, onProgress);
    
    // Step 2: Simulate saving metadata (no actual Firestore save)
    const documentMetadata = {
      fileName: file.name || 'document',
      fileType: file.type || 'image/jpeg',
      fileSize: file.size || 0,
      documentType,
      storagePath: uploadResult.storagePath,
      downloadURL: uploadResult.downloadURL,
      status: 'uploaded'
    };
    
    // Simulate document ID (not actually saved to Firestore)
    const documentId = `mock_doc_${Date.now()}`;
    
    // Step 3: Process document (extract health information) - returns mock data
    const processingResult = await processDocument(uploadResult.downloadURL, documentType);
    
    // Return result with mock data
    return {
      success: true,
      documentId,
      downloadURL: uploadResult.downloadURL,
      extractedData: processingResult.extractedData,
      analysis: processingResult.analysis,
      processingStatus: processingResult.success ? 'completed' : 'pending'
    };
  } catch (error) {
    console.error('Error in upload and process workflow:', error);
    throw error;
  }
};
