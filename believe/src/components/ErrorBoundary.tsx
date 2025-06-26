import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <motion.div 
            className="max-w-md w-full bg-gray-900 p-6 rounded-lg border border-[#BD9526]/30 shadow-lg shadow-[#BD9526]/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center">
              <motion.div 
                className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center text-[#BD9526]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              >
                <AlertTriangle size={40} />
              </motion.div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">
              <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                Something Went Wrong
              </span>
            </h1>
            
            <p className="text-gray-400 text-center mb-6">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            
            {this.state.error && (
              <div className="mb-6 p-3 bg-black/50 rounded-md overflow-auto">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-[#14452F] hover:bg-[#14452F]/80 text-white px-4 py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={16} />
                Try Again
              </motion.button>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/"
                  className="flex items-center justify-center gap-2 bg-[#BD9526] hover:bg-[#BD9526]/80 text-black px-4 py-2 rounded-lg transition-colors"
                >
                  <Home size={16} />
                  Go Home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
