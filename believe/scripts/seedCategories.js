// This script can be run once to seed the initial categories data to Firestore
// Save this file as scripts/seedCategories.js and run with Node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Categories data
const categories = [
  {
    id: 1,
    name: 'T-Shirts',
    description: 'Premium quality T-Shirts with unique designs and comfortable fabrics.',
    image: '/TrueBeliever.jpg',
    productCount: 3,
    status: 'available',
    order: 1
  },
  {
    id: 2,
    name: 'Men\'s Shorts',
    description: 'High-quality shorts designed for comfort and style.',
    image: 'https://via.placeholder.com/800x600/BD9526/000000?text=Men\'s+Shorts',
    productCount: 0,
    status: 'coming-soon',
    order: 2
  },
  {
    id: 3,
    name: 'Joggers',
    description: 'Comfortable and stylish joggers for everyday wear.',
    image: 'https://via.placeholder.com/800x600/000000/BD9526?text=Joggers',
    productCount: 0,
    status: 'coming-soon',
    order: 3
  },
  {
    id: 4,
    name: 'Hoodies',
    description: 'Premium hoodies to keep you warm and stylish.',
    image: 'https://via.placeholder.com/800x600/14452F/FFFFFF?text=Hoodies',
    productCount: 0,
    status: 'coming-soon',
    order: 4
  }
];

// Clear existing categories and seed new ones
async function seedCategories() {
  try {
    // First, clear existing categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const deletePromises = categoriesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('Existing categories cleared.');
    
    // Then add new categories
    const addPromises = categories.map(category => 
      setDoc(doc(db, 'categories', category.id.toString()), category)
    );
    
    await Promise.all(addPromises);
    console.log('Categories successfully seeded!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    process.exit();
  }
}

// Run the seed function
seedCategories();
