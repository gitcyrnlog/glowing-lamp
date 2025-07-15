import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRightIcon, FilterIcon, GridIcon, HeartIcon, ListIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../features/wishlist/WishlistContext';

// Mock product data - in real app, this would come from Firebase/API
const mockProducts = [
  {
    id: '1',
    title: 'BITD "True Believer" Black T-Shirt',
    image: '/glowing-lamp/TrueBeliever.jpg',
    price: '$3000',
    category: 'T-Shirts',
  },
  {
    id: '2',
    title: 'BITD "True Believer" White T-Shirt',
    image: '/glowing-lamp/WhiteTruBlv.jpg',
    price: '$3000',
    category: 'T-Shirts',
  },
  {
    id: '3',
    title: 'Believe in the Designs T-Shirt, Black',
    image: '/glowing-lamp/BelieveDesigns.jpg',
    price: '$3500',
    category: 'T-Shirts',
  },
];

// Filter options
const categories = ['All', 'T-Shirts'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('newest');
  const [viewMode, setViewMode] = React.useState('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  
  // Filter products based on category selection
  const filteredProducts = selectedCategory === 'All' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);
  
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
                Our Products
              </span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Explore our collection of premium products designed with innovation and style
            </motion.p>
          </section>
          
          {/* Filter controls */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors mr-4"
                >
                  <FilterIcon size={18} />
                  <span>Filters</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#BD9526] text-black' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    <GridIcon size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#BD9526] text-black' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full md:w-auto bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#BD9526]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Expandable filters */}
            {showFilters && (
              <motion.div 
                className="bg-gray-900 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full border ${
                        selectedCategory === category
                          ? 'bg-[#BD9526] text-black border-[#BD9526]'
                          : 'border-gray-700 hover:border-[#BD9526] hover:bg-black/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Additional filters would go here */}
              </motion.div>
            )}
          </section>
          
          {/* Products grid/list */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <button className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 flex items-center justify-center">
                &laquo;
              </button>
              <button className="w-10 h-10 rounded-lg bg-[#BD9526] text-black flex items-center justify-center">
                1
              </button>
              <button className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 flex items-center justify-center">
                2
              </button>
              <button className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 flex items-center justify-center">
                3
              </button>
              <button className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 flex items-center justify-center">
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

interface Product {
  id: string;
  title: string;
  image: string;
  price: string;
  category: string;
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <motion.div 
        className="bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#BD9526]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2 bg-[#14452F] text-white text-xs px-2 py-1 rounded">
            {product.category}
          </div>
          <button 
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              inWishlist 
                ? 'bg-[#BD9526] text-black' 
                : 'bg-black/50 text-white hover:bg-[#BD9526] hover:text-black'
            }`}
          >
            <HeartIcon size={16} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-[#BD9526] transition-colors">{product.title}</h3>
          <div className="flex justify-between items-center">
            <p className="text-[#BD9526] font-bold">{product.price}</p>
            <button className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#BD9526] hover:text-black transition-colors">
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ProductListItem({ product }: { product: Product }) {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <motion.div 
        className="bg-gray-900 rounded-lg overflow-hidden flex transition-all duration-300 hover:shadow-lg hover:shadow-[#BD9526]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ x: 8 }}
      >
        <div className="relative w-32 h-32 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-[#14452F] text-white text-xs px-2 py-1 rounded inline-block mb-2">
                {product.category}
              </span>
              <h3 className="text-lg font-semibold group-hover:text-[#BD9526] transition-colors">{product.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#BD9526] font-bold">{product.price}</p>
              <button 
                onClick={handleWishlistToggle}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  inWishlist 
                    ? 'bg-[#BD9526] text-black' 
                    : 'bg-black/50 text-white hover:bg-[#BD9526] hover:text-black'
                }`}
              >
                <HeartIcon size={16} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="text-yellow-500 text-sm">★★★★☆</div>
            <button className="flex items-center gap-1 text-sm text-gray-400 group-hover:text-[#BD9526] transition-colors">
              View Details <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
