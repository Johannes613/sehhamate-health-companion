// Document Validation Utility (FR-1.2.4)
// Validates uploaded documents for format and authenticity

/**
 * Validates document file format
 * @param {Object} file - File object with uri, type, name, size
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validateDocumentFormat = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check if file has required properties
  if (!file.uri && !file.name) {
    return { isValid: false, error: 'Invalid file format' };
  }

  // Allowed file types for medical documents
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/pdf',
    'application/pdf',
    'image/heic',
    'image/heif'
  ];

  // Check file type
  if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.'
    };
  }

  // Check file extension if type is not available
  if (!file.type && file.name) {
    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'heic', 'heif'];
    
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: 'Invalid file extension. Please upload JPG, PNG, or PDF files only.'
      };
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size && file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit. Please upload a smaller file.'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates document authenticity by checking basic metadata
 * @param {Object} file - File object
 * @returns {Object} - { isValid: boolean, error: string | null, metadata: Object }
 */
export const validateDocumentAuthenticity = async (file) => {
  try {
    // Basic validation checks
    const metadata = {
      fileName: file.name || 'unknown',
      fileType: file.type || 'unknown',
      fileSize: file.size || 0,
      uploadedAt: new Date().toISOString()
    };

    // Check for suspicious file characteristics
    const warnings = [];

    // Check if file name looks suspicious
    if (file.name) {
      const suspiciousPatterns = [
        /\.exe$/i,
        /\.bat$/i,
        /\.scr$/i,
        /\.com$/i,
        /\.vbs$/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(file.name)) {
          warnings.push('File extension may be unsafe');
          break;
        }
      }
    }

    // Check file size (very small files might be corrupted)
    if (file.size && file.size < 1024) { // Less than 1KB
      warnings.push('File size is unusually small');
    }

    return {
      isValid: warnings.length === 0,
      error: warnings.length > 0 ? warnings.join(', ') : null,
      metadata,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error.message}`,
      metadata: null
    };
  }
};

/**
 * Validates document type (lab report vs prescription)
 * @param {string} documentType - Type of document ('lab_report' or 'prescription')
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validateDocumentType = (documentType) => {
  const validTypes = ['lab_report', 'prescription'];
  
  if (!documentType) {
    return { isValid: false, error: 'Document type is required' };
  }

  if (!validTypes.includes(documentType)) {
    return {
      isValid: false,
      error: `Invalid document type. Must be one of: ${validTypes.join(', ')}`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Comprehensive document validation
 * @param {Object} file - File object
 * @param {string} documentType - Type of document
 * @returns {Promise<Object>} - Validation result
 */
export const validateDocument = async (file, documentType) => {
  // Validate document type
  const typeValidation = validateDocumentType(documentType);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate file format
  const formatValidation = validateDocumentFormat(file);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  // Validate authenticity
  const authenticityValidation = await validateDocumentAuthenticity(file);
  if (!authenticityValidation.isValid) {
    return {
      isValid: false,
      error: authenticityValidation.error,
      warnings: authenticityValidation.warnings
    };
  }

  return {
    isValid: true,
    error: null,
    metadata: authenticityValidation.metadata,
    warnings: authenticityValidation.warnings || []
  };
};




