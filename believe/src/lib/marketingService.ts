import { collection, getDocs, doc, getDoc, query, orderBy, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: any;
  validTo: any;
  isActive: boolean;
  products?: string[];
  categories?: string[];
  createdAt: any;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  audience: 'all' | 'new_customers' | 'returning_customers' | 'inactive' | 'custom';
  customAudience?: string[];
  scheduledDate?: any;
  sentDate?: any;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  openRate?: number;
  clickRate?: number;
  createdAt: any;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  position: 'home_hero' | 'home_middle' | 'sidebar' | 'category_top' | 'custom';
  startDate: any;
  endDate: any;
  isActive: boolean;
  createdAt: any;
}

// Store cache in memory
let couponsCache: Coupon[] | null = null;
let campaignsCache: EmailCampaign[] | null = null;
let bannersCache: Banner[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastCouponsFetchTime = 0;
let lastCampaignsFetchTime = 0;
let lastBannersFetchTime = 0;

class MarketingService {
  /**
   * Gets all coupons
   */
  async getAllCoupons(): Promise<Coupon[]> {
    try {
      // Check if we have cached coupons and the cache is still valid
      const now = Date.now();
      if (couponsCache && (now - lastCouponsFetchTime < cacheTTL)) {
        return couponsCache;
      }
      
      const couponsQuery = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(couponsQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const couponsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.code,
          type: data.type,
          value: data.value,
          minPurchase: data.minPurchase,
          maxUses: data.maxUses,
          usedCount: data.usedCount || 0,
          validFrom: data.validFrom,
          validTo: data.validTo,
          isActive: data.isActive,
          products: data.products,
          categories: data.categories,
          createdAt: data.createdAt
        } as Coupon;
      });
      
      // Update cache
      couponsCache = couponsData;
      lastCouponsFetchTime = now;
      
      return couponsCache;
    } catch (err) {
      console.error('Error fetching coupons:', err);
      return [];
    }
  }
  
  /**
   * Gets a specific coupon by ID
   */
  async getCouponById(couponId: string): Promise<Coupon | null> {
    try {
      const docRef = doc(db, 'coupons', couponId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          code: data.code,
          type: data.type,
          value: data.value,
          minPurchase: data.minPurchase,
          maxUses: data.maxUses,
          usedCount: data.usedCount || 0,
          validFrom: data.validFrom,
          validTo: data.validTo,
          isActive: data.isActive,
          products: data.products,
          categories: data.categories,
          createdAt: data.createdAt
        } as Coupon;
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error fetching coupon with ID ${couponId}:`, err);
      return null;
    }
  }
  
  /**
   * Creates a new coupon
   */
  async createCoupon(couponData: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<string> {
    try {
      // Check if coupon code already exists
      const existingQuery = query(
        collection(db, 'coupons'),
        where('code', '==', couponData.code)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('Coupon code already exists');
      }
      
      // Create the coupon
      const couponRef = await addDoc(collection(db, 'coupons'), {
        ...couponData,
        usedCount: 0,
        createdAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCouponsCache();
      
      return couponRef.id;
    } catch (err) {
      console.error('Error creating coupon:', err);
      throw err;
    }
  }
  
  /**
   * Updates a coupon
   */
  async updateCoupon(couponId: string, couponData: Partial<Coupon>): Promise<void> {
    try {
      // If code is being updated, check if the new code already exists
      if (couponData.code) {
        const existingQuery = query(
          collection(db, 'coupons'),
          where('code', '==', couponData.code)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (!existingSnapshot.empty) {
          const existingDoc = existingSnapshot.docs[0];
          if (existingDoc.id !== couponId) {
            throw new Error('Coupon code already exists');
          }
        }
      }
      
      // Update the coupon
      await updateDoc(doc(db, 'coupons', couponId), {
        ...couponData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCouponsCache();
    } catch (err) {
      console.error(`Error updating coupon with ID ${couponId}:`, err);
      throw err;
    }
  }
  
  /**
   * Deletes a coupon
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      
      // Clear the cache
      this.clearCouponsCache();
    } catch (err) {
      console.error(`Error deleting coupon with ID ${couponId}:`, err);
      throw err;
    }
  }
  
  /**
   * Gets all email campaigns
   */
  async getAllEmailCampaigns(): Promise<EmailCampaign[]> {
    try {
      // Check if we have cached campaigns and the cache is still valid
      const now = Date.now();
      if (campaignsCache && (now - lastCampaignsFetchTime < cacheTTL)) {
        return campaignsCache;
      }
      
      const campaignsQuery = query(collection(db, 'emailCampaigns'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(campaignsQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const campaignsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          subject: data.subject,
          content: data.content,
          audience: data.audience,
          customAudience: data.customAudience,
          scheduledDate: data.scheduledDate,
          sentDate: data.sentDate,
          status: data.status,
          openRate: data.openRate,
          clickRate: data.clickRate,
          createdAt: data.createdAt
        } as EmailCampaign;
      });
      
      // Update cache
      campaignsCache = campaignsData;
      lastCampaignsFetchTime = now;
      
      return campaignsCache;
    } catch (err) {
      console.error('Error fetching email campaigns:', err);
      return [];
    }
  }
  
  /**
   * Creates a new email campaign
   */
  async createEmailCampaign(campaignData: Omit<EmailCampaign, 'id' | 'createdAt'>): Promise<string> {
    try {
      const campaignRef = await addDoc(collection(db, 'emailCampaigns'), {
        ...campaignData,
        createdAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCampaignsCache();
      
      return campaignRef.id;
    } catch (err) {
      console.error('Error creating email campaign:', err);
      throw err;
    }
  }
  
  /**
   * Updates an email campaign
   */
  async updateEmailCampaign(campaignId: string, campaignData: Partial<EmailCampaign>): Promise<void> {
    try {
      await updateDoc(doc(db, 'emailCampaigns', campaignId), {
        ...campaignData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCampaignsCache();
    } catch (err) {
      console.error(`Error updating email campaign with ID ${campaignId}:`, err);
      throw err;
    }
  }
  
  /**
   * Deletes an email campaign
   */
  async deleteEmailCampaign(campaignId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'emailCampaigns', campaignId));
      
      // Clear the cache
      this.clearCampaignsCache();
    } catch (err) {
      console.error(`Error deleting email campaign with ID ${campaignId}:`, err);
      throw err;
    }
  }
  
  /**
   * Gets all banners
   */
  async getAllBanners(): Promise<Banner[]> {
    try {
      // Check if we have cached banners and the cache is still valid
      const now = Date.now();
      if (bannersCache && (now - lastBannersFetchTime < cacheTTL)) {
        return bannersCache;
      }
      
      const bannersQuery = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(bannersQuery);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const bannersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          image: data.image,
          link: data.link,
          position: data.position,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
          createdAt: data.createdAt
        } as Banner;
      });
      
      // Update cache
      bannersCache = bannersData;
      lastBannersFetchTime = now;
      
      return bannersCache;
    } catch (err) {
      console.error('Error fetching banners:', err);
      return [];
    }
  }
  
  /**
   * Creates a new banner
   */
  async createBanner(bannerData: Omit<Banner, 'id' | 'createdAt'>): Promise<string> {
    try {
      const bannerRef = await addDoc(collection(db, 'banners'), {
        ...bannerData,
        createdAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearBannersCache();
      
      return bannerRef.id;
    } catch (err) {
      console.error('Error creating banner:', err);
      throw err;
    }
  }
  
  /**
   * Updates a banner
   */
  async updateBanner(bannerId: string, bannerData: Partial<Banner>): Promise<void> {
    try {
      await updateDoc(doc(db, 'banners', bannerId), {
        ...bannerData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearBannersCache();
    } catch (err) {
      console.error(`Error updating banner with ID ${bannerId}:`, err);
      throw err;
    }
  }
  
  /**
   * Deletes a banner
   */
  async deleteBanner(bannerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
      
      // Clear the cache
      this.clearBannersCache();
    } catch (err) {
      console.error(`Error deleting banner with ID ${bannerId}:`, err);
      throw err;
    }
  }
  
  /**
   * Clears the coupons cache
   */
  clearCouponsCache(): void {
    couponsCache = null;
    lastCouponsFetchTime = 0;
  }
  
  /**
   * Clears the campaigns cache
   */
  clearCampaignsCache(): void {
    campaignsCache = null;
    lastCampaignsFetchTime = 0;
  }
  
  /**
   * Clears the banners cache
   */
  clearBannersCache(): void {
    bannersCache = null;
    lastBannersFetchTime = 0;
  }
}

export default new MarketingService();
