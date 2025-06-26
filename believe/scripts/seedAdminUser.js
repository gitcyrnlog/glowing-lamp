// This script can be run once to seed an admin user to Firestore
// Save this file as scripts/seedAdminUser.js and run with Node

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import dotenv from 'dotenv';
import { prompt } from 'enquirer';

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
const auth = getAuth(app);

async function createAdminUser() {
  try {
    // Prompt for admin user details
    const emailPrompt = await prompt({
      type: 'input',
      name: 'email',
      message: 'Enter admin email:'
    });

    const passwordPrompt = await prompt({
      type: 'password',
      name: 'password',
      message: 'Enter admin password (min 8 characters):'
    });

    const namePrompt = await prompt({
      type: 'input',
      name: 'name',
      message: 'Enter admin name:'
    });

    const { email } = emailPrompt;
    const { password } = passwordPrompt;
    const { name } = namePrompt;

    // Create user or sign in if exists
    let userCredential;
    
    try {
      // Try to create new user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Admin user created successfully');
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('User already exists, signing in instead...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw error;
      }
    }

    // Set admin role in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: name,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    });

    console.log(`Admin role assigned to ${email} successfully!`);
    console.log(`User ID: ${userCredential.user.uid}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

// Run the admin user creation function
createAdminUser();
