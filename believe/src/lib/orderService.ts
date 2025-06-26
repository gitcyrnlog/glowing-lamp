import { collection, getDocs, doc, getDoc, query, orderBy, where, limit, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Product } from './productService';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'completed';

export interface OrderItem {
  productId: string;
  id: string; // Added for compatibility with admin views
  title: string;
  name: string; // Added for compatibility with admin views
  price: number; // Changed from string to number
  quantity: number;
  size?: string;
  color?: string;
  variant?: {
    size?: string;
    color?: string;
  };
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  street?: string; // Added for compatibility with admin views
  street2?: string; // Added for compatibility with admin views
  city: string;
  state: string;
  postalCode: string;
  zip?: string; // Added for compatibility with admin views
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string; // Added for compatibility with admin views
  items: OrderItem[];
  subtotal: number; // Changed from string to number
  tax: number; // Changed from string to number
  shipping: number; // Changed from string to number
  total: number; // Changed from string to number
  discount?: number; // Changed from string to number
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: {
    id: string;
    text: string;
    createdAt: string;
    createdBy: string;
  }[];
  trackingNumber?: string;
  createdAt: any;
  updatedAt: any;
}

// Store cache in memory
let ordersCache: Order[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

class OrderService {
  /**
   * Gets all orders from Firestore
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      // Check if we have cached orders and the cache is still valid
      const now = Date.now();
      if (ordersCache && (now - lastFetchTime < cacheTTL)) {
        return ordersCache;
      }
      
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(ordersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const ordersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: data.items,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          total: data.total,
          status: data.status,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          notes: data.notes,
          trackingNumber: data.trackingNumber,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Order;
      });
      
      // Update cache
      ordersCache = ordersData;
      lastFetchTime = now;
      
      return ordersCache;
    } catch (err) {
      console.error('Error fetching orders:', err);
      return [];
    }
  }
  
  /**
   * Gets a specific order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: data.items,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          total: data.total,
          status: data.status,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          notes: data.notes,
          trackingNumber: data.trackingNumber,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Order;
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error fetching order with ID ${orderId}:`, err);
      return null;
    }
  }
  
  /**
   * Gets orders by user ID
   */
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(ordersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: data.items,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          total: data.total,
          status: data.status,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          notes: data.notes,
          trackingNumber: data.trackingNumber,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Order;
      });
    } catch (err) {
      console.error(`Error fetching orders for user ${userId}:`, err);
      return [];
    }
  }
  
  /**
   * Gets orders by customer ID (alias for getOrdersByUserId)
   * @param customerId Customer ID
   */
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.getOrdersByUserId(customerId);
  }
  
  /**
   * Gets orders by status
   */
  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(ordersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: data.items,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          total: data.total,
          status: data.status,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          notes: data.notes,
          trackingNumber: data.trackingNumber,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Order;
      });
    } catch (err) {
      console.error(`Error fetching orders with status ${status}:`, err);
      return [];
    }
  }
  
  /**
   * Updates an order's status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating status for order ${orderId}:`, err);
      throw err;
    }
  }
  
  /**
   * Updates an order's tracking number
   */
  async updateTrackingNumber(orderId: string, trackingNumber: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        trackingNumber,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating tracking number for order ${orderId}:`, err);
      throw err;
    }
  }
  
  /**
   * Updates an order's notes
   */
  async updateOrderNotes(orderId: string, notes: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        notes,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating notes for order ${orderId}:`, err);
      throw err;
    }
  }
  
  /**
   * Processes a refund for an order
   */
  async processRefund(orderId: string, amount?: string): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      await updateDoc(orderRef, {
        status: 'refunded',
        paymentStatus: 'refunded',
        refundAmount: amount || orderSnap.data().total,
        refundedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error processing refund for order ${orderId}:`, err);
      throw err;
    }
  }
  
  /**
   * Updates an order
   * @param orderId Order ID
   * @param orderData Updated order data
   */
  async updateOrder(orderId: string, orderData: Partial<Order>): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        ...orderData,
        updatedAt: serverTimestamp()
      });
        // Invalidate the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating order with ID ${orderId}:`, err);
      throw err;
    }
  }
  
  /**
   * Clears the orders cache to force a fresh fetch
   */
  clearCache(): void {
    ordersCache = null;
    lastFetchTime = 0;
  }
}

export default new OrderService();
