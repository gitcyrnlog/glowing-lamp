import { Link } from 'react-router-dom';
import { Header }from '../components/Header';
import { useCart } from '../features/cart/CartContext';
import { fonts } from '../styles/theme';

export default function Cart() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="p-8 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Orbitron' }}>
            Your Cart
          </h1>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
            <h2 className="text-2xl mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some futuristic items to get started!</p>
            <Link 
              to="/"
              className="inline-block py-3 px-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Orbitron' }}>
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div 
                key={item.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex gap-6">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-yellow-400 text-lg font-semibold mb-4">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-fit">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
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
              <hr className="border-white/20" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${(state.total * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                to="/checkout"
                className="block w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-center rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all"
              >
                Proceed to Checkout
              </Link>
              
              <button
                onClick={clearCart}
                className="w-full py-3 px-6 border border-white/20 rounded-xl hover:bg-white/5 transition-all"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
