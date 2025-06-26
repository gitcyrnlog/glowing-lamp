import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRightIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryService, { Category, fallbackCategories } from '../lib/categoryService';
import useFirestore from '../hooks/useFirestore';

export default function Categories() {
  const { 
    data: categories, 
    loading, 
    error, 
    refetch 
  } = useFirestore<Category[]>(
    () => CategoryService.getAllCategories(),
    { fallbackData: fallbackCategories }
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero section */}
          <section className="mb-12 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                Product Categories
              </span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Browse through our collection of premium categories
            </motion.p>
          </section>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Failed to load categories. Please try again.</p>
              <button 
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2 mx-auto"
                onClick={() => refetch()}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          )}
          
          {/* Categories grid */}
          {!loading && !error && categories && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  index={index} 
                />
              ))}
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function CategoryCard({ category, index }: { category: Category, index: number }) {
  return (
    <motion.div
      className="group overflow-hidden rounded-lg bg-gray-900 hover:shadow-lg hover:shadow-[#BD9526]/20 transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <Link to={category.status === 'available' ? `/products?category=${category.name}` : '#'}>
        <div className="aspect-[4/3] overflow-hidden relative">
          <img 
            src={category.image} 
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
            {category.status === 'available' ? (
              <p className="text-[#BD9526] mb-2">{category.productCount} products</p>
            ) : (
              <p className="text-yellow-500 font-semibold mb-2">Coming Soon</p>
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">{category.description}</p>
          {category.status === 'available' ? (
            <div className="flex items-center text-[#BD9526] font-medium group-hover:translate-x-2 transition-transform">
              <span className="mr-2">View Products</span>
              <ArrowRightIcon size={16} />
            </div>
          ) : (
            <div className="flex items-center text-gray-400 font-medium">
              <span className="mr-2">Coming Soon</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
