import { collection, getDocs, doc, getDoc, query, orderBy, where, limit, addDoc, updateDoc, deleteDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  featured?: boolean;
  inventory?: number;
  sizes?: string[];
  variants?: ProductVariant[];
  images?: string[];
  tags?: string[];
  salePrice?: string;
  isPublished?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

// Fallback products if Firebase fetch fails
export const fallbackProducts: Product[] = [
  {
    id: '1',
    title: 'BITD "True Believer" Black T-Shirt',
    image: '/glowing-lamp/TrueBeliever.jpg',
    price: '$3000',
    category: 'T-Shirts',
    description: 'Premium quality True Believer black T-Shirt with unique design.',
    featured: true,
    inventory: 10,
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '2',
    title: 'BITD "True Believer" White T-Shirt',
    image: '/glowing-lamp/WhiteTruBlv.jpg',
    price: '$3000',
    category: 'T-Shirts',
    description: 'Premium quality True Believer white T-Shirt with unique design.',
    featured: true,
    inventory: 8,
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '3',
    title: 'Believe in the Designs T-Shirt, Black',
    image: '/glowing-lamp/BelieveDesigns.jpg',
    price: '$3500',
    category: 'T-Shirts',
    description: 'Premium quality Believe in the Designs black T-Shirt.',
    featured: true,
    inventory: 12,
    sizes: ['S', 'M', 'L', 'XL']
  }
];

// Store cache in memory
let productsCache: Product[] | null = null;
let cacheTTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

class ProductService {
  /**
   * Gets all products from Firestore
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      // Check if we have cached products and the cache is still valid
      const now = Date.now();
      if (productsCache && (now - lastFetchTime < cacheTTL)) {
        return productsCache;
      }
      
      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(productsQuery);
      
      if (querySnapshot.empty) {
        // If no products in Firebase, use fallback
        return fallbackProducts;
      }
      
      const productsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image,
          category: data.category,
          featured: data.featured || false,
          inventory: data.inventory || 0,
          sizes: data.sizes || ['S', 'M', 'L', 'XL'],
          createdAt: data.createdAt
        } as Product;
      });
      
      // Update cache
      productsCache = productsData.length > 0 ? productsData : fallbackProducts;
      lastFetchTime = now;
      
      return productsCache;
    } catch (err) {
      console.error('Error fetching products:', err);
      return fallbackProducts;
    }
  }
  
  /**
   * Gets a specific product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image,
          category: data.category,
          featured: data.featured || false,
          inventory: data.inventory || 0,
          sizes: data.sizes || ['S', 'M', 'L', 'XL'],
          createdAt: data.createdAt
        } as Product;
      } else {
        // Try to find the product in the fallback data
        const fallbackProduct = fallbackProducts.find(prod => prod.id === productId);
        return fallbackProduct || null;
      }
    } catch (err) {
      console.error(`Error fetching product with ID ${productId}:`, err);
      // Try to find the product in the fallback data
      const fallbackProduct = fallbackProducts.find(prod => prod.id === productId);
      return fallbackProduct || null;
    }
  }
  
  /**
   * Gets products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(productsQuery);
      
      if (querySnapshot.empty) {
        // If no products in this category in Firebase, filter the fallback
        return fallbackProducts.filter(prod => prod.category === category);
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image,
          category: data.category,
          featured: data.featured || false,
          inventory: data.inventory || 0,
          sizes: data.sizes || ['S', 'M', 'L', 'XL'],
          createdAt: data.createdAt
        } as Product;
      });
    } catch (err) {
      console.error(`Error fetching products for category ${category}:`, err);
      return fallbackProducts.filter(prod => prod.category === category);
    }
  }
  
  /**
   * Gets featured products
   */
  async getFeaturedProducts(count: number = 3): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('featured', '==', true),
        limit(count)
      );
      const querySnapshot = await getDocs(productsQuery);
      
      if (querySnapshot.empty) {
        // If no featured products in Firebase, filter the fallback
        return fallbackProducts.filter(prod => prod.featured).slice(0, count);
      }
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image,
          category: data.category,
          featured: data.featured || false,
          inventory: data.inventory || 0,
          sizes: data.sizes || ['S', 'M', 'L', 'XL'],
          createdAt: data.createdAt
        } as Product;
      });
    } catch (err) {
      console.error('Error fetching featured products:', err);
      return fallbackProducts.filter(prod => prod.featured).slice(0, count);
    }
  }
  
  /**
   * Search products by query
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      // In a real app, you would use Algolia, Firebase Extensions, or a custom search solution
      // For now, we'll fetch all products and filter client-side
      const allProducts = await this.getAllProducts();
      
      if (!query.trim()) {
        return allProducts;
      }
      
      const lowerQuery = query.toLowerCase();
      return allProducts.filter(product => 
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      );
    } catch (err) {
      console.error(`Error searching products for "${query}":`, err);
      
      // Fallback to client-side search of fallback products
      const lowerQuery = query.toLowerCase();
      return fallbackProducts.filter(product => 
        product.title.toLowerCase().includes(lowerQuery) ||
        (product.description?.toLowerCase().includes(lowerQuery)) ||
        product.category.toLowerCase().includes(lowerQuery)
      );    }
  }
  
  /**
   * Creates a new product
   */
  async createProduct(productData: Omit<Product, 'id'>, imageFile?: File): Promise<string> {
    try {
      let imageUrl = productData.image;
      
      // If an image file is provided, upload it to Firebase Storage
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Create the product in Firestore
      const productRef = await addDoc(collection(db, 'products'), {
        ...productData,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: productData.isPublished ?? true
      });
      
      // Clear the cache
      this.clearCache();
      
      return productRef.id;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  }
  
  /**
   * Updates an existing product
   */
  async updateProduct(productId: string, productData: Partial<Product>, imageFile?: File): Promise<void> {
    try {
      let updateData: Partial<Product> = {
        ...productData,
        updatedAt: serverTimestamp()
      };
      
      // If an image file is provided, upload it to Firebase Storage
      if (imageFile) {
        // Delete old image if it's a Firebase Storage URL
        const oldProductSnap = await getDoc(doc(db, 'products', productId));
        if (oldProductSnap.exists()) {
          const oldImageUrl = oldProductSnap.data().image;
          if (oldImageUrl && oldImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
            try {
              // Extract the path from the URL
              const oldImagePath = oldImageUrl.split('products%2F')[1].split('?')[0];
              const oldImageRef = ref(storage, `products/${oldImagePath}`);
              await deleteObject(oldImageRef);
            } catch (error) {
              console.warn('Could not delete old image:', error);
              // Continue even if old image deletion fails
            }
          }
        }
        
        // Upload new image
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const newImageUrl = await getDownloadURL(storageRef);
        updateData.image = newImageUrl;
      }
      
      // Update the product in Firestore
      await updateDoc(doc(db, 'products', productId), updateData);
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating product with ID ${productId}:`, err);
      throw err;
    }
  }
  
  /**
   * Deletes a product
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      // Get the product to check if it has an image to delete
      const productSnap = await getDoc(doc(db, 'products', productId));
      
      if (productSnap.exists()) {
        const imageUrl = productSnap.data().image;
        
        // Delete the product from Firestore
        await deleteDoc(doc(db, 'products', productId));
        
        // Delete the product image from Storage if it's a Firebase Storage URL
        if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
          try {
            // Extract the path from the URL
            const imagePath = imageUrl.split('products%2F')[1].split('?')[0];
            const imageRef = ref(storage, `products/${imagePath}`);
            await deleteObject(imageRef);
          } catch (error) {
            console.warn('Could not delete product image:', error);
            // Continue even if image deletion fails
          }
        }
        
        // Clear the cache
        this.clearCache();
      } else {
        throw new Error(`Product with ID ${productId} not found`);
      }
    } catch (err) {
      console.error(`Error deleting product with ID ${productId}:`, err);
      throw err;
    }
  }
  
  /**
   * Toggle product visibility (publish/unpublish)
   */
  async toggleProductVisibility(productId: string, isPublished: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        isPublished,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error toggling visibility for product with ID ${productId}:`, err);
      throw err;
    }
  }
  
  /**
   * Toggle featured status
   */
  async toggleFeaturedStatus(productId: string, featured: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        featured,
        updatedAt: serverTimestamp()
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error toggling featured status for product with ID ${productId}:`, err);
      throw err;
    }
  }
  
  /**
   * Update product variants
   */
  async updateProductVariants(productId: string, variants: ProductVariant[]): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        variants,
        updatedAt: serverTimestamp()
      });
      
      // Update inventory count based on total stock in variants
      const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
      await updateDoc(doc(db, 'products', productId), {
        inventory: totalStock
      });
      
      // Clear the cache
      this.clearCache();
    } catch (err) {
      console.error(`Error updating variants for product with ID ${productId}:`, err);
      throw err;
    }
  }
  
  /**
   * Bulk import products from CSV data
   */
  async bulkImportProducts(productsData: Partial<Product>[]): Promise<number> {
    try {
      let importCount = 0;
      
      for (const productData of productsData) {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPublished: productData.isPublished ?? true
        });
        importCount++;
      }
      
      // Clear the cache
      this.clearCache();
      
      return importCount;
    } catch (err) {
      console.error('Error bulk importing products:', err);
      throw err;
    }
  }
  
  /**
   * Clears the products cache to force a fresh fetch
   */
  clearCache(): void {
    productsCache = null;
    lastFetchTime = 0;
  }
}

export default new ProductService();
