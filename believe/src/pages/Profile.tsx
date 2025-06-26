import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthContext } from '../features/auth/AuthContext';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import {
  User as UserIcon,
  Mail,
  Lock,
  CreditCard,
  ShoppingBag,
  Settings,
  LogOut,
  Home,
  MapPin,
  Phone,
  Edit2,
  Eye,
  EyeOff,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Define interfaces for the profile data
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  date: Date;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

interface UserProfile {
  displayName: string;
  email: string;
  phoneNumber: string;
  address: Address;
  orders: Order[];
}

// Input validation utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

const validatePhone = (phone: string): boolean => {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const sanitizeInput = (input: string): string => {
  // Basic sanitization - remove script tags and trim
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

export default function Profile() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  // State for profile tabs
  const [activeTab, setActiveTab] = useState('personal');
  
  // State for user profile data
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    orders: []
  });
  
  // State for form editing
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      try {
        // Get user profile from Firestore
        const profileRef = doc(db, 'userProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          // Merge Firebase auth data with Firestore profile data
          const profileData = profileSnap.data() as Partial<UserProfile>;
          
          setProfile(prev => ({
            ...prev,
            displayName: user.displayName || prev.displayName,
            email: user.email || prev.email,
            phoneNumber: profileData.phoneNumber || prev.phoneNumber,
            address: profileData.address || prev.address
          }));
        } else {
          // If no profile exists yet, initialize with Firebase auth data
          setProfile(prev => ({
            ...prev,
            displayName: user.displayName || '',
            email: user.email || ''
          }));
          
          // Create a new profile document
          await setDoc(profileRef, {
            phoneNumber: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification('error', 'Failed to load profile information');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Load user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoadingOrders(false);
        return;
      }

      try {
        // Query orders collection for user's orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData: Order[] = [];
        
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            date: data.date.toDate(),
            total: data.total,
            status: data.status,
            items: data.items
          });
        });
        
        setProfile(prev => ({
          ...prev,
          orders: ordersData
        }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Handle personal info update
  const handleUpdatePersonal = async () => {
    if (!user) return;
    
    const sanitizedName = sanitizeInput(profile.displayName);
    const sanitizedEmail = sanitizeInput(profile.email);
    const sanitizedPhone = sanitizeInput(profile.phoneNumber);
    
    // Validate inputs
    if (sanitizedName.length < 2) {
      showNotification('error', 'Name must be at least 2 characters long');
      return;
    }
    
    if (!validateEmail(sanitizedEmail)) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }
    
    if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
      showNotification('error', 'Please enter a valid phone number');
      return;
    }
    
    setSavingPersonal(true);
    
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: sanitizedName
      });
      
      // Update email if changed
      if (user.email !== sanitizedEmail) {
        await updateEmail(user, sanitizedEmail);
      }
      
      // Update Firestore profile
      const profileRef = doc(db, 'userProfiles', user.uid);
      await setDoc(profileRef, {
        phoneNumber: sanitizedPhone,
        address: profile.address
      }, { merge: true });
      
      setIsEditingPersonal(false);
      showNotification('success', 'Personal information updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        showNotification('error', 'For security reasons, please sign in again before changing your email');
      } else if (error.code === 'auth/email-already-in-use') {
        showNotification('error', 'Email is already in use by another account');
      } else {
        showNotification('error', 'Failed to update profile information');
      }
    } finally {
      setSavingPersonal(false);
    }
  };

  // Handle address update
  const handleUpdateAddress = async () => {
    if (!user) return;
    
    // Sanitize address fields
    const sanitizedAddress = {
      street: sanitizeInput(profile.address.street),
      city: sanitizeInput(profile.address.city),
      state: sanitizeInput(profile.address.state),
      zipCode: sanitizeInput(profile.address.zipCode),
      country: sanitizeInput(profile.address.country)
    };
    
    setSavingAddress(true);
    
    try {
      // Update Firestore profile with address
      const profileRef = doc(db, 'userProfiles', user.uid);
      await setDoc(profileRef, {
        phoneNumber: profile.phoneNumber,
        address: sanitizedAddress
      }, { merge: true });
      
      setProfile(prev => ({
        ...prev,
        address: sanitizedAddress
      }));
      
      setIsEditingAddress(false);
      showNotification('success', 'Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      showNotification('error', 'Failed to update address information');
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!user) return;
    
    // Validate inputs
    if (!passwordData.currentPassword) {
      showNotification('error', 'Please enter your current password');
      return;
    }
    
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.valid) {
      showNotification('error', passwordValidation.message || 'Password does not meet requirements');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showNotification('success', 'Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        showNotification('error', 'Current password is incorrect');
      } else {
        showNotification('error', 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      showNotification('error', 'Failed to sign out');
    }
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get status badge color
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      case 'shipped':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'delivered':
        return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="w-16 h-16 border-t-4 border-violet-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {user?.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user?.displayName || 'User'}</h3>
                  <p className="text-sm text-zinc-400">{user?.email}</p>
                </div>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'personal'
                        ? 'bg-violet-900/20 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Personal Info</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'address'
                        ? 'bg-violet-900/20 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                    <span>Address</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'security'
                        ? 'bg-violet-900/20 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    <span>Security</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-violet-900/20 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>Orders</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'payments'
                        ? 'bg-violet-900/20 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Methods</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-violet-900/20 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="pt-4 border-t border-zinc-800 mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Notification */}
            {notification && (
              <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
                notification.type === 'success'
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-auto flex-shrink-0 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Personal Information</h2>
                  <button
                    onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                    className="flex items-center space-x-2 text-violet-400 hover:text-violet-300"
                  >
                    {isEditingPersonal ? (
                      <>
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-5 w-5" />
                        <span>Edit</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-6">
                  {loadingProfile ? (
                    <div className="flex justify-center py-8">
                      <div className="w-10 h-10 border-t-4 border-violet-500 border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-400">Full Name</label>
                        {isEditingPersonal ? (
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input
                              type="text"
                              value={profile.displayName}
                              onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                              className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 py-3 px-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                            <UserIcon className="h-5 w-5 text-zinc-500" />
                            <span>{profile.displayName || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-400">Email Address</label>
                        {isEditingPersonal ? (
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({...profile, email: e.target.value})}
                              className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 py-3 px-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                            <Mail className="h-5 w-5 text-zinc-500" />
                            <span>{profile.email || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-400">Phone Number</label>
                        {isEditingPersonal ? (
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-zinc-500" />
                            </div>
                            <input
                              type="tel"
                              value={profile.phoneNumber}
                              onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                              className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 py-3 px-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                            <Phone className="h-5 w-5 text-zinc-500" />
                            <span>{profile.phoneNumber || 'Not set'}</span>
                          </div>
                        )}
                      </div>
                      
                      {isEditingPersonal && (
                        <div className="pt-4">
                          <button
                            onClick={handleUpdatePersonal}
                            disabled={savingPersonal}
                            className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all disabled:opacity-70"
                          >
                            {savingPersonal ? (
                              <>
                                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-5 w-5" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Address</h2>
                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="flex items-center space-x-2 text-violet-400 hover:text-violet-300"
                  >
                    {isEditingAddress ? (
                      <>
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-5 w-5" />
                        <span>Edit</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-6">
                  {loadingProfile ? (
                    <div className="flex justify-center py-8">
                      <div className="w-10 h-10 border-t-4 border-violet-500 border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {isEditingAddress ? (
                        <>
                          {/* Street Address */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-400">Street Address</label>
                            <input
                              type="text"
                              value={profile.address.street}
                              onChange={(e) => setProfile({
                                ...profile,
                                address: { ...profile.address, street: e.target.value }
                              })}
                              className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                              placeholder="123 Main St, Apt 4B"
                            />
                          </div>
                          
                          {/* City and State */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-zinc-400">City</label>
                              <input
                                type="text"
                                value={profile.address.city}
                                onChange={(e) => setProfile({
                                  ...profile,
                                  address: { ...profile.address, city: e.target.value }
                                })}
                                className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="New York"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-zinc-400">State/Province</label>
                              <input
                                type="text"
                                value={profile.address.state}
                                onChange={(e) => setProfile({
                                  ...profile,
                                  address: { ...profile.address, state: e.target.value }
                                })}
                                className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="NY"
                              />
                            </div>
                          </div>
                          
                          {/* Zip and Country */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-zinc-400">Zip/Postal Code</label>
                              <input
                                type="text"
                                value={profile.address.zipCode}
                                onChange={(e) => setProfile({
                                  ...profile,
                                  address: { ...profile.address, zipCode: e.target.value }
                                })}
                                className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="10001"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-zinc-400">Country</label>
                              <input
                                type="text"
                                value={profile.address.country}
                                onChange={(e) => setProfile({
                                  ...profile,
                                  address: { ...profile.address, country: e.target.value }
                                })}
                                className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="United States"
                              />
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <button
                              onClick={handleUpdateAddress}
                              disabled={savingAddress}
                              className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all disabled:opacity-70"
                            >
                              {savingAddress ? (
                                <>
                                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-5 w-5" />
                                  <span>Save Address</span>
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-zinc-800/30 rounded-lg border border-zinc-800 p-4">
                          {profile.address.street || profile.address.city ? (
                            <div className="space-y-2">
                              <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-zinc-500 mt-1 mr-3" />
                                <div>
                                  <p>{profile.address.street}</p>
                                  <p>
                                    {profile.address.city}
                                    {profile.address.state && `, ${profile.address.state}`} {profile.address.zipCode}
                                  </p>
                                  <p>{profile.address.country}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-6 text-zinc-500">
                              <p>No address information added yet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                <div className="p-6 border-b border-zinc-800">
                  <h2 className="text-2xl font-bold">Security</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <div className="space-y-4">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-400">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="block w-full pl-10 pr-10 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="text-zinc-500 hover:text-zinc-300 focus:outline-none"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* New Password */}
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-400">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="block w-full pl-10 pr-10 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="text-zinc-500 hover:text-zinc-300 focus:outline-none"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className={`block w-full pl-10 pr-10 py-3 border ${
                              passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-zinc-700 focus:ring-violet-500'
                            } rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent`}
                            placeholder="••••••••"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-zinc-500 hover:text-zinc-300 focus:outline-none"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={handleChangePassword}
                          disabled={changingPassword}
                          className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all disabled:opacity-70"
                        >
                          {changingPassword ? (
                            <>
                              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                              <span>Changing Password...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-5 w-5" />
                              <span>Change Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-zinc-800">
                      <h3 className="text-lg font-medium mb-4">Account Security</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                          <div>
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-zinc-400 mt-1">Add an extra layer of security to your account</p>
                          </div>
                          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-md text-sm font-medium transition-colors">
                            Enable
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                          <div>
                            <h4 className="font-medium">Login History</h4>
                            <p className="text-sm text-zinc-400 mt-1">View your recent login activity</p>
                          </div>
                          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                <div className="p-6 border-b border-zinc-800">
                  <h2 className="text-2xl font-bold">Order History</h2>
                </div>
                
                <div className="p-6">
                  {loadingOrders ? (
                    <div className="flex justify-center py-8">
                      <div className="w-10 h-10 border-t-4 border-violet-500 border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : profile.orders.length > 0 ? (
                    <div className="space-y-6">
                      {profile.orders.map((order) => (
                        <div key={order.id} className="bg-zinc-800/30 rounded-lg border border-zinc-800 overflow-hidden">
                          {/* Order header */}
                          <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-zinc-400">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm flex items-center mt-1">
                                <Clock className="h-4 w-4 mr-1 text-zinc-500" />
                                {formatDate(order.date)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span className="font-medium">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          {/* Order items */}
                          <div className="p-4">
                            <ul className="divide-y divide-zinc-800">
                              {order.items.map((item) => (
                                <li key={item.id} className="py-4 flex items-center space-x-4">
                                  <div className="h-16 w-16 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0">
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-sm text-zinc-400 mt-1">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${item.price.toFixed(2)}</p>
                                    <p className="text-sm text-zinc-400 mt-1">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Order actions */}
                          <div className="p-4 border-t border-zinc-800 flex flex-wrap gap-2">
                            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-md text-sm font-medium transition-colors">
                              View Details
                            </button>
                            {order.status === 'delivered' && (
                              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors">
                                Leave Review
                              </button>
                            )}
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors ml-auto">
                              Track Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <ShoppingBag className="h-16 w-16 text-zinc-700 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                      <p className="text-zinc-400 mb-6">Looks like you haven't made any orders yet.</p>
                      <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-md font-medium transition-colors">
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payments' && (
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                <div className="p-6 border-b border-zinc-800">
                  <h2 className="text-2xl font-bold">Payment Methods</h2>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CreditCard className="h-16 w-16 text-zinc-700 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No payment methods yet</h3>
                    <p className="text-zinc-400 mb-6">Add a payment method to make checkout faster.</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-md font-medium transition-colors">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                <div className="p-6 border-b border-zinc-800">
                  <h2 className="text-2xl font-bold">Settings</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-zinc-400 mt-1">Receive emails about your orders and account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Order Updates</h4>
                          <p className="text-sm text-zinc-400 mt-1">Receive updates about your orders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Marketing Emails</h4>
                          <p className="text-sm text-zinc-400 mt-1">Receive emails about promotions and sales</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-zinc-800">
                      <h3 className="text-lg font-medium mb-4">Language & Region</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-zinc-400">Language</label>
                          <select className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-zinc-400">Currency</label>
                          <select className="block w-full px-3 py-3 border border-zinc-700 rounded-md bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                            <option value="usd">USD ($)</option>
                            <option value="eur">EUR (€)</option>
                            <option value="gbp">GBP (£)</option>
                            <option value="jpy">JPY (¥)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-zinc-800">
                      <h3 className="text-lg font-medium mb-4 text-red-400">Danger Zone</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-red-900/10 p-4 rounded-lg border border-red-500/20">
                          <div>
                            <h4 className="font-medium">Delete Account</h4>
                            <p className="text-sm text-zinc-400 mt-1">Permanently delete your account and all data</p>
                          </div>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
