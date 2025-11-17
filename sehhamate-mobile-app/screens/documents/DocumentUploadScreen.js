// Document Upload Screen (FR-1.2.1, FR-1.2.2)
// Enables users to upload medical documents (lab reports and prescriptions)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker'; // Can be added later for PDF support
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Colors } from '../../utils/colorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { validateDocument } from '../../utils/documentValidation';
import { uploadAndProcessDocument } from '../../services/documentService';

export default function DocumentUploadScreen({ navigation }) {
  const { user } = useAuth();
  const [selectedDocumentType, setSelectedDocumentType] = useState(null); // 'lab_report' or 'prescription'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

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

  // Handle document type selection
  const handleDocumentTypeSelect = (type) => {
    setSelectedDocumentType(type);
    setSelectedFile(null);
    setUploadResult(null);
  };

  // Pick document from gallery
  const handlePickFromGallery = async () => {
    if (!selectedDocumentType) {
      Alert.alert('Select Document Type', 'Please select a document type first.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'image/jpeg',
          name: result.assets[0].fileName || `document_${Date.now()}.jpg`,
          size: result.assets[0].fileSize || 0
        };
        await handleFileSelect(file);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    if (!selectedDocumentType) {
      Alert.alert('Select Document Type', 'Please select a document type first.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'image/jpeg',
          name: `document_${Date.now()}.jpg`,
          size: result.assets[0].fileSize || 0
        };
        await handleFileSelect(file);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Handle file selection and validation
  const handleFileSelect = async (file) => {
    try {
      // Validate document (FR-1.2.4)
      const validation = await validateDocument(file, selectedDocumentType);
      
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.error);
        return;
      }

      if (validation.warnings && validation.warnings.length > 0) {
        Alert.alert(
          'Warning',
          `File validation warnings: ${validation.warnings.join(', ')}. Continue anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => setSelectedFile(file) }
          ]
        );
        return;
      }

      setSelectedFile(file);
    } catch (error) {
      console.error('Error validating file:', error);
      Alert.alert('Error', 'Failed to validate file. Please try again.');
    }
  };

  // Upload and process document
  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType || !user?.id) {
      Alert.alert('Error', 'Please select a document and document type.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const result = await uploadAndProcessDocument(
        selectedFile,
        user.id,
        selectedDocumentType,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResult(result);
      setShowResultModal(true);
      setIsUploading(false);
      setSelectedFile(null);
      
      Alert.alert(
        'Success',
        'Document uploaded successfully! Processing will extract health information.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload document. Please try again.'
      );
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Upload Medical Document" navigation={navigation} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        {/* Document Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Document Type</Text>
          <Text style={styles.sectionSubtitle}>Choose the type of medical document you want to upload</Text>
          
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                selectedDocumentType === 'lab_report' && styles.typeCardSelected
              ]}
              onPress={() => handleDocumentTypeSelect('lab_report')}
            >
              <LinearGradient
                colors={
                  selectedDocumentType === 'lab_report'
                    ? ['#4ECDC4', '#45B7D1']
                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)']
                }
                style={styles.typeCardGradient}
              >
                <Ionicons
                  name="document-text"
                  size={32}
                  color={selectedDocumentType === 'lab_report' ? '#000' : '#4ECDC4'}
                />
                <Text
                  style={[
                    styles.typeCardText,
                    selectedDocumentType === 'lab_report' && styles.typeCardTextSelected
                  ]}
                >
                  Lab Report
                </Text>
                <Text
                  style={[
                    styles.typeCardSubtext,
                    selectedDocumentType === 'lab_report' && styles.typeCardSubtextSelected
                  ]}
                >
                  Blood tests, glucose, HbA1c, IgE
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                selectedDocumentType === 'prescription' && styles.typeCardSelected
              ]}
              onPress={() => handleDocumentTypeSelect('prescription')}
            >
              <LinearGradient
                colors={
                  selectedDocumentType === 'prescription'
                    ? ['#4ECDC4', '#45B7D1']
                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)']
                }
                style={styles.typeCardGradient}
              >
                <Ionicons
                  name="medical"
                  size={32}
                  color={selectedDocumentType === 'prescription' ? '#000' : '#4ECDC4'}
                />
                <Text
                  style={[
                    styles.typeCardText,
                    selectedDocumentType === 'prescription' && styles.typeCardTextSelected
                  ]}
                >
                  Prescription
                </Text>
                <Text
                  style={[
                    styles.typeCardSubtext,
                    selectedDocumentType === 'prescription' && styles.typeCardSubtextSelected
                  ]}
                >
                  Medication prescriptions
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* File Selection */}
        {selectedDocumentType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Document</Text>
            <Text style={styles.sectionSubtitle}>
              Take a photo or choose from gallery
            </Text>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleTakePhoto}
                disabled={isUploading}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#45B7D1']}
                  style={styles.uploadButtonGradient}
                >
                  <Ionicons name="camera" size={24} color="#000" />
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickFromGallery}
                disabled={isUploading}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a6f']}
                  style={styles.uploadButtonGradient}
                >
                  <Ionicons name="images" size={24} color="#fff" />
                  <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Selected File Preview */}
            {selectedFile && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.previewFileSize}>
                    {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setSelectedFile(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Upload Button */}
        {selectedFile && selectedDocumentType && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.uploadSubmitButton}
              onPress={handleUpload}
              disabled={isUploading || isProcessing}
            >
              <LinearGradient
                colors={['#4ECDC4', '#45B7D1', '#ff6b6b']}
                style={styles.uploadSubmitGradient}
              >
                {isUploading || isProcessing ? (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator color="#000" size="small" />
                    <Text style={styles.uploadSubmitText}>
                      {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={24} color="#000" />
                    <Text style={styles.uploadSubmitText}>Upload & Process Document</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Progress Bar */}
            {isUploading && uploadProgress > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressBarFill, { width: `${uploadProgress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
              </View>
            )}
          </View>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#4ECDC4" />
            <Text style={styles.infoText}>
              Supported formats: JPG, PNG, PDF (Max 10MB)
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color="#4ECDC4" />
            <Text style={styles.infoText}>
              Your documents are securely stored and processed
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowResultModal(false)}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <Ionicons name="checkmark-circle" size={64} color="#4ECDC4" />
            <Text style={styles.modalTitle}>Document Uploaded Successfully!</Text>
            
            {uploadResult?.extractedData && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Processing Status:</Text>
                <Text style={styles.resultText}>
                  {uploadResult.processingStatus === 'completed'
                    ? 'Health information extracted successfully'
                    : 'Document is being processed'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowResultModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  typeCardSelected: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  typeCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  typeCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  typeCardTextSelected: {
    color: '#000',
  },
  typeCardSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  typeCardSubtextSelected: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  uploadButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  previewContainer: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
  },
  previewFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  previewFileSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  uploadSubmitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  uploadSubmitGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadSubmitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarContainer: {
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 20,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

