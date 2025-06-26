import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, MessageSquare, Clock, Check, InstagramIcon } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
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
                  Contact Us
                </span>
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                We'd love to hear from you. Get in touch with our team for any inquiries or feedback.
              </motion.p>
            </div>
          </div>
        </section>
        
        {/* Contact Info Cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-[#BD9526] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-[#BD9526]" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Us</h3>                <p className="text-gray-300 mb-2">For general inquiries:</p>
                <a href="mailto:info@believeinthedesigns.com" className="text-[#BD9526] hover:underline">
                  info@believeinthedesigns.com
                </a>
              </motion.div>
                <motion.div 
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-[#BD9526] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <InstagramIcon className="text-[#BD9526]" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Text Us</h3>
                <p className="text-gray-300 mb-2">Follow us on Instagram:</p>
                <a 
                  href="https://www.instagram.com/believeinthedesigns/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#BD9526] hover:underline"
                >
                  believeinthedesigns
                </a>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">We usually respond within 24 hours</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-[#BD9526] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-[#BD9526]" size={24} />
                </div>                <h3 className="text-xl font-semibold mb-2">Location</h3>
                <p className="text-gray-300 mb-4">Headquarters:</p>
                <address className="not-italic text-[#BD9526]">
                  Portmore, Jamaica
                </address>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Contact Form & Map */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Form */}
                <div className="p-8">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <MessageSquare className="text-[#BD9526]" size={24} />
                      <span>Send Us a Message</span>
                    </h2>
                    
                    {isSubmitted ? (
                      <motion.div 
                        className="bg-green-900/30 border border-green-700 rounded-lg p-4 flex items-center gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Check className="text-green-500" size={20} />
                        <p>Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-gray-400 mb-2" htmlFor="name">Your Name</label>
                            <input 
                              type="text" 
                              id="name"
                              name="name"
                              value={formState.name}
                              onChange={handleChange}
                              required
                              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-2" htmlFor="email">Your Email</label>
                            <input 
                              type="email" 
                              id="email"
                              name="email"
                              value={formState.email}
                              onChange={handleChange}
                              required
                              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-gray-400 mb-2" htmlFor="subject">Subject</label>
                          <select 
                            id="subject"
                            name="subject"
                            value={formState.subject}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                          >
                            <option value="">Select a subject</option>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Product Question">Product Question</option>
                            <option value="Support">Support</option>
                            <option value="Feedback">Feedback</option>
                            <option value="Partnership">Partnership</option>
                          </select>
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-gray-400 mb-2" htmlFor="message">Your Message</label>
                          <textarea 
                            id="message"
                            name="message"
                            value={formState.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                          />
                        </div>
                        
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-gradient-to-r from-[#BD9526] to-[#14452F] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message <Send size={16} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </motion.div>
                </div>
                
                {/* Map */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative min-h-[400px] bg-gray-800"
                >
                  {/* Placeholder for map - in a real app, you'd use Google Maps or similar */}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#14452F]/20">
                    <div className="text-center p-6">
                      <MapPin className="text-[#BD9526] mx-auto mb-4" size={48} />
                      <h3 className="text-xl font-semibold mb-2">Our Location</h3>
                      <p className="text-gray-300 mb-4">
                        Portmore<br />
                        Jamaica
                      </p>
                      <a 
                        href="https://maps.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-[#BD9526] text-black rounded-lg hover:bg-opacity-90 transition-opacity"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Find quick answers to common questions about our products and services
              </p>
            </motion.div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <FAQ 
                question="What are your shipping options and delivery times?"
                answer="We offer standard shipping (5-7 business days), express shipping (2-3 business days), and next-day delivery options. Shipping times may vary based on your location. All shipping options and estimated delivery dates will be displayed at checkout."
              />
              <FAQ 
                question="What is your return policy?"
                answer="We offer a 30-day return policy for all our products. Items must be in their original condition with all tags and packaging intact. To initiate a return, please contact our customer support team or visit the 'Orders' section in your account."
              />
              <FAQ 
                question="Do you offer international shipping?"
                answer="Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Please note that additional customs fees or import taxes may apply depending on your country's regulations."
              />
              <FAQ 
                question="How can I track my order?"
                answer="Once your order ships, you'll receive a confirmation email with tracking information. You can also view your order status and tracking details in the 'Orders' section of your account dashboard."
              />
              <FAQ 
                question="Do you offer warranty on your products?"
                answer="Yes, all our products come with a standard one-year warranty against manufacturing defects. Some premium products include extended warranty options. Please contact us for warranty details."
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

function FAQ({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div 
      className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <button 
        className="w-full px-6 py-4 text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      
      <motion.div 
        className="px-6 overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-400 pb-4">{answer}</p>
      </motion.div>
    </motion.div>
  );
}
