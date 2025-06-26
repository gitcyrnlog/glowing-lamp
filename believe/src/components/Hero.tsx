import React, { useEffect } from 'react'
import { motion, useAnimation, Variants } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
export const Hero = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
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
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }
  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-black"
      ref={ref}
      id="hero"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#14452F] opacity-20 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-10 w-96 h-96 rounded-full bg-[#BD9526] opacity-10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=3000&auto=format&fit=crop')] bg-fixed opacity-5"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="container mx-auto px-4 z-10 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-white via-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
              Future of Streetwear
            </span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl max-w-2xl mb-10 text-gray-300"
            variants={itemVariants}
          >
            Discover revolutionary clothing that blends aesthetics with
            innovation at BelieveInTheDesigns
          </motion.p>            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <Link to="/products">
                <motion.button
                  className="px-8 py-3 bg-[#BD9526] text-black font-medium rounded-full hover:bg-opacity-90 transition-all flex items-center gap-2 group"
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  Shop Now
                  <ArrowRightIcon
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  className="px-8 py-3 border border-[#14452F] hover:border-[#BD9526] text-white font-medium rounded-full transition-colors"
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
        </motion.div>
      </div>
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{
              y: [0, 15, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}
