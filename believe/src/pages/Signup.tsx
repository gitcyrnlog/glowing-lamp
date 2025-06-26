import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

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

const sanitizeInput = (input: string): string => {
  // Basic sanitization - remove script tags and trim
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const navigate = useNavigate();

  // Calculate password strength and update in real-time
  const updatePasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    
    setPasswordStrength(strength);
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    updatePasswordStrength(newPassword);
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate and sanitize inputs
    const sanitizedName = sanitizeInput(displayName);
    const sanitizedEmail = sanitizeInput(email);
    
    if (sanitizedName.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Password does not meet requirements');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: sanitizedName
      });
      
      // Redirect to home page after successful signup
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('Email address is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('An error occurred. Please try again later');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to show an error
      } else {
        setError('Failed to sign in with Google. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
          <div className="p-8">            <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#BD9526] to-[#14452F]">
              Create Account
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-zinc-400">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#BD9526] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#BD9526] focus:border-transparent"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}                    className="block w-full pl-10 pr-10 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#BD9526] focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength < 40 ? 'bg-red-500' : 
                          passwordStrength < 80 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 text-zinc-400">
                      {passwordStrength < 40 ? 'Weak' : 
                       passwordStrength < 80 ? 'Medium' : 
                       'Strong'} password
                    </p>
                    <ul className="text-xs mt-2 text-zinc-400 space-y-1">
                      <li className={password.length >= 8 ? 'text-green-400' : ''}>• At least 8 characters</li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>• At least one uppercase letter</li>
                      <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>• At least one lowercase letter</li>
                      <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>• At least one number</li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : ''}>• At least one special character</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      confirmPassword && password !== confirmPassword                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-zinc-700 focus:ring-[#BD9526]'
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
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required                  className="h-4 w-4 text-[#BD9526] focus:ring-[#BD9526] border-zinc-700 rounded bg-zinc-800"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-zinc-400">
                  I agree to the <Link to="/terms" className="text-[#BD9526] hover:text-[#BD9526]/80">Terms of Service</Link> and <Link to="/privacy" className="text-[#BD9526] hover:text-[#BD9526]/80">Privacy Policy</Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-[#BD9526] to-[#14452F] hover:from-[#BD9526]/90 hover:to-[#14452F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BD9526] font-medium transition-all disabled:opacity-70"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>            <div className="mt-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900 text-zinc-400">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-zinc-700 rounded-md shadow-sm bg-transparent text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BD9526] font-medium transition-all mb-6"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Sign up with Google
              </button>
              
              <p className="text-sm text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[#BD9526] hover:text-[#BD9526]/80">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
