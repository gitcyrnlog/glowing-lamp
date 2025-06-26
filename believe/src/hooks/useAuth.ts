import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AuthUser extends User {
  role?: string;
  permissions?: string[];
  isAdmin?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const enhancedUser = {
              ...firebaseUser,
              role: userData.role || 'customer',
              permissions: userData.permissions || [],
              isAdmin: userData.role === 'admin'
            } as AuthUser;
            
            // Update last login timestamp
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: serverTimestamp()
            }, { merge: true });
            
            setUser(enhancedUser);
          } else {
            // If user document doesn't exist in Firestore, create it
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'customer',
              permissions: ['view'],
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });
            
            setUser({
              ...firebaseUser,
              role: 'customer',
              permissions: ['view'],
              isAdmin: false
            } as AuthUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (userCredential.user) {
      // Update display name in Firebase Auth
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        photoURL: userCredential.user.photoURL || '',
        role: 'customer',
        permissions: ['view'],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    }
    
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if this is the first time the user is signing in with Google
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        role: 'customer',
        permissions: ['view'],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    }
    
    return result;
  };

  const logout = async () => {
    return signOut(auth);
  };

  return { user, loading, login, signUp, loginWithGoogle, logout };
}
