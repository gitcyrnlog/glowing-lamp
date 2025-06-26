import { collection, getDocs, doc, getDoc, query, orderBy, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  createdAt: any;
  expiresAt: any;
  acceptedAt?: any;
}

// Store cache in memory
let invitationsCache: Invitation[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

class InvitationService {
  /**
   * Gets all invitations
   */
  async getAllInvitations(): Promise<Invitation[]> {
    try {
      // Check if we have cached invitations and the cache is still valid
      const now = Date.now();
      if (invitationsCache && (now - lastFetchTime < cacheTTL)) {
        return invitationsCache;
      }
      
      const invitationsQuery = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(invitationsQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const invitationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          role: data.role,
          token: data.token,
          status: data.status,
          invitedBy: data.invitedBy,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          acceptedAt: data.acceptedAt
        } as Invitation;
      });
      
      // Update cache
      invitationsCache = invitationsData;
      lastFetchTime = now;
      
      return invitationsCache;
    } catch (err) {
      console.error('Error fetching invitations:', err);
      return [];
    }
  }
  
  /**
   * Gets pending invitations
   */
  async getPendingInvitations(): Promise<Invitation[]> {
    try {
      const invitationsQuery = query(
        collection(db, 'invitations'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(invitationsQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          role: data.role,
          token: data.token,
          status: data.status,
          invitedBy: data.invitedBy,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          acceptedAt: data.acceptedAt
        } as Invitation;
      });
    } catch (err) {
      console.error('Error fetching pending invitations:', err);
      return [];
    }
  }
  
  /**
   * Gets an invitation by ID
   */
  async getInvitationById(invitationId: string): Promise<Invitation | null> {
    try {
      const docRef = doc(db, 'invitations', invitationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          role: data.role,
          token: data.token,
          status: data.status,
          invitedBy: data.invitedBy,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          acceptedAt: data.acceptedAt
        } as Invitation;
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error fetching invitation with ID ${invitationId}:`, err);
      return null;
    }
  }
  
  /**
   * Gets an invitation by token
   */
  async getInvitationByToken(token: string): Promise<Invitation | null> {
    try {
      const invitationsQuery = query(collection(db, 'invitations'), where('token', '==', token));
      const querySnapshot = await getDocs(invitationsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const data = querySnapshot.docs[0].data();
      return {
        id: querySnapshot.docs[0].id,
        email: data.email,
        role: data.role,
        token: data.token,
        status: data.status,
        invitedBy: data.invitedBy,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        acceptedAt: data.acceptedAt
      } as Invitation;
    } catch (err) {
      console.error(`Error fetching invitation with token ${token}:`, err);
      return null;
    }
  }
  
  /**
   * Creates a new invitation
   */
  async createInvitation(email: string, role: string, invitedBy: string): Promise<string> {
    try {
      // Check if there's already a pending invitation for this email
      const existingQuery = query(
        collection(db, 'invitations'),
        where('email', '==', email),
        where('status', '==', 'pending')
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('There is already a pending invitation for this email');
      }
      
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Set expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create the invitation
      const invitationRef = await addDoc(collection(db, 'invitations'), {
        email,
        role,
        token,
        status: 'pending',
        invitedBy,
        createdAt: serverTimestamp(),
        expiresAt
      });
      
      // Clear the cache
      this.clearCache();
      
      return invitationRef.id;
    } catch (err) {
      console.error('Error creating invitation:', err);
      throw err;
    }
  }
  
  /**
   * Accepts an invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<boolean> {
    try {
      // Find the invitation by token
      const invitation = await this.getInvitationByToken(token);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      if (invitation.status !== 'pending') {
        throw new Error('Invitation is no longer valid');
      }
      
      // Check if invitation has expired
      const now = new Date();
      const expiresAt = invitation.expiresAt.toDate();
      
      if (now > expiresAt) {
        // Update invitation status to expired
        await updateDoc(doc(db, 'invitations', invitation.id), {
          status: 'expired',
          updatedAt: serverTimestamp()
        });
        
        this.clearCache();
        throw new Error('Invitation has expired');
      }
      
      // Update invitation status to accepted
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update user role in users collection
      await updateDoc(doc(db, 'users', userId), {
        role: invitation.role,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
      
      return true;
    } catch (err) {
      console.error('Error accepting invitation:', err);
      throw err;
    }
  }
  
  /**
   * Resends an invitation (resets expiration date and generates new token)
   */
  async resendInvitation(invitationId: string): Promise<string> {
    try {
      const invitation = await this.getInvitationById(invitationId);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Generate a new token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Set new expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Update the invitation
      await updateDoc(doc(db, 'invitations', invitationId), {
        token,
        status: 'pending',
        expiresAt,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
      
      return token;
    } catch (err) {
      console.error(`Error resending invitation with ID ${invitationId}:`, err);
      throw err;
    }
  }
  
  /**
   * Cancels an invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'invitations', invitationId));
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error canceling invitation with ID ${invitationId}:`, err);
      throw err;
    }
  }
  
  /**
   * Clears the invitations cache to force a fresh fetch
   */
  clearCache(): void {
    invitationsCache = null;
    lastFetchTime = 0;
  }
}

export default new InvitationService();
