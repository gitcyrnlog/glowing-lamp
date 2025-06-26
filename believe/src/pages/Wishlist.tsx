import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useCart } from '../features/cart/CartContext';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, XIcon } from 'lucide-react';

export default function Wishlist() {
  const { state, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="pt-24 pb-16 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Orbitron' }}>
              <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                Your Wishlist
              </span>
            </h1>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
              <div className="flex justify-center mb-6">
                <HeartIcon size={64} className="text-gray-600" />
              </div>
              <h2 className="text-2xl mb-4">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-8">Save items you love to your wishlist and review them anytime!</p>
              <Link 
                to="/products"
                className="inline-block py-3 px-8 bg-gradient-to-r from-[#BD9526] to-[#14452F] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Orbitron' }}>
              <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                Your Wishlist
              </span>
            </h1>
            <button
              onClick={clearWishlist}
              className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-white/5 transition-all"
            >
              Clear Wishlist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {state.items.map((item) => (
              <motion.div 
                key={item.id}
                className="bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#BD9526]/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative">
                  <Link to={`/product/${item.id}`}>
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <XIcon size={16} />
                  </button>
                  <div className="absolute top-2 left-2 bg-[#14452F] text-white text-xs px-2 py-1 rounded">
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-[#BD9526] transition-colors">{item.title}</h3>
                  </Link>
                  <div className="flex justify-between items-center">
                    <p className="text-[#BD9526] font-bold">{item.price}</p>
                    <button 
                      onClick={() => {
                        addItem({
                          id: item.id,
                          title: item.title,
                          price: parseFloat(item.price.replace('$', '')),
                          image: item.image
                        });
                      }}
                      className="w-10 h-10 rounded-full bg-[#BD9526] text-black flex items-center justify-center hover:bg-opacity-90 transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingCartIcon size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
