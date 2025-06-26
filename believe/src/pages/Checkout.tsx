import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../features/cart/CartContext';
import { fonts } from '../styles/theme';

export default function Checkout() {
  const { state, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [formStep, setFormStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(formStep + 1);
    
    if (formStep === 2) {
      // In a real app, this would be where we process payment
      // After successful payment:
      setTimeout(() => {
        clearCart();
      }, 1000);
    }
  };
  
  const handleReturn = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    } else {
      navigate('/cart');
    }
  };
  
  if (state.items.length === 0 && formStep !== 3) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="p-8 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Orbitron' }}>
            Checkout
          </h1>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
            <h2 className="text-2xl mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some futuristic items to checkout!</p>
            <Link 
              to="/"
              className="inline-block py-3 px-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Orbitron' }}>
          Checkout
        </h1>
        
        {/* Progress indicator */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -translate-y-1/2 z-0"></div>
          <div className="relative z-10 flex justify-between w-full">
            <div className={`flex flex-col items-center ${formStep >= 1 ? 'text-[#BD9526]' : 'text-gray-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 1 ? 'bg-[#BD9526] text-black' : 'bg-gray-800 text-gray-500'}`}>
                1
              </div>
              <span>Information</span>
            </div>
            <div className={`flex flex-col items-center ${formStep >= 2 ? 'text-[#BD9526]' : 'text-gray-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 2 ? 'bg-[#BD9526] text-black' : 'bg-gray-800 text-gray-500'}`}>
                2
              </div>
              <span>Payment</span>
            </div>
            <div className={`flex flex-col items-center ${formStep >= 3 ? 'text-[#BD9526]' : 'text-gray-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 3 ? 'bg-[#BD9526] text-black' : 'bg-gray-800 text-gray-500'}`}>
                3
              </div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>
        
        {/* Form Steps */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {formStep === 1 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleReturn}
                  className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-white/5"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#BD9526] to-[#14452F] text-white rounded-lg hover:opacity-90"
                  style={{ fontFamily: fonts.body }}
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          )}
          
          {formStep === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#BD9526]"
                    />
                  </div>
                </div>
                
                <div className="border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(state.total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(state.total * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleReturn}
                  className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-white/5"
                >
                  Back to Information
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#BD9526] to-[#14452F] text-white rounded-lg hover:opacity-90"
                  style={{ fontFamily: fonts.body }}
                >
                  Complete Order
                </button>
              </div>
            </form>
          )}
          
          {formStep === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Orbitron' }}>
                Order Confirmed!
              </h2>
              <p className="text-gray-400 mb-8">
                Thank you for your order. We've sent a confirmation email to {formData.email}.
              </p>
              <Link 
                to="/"
                className="inline-block py-3 px-8 bg-gradient-to-r from-[#BD9526] to-[#14452F] text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
