import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
  createdAt: any;
  createdBy?: string;
  lastLogin?: any;
}

// Store cache in memory
let adminUsersCache: AdminUser[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

class AdminService {
  /**
   * Gets all admin users from Firestore
   */
  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      // Check if we have cached users and the cache is still valid
      const now = Date.now();
      if (adminUsersCache && (now - lastFetchTime < cacheTTL)) {
        return adminUsersCache;
      }
      
      const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const querySnapshot = await getDocs(adminsQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const adminsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName || '',
          role: data.role,
          permissions: data.permissions || [],
          createdAt: data.createdAt,
          createdBy: data.createdBy || '',
          lastLogin: data.lastLogin
        } as AdminUser;
      });
      
      // Update cache
      adminUsersCache = adminsData;
      lastFetchTime = now;
      
      return adminUsersCache;
    } catch (err) {
      console.error('Error fetching admin users:', err);
      return [];
    }
  }
  
  /**
   * Gets a specific admin user by ID
   */
  async getAdminUserById(userId: string): Promise<AdminUser | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().role === 'admin') {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          displayName: data.displayName || '',
          role: data.role,
          permissions: data.permissions || [],
          createdAt: data.createdAt,
          createdBy: data.createdBy || '',
          lastLogin: data.lastLogin
        } as AdminUser;
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error fetching admin user with ID ${userId}:`, err);
      return null;
    }
  }
  
  /**
   * Checks if a user has admin role
   */
  async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      return docSnap.exists() && docSnap.data().role === 'admin';
    } catch (err) {
      console.error(`Error checking admin status for user ${userId}:`, err);
      return false;
    }
  }
  
  /**
   * Creates a new admin invitation
   */
  async createAdminInvitation(email: string, invitedBy: string): Promise<string> {
    try {
      // Check if user with this email already exists
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        throw new Error('User with this email already exists');
      }
      
      // Create invitation in invitations collection
      const invitationRef = await addDoc(collection(db, 'invitations'), {
        email,
        role: 'admin',
        invitedBy,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      
      return invitationRef.id;
    } catch (err) {
      console.error('Error creating admin invitation:', err);
      throw err;
    }
  }
  
  /**
   * Creates a new admin user
   */
  async createAdminUser(userData: Partial<AdminUser>, createdBy: string): Promise<string> {
    try {
      // Create user in users collection
      const userRef = await addDoc(collection(db, 'users'), {
        ...userData,
        role: 'admin',
        permissions: userData.permissions || ['view'],
        createdAt: serverTimestamp(),
        createdBy
      });
      
      // Clear the cache
      this.clearCache();
      
      return userRef.id;
    } catch (err) {
      console.error('Error creating admin user:', err);
      throw err;
    }
  }
  
  /**
   * Updates an admin user
   */
  async updateAdminUser(userId: string, userData: Partial<AdminUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating admin user with ID ${userId}:`, err);
      throw err;
    }
  }
  
  /**
   * Deletes an admin user
   */
  async deleteAdminUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error deleting admin user with ID ${userId}:`, err);
      throw err;
    }
  }
  
  /**
   * Clears the admin users cache to force a fresh fetch
   */
  clearCache(): void {
    adminUsersCache = null;
    lastFetchTime = 0;
  }
}

export default new AdminService();
