import React, { useEffect, Children } from 'react'
import { motion, useAnimation, easeOut } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
export const AboutSection = () => {
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
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeOut,
      },
    },
  }
  return (
    <section
      className="py-24 bg-black relative overflow-hidden"
      id="about"
      ref={ref}
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-[#14452F] opacity-20 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="order-2 lg:order-1"
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                Our Story
              </span>
            </motion.h2>
            <motion.p className="text-gray-300 mb-6" variants={itemVariants}>
              BelieveInTheDesigns was founded with a vision to merge
              cutting-edge technology with timeless design principles. We
              believe that the objects that surround us should not only be
              functional but also inspire and elevate our daily experiences.
            </motion.p>
            <motion.p className="text-gray-300 mb-6" variants={itemVariants}>
              Our team of designers and engineers work tirelessly to push the
              boundaries of what's possible, creating products that feel like
              they've been transported from the future to the present.
            </motion.p>
            <motion.div
              className="grid grid-cols-2 gap-6 mt-10"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="text-center">
                <span className="block text-[#BD9526] text-4xl font-bold mb-2">
                  10+
                </span>
                <span className="text-gray-400">Years of Innovation</span>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <span className="block text-[#BD9526] text-4xl font-bold mb-2">
                  5000+
                </span>
                <span className="text-gray-400">Happy Customers</span>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <span className="block text-[#BD9526] text-4xl font-bold mb-2">
                  120+
                </span>
                <span className="text-gray-400">Design Awards</span>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <span className="block text-[#BD9526] text-4xl font-bold mb-2">
                  300+
                </span>
                <span className="text-gray-400">Unique Products</span>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="order-1 lg:order-2 relative"
            variants={itemVariants}
            initial="hidden"
            animate={controls}
          >
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden border border-[#14452F]">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
                  alt="Design Studio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-2/3 aspect-square rounded-lg overflow-hidden border border-[#BD9526] z-10">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1916&auto=format&fit=crop"
                  alt="Product Design"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full border-2 border-[#BD9526]"></div>
              <div className="absolute -bottom-8 right-1/3 w-16 h-16 rounded-full border border-[#14452F]"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
