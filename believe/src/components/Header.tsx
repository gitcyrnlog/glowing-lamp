import React, { useEffect, useState } from 'react'
import { ShoppingCartIcon, MenuIcon, XIcon, SearchIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
            BelieveInTheDesigns
          </h1>
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
            delay: 0.2,
          }}
          className="hidden md:flex space-x-8 items-center"
        >
          <NavLink href="#" text="Home" />
          <NavLink href="#products" text="Products" />
          <NavLink href="#categories" text="Categories" />
          <NavLink href="#about" text="About" />
          <NavLink href="#contact" text="Contact" />
        </motion.nav>
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
          }}
          className="flex items-center space-x-4"
        >
          <button className="p-2 hover:text-[#BD9526] transition-colors">
            <SearchIcon size={20} />
          </button>
          <button className="p-2 hover:text-[#BD9526] transition-colors relative">
            <ShoppingCartIcon size={20} />
            <span className="absolute -top-1 -right-1 bg-[#BD9526] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <button
            className="md:hidden p-2 hover:text-[#BD9526] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </motion.div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="md:hidden bg-black bg-opacity-95 border-t border-[#14452F]"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <MobileNavLink
                href="#"
                text="Home"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavLink
                href="#products"
                text="Products"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavLink
                href="#categories"
                text="Categories"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavLink
                href="#about"
                text="About"
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavLink
                href="#contact"
                text="Contact"
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
type NavLinkProps = {
  href: string
  text: string
}

const NavLink = ({ href, text }: NavLinkProps) => {
  return (
    <motion.a
      href={href}
      className="relative font-medium text-white hover:text-[#BD9526] transition-colors"
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
      }}
    >
      {text}
      <motion.span
        className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#BD9526]"
        initial={{
          width: 0,
        }}
        whileHover={{
          width: '100%',
        }}
        transition={{
          duration: 0.3,
        }}
      />
    </motion.a>
  )
}
type MobileNavLinkProps = {
  href: string
  text: string
  onClick: () => void
}

const MobileNavLink = ({ href, text, onClick }: MobileNavLinkProps) => {
  return (
    <motion.a
      href={href}
      className="block py-2 px-4 text-lg font-medium border-l-2 border-transparent hover:border-[#BD9526] hover:text-[#BD9526] transition-all"
      whileTap={{
        scale: 0.95,
      }}
      onClick={onClick}
    >
      {text}
    </motion.a>
  )
}
