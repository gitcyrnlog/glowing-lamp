import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../features/cart/CartContext';
import { fonts } from '../styles/theme';

// Mock product data - in real app, this would come from Firebase/API
const mockProducts = {
  '1': {
    id: '1',
    title: 'CyberCore Shirt',
    image: 'https://via.placeholder.com/600x400/14452F/FFFFFF?text=CyberCore',
    price: '$49.99',
    description: 'Premium futuristic shirt with cyber-inspired design. Made with cutting-edge fabric technology for ultimate comfort and style.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Charcoal'],
  },
  '2': {
    id: '2',
    title: 'Neon Grid Tee',
    image: 'https://via.placeholder.com/600x400/000000/BD9526?text=Neon+Grid',
    price: '$59.99',
    description: 'Electrifying neon grid design that glows in low light. Perfect for the tech-savvy individual.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Dark Gray'],
  },
  '3': {
    id: '3',
    title: 'Vortex Threads',
    image: 'https://via.placeholder.com/600x400/BD9526/000000?text=Vortex',
    price: '$39.99',
    description: 'Mesmerizing vortex pattern that captures the essence of digital transformation.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gold', 'Silver', 'Bronze'],
  },
  '4': {
    id: '4',
    title: 'HoloWave Apparel',
    image: 'https://via.placeholder.com/600x400/FFFFFF/000000?text=HoloWave',
    price: '$64.99',
    description: 'Holographic wave patterns that shift and shimmer with movement. The future of fashion.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Silver', 'Iridescent'],
  },
};

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  
  const product = id ? mockProducts[id as keyof typeof mockProducts] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/" className="text-yellow-400 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: parseFloat(product.price.replace('$', '')),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full rounded-2xl shadow-lg"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>
                {product.title}
              </h1>
              <p className="text-3xl text-yellow-400 font-semibold">{product.price}</p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed" style={{ fontFamily: fonts.body }}>
              {product.description}
            </p>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border border-white/20 rounded-lg hover:border-yellow-400 hover:bg-yellow-400/10 transition-all"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className="px-4 py-2 border border-white/20 rounded-lg hover:border-yellow-400 hover:bg-yellow-400/10 transition-all"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all transform hover:scale-105"
              style={{ fontFamily: fonts.body }}
            >
              Add to Cart
            </button>

            {/* Back to Products */}
            <Link 
              to="/" 
              className="inline-block text-yellow-400 hover:underline mt-4"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
