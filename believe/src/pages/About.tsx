import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { 
  Award, 
  Users, 
  Heart, 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ThumbsUp, 
  Mail, 
  MapPin,
  InstagramIcon
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#14452F] opacity-20 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-10 w-96 h-96 rounded-full bg-[#BD9526] opacity-10 blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                  About Our Company
                </span>
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                We're dedicated to creating innovative products that combine cutting-edge technology with elegant design.
              </motion.p>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16 bg-black relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-lg overflow-hidden border border-[#14452F]">
                  <img
                    src="https://via.placeholder.com/600x600/14452F/FFFFFF?text=Our+Story"
                    alt="Our Story"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-2/3 aspect-square rounded-lg overflow-hidden border border-[#BD9526] z-10">
                  <img
                    src="https://via.placeholder.com/400x400/BD9526/000000?text=Our+Team"
                    alt="Our Team"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full border-2 border-[#BD9526]"></div>
                <div className="absolute -bottom-8 right-1/3 w-16 h-16 rounded-full border border-[#14452F]"></div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                    Our Story
                  </span>
                </h2>
                <p className="text-gray-300 mb-6">
                  Founded in 2020, our company began with a simple idea: to create products that seamlessly blend innovative technology with timeless design. What started as a small team of passionate designers and engineers has grown into a globally recognized brand.
                </p>
                <p className="text-gray-300 mb-8">
                  We believe that exceptional products should not only function flawlessly but also inspire and elevate everyday experiences. This philosophy drives everything we do, from initial concept to final delivery.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <span className="block text-[#BD9526] text-4xl font-bold mb-2">5+</span>
                    <span className="text-gray-400">Years of Innovation</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[#BD9526] text-4xl font-bold mb-2">10k+</span>
                    <span className="text-gray-400">Happy Customers</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[#BD9526] text-4xl font-bold mb-2">50+</span>
                    <span className="text-gray-400">Design Awards</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[#BD9526] text-4xl font-bold mb-2">100+</span>
                    <span className="text-gray-400">Products</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-16 bg-gradient-to-b from-black to-[#14452F]/20 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#BD9526] to-transparent opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#BD9526] to-transparent opacity-30"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                  Our Core Values
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                These principles guide everything we do and define who we are as a company
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ValueCard 
                icon={<Award className="text-[#BD9526]" size={32} />}
                title="Excellence"
                description="We strive for excellence in every aspect of our business, from product design to customer service."
                delay={0}
              />
              <ValueCard 
                icon={<Heart className="text-[#BD9526]" size={32} />}
                title="Passion"
                description="Our team is driven by a genuine passion for innovation and creating products that customers love."
                delay={0.1}
              />
              <ValueCard 
                icon={<Users className="text-[#BD9526]" size={32} />}
                title="Collaboration"
                description="We believe great ideas come from diverse perspectives and collaborative efforts."
                delay={0.2}
              />
              <ValueCard 
                icon={<Star className="text-[#BD9526]" size={32} />}
                title="Innovation"
                description="Constantly pushing boundaries and challenging conventions to create groundbreaking products."
                delay={0.3}
              />
            </div>
          </div>
        </section>
        
        {/* Our Promises */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                  Our Promise to You
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                When you choose our products, you're not just getting an item - you're getting our commitment to quality and service
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PromiseCard 
                icon={<ShieldCheck className="text-[#BD9526]" size={24} />}
                title="Quality Assurance"
                description="All our products undergo rigorous testing to ensure they meet the highest standards of quality and durability."
              />
              <PromiseCard 
                icon={<Truck className="text-[#BD9526]" size={24} />}
                title="Fast Shipping"
                description="We offer quick and reliable shipping options to get your products to you as soon as possible."
              />
              <PromiseCard 
                icon={<RefreshCw className="text-[#BD9526]" size={24} />}
                title="Easy Returns"
                description="If you're not completely satisfied, we offer hassle-free returns within 30 days of purchase."
              />
              <PromiseCard 
                icon={<ThumbsUp className="text-[#BD9526]" size={24} />}
                title="Customer Satisfaction"
                description="Our dedicated customer service team is always ready to assist you with any questions or concerns."
              />
            </div>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="py-16 bg-gradient-to-b from-black to-[#14452F]/20 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#BD9526] to-transparent opacity-30"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                  Get in Touch
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We'd love to hear from you. Reach out to us with any questions or feedback.
              </p>
            </motion.div>
              <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ContactInfoCard 
                  icon={<Mail className="text-[#BD9526]" size={24} />}
                  title="Email Us"
                  info="info@believeinthedesigns.com"
                />
                <ContactInfoCard 
                  icon={<InstagramIcon className="text-[#BD9526]" size={24} />}
                  title="Text Us"
                  info={<a 
                    href="https://www.instagram.com/believeinthedesigns/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#BD9526] transition-colors"
                  >
                    believeinthedesigns
                  </a>}
                />
                <ContactInfoCard 
                  icon={<MapPin className="text-[#BD9526]" size={24} />}
                  title="Visit Us"
                  info="Portmore, Jamaica"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-[#BD9526] transition-colors"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="bg-black/40 w-16 h-16 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

function PromiseCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      className="flex gap-4 p-6 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-[#BD9526] transition-colors"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}

function ContactInfoCard({ icon, title, info }: { icon: React.ReactNode, title: string, info: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-gray-300">{info}</div>
    </div>
  );
}
