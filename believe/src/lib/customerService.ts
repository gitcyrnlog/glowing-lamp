import { collection, getDocs, doc, getDoc, query, orderBy, where, limit, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface CustomerAddress {
  addressLine1: string;
  addressLine2?: string;
  street?: string; // Added for compatibility with admin views
  street2?: string; // Added for compatibility with admin views
  city: string;
  state: string;
  postalCode: string;
  zip?: string; // Added for compatibility with admin views
  country: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  email: string;
  displayName: string;
  name: string;  // Changed from optional to required
  phone?: string;
  addresses?: CustomerAddress[];
  address?: CustomerAddress; // Added for compatibility
  defaultAddress?: CustomerAddress;
  totalOrders?: number;
  orderCount?: number; // Added for compatibility
  totalSpent: number; // Changed from optional to required and from string to number
  lastOrderDate?: any;
  lastLogin?: any;  // Added for compatibility
  notes?: {
    id: string;
    text: string;
    createdAt: string;
    createdBy: string;
  }[];
  status: 'active' | 'suspended' | 'banned';
  isActive?: boolean; // Added for compatibility
  isHighValue?: boolean; // Added for compatibility
  isRecentCustomer?: boolean; // Added for compatibility
  subscribedToNewsletter?: boolean; // Added for compatibility
  avatar?: string; // Added for compatibility
  createdAt: any;
  updatedAt?: any;
}

// Store cache in memory
let customersCache: Customer[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

class CustomerService {
  /**
   * Gets all customers from Firestore
   */
  async getAllCustomers(): Promise<Customer[]> {
    try {
      // Check if we have cached customers and the cache is still valid
      const now = Date.now();
      if (customersCache && (now - lastFetchTime < cacheTTL)) {
        return customersCache;
      }
      
      const customersQuery = query(collection(db, 'users'), where('role', '!=', 'admin'), orderBy('role'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(customersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const customersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName || '',
          phone: data.phone,
          addresses: data.addresses || [],
          defaultAddress: data.defaultAddress,
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || '$0',
          lastOrderDate: data.lastOrderDate,
          notes: data.notes,
          status: data.status || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Customer;
      });
      
      // Update cache
      customersCache = customersData;
      lastFetchTime = now;
      
      return customersCache;
    } catch (err) {
      console.error('Error fetching customers:', err);
      return [];
    }
  }
  
  /**
   * Gets a specific customer by ID
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const docRef = doc(db, 'users', customerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().role !== 'admin') {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          displayName: data.displayName || '',
          phone: data.phone,
          addresses: data.addresses || [],
          defaultAddress: data.defaultAddress,
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || '$0',
          lastOrderDate: data.lastOrderDate,
          notes: data.notes,
          status: data.status || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Customer;
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error fetching customer with ID ${customerId}:`, err);
      return null;
    }
  }
  
  /**
   * Updates customer information
   */
  async updateCustomer(customerId: string, customerData: Partial<Customer>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', customerId), {
        ...customerData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating customer with ID ${customerId}:`, err);
      throw err;
    }
  }
  
  /**
   * Updates a customer's status (active/suspended/banned)
   */
  async updateCustomerStatus(customerId: string, status: 'active' | 'suspended' | 'banned'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', customerId), {
        status,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating status for customer ${customerId}:`, err);
      throw err;
    }
  }
    /**
   * Gets high-value customers (based on total spent)
   */
  async getHighValueCustomers(limitCount: number = 10): Promise<Customer[]> {
    try {
      const customersQuery = query(
        collection(db, 'users'),
        where('role', '!=', 'admin'),
        orderBy('totalSpent', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(customersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName || '',
          phone: data.phone,
          addresses: data.addresses || [],
          defaultAddress: data.defaultAddress,
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || '$0',
          lastOrderDate: data.lastOrderDate,
          notes: data.notes,
          status: data.status || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Customer;
      });
    } catch (err) {
      console.error('Error fetching high-value customers:', err);
      return [];
    }
  }
    /**
   * Gets recent customers
   */
  async getRecentCustomers(limitCount: number = 10): Promise<Customer[]> {
    try {
      const customersQuery = query(
        collection(db, 'users'),
        where('role', '!=', 'admin'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(customersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName || '',
          phone: data.phone,
          addresses: data.addresses || [],
          defaultAddress: data.defaultAddress,
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || '$0',
          lastOrderDate: data.lastOrderDate,
          notes: data.notes,
          status: data.status || 'active',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Customer;
      });
    } catch (err) {
      console.error('Error fetching recent customers:', err);
      return [];
    }
  }
  
  /**
   * Clears the customers cache to force a fresh fetch
   */
  clearCache(): void {
    customersCache = null;
    lastFetchTime = 0;
  }
}

export default new CustomerService();
