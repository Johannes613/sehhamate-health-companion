// Document Service (FR-1.2.3)
// Handles document upload, storage, and processing

import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Upload document to Firebase Storage
 * @param {Object} file - File object with uri, type, name
 * @param {string} userId - User ID
 * @param {string} documentType - Type of document ('lab_report' or 'prescription')
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Upload result with download URL
 */
export const uploadDocument = async (file, userId, documentType, onProgress = null) => {
  try {
    // Create storage reference
    const timestamp = Date.now();
    const fileName = `${documentType}_${timestamp}_${file.name || 'document'}`;
    const storageRef = ref(storage, `documents/${userId}/${documentType}/${fileName}`);

    // Convert file URI to blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        originalName: file.name || 'document',
        documentType: documentType,
        uploadedAt: new Date().toISOString()
      }
    });

    // Monitor upload progress
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          // Upload completed
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              downloadURL,
              fileName,
              storagePath: `documents/${userId}/${documentType}/${fileName}`
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Save document metadata to Firestore
 * @param {Object} documentData - Document metadata
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Document ID
 */
export const saveDocumentMetadata = async (documentData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'documents'), {
      ...documentData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving document metadata:', error);
    throw error;
  }
};

/**
 * Process document and extract health information (FR-1.2.3)
 * This will call the backend API for document processing
 * @param {string} documentUrl - URL of the uploaded document
 * @param {string} documentType - Type of document
 * @returns {Promise<Object>} - Extracted health information
 */
export const processDocument = async (documentUrl, documentType) => {
  try {
    // TODO: Replace with actual backend API endpoint
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://healthsphere-ai.onrender.com';
    const endpoint = documentType === 'lab_report' 
      ? '/api/v1/documents/process-lab-report'
      : '/api/v1/documents/process-prescription';

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl,
        documentType
      })
    });

    if (!response.ok) {
      throw new Error(`Document processing failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      extractedData: result.data || result,
      analysis: result.analysis || null
    };
  } catch (error) {
    console.error('Error processing document:', error);
    // Return mock data for now until backend is ready
    return {
      success: false,
      error: error.message,
      extractedData: null,
      // Mock extracted data structure
      mockData: {
        documentType,
        status: 'pending_processing',
        message: 'Document uploaded successfully. Processing will be available soon.'
      }
    };
  }
};

/**
 * Complete document upload workflow
 * @param {Object} file - File object
 * @param {string} userId - User ID
 * @param {string} documentType - Type of document
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Complete upload and processing result
 */
export const uploadAndProcessDocument = async (file, userId, documentType, onProgress = null) => {
  try {
    // Step 1: Upload to Firebase Storage
    const uploadResult = await uploadDocument(file, userId, documentType, onProgress);

    // Step 2: Save metadata to Firestore
    const documentMetadata = {
      fileName: file.name || 'document',
      fileType: file.type || 'image/jpeg',
      fileSize: file.size || 0,
      documentType,
      storagePath: uploadResult.storagePath,
      downloadURL: uploadResult.downloadURL,
      status: 'uploaded'
    };

    const documentId = await saveDocumentMetadata(documentMetadata, userId);

    // Step 3: Process document (extract health information)
    const processingResult = await processDocument(uploadResult.downloadURL, documentType);

    // Step 4: Update document metadata with processing results
    if (processingResult.success && processingResult.extractedData) {
      await updateDoc(
        doc(db, 'users', userId, 'documents', documentId),
        {
          status: 'processed',
          extractedData: processingResult.extractedData,
          processedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );
    }

    return {
      success: true,
      documentId,
      downloadURL: uploadResult.downloadURL,
      extractedData: processingResult.extractedData || processingResult.mockData,
      processingStatus: processingResult.success ? 'completed' : 'pending'
    };
  } catch (error) {
    console.error('Error in upload and process workflow:', error);
    throw error;
  }
};




