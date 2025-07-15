import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface SiteConfig {
  name: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  hero: {
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
  featuredProducts: string[];
  featuredCategories: string[];
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  footer: {
    columns: {
      title: string;
      links: { text: string; url: string }[];
    }[];
    bottomText: string;
  };
  updatedAt: any;
}

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  isExternal?: boolean;
  children?: NavigationItem[];
  order: number;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
}

// Store cache in memory
let configCache: SiteConfig | null = null;
let navigationCache: NavigationItem[] | null = null;
let pagesCache: CustomPage[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastConfigFetchTime = 0;
let lastNavigationFetchTime = 0;
let lastPagesFetchTime = 0;

class SiteConfigService {
  /**
   * Gets the site configuration
   */
  async getSiteConfig(): Promise<SiteConfig> {
    try {
      // Check if we have cached config and the cache is still valid
      const now = Date.now();
      if (configCache && (now - lastConfigFetchTime < cacheTTL)) {
        return configCache;
      }
      
      const docRef = doc(db, 'config', 'site');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        configCache = data as SiteConfig;
        lastConfigFetchTime = now;
        return configCache;
      } else {
        // If no config exists, return default values
        return this.getDefaultConfig();
      }
    } catch (err) {
      console.error('Error fetching site config:', err);
      return this.getDefaultConfig();
    }
  }
  
  /**
   * Updates the site configuration
   */
  async updateSiteConfig(configData: Partial<SiteConfig>, logoFile?: File, faviconFile?: File, heroImageFile?: File): Promise<void> {
    try {
      const updateData: Partial<SiteConfig> = {
        ...configData,
        updatedAt: serverTimestamp()
      };
      
      // Handle logo upload if provided
      if (logoFile) {
        const storageRef = ref(storage, `site/logo.${logoFile.name.split('.').pop()}`);
        await uploadBytes(storageRef, logoFile);
        updateData.logo = await getDownloadURL(storageRef);
      }
      
      // Handle favicon upload if provided
      if (faviconFile) {
        const storageRef = ref(storage, `site/favicon.${faviconFile.name.split('.').pop()}`);
        await uploadBytes(storageRef, faviconFile);
        updateData.favicon = await getDownloadURL(storageRef);
      }
      
      // Handle hero image upload if provided
      if (heroImageFile && updateData.hero) {
        const storageRef = ref(storage, `site/hero.${heroImageFile.name.split('.').pop()}`);
        await uploadBytes(storageRef, heroImageFile);
        const heroImageUrl = await getDownloadURL(storageRef);
        
        updateData.hero = {
          ...(updateData.hero || {}),
          image: heroImageUrl
        };
      }
      
      // Update the config in Firestore
      const configRef = doc(db, 'config', 'site');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        await updateDoc(configRef, updateData);
      } else {
        // If config doesn't exist yet, create it
        await setDoc(configRef, {
          ...this.getDefaultConfig(),
          ...updateData
        });
      }
      
      // Clear the cache
      this.clearConfigCache();
    } catch (err) {
      console.error('Error updating site config:', err);
      throw err;
    }
  }
  
  /**
   * Gets the navigation menu
   */
  async getNavigation(): Promise<NavigationItem[]> {
    try {
      // Check if we have cached navigation and the cache is still valid
      const now = Date.now();
      if (navigationCache && (now - lastNavigationFetchTime < cacheTTL)) {
        return navigationCache;
      }
      
      const querySnapshot = await getDocs(collection(db, 'navigation'));
      
      if (querySnapshot.empty) {
        // Return default navigation
        return this.getDefaultNavigation();
      }
      
      const navigationItems = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as NavigationItem))
        .sort((a, b) => a.order - b.order);
      
      navigationCache = navigationItems;
      lastNavigationFetchTime = now;
      
      return navigationCache;
    } catch (err) {
      console.error('Error fetching navigation:', err);
      return this.getDefaultNavigation();
    }
  }
  
  /**
   * Updates a navigation item
   */
  async updateNavigationItem(itemId: string, itemData: Partial<NavigationItem>): Promise<void> {
    try {
      const navRef = doc(db, 'navigation', itemId);
      await updateDoc(navRef, {
        ...itemData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearNavigationCache();
    } catch (err) {
      console.error(`Error updating navigation item with ID ${itemId}:`, err);
      throw err;
    }
  }
  
  /**
   * Creates a navigation item
   */
  async createNavigationItem(itemData: Omit<NavigationItem, 'id'>): Promise<string> {
    try {
      // Get the highest order number to append this item at the end
      const querySnapshot = await getDocs(collection(db, 'navigation'));
      const highestOrder = querySnapshot.docs.reduce((max, doc) => {
        const order = doc.data().order || 0;
        return order > max ? order : max;
      }, 0);
      
      // Create new navigation item
      const newItemRef = doc(collection(db, 'navigation'));
      await setDoc(newItemRef, {
        ...itemData,
        order: highestOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearNavigationCache();
      
      return newItemRef.id;
    } catch (err) {
      console.error('Error creating navigation item:', err);
      throw err;
    }
  }
  
  /**
   * Deletes a navigation item
   */
  async deleteNavigationItem(itemId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'navigation', itemId), {
        deleted: true,
        deletedAt: serverTimestamp()
      }, { merge: true });
      
      // Clear the cache
      this.clearNavigationCache();
    } catch (err) {
      console.error(`Error deleting navigation item with ID ${itemId}:`, err);
      throw err;
    }
  }
  
  /**
   * Gets all custom pages
   */
  async getCustomPages(): Promise<CustomPage[]> {
    try {
      // Check if we have cached pages and the cache is still valid
      const now = Date.now();
      if (pagesCache && (now - lastPagesFetchTime < cacheTTL)) {
        return pagesCache;
      }
      
      const querySnapshot = await getDocs(collection(db, 'pages'));
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const pages = querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as CustomPage));
      
      pagesCache = pages;
      lastPagesFetchTime = now;
      
      return pagesCache;
    } catch (err) {
      console.error('Error fetching custom pages:', err);
      return [];
    }
  }
  
  /**
   * Gets a custom page by slug
   */
  async getCustomPageBySlug(slug: string): Promise<CustomPage | null> {
    try {
      // Try to get from cache first
      if (pagesCache) {
        const cachedPage = pagesCache.find(page => page.slug === slug);
        if (cachedPage) {
          return cachedPage;
        }
      }
      
      const pagesQuery = await getDocs(collection(db, 'pages'));
      
      for (const doc of pagesQuery.docs) {
        const data = doc.data();
        if (data.slug === slug) {
          return {
            id: doc.id,
            ...data
          } as CustomPage;
        }
      }
      
      return null;
    } catch (err) {
      console.error(`Error fetching page with slug ${slug}:`, err);
      return null;
    }
  }
  
  /**
   * Creates a custom page
   */
  async createCustomPage(pageData: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if slug already exists
      const existingPage = await this.getCustomPageBySlug(pageData.slug);
      if (existingPage) {
        throw new Error(`Page with slug "${pageData.slug}" already exists`);
      }
      
      const pageRef = doc(collection(db, 'pages'));
      await setDoc(pageRef, {
        ...pageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearPagesCache();
      
      return pageRef.id;
    } catch (err) {
      console.error('Error creating custom page:', err);
      throw err;
    }
  }
  
  /**
   * Updates a custom page
   */
  async updateCustomPage(pageId: string, pageData: Partial<CustomPage>): Promise<void> {
    try {
      // If slug is being updated, check if the new slug already exists
      if (pageData.slug) {
        const existingPage = await this.getCustomPageBySlug(pageData.slug);
        if (existingPage && existingPage.id !== pageId) {
          throw new Error(`Page with slug "${pageData.slug}" already exists`);
        }
      }
      
      await updateDoc(doc(db, 'pages', pageId), {
        ...pageData,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearPagesCache();
    } catch (err) {
      console.error(`Error updating page with ID ${pageId}:`, err);
      throw err;
    }
  }
  
  /**
   * Deletes a custom page
   */
  async deleteCustomPage(pageId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'pages', pageId), {
        deleted: true,
        deletedAt: serverTimestamp()
      }, { merge: true });
      
      // Clear the cache
      this.clearPagesCache();
    } catch (err) {
      console.error(`Error deleting page with ID ${pageId}:`, err);
      throw err;
    }
  }
  
  /**
   * Gets default site configuration
   */
  private getDefaultConfig(): SiteConfig {
    return {
      name: 'Believe in the Designs',
      logo: '/glowing-lamp/logo.png',
      favicon: '/favicon.ico',
      colors: {
        primary: '#BD9526',
        secondary: '#14452F',
        accent: '#FFFFFF',
        background: '#000000',
        text: '#FFFFFF'
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
      },
      hero: {
        title: 'Premium Quality Apparel',
        subtitle: 'Exclusive designs for the true believers',
        image: '/glowing-lamp/TrueBeliever.jpg',
        buttonText: 'Shop Now',
        buttonLink: '/products'
      },
      featuredProducts: [],
      featuredCategories: [],
      social: {
        instagram: 'https://instagram.com/believeinthedesigns',
      },
      contact: {
        email: 'info@believeinthedesigns.com',
      },
      footer: {
        columns: [
          {
            title: 'Shop',
            links: [
              { text: 'All Products', url: '/products' },
              { text: 'Categories', url: '/categories' },
              { text: 'Featured', url: '/products?featured=true' },
            ]
          },
          {
            title: 'Information',
            links: [
              { text: 'About Us', url: '/about' },
              { text: 'Contact', url: '/contact' },
              { text: 'FAQ', url: '/faq' },
            ]
          },
          {
            title: 'Account',
            links: [
              { text: 'My Account', url: '/profile' },
              { text: 'My Orders', url: '/profile/orders' },
              { text: 'Wishlist', url: '/wishlist' },
            ]
          }
        ],
        bottomText: '© 2025 Believe in the Designs. All rights reserved.'
      },
      updatedAt: serverTimestamp()
    };
  }
  
  /**
   * Gets default navigation items
   */
  private getDefaultNavigation(): NavigationItem[] {
    return [
      {
        id: 'home',
        title: 'Home',
        url: '/',
        order: 1
      },
      {
        id: 'products',
        title: 'Products',
        url: '/products',
        order: 2
      },
      {
        id: 'categories',
        title: 'Categories',
        url: '/categories',
        order: 3
      },
      {
        id: 'about',
        title: 'About',
        url: '/about',
        order: 4
      },
      {
        id: 'contact',
        title: 'Contact',
        url: '/contact',
        order: 5
      }
    ];
  }
  
  /**
   * Clears the config cache
   */
  clearConfigCache(): void {
    configCache = null;
    lastConfigFetchTime = 0;
  }
  
  /**
   * Clears the navigation cache
   */
  clearNavigationCache(): void {
    navigationCache = null;
    lastNavigationFetchTime = 0;
  }
  
  /**
   * Clears the pages cache
   */
  clearPagesCache(): void {
    pagesCache = null;
    lastPagesFetchTime = 0;
  }
}

export default new SiteConfigService();
