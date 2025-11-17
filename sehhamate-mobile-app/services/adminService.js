/**
 * Admin Service
 * Implements FR-4: System Administrator Requirements (4.1-4.6)
 * - 4.1: Manage all registered user accounts
 * - 4.2: Assign user roles
 * - 4.3: Edit existing user roles
 * - 4.4: Remove user roles
 * - 4.5: Configure access permissions for new user roles
 * - 4.6: Update access permissions when role requirements change
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// User Management (FR-4.1-4.4)

// FR-4.1: Manage all registered user accounts
export const getAllUsers = async (filters = {}) => {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('createdAt', 'desc'));
    
    if (filters.role) {
      q = query(q, where('role', '==', filters.role));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    const users = [];
    
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return { success: true, users };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { success: false, error: error.message };
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserAccount = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user account:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, error: error.message };
  }
};

// FR-4.2: Assign user roles
export const assignUserRole = async (userId, role) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      roleAssignedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning user role:', error);
    return { success: false, error: error.message };
  }
};

// FR-4.3: Edit existing user roles
export const editUserRole = async (userId, roleUpdates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...roleUpdates,
      roleUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error editing user role:', error);
    return { success: false, error: error.message };
  }
};

// FR-4.4: Remove user roles
export const removeUserRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'user',
      roleRemovedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing user role:', error);
    return { success: false, error: error.message };
  }
};

// Role and Permission Management (FR-4.5-4.6)

export const getRoles = async () => {
  try {
    const rolesRef = collection(db, 'roles');
    const snapshot = await getDocs(rolesRef);
    const roles = [];
    
    snapshot.forEach((doc) => {
      roles.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return { success: true, roles };
  } catch (error) {
    console.error('Error getting roles:', error);
    return { success: false, error: error.message };
  }
};

export const getRoleById = async (roleId) => {
  try {
    const roleRef = doc(db, 'roles', roleId);
    const roleDoc = await getDoc(roleRef);
    
    if (roleDoc.exists()) {
      return { success: true, role: { id: roleDoc.id, ...roleDoc.data() } };
    }
    
    return { success: false, error: 'Role not found' };
  } catch (error) {
    console.error('Error getting role:', error);
    return { success: false, error: error.message };
  }
};

// FR-4.5: Configure access permissions for new user roles
export const createRole = async (roleData) => {
  try {
    const rolesRef = collection(db, 'roles');
    const newRoleRef = doc(rolesRef);
    
    await setDoc(newRoleRef, {
      ...roleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, roleId: newRoleRef.id };
  } catch (error) {
    console.error('Error creating role:', error);
    return { success: false, error: error.message };
  }
};

// FR-4.6: Update access permissions when role requirements change
export const updateRolePermissions = async (roleId, permissions) => {
  try {
    const roleRef = doc(db, 'roles', roleId);
    await updateDoc(roleRef, {
      permissions,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return { success: false, error: error.message };
  }
};
