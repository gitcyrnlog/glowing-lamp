import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AlertTriangle, Home, RefreshCw, FileX } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorDetail {
  status?: number;
  statusText?: string;
  message?: string;
  data?: any;
}

export default function ErrorElement() {
  const error = useRouteError() as ErrorDetail;
  
  let title = 'Something went wrong';
  let message = 'We apologize for the inconvenience. An unexpected error has occurred.';
  let icon = <AlertTriangle size={40} className="text-red-500" />;
  
  // Customize based on error type
  if (error.status === 404) {
    title = 'Page not found';
    message = 'The page you are looking for doesn\'t exist or has been moved.';
    icon = <FileX size={40} className="text-yellow-500" />;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <motion.div 
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="text-gray-400">{message}</p>
                </div>
              </div>

              {(error.statusText || error.message) && (
                <div className="bg-black/30 rounded-lg p-4 mb-8 border border-gray-800 overflow-auto">
                  <p className="text-red-400 font-mono text-sm">
                    {error.statusText || error.message || 'Unknown error'}
                  </p>
                  {error.status && (
                    <p className="text-gray-500 text-xs mt-2">Error code: {error.status}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRefresh}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-[#BD9526] to-[#14452F] rounded-lg text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <RefreshCw size={18} />
                  Refresh Page
                </button>
                <Link
                  to="/"
                  className="flex-1 py-3 px-6 border border-gray-700 rounded-lg text-white flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                >
                  <Home size={18} />
                  Return Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
