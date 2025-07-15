import React, { useEffect, Children } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { easeOut } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRightIcon } from 'lucide-react'
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: easeOut,
    },
  },
}

export const CategoryShowcase = () => {
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
    const categories = [
    {
      id: 1,
      name: 'True Believer',
      image: '/glowing-lamp/TrueBeliever.jpg',
      count: 18,
    },
    {
      id: 2,
      name: 'Believe in the Designs',
      image: '/glowing-lamp/BelieveDesigns.jpg',
      count: 24,
    },
  ]
  return (    <section
      className="py-24 bg-gradient-to-b from-black to-[#14452F]/20 relative"
      id="collections"
      ref={ref}
    >
      {/* Accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#BD9526] to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#BD9526] to-transparent opacity-30"></div>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={itemVariants}
          >            <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
              Collections
            </span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Explore our designs
          </motion.p>
        </motion.div>        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              variants={itemVariants}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

type Category = {
  id: number
  name: string
  image: string
  count: number
}

type CategoryCardProps = {
  category: Category
  variants: any
  index: number
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, variants, index }) => {
  return (
    <motion.div
      className="relative group overflow-hidden rounded-lg cursor-pointer"
      variants={variants}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <motion.img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
          initial={{
            scale: 1,
          }}
          whileHover={{
            scale: 1.1,
          }}
          transition={{
            duration: 0.7,
          }}
          onError={(e) => {
            console.error('Image failed to load:', category.image);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', category.image);
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-6"
        initial={{
          y: 20,
          opacity: 0.8,
        }}
        whileHover={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
        <p className="text-[#BD9526] mb-4">{category.count} products</p>        <div className="flex items-center text-white group-hover:text-[#BD9526] transition-colors">
          <span className="mr-2">View Collection</span>
          <motion.div
            initial={{
              x: 0,
            }}
            whileHover={{
              x: 5,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <ArrowRightIcon size={16} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
