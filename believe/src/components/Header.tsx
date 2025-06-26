import React, { useEffect, useState } from 'react'
import { ShoppingCartIcon, MenuIcon, XIcon, SearchIcon, UserIcon, LogOutIcon, HeartIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth/AuthContext'
import { useCart } from '../features/cart/CartContext'
import { useWishlist } from '../features/wishlist/WishlistContext'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export const Header = () => {  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthContext()
  const { state: cartState } = useCart()
  const { state: wishlistState } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUserMenuOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const menuItems = [
    { text: 'Home', link: '/' },
    { text: 'Products', link: '/products' },
    { text: 'Categories', link: '/categories' },
    { text: 'About', link: '/about' },
    { text: 'Contact', link: '/contact' },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black bg-opacity-80 backdrop-blur-md py-3' : 'bg-transparent py-5'}`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="flex items-center"
        >
          <Link to="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
              BelieveInTheDesigns
            </h1>
          </Link>
        </motion.div>
        
        {/* Desktop Navigation */}
        <motion.nav
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
          className="hidden md:block"
        >
          <ul className="flex space-x-8">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.link}
                  className="font-medium text-white hover:text-[#BD9526] transition-colors"
                >
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </motion.nav>
        
        {/* Right side - Cart, Account, Mobile Menu */}
        <motion.div
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className="flex items-center space-x-6"
        >          {/* Search */}
          <button 
            className="text-white hover:text-[#BD9526] transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <SearchIcon size={20} />
          </button>
          
          {/* Wishlist */}
          <Link to="/wishlist" className="text-white hover:text-[#BD9526] transition-colors relative">
            <HeartIcon size={20} />
            {wishlistState.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#14452F] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistState.items.length}
              </span>
            )}
          </Link>
          
          {/* Cart */}
          <Link to="/cart" className="text-white hover:text-[#BD9526] transition-colors relative">
            <ShoppingCartIcon size={20} />
            {cartState.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#BD9526] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartState.items.length}
              </span>
            )}
          </Link>
          
          {/* User Account */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-white hover:text-[#BD9526]"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-[#BD9526] to-[#14452F] rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
                    {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-black bg-opacity-90 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-800">
                        <p className="font-medium text-sm text-white">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <ul>
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-white hover:bg-[#14452F] hover:bg-opacity-50 w-full text-left"
                          >
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-white hover:bg-[#14452F] hover:bg-opacity-50 w-full text-left"
                          >
                            Orders
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block px-4 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-30 w-full text-left"
                          >
                            Sign out
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-[#BD9526] transition-colors"
              >
                <UserIcon size={20} />
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-[#BD9526] transition-colors"
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </motion.div>      </div>
      
      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md z-50 flex items-start justify-center pt-24"
          >
            <div className="w-full max-w-3xl px-4">
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-0 top-0 -mt-12 text-white hover:text-[#BD9526]"
                >
                  <XIcon size={24} />
                </button>
                
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for products..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-l-lg pl-12 pr-4 py-4 focus:outline-none focus:border-[#BD9526]"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#BD9526] text-black px-6 py-4 rounded-r-lg hover:bg-opacity-90 transition-colors"
                  >
                    Search
                  </button>
                </form>
                
                <div className="mt-6 text-gray-400">
                  <p className="mb-2">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Shirts', 'Hoodies', 'Jackets', 'Accessories'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          navigate(`/search?q=${encodeURIComponent(term)}`);
                          setSearchOpen(false);
                        }}
                        className="px-3 py-1 rounded-full border border-gray-700 hover:border-[#BD9526] hover:text-[#BD9526] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black bg-opacity-90 backdrop-blur-md border-t border-gray-800"
          >
            <nav className="container mx-auto px-4 py-3">
              <ul className="space-y-3">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block font-medium text-white hover:text-[#BD9526] transition-colors py-2"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
                {!user && (
                  <>
                    <li className="border-t border-gray-800 pt-3 mt-3">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block font-medium text-white hover:text-[#BD9526] transition-colors py-2"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block font-medium text-white hover:text-[#BD9526] transition-colors py-2"
                      >
                        Create Account
                      </Link>
                    </li>
                  </>
                )}              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
