import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRightIcon, FilterIcon, GridIcon, HeartIcon, ListIcon, SearchIcon, Loader } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWishlist } from '../features/wishlist/WishlistContext';
import ProductService, { Product } from '../lib/productService';
import useFirestore from '../hooks/useFirestore';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [isSearching, setIsSearching] = useState(false);
  
  // Get all products
  const { 
    data: products, 
    loading, 
    error, 
    refetch 
  } = useFirestore<Product[]>(
    () => {
      if (!initialQuery) return ProductService.getAllProducts();
      return ProductService.searchProducts(initialQuery);
    },
    { dependencies: [initialQuery] }
  );
  
  // Categories extracted from available products
  const categories = products ? 
    ['All', ...new Set(products.map(product => product.category))] : 
    ['All', 'T-Shirts'];
  
  // Filter products based on selections
  const filteredProducts = products ? products.filter(product => {
    // Filter by category
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    
    // Filter by price range
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    if (numericPrice < priceRange.min || numericPrice > priceRange.max) {
      return false;
    }
    
    return true;
  }) : [];
  
  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = parseFloat(a.price.replace(/[^0-9.]/g, ''));
    const bPrice = parseFloat(b.price.replace(/[^0-9.]/g, ''));
    
    switch (sortBy) {
      case 'price-low':
        return aPrice - bPrice;
      case 'price-high':
        return bPrice - aPrice;
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'newest':
      default:
        // Assuming newest is the default sort in the API
        return 0;
    }
  });
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    
    // Refetch with new query
    refetch();
    
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search header */}
          <section className="mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                Search Products
              </span>
            </motion.h1>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 pl-12 text-white focus:outline-none focus:border-[#BD9526] placeholder-gray-500"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#BD9526] text-black rounded-md px-4 py-1 font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
                  disabled={isSearching}
                >
                  {isSearching ? <Loader className="animate-spin" size={16} /> : null}
                  Search
                </button>
              </div>
            </form>
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
              <p className="text-red-500 mb-4">Failed to load products. Please try again.</p>
              <button 
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2 mx-auto"
                onClick={() => refetch()}
              >
                <ArrowRightIcon size={16} className="transform rotate-180" />
                Try Again
              </button>
            </div>
          )}
          
          {/* Search results */}
          {!loading && !error && products && (
            <>
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
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <label className="text-gray-400 mr-2">Sort by:</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
                      >
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                      </select>
                    </div>
                    
                    <div className="text-gray-400">
                      {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
                    </div>
                  </div>
                </div>
                
                {/* Expanded filters */}
                {showFilters && (
                  <motion.div 
                    className="bg-gray-900 rounded-lg p-4 mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Categories</h3>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <label key={category} className="flex items-center">
                              <input 
                                type="radio"
                                name="category"
                                checked={selectedCategory === category}
                                onChange={() => setSelectedCategory(category)}
                                className="mr-2 accent-[#BD9526]"
                              />
                              <span>{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span>$</span>
                            <input 
                              type="number"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                              min="0"
                              className="bg-gray-800 border border-gray-700 rounded-lg py-1 px-2 text-white focus:outline-none focus:border-[#BD9526] w-24"
                            />
                            <span>to</span>
                            <span>$</span>
                            <input 
                              type="number"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                              min={priceRange.min}
                              className="bg-gray-800 border border-gray-700 rounded-lg py-1 px-2 text-white focus:outline-none focus:border-[#BD9526] w-24"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <button 
                          onClick={() => {
                            setSelectedCategory('All');
                            setPriceRange({ min: 0, max: 10000 });
                          }}
                          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>
              
              {/* No results message */}
              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No products found matching your criteria.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setPriceRange({ min: 0, max: 10000 });
                      navigate('/search');
                    }}
                    className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
              
              {/* Product grid/list */}
              {sortedProducts.length > 0 && (
                <section className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                  {sortedProducts.map((product) => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <ProductListItem key={product.id} product={product} />
                    )
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Product Card Component for grid view
function ProductCard({ product }: { product: Product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  
  return (
    <motion.div
      className="group rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg hover:shadow-[#BD9526]/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        <button 
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${inWishlist ? 'bg-[#BD9526] text-black' : 'bg-black/50 text-white'} transition-colors`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon size={16} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-[#BD9526] transition-colors">{product.title}</h3>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-[#BD9526] font-medium">{product.price}</span>
          <Link 
            to={`/product/${product.id}`} 
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Product List Item Component for list view
function ProductListItem({ product }: { product: Product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  
  return (
    <motion.div
      className="group rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg hover:shadow-[#BD9526]/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex">
        <Link to={`/product/${product.id}`} className="block w-32 h-32 sm:w-48 sm:h-48 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <Link to={`/product/${product.id}`} className="block">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#BD9526] transition-colors">{product.title}</h3>
              </Link>
              <button 
                onClick={() => toggleWishlist(product)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${inWishlist ? 'bg-[#BD9526] text-black' : 'bg-gray-800 text-white'} transition-colors`}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <HeartIcon size={16} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
            
            <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
            <div className="text-sm text-gray-500 mb-2">Category: {product.category}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[#BD9526] font-medium text-lg">{product.price}</span>
            <Link 
              to={`/product/${product.id}`} 
              className="px-4 py-2 bg-gray-800 hover:bg-[#BD9526] hover:text-black text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>View Product</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
