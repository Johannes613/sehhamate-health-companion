// Email validation utility
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Remove whitespace
  const cleanEmail = email.trim();
  
  if (cleanEmail.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for common issues
  if (cleanEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  // Check for consecutive dots
  if (cleanEmail.includes('..')) {
    return { isValid: false, error: 'Email address format is invalid' };
  }

  // Check for valid domain part
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Email address format is invalid' };
  }

  const [localPart, domainPart] = parts;
  
  if (localPart.length === 0 || localPart.length > 64) {
    return { isValid: false, error: 'Email address format is invalid' };
  }

  if (domainPart.length === 0 || domainPart.length > 253) {
    return { isValid: false, error: 'Email address format is invalid' };
  }

  // Check for valid characters in domain
  const domainRegex = /^[a-zA-Z0-9.-]+$/;
  if (!domainRegex.test(domainPart)) {
    return { isValid: false, error: 'Email address format is invalid' };
  }

  return { isValid: true, error: null };
};

// Password validation utility
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  return { isValid: true, error: null };
};

// Name validation utility
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const cleanName = name.trim();
  
  if (cleanName.length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  if (cleanName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (cleanName.length > 50) {
    return { isValid: false, error: 'Name is too long' };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(cleanName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, error: null };
};

// Phone number validation utility
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');

  if (cleanPhone.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // International phone number regex (supports + prefix and various formats)
  // Supports formats like: +971501234567, +971 50 123 4567, 0501234567, etc.
  const phoneRegex = /^(\+?971|0)?[2-9]\d{8}$/;
  const internationalPhoneRegex = /^\+[1-9]\d{1,14}$/;

  // Remove spaces and check
  const digitsOnly = cleanPhone.replace(/[\s\-\(\)]/g, '');

  // Check if it starts with + (international format)
  if (digitsOnly.startsWith('+')) {
    if (!internationalPhoneRegex.test(digitsOnly)) {
      return { isValid: false, error: 'Please enter a valid international phone number' };
    }
  } else {
    // UAE/GCC format: should be 9 digits after country code or 0
    const uaeFormat = digitsOnly.replace(/^(\+971|971|0)/, '');
    if (uaeFormat.length !== 9 || !/^[2-9]\d{8}$/.test(uaeFormat)) {
      return { isValid: false, error: 'Please enter a valid phone number (e.g., +971501234567 or 0501234567)' };
    }
  }

  return { isValid: true, error: null };
};

// Format phone number for Firebase (E.164 format)
export const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  
  // If already in E.164 format
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  // If starts with 0, replace with +971 (UAE country code)
  if (cleanPhone.startsWith('0')) {
    return '+971' + cleanPhone.substring(1);
  }
  
  // If starts with 971, add +
  if (cleanPhone.startsWith('971')) {
    return '+' + cleanPhone;
  }
  
  // Default: assume UAE number and add +971
  return '+971' + cleanPhone;
};

// General form validation utility
export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;

  Object.keys(fields).forEach(key => {
    const { value, validator } = fields[key];
    const result = validator(value);
    
    if (!result.isValid) {
      errors[key] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};


