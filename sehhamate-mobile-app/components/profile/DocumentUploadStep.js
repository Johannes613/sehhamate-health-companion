// Document Upload Step Component for Profile Setup (FR-1.2.1, FR-1.2.2)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../utils/colorUtils';
import { validateDocument } from '../../utils/documentValidation';
import { uploadAndProcessDocument } from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';

export default function DocumentUploadStep({ data, onUpdate, onNext, canProceed }) {
  const { user } = useAuth();
  const [uploadedDocuments, setUploadedDocuments] = useState(data.uploadedDocuments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Request permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to upload documents.'
      );
      return false;
    }
    return true;
  };

  // Handle document upload
  const handleUploadDocument = async (documentType) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please complete authentication first.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Show options
      Alert.alert(
        'Upload Document',
        `Upload your ${documentType === 'lab_report' ? 'lab report' : 'prescription'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => takePhoto(documentType) },
          { text: 'Choose from Gallery', onPress: () => pickFromGallery(documentType) },
        ]
      );
    } catch (error) {
      console.error('Error showing upload options:', error);
    }
  };

  const takePhoto = async (documentType) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        await processAndUpload(result.assets[0], documentType);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async (documentType) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        await processAndUpload(result.assets[0], documentType);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const processAndUpload = async (asset, documentType) => {
    try {
      const file = {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `document_${Date.now()}.jpg`,
        size: asset.fileSize || 0
      };

      // Validate document
      const validation = await validateDocument(file, documentType);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.error);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Upload and process
      const result = await uploadAndProcessDocument(
        file,
        user.id,
        documentType,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        const newDocument = {
          id: result.documentId,
          type: documentType,
          fileName: file.name,
          downloadURL: result.downloadURL,
          uploadedAt: new Date().toISOString(),
          status: result.processingStatus
        };

        const updatedDocuments = [...uploadedDocuments, newDocument];
        setUploadedDocuments(updatedDocuments);
        onUpdate({ uploadedDocuments: updatedDocuments });

        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeDocument = (documentId) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = uploadedDocuments.filter(doc => doc.id !== documentId);
            setUploadedDocuments(updated);
            onUpdate({ uploadedDocuments: updated });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Upload your medical documents to help us provide better health insights. This step is optional.
        </Text>

        {/* Lab Report Upload */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadHeader}>
            <Ionicons name="document-text" size={24} color="#4ECDC4" />
            <Text style={styles.uploadTitle}>Lab Reports</Text>
          </View>
          <Text style={styles.uploadSubtitle}>
            Upload blood tests, glucose levels, HbA1c, IgE results
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('lab_report')}
            disabled={isUploading}
          >
            <LinearGradient
              colors={['#4ECDC4', '#45B7D1']}
              style={styles.uploadButtonGradient}
            >
              <Ionicons name="cloud-upload" size={20} color="#000" />
              <Text style={styles.uploadButtonText}>Upload Lab Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Prescription Upload */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadHeader}>
            <Ionicons name="medical" size={24} color="#ff6b6b" />
            <Text style={styles.uploadTitle}>Prescriptions</Text>
          </View>
          <Text style={styles.uploadSubtitle}>
            Upload medication prescriptions for analysis
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUploadDocument('prescription')}
            disabled={isUploading}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a6f']}
              style={styles.uploadButtonGradient}
            >
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Prescription</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upload Progress */}
        {isUploading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="#4ECDC4" />
            <Text style={styles.progressText}>
              Uploading... {Math.round(uploadProgress)}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressBarFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          </View>
        )}

        {/* Uploaded Documents List */}
        {uploadedDocuments.length > 0 && (
          <View style={styles.documentsList}>
            <Text style={styles.documentsTitle}>Uploaded Documents</Text>
            {uploadedDocuments.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <Ionicons
                  name={doc.type === 'lab_report' ? 'document-text' : 'medical'}
                  size={20}
                  color={doc.type === 'lab_report' ? '#4ECDC4' : '#ff6b6b'}
                />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.fileName}
                  </Text>
                  <Text style={styles.documentType}>
                    {doc.type === 'lab_report' ? 'Lab Report' : 'Prescription'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeDocument(doc.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={16} color="#4ECDC4" />
            <Text style={styles.infoText}>
              Supported formats: JPG, PNG, PDF (Max 10MB)
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={16} color="#4ECDC4" />
            <Text style={styles.infoText}>
              Your documents are securely stored and processed
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !canProceed && styles.continueButtonDisabled]}
          onPress={onNext}
          disabled={!canProceed}
        >
          <LinearGradient
            colors={canProceed ? ['#4ECDC4', '#45B7D1'] : ['#666', '#555']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {uploadedDocuments.length > 0 ? 'Continue with Documents' : 'Skip for Now'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={canProceed ? '#000' : '#999'}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 30,
  },
  uploadSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  documentsList: {
    marginTop: 20,
    marginBottom: 20,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  infoSection: {
    marginTop: 20,
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  continueButton: {
    marginTop: 30,
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});




