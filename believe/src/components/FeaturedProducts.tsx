import React, { useEffect } from 'react'
import { motion, useAnimation, Variants } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ShoppingCartIcon, HeartIcon, EyeIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
export const FeaturedProducts = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }
    const products = [
    {
      id: 1,
      name: 'BITD "True Believer" Black T-Shirt',
      price: 3000,
      image: '/TrueBeliever.jpg',
      category: 'T-Shirts',
    },
    {
      id: 2,
      name: 'BITD "True Believer" White T-Shirt',
      price: 3000,
      image: '/WhiteTruBlv.jpg',
      category: 'T-Shirts',
    },
    {
      id: 3,
      name: 'Believe in the Designs T-Shirt, Black',
      price: 3500,
      image: '/BelieveDesigns.jpg',
      category: 'T-Shirts',
    },
  ]
  return (
    <section className="py-24 bg-black relative" id="products" ref={ref}>
      {/* Background accents */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#14452F] to-transparent opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#BD9526] to-transparent opacity-20"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
              Featured Products
            </span>
          </motion.h2>          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Our exclusive collection of premium Believe in the Designs apparel
          </motion.p>
        </motion.div>        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variants={itemVariants}
            />
          ))}
        </motion.div>        <motion.div
          className="mt-16 text-center"
          variants={itemVariants}
          initial="hidden"
          animate={controls}
        >
          <Link to="/products">
            <motion.button
              className="px-8 py-3 border border-[#14452F] hover:border-[#BD9526] text-white font-medium rounded-full transition-colors"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
type Product = {
  id: number
  name: string
  price: number
  image: string
  category: string
}

type ProductCardProps = {
  product: Product
  variants: Variants
}

const ProductCard = ({ product, variants }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        className="group bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-[#14452F] transition-all duration-300"
        variants={variants}
        whileHover={{
          y: -10,
        }}
      >
        <div className="relative overflow-hidden">
          <div className="aspect-square overflow-hidden">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <ActionButton icon={<ShoppingCartIcon size={18} />} />
            <ActionButton icon={<HeartIcon size={18} />} />
            <ActionButton icon={<EyeIcon size={18} />} />
          </div>
          <div className="absolute top-2 left-2 bg-[#14452F] text-white text-xs px-2 py-1 rounded">
            {product.category}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-white group-hover:text-[#BD9526] transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[#BD9526] font-semibold">${product.price}</p>
            <div className="text-yellow-500 text-sm">★★★★☆</div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
type ActionButtonProps = {
  icon: React.ReactNode
}

const ActionButton = ({ icon }: ActionButtonProps) => {
  return (
    <motion.button
      className="w-10 h-10 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white hover:bg-[#BD9526] hover:text-black transition-colors"
      whileHover={{
        scale: 1.2,
      }}
      whileTap={{
        scale: 0.9,
      }}
    >
      {icon}
    </motion.button>
  )
}
