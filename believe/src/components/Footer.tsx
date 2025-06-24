import React from 'react'
import { motion } from 'framer-motion'
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
} from 'lucide-react'
export const Footer = () => {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-black relative overflow-hidden" id="contact">
      {/* Background accent */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#14452F] to-transparent opacity-30"></div>
      </div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <motion.h3
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              BelieveInTheDesigns
            </motion.h3>
            <motion.p
              className="text-gray-400 mb-6"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
            >
              Pushing the boundaries of design and technology to create products
              that inspire and elevate everyday living.
            </motion.p>
            <motion.div
              className="flex space-x-4"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
            >
              <SocialIcon icon={<FacebookIcon size={18} />} />
              <SocialIcon icon={<InstagramIcon size={18} />} />
              <SocialIcon icon={<TwitterIcon size={18} />} />
              <SocialIcon icon={<YoutubeIcon size={18} />} />
            </motion.div>
          </div>
          <div>
            <motion.h4
              className="text-lg font-semibold mb-6 text-white"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
            >
              Quick Links
            </motion.h4>
            <motion.ul
              className="space-y-3"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
            >
              <FooterLink text="Home" href="#" />
              <FooterLink text="Products" href="#products" />
              <FooterLink text="Categories" href="#categories" />
              <FooterLink text="About Us" href="#about" />
              <FooterLink text="Contact" href="#contact" />
            </motion.ul>
          </div>
          <div>
            <motion.h4
              className="text-lg font-semibold mb-6 text-white"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
            >
              Contact Us
            </motion.h4>
            <motion.div
              className="space-y-4"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
            >
              <div className="flex items-start space-x-3">
                <MapPinIcon
                  size={18}
                  className="text-[#BD9526] mt-1 flex-shrink-0"
                />
                <span className="text-gray-400">
                  123 Design Avenue, Innovation City, 10001
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MailIcon size={18} className="text-[#BD9526] flex-shrink-0" />
                <span className="text-gray-400">
                  info@believeinthedesigns.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon size={18} className="text-[#BD9526] flex-shrink-0" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
            </motion.div>
          </div>
          <div>
            <motion.h4
              className="text-lg font-semibold mb-6 text-white"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
            >
              Newsletter
            </motion.h4>
            <motion.p
              className="text-gray-400 mb-4"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.4,
              }}
            >
              Subscribe to receive updates on new products and special
              promotions.
            </motion.p>
            <motion.div
              className="flex"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.5,
              }}
            >
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none focus:border-[#BD9526] w-full"
              />
              <button className="bg-[#BD9526] text-black px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors">
                <ArrowRightIcon size={18} />
              </button>
            </motion.div>
          </div>
        </div>
        <motion.div
          className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500"
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
            delay: 0.6,
          }}
        >
          <p>&copy; {currentYear} BelieveInTheDesigns. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
type SocialIconProps = {
  icon: React.ReactNode
}

const SocialIcon = ({ icon }: SocialIconProps) => {
  return (
    <motion.a
      href="#"
      className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-[#BD9526] hover:text-black transition-colors"
      whileHover={{
        scale: 1.2,
      }}
      whileTap={{
        scale: 0.9,
      }}
    >
      {icon}
    </motion.a>
  )
}
type FooterLinkProps = {
  text: string
  href: string
}

const FooterLink = ({ text, href }: FooterLinkProps) => {
  return (
    <li>
      <motion.a
        href={href}
        className="text-gray-400 hover:text-[#BD9526] transition-colors flex items-center group"
        whileHover={{
          x: 5,
        }}
        transition={{
          duration: 0.2,
        }}
      >
        <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightIcon size={12} />
        </span>
        {text}
      </motion.a>
    </li>
  )
}
