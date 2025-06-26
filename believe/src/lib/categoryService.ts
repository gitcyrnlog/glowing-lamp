import { collection, getDocs, doc, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
  status: 'available' | 'coming-soon';
  order?: number;
}

// Fallback categories if Firebase fetch fails
export const fallbackCategories: Category[] = [
  {
    id: 1,
    name: 'T-Shirts',
    description: 'Premium quality T-Shirts with unique designs and comfortable fabrics.',
    image: '/TrueBeliever.jpg',
    productCount: 3,
    status: 'available'
  },
  {
    id: 2,
    name: 'Men\'s Shorts',
    description: 'High-quality shorts designed for comfort and style.',
    image: 'https://via.placeholder.com/800x600/BD9526/000000?text=Men\'s+Shorts',
    productCount: 0,
    status: 'coming-soon'
  },
  {
    id: 3,
    name: 'Joggers',
    description: 'Comfortable and stylish joggers for everyday wear.',
    image: 'https://via.placeholder.com/800x600/000000/BD9526?text=Joggers',
    productCount: 0,
    status: 'coming-soon'
  },
  {
    id: 4,
    name: 'Hoodies',
    description: 'Premium hoodies to keep you warm and stylish.',
    image: 'https://via.placeholder.com/800x600/14452F/FFFFFF?text=Hoodies',
    productCount: 0,
    status: 'coming-soon'
  }
];

// Store cache in memory
let categoriesCache: Category[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

class CategoryService {
  /**
   * Gets all categories from Firestore, sorted by order
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      // Check if we have cached categories and the cache is still valid
      const now = Date.now();
      if (categoriesCache && (now - lastFetchTime < cacheTTL)) {
        return categoriesCache;
      }
      
      const categoriesQuery = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(categoriesQuery);
      
      if (querySnapshot.empty) {
        // If no categories in Firebase, use fallback
        return fallbackCategories;
      }
      
      const categoriesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id || parseInt(doc.id, 10),
          name: data.name,
          description: data.description,
          image: data.image,
          productCount: data.productCount || 0,
          status: data.status || 'coming-soon',
          order: data.order
        } as Category;
      });
      
      // Filter categories to only include the ones we want
      const filteredCategories = categoriesData.filter(cat => 
        ['T-Shirts', 'Men\'s Shorts', 'Joggers', 'Hoodies'].includes(cat.name)
      );
      
      // Update cache
      categoriesCache = filteredCategories.length > 0 ? filteredCategories : fallbackCategories;
      lastFetchTime = now;
      
      return categoriesCache;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return fallbackCategories;
    }
  }
  
  /**
   * Gets a specific category by ID
   */
  async getCategoryById(categoryId: number): Promise<Category | null> {
    try {
      const docRef = doc(db, 'categories', categoryId.toString());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          image: data.image,
          productCount: data.productCount || 0,
          status: data.status,
          order: data.order
        } as Category;
      } else {
        // Try to find the category in the fallback data
        const fallbackCategory = fallbackCategories.find(cat => cat.id === categoryId);
        return fallbackCategory || null;
      }
    } catch (err) {
      console.error(`Error fetching category with ID ${categoryId}:`, err);
      // Try to find the category in the fallback data
      const fallbackCategory = fallbackCategories.find(cat => cat.id === categoryId);
      return fallbackCategory || null;
    }
  }
  
  /**
   * Gets available categories (status = 'available')
   */
  async getAvailableCategories(): Promise<Category[]> {
    try {
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('status', '==', 'available'),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(categoriesQuery);
      
      if (querySnapshot.empty) {
        // If no available categories in Firebase, filter the fallback
        return fallbackCategories.filter(cat => cat.status === 'available');
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id || parseInt(doc.id, 10),
          name: data.name,
          description: data.description,
          image: data.image,
          productCount: data.productCount || 0,
          status: data.status,
          order: data.order
        } as Category;
      });
    } catch (err) {
      console.error('Error fetching available categories:', err);
      return fallbackCategories.filter(cat => cat.status === 'available');
    }
  }
  
  /**
   * Clears the categories cache to force a fresh fetch
   */
  clearCache(): void {
    categoriesCache = null;
    lastFetchTime = 0;
  }
}

export default new CategoryService();
