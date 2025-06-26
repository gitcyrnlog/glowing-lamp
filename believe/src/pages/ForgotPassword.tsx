import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

// Input validation utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input: string): string => {
  // Basic sanitization - remove script tags and trim
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate and sanitize email
    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, sanitizedEmail);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later');
      } else {
        setError('An error occurred. Please try again later');
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
          <div className="p-8">
            <div className="mb-6">              <Link to="/login" className="inline-flex items-center text-sm text-[#BD9526] hover:text-[#BD9526]/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#BD9526] to-[#14452F]">
              Reset Password
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-md text-green-400">
                  <p>Password reset link sent!</p>
                  <p className="text-sm mt-2">Check your email for further instructions.</p>
                </div>
                <Link
                  to="/login"                  className="mt-4 inline-block w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-center text-white bg-gradient-to-r from-[#BD9526] to-[#14452F] hover:from-[#BD9526]/90 hover:to-[#14452F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BD9526] font-medium transition-all"
                >
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <p className="text-sm text-zinc-400 mb-4">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </p>
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
                      onChange={(e) => setEmail(e.target.value)}                      className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-md bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#BD9526] focus:border-transparent"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-[#BD9526] to-[#14452F] hover:from-[#BD9526]/90 hover:to-[#14452F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BD9526] font-medium transition-all disabled:opacity-70"
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
