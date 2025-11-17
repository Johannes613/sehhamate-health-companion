import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true for auth state listener
  const [profileSetupCompleted, setProfileSetupCompleted] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    let timeoutId;
    let initTimeoutId;
    
    // Set an initial timeout to prevent infinite loading if auth never initializes
    initTimeoutId = setTimeout(() => {
      console.warn('⚠️ Initial auth check timeout - setting loading to false');
      setLoading(false);
    }, 3000); // 3 second initial timeout
    
    // Check if auth is properly initialized
    if (!auth) {
      console.error('❌ Firebase Auth not initialized, setting loading to false');
      clearTimeout(initTimeoutId);
      setLoading(false);
      return;
    }
    
    console.log('✅ Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear initial timeout
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
        initTimeoutId = null;
      }
      
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set a safety timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.warn('⚠️ Auth state processing timeout - forcing loading to false');
        setLoading(false);
      }, 5000); // 5 second timeout (reduced from 10)
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      // Always start with loading true when auth state changes
      setLoading(true);
      
      if (firebaseUser) {
        try {
          console.log('Fetching user data for:', firebaseUser.uid);
          
          // Check if Firestore is accessible
          console.log('Checking Firestore connection...');
          
          if (!db) {
            throw new Error('Firestore not initialized');
          }
          
          // Get user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          console.log('Getting user document from path:', `users/${firebaseUser.uid}`);
          
          // Add timeout for Firestore operations
          const userDocPromise = getDoc(userDocRef);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore operation timeout')), 8000)
          );
          
          const userDoc = await Promise.race([userDocPromise, timeoutPromise]);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User document found:', userData);
            
            // Check if user is admin - admins always skip profile setup
            const isAdmin = userData.role === 'admin';
            
            const completeUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || userData.name,
              ...userData
            };
            
            setUser(completeUserData);
            // Admins always have profileSetupCompleted = true to skip setup
            setProfileSetupCompleted(isAdmin ? true : (userData.profileSetupCompleted || false));
            setIsAuthenticated(true);
            console.log('Existing user authenticated successfully', { isAdmin });
          } else {
            console.log('User document not found, creating new one');
            
            // Check if this might be an admin user (based on email)
            // Note: Admin role is set during login, so we check email as fallback
            const isAdminEmail = firebaseUser.email === 'admin@sehhamate.app';
            
            // User document doesn't exist, create basic user data
            const basicUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              profileSetupCompleted: isAdminEmail ? true : false, // Admin skips setup
              ...(isAdminEmail ? { role: 'admin' } : {}), // Set admin role if admin email
              createdAt: new Date().toISOString(),
            };
            
            console.log('Creating user document...', { isAdminEmail });
            // Create user document in Firestore
            await setDoc(userDocRef, basicUserData);
            
            setUser(basicUserData);
            setProfileSetupCompleted(isAdminEmail ? true : false);
            setIsAuthenticated(true);
            console.log('New user created and authenticated successfully', { isAdminEmail });
          }
        } catch (error) {
          console.error('Error in auth state handler:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
          });
          
          // If it's a Firestore error but we have a valid Firebase user,
          // create basic user data without Firestore
          if (firebaseUser && (error.message.includes('timeout') || error.code?.includes('firestore'))) {
            console.warn('Firestore unavailable, proceeding with basic auth only');
            
            // Check if admin email for offline mode
            const isAdminEmail = firebaseUser.email === 'admin@sehhamate.app';
            
            const basicUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              profileSetupCompleted: isAdminEmail ? true : false, // Admin skips setup
              ...(isAdminEmail ? { role: 'admin' } : {}),
              isOfflineMode: true
            };
            
            setUser(basicUserData);
            setProfileSetupCompleted(isAdminEmail ? true : false);
            setIsAuthenticated(true);
            console.log('User authenticated in offline mode', { isAdminEmail });
          } else {
            // On other errors, clear auth state
            setIsAuthenticated(false);
            setUser(null);
            setProfileSetupCompleted(false);
          }
        }
      } else {
        console.log('No user - clearing auth state');
        setIsAuthenticated(false);
        setUser(null);
        setProfileSetupCompleted(false);
      }
      
      // Always set loading to false at the end
      setLoading(false);
      console.log('✅ Auth state processing complete - loading set to false');
      
      // Clear the timeout since we completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Clear initial timeout if still exists
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
      }
    });

    // Additional fallback: if loading is still true after 2 seconds, force it to false
    // This handles cases where onAuthStateChanged doesn't fire immediately
    let fallbackTimeout;
    if (auth) {
      fallbackTimeout = setTimeout(() => {
        console.log('⚠️ Fallback: checking if loading should be forced to false');
        setLoading(prevLoading => {
          if (prevLoading) {
            console.log('⚠️ Forcing loading to false after fallback delay');
            return false;
          }
          return prevLoading;
        });
      }, 2000); // 2 second fallback
    }

    return () => {
      // Cleanup subscription and timeouts on unmount
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

    const login = async (email, password, loginType = 'user') => {
    try {
      console.log('Login attempt started:', { email, loginType });
      
      // Check if Firebase Auth is initialized
      if (!auth) {
        console.error('Firebase Auth not initialized');
        return { success: false, error: 'Authentication service unavailable. Please try again.' };
      }
      
      // Handle default admin credentials
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const isDefaultAdmin = (cleanEmail === 'admin' || cleanEmail === 'admin@sehhamate.app') && cleanPassword === 'admin123';
      
      if (isDefaultAdmin && loginType === 'admin') {
        console.log('Default admin login detected');
        // Use a standard email format for Firebase Auth
        const adminEmail = 'admin@sehhamate.app';
        const adminPassword = 'admin123';
        
        try {
          // Try to sign in with admin credentials
          setLoading(true);
          const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          const firebaseUser = userCredential.user;
          
          console.log('Admin Firebase login successful:', firebaseUser.uid);
          
          // Ensure admin user document exists with proper role
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          const adminUserData = {
            id: firebaseUser.uid,
            email: adminEmail,
            name: 'Administrator',
            role: 'admin',
            profileSetupCompleted: true, // Skip profile setup for admin
            createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await setDoc(userDocRef, adminUserData, { merge: true });
          console.log('Admin user document created/updated');
          
          return { success: true };
        } catch (authError) {
          console.error('Admin login error:', authError);
          // If admin user doesn't exist in Firebase Auth, we can't auto-create it
          // The user needs to create the admin account in Firebase Console first
          // For now, return a helpful error message
          if (authError.code === 'auth/user-not-found') {
            return { 
              success: false, 
              error: 'Admin account not found. Please create admin@sehhamate.app in Firebase Console with password admin123.' 
            };
          }
          return { success: false, error: 'Admin login failed. Please check credentials.' };
        }
      }
      
      // Regular user login validation
      // Validate email format before sending to Firebase
      const emailValidation = validateEmail(cleanEmail);
      if (!emailValidation.isValid) {
        console.log('Email validation failed:', emailValidation.error);
        return { success: false, error: emailValidation.error };
      }

      // Validate password
      const passwordValidation = validatePassword(cleanPassword);
      if (!passwordValidation.isValid) {
        console.log('Password validation failed:', passwordValidation.error);
        return { success: false, error: passwordValidation.error };
      }

      console.log('Attempting Firebase login with:', cleanEmail);

      // Set loading only for the login operation, not the auth state change
      setLoading(true);

      // Sign in with Firebase
      console.log('Calling signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;

      console.log('Firebase login successful:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified
      });
      
      // If admin login, verify admin role after fetching user data
      if (loginType === 'admin') {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role !== 'admin') {
            // Sign out if not admin
            await signOut(auth);
            return { success: false, error: 'Access denied. Admin privileges required.' };
          }
        } else {
          // User document doesn't exist yet, sign out
          await signOut(auth);
          return { success: false, error: 'Access denied. Admin privileges required.' };
        }
      }
      
      // Don't set loading to false here - let onAuthStateChanged handle it
      // User data will be set by the onAuthStateChanged listener
      console.log('Login function completed successfully - waiting for auth state change');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Only set loading to false on error
      setLoading(false);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

    const signUp = async (name, identifier, password, confirmPassword, registrationMethod = 'email', healthProfileData = {}) => {
    try {
      console.log('Sign up attempt:', { name, identifier, registrationMethod });

      // Validate name
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.error };
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Check password confirmation
      if (!confirmPassword) {
        return { success: false, error: 'Please confirm your password' };
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Clean the inputs
      const cleanName = name.trim();
      let firebaseUser;

      // Set loading for the sign up operation
      setLoading(true);

      // Handle registration based on method
      if (registrationMethod === 'phone') {
        // For phone registration, we'll use email/password auth but store phone number
        // Note: Full phone auth with SMS verification requires additional setup
        // For now, we'll create account with a generated email and store phone separately
        // In production, implement proper Firebase Phone Auth with SMS verification
        
        // Generate a temporary email for phone-based accounts
        const tempEmail = `phone_${identifier.replace(/[^0-9]/g, '')}@sehhamate.temp`;
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, tempEmail, password);
          firebaseUser = userCredential.user;
        } catch (error) {
          // If account exists, try to sign in
          if (error.code === 'auth/email-already-in-use') {
            return { success: false, error: 'An account with this phone number already exists.' };
          }
          throw error;
        }
      } else {
        // Email registration
        const emailValidation = validateEmail(identifier);
        if (!emailValidation.isValid) {
          setLoading(false);
          return { success: false, error: emailValidation.error };
        }

        const cleanEmail = identifier.trim().toLowerCase();
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUser = userCredential.user;
      }

      // Update Firebase Auth profile with display name
      await updateProfile(firebaseUser, {
        displayName: cleanName
      });

      // Prepare user data with health profile information
      const userData = {
        id: firebaseUser.uid,
        name: cleanName,
        profileSetupCompleted: false, // New users need to complete setup
        // Include health profile data from signup (FR-1.1.3, FR-1.1.4, FR-1.1.5)
        diabetesType: healthProfileData.diabetesType || null,
        allergies: healthProfileData.allergies || [],
        dietaryRestrictions: healthProfileData.dietaryRestrictions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add identifier based on registration method
      if (registrationMethod === 'email') {
        userData.email = identifier.trim().toLowerCase();
      } else {
        userData.phoneNumber = identifier; // Store formatted phone number
        userData.email = firebaseUser.email; // Store temp email for reference
      }

      // Add health profile data (FR-1.1.3, FR-1.1.4, FR-1.1.5)
      if (healthProfileData.diabetesType) {
        userData.diabetesType = healthProfileData.diabetesType;
      }
      if (healthProfileData.allergies && healthProfileData.allergies.length > 0) {
        userData.allergies = healthProfileData.allergies;
      }
      if (healthProfileData.dietaryRestrictions && healthProfileData.dietaryRestrictions.length > 0) {
        userData.dietaryRestrictions = healthProfileData.dietaryRestrictions;
      }

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, userData);

      console.log('Firebase sign up successful:', firebaseUser.uid);
      console.log('Health profile data saved:', healthProfileData);
      
      // Don't set loading to false here - let onAuthStateChanged handle it
      // User data will be set by the onAuthStateChanged listener
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Only set loading to false on error
      setLoading(false);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Sign up failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = registrationMethod === 'phone' 
            ? 'An account with this phone number already exists.'
            : 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'This registration method is not enabled.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/invalid-phone-number':
          errorMessage = 'Please enter a valid phone number.';
          break;
        default:
          errorMessage = 'Sign up failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      setLoading(true);
      
      // Clear local state first to ensure immediate UI update
      // This triggers navigation to auth screen immediately
      setIsAuthenticated(false);
      setUser(null);
      setProfileSetupCompleted(false);
      
      // Sign out from Firebase
      // This will trigger onAuthStateChanged which will also confirm the state
      // but we've already cleared it above for immediate UI feedback
      try {
        await signOut(auth);
        console.log('Firebase signOut successful');
      } catch (signOutError) {
        console.error('Firebase signOut error:', signOutError);
        // Continue even if signOut fails - state is already cleared
      }
      
      console.log('User logged out successfully');
      
      // Set loading to false after a brief delay to allow navigation
      // The onAuthStateChanged will also set loading to false
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, ensure local state is cleared
      setIsAuthenticated(false);
      setUser(null);
      setProfileSetupCompleted(false);
      setLoading(false);
    }
  };

  const completeProfileSetup = async (profileData) => {
    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not found');
      }

      console.log('Completing profile setup for user:', user.id);

      // Calculate daily requirements based on profile data (legacy support)
      const dailyRequirements = calculateDailyRequirements(profileData);

      // Prepare complete user data
      // Note: nutritionProfile and allergyProfile should already be included in profileData
      // from ProfileSetupScreen (generated by analysis engines - FR-1.4.3, FR-1.4.4)
      const completeUserData = {
        ...profileData,
        profileSetupCompleted: true,
        dailyRequirements, // Keep for backward compatibility
        // nutritionProfile and allergyProfile are included from profileData
        updatedAt: new Date().toISOString(),
      };

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, completeUserData);

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        ...completeUserData,
      }));

      setProfileSetupCompleted(true);
      
      console.log('Profile setup completed successfully');
      console.log('Nutrition profile generated:', !!profileData.nutritionProfile);
      console.log('Allergy profile generated:', !!profileData.allergyProfile);
      return { success: true };
    } catch (error) {
      console.error('Profile setup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate daily requirements
  const calculateDailyRequirements = (profileData) => {
    const { age, weight, height, gender, activityLevel } = profileData;
    
    if (!age || !weight || !height || !gender) {
      return null;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    } else {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
    }

    // Activity level multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      moderately_active: 1.55,
      very_active: 1.725,
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    const tdee = Math.round(bmr * multiplier);

    // Calculate macronutrient targets (example distribution)
    const protein = Math.round((tdee * 0.25) / 4); // 25% of calories from protein
    const carbohydrates = Math.round((tdee * 0.45) / 4); // 45% of calories from carbs
    const fat = Math.round((tdee * 0.30) / 9); // 30% of calories from fat

    return {
      calories: tdee,
      bmr: Math.round(bmr),
      protein,
      carbohydrates,
      fat,
    };
  };

  // Function to update user profile
  const updateUserProfile = async (updatedData) => {
    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not found');
      }

      console.log('Updating user profile:', user.id);

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', user.id);
      const updateData = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userDocRef, updateData);

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        ...updateData,
      }));

      console.log('User profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    profileSetupCompleted: profileSetupCompleted || user?.profileSetupCompleted,
    login,
    signUp,
    logout,
    completeProfileSetup,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

