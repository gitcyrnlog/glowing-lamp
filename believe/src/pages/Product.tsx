import { useParams, Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../features/cart/CartContext';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { fonts } from '../styles/theme';
import { HeartIcon, StarIcon, SendIcon } from 'lucide-react';

// Mock product data - in real app, this would come from Firebase/API
const mockProducts = {
  '1': {
    id: '1',
    title: 'BITD "True Believer" Black T-Shirt',
    image: '/glowing-lamp/TrueBeliever.jpg',
    price: '$3000',
    description: 'Premium BITD True Believer Black T-Shirt featuring our signature design. Made with high-quality fabric for comfort and durability.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  '2': {
    id: '2',
    title: 'BITD "True Believer" White T-Shirt',
    image: '/glowing-lamp/WhiteTruBlv.jpg',
    price: '$3000',
    description: 'Premium BITD True Believer White T-Shirt featuring our signature design. Classic white color with high-quality fabric for comfort and style.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  '3': {
    id: '3',
    title: 'Believe in the Designs T-Shirt, Black',
    image: '/glowing-lamp/BelieveDesigns.jpg',
    price: '$3500',
    description: 'Believe in the Designs Black T-Shirt featuring our iconic logo. Premium quality material for everyday wear.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
};

export default function Product() {  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);  const [reviewText, setReviewText] = useState<string>('');
  const [reviewName, setReviewName] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviews, setReviews] = useState<Array<{name: string, text: string, rating: number, date: string}>>([]);
  
  const product = id ? mockProducts[id as keyof typeof mockProducts] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/" className="text-yellow-400 hover:underline">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  
  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        category: "Product"
      });
    }
  };  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    
    setSizeError(false);
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: parseFloat(product.price.replace('$', '')),
      size: selectedSize
    });
    
    // Show success message
    setAddedToCart(true);
    
    // Hide the success message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };
  
  // Get other products as suggested items
  const suggestedProducts = Object.values(mockProducts)
    .filter(p => p.id !== product?.id)
    .slice(0, 2);
    
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewText && reviewName && rating > 0) {
      const newReview = {
        name: reviewName,
        text: reviewText,
        rating: rating,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setReviews([newReview, ...reviews]);
      setReviewText('');
      setReviewName('');
      setRating(0);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
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

          {/* Product Details */}          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>
                {product.title}
              </h1>
              <p className="text-3xl text-yellow-400 font-semibold">{product.price}</p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed" style={{ fontFamily: fonts.body }}>
              {product.description}
            </p>            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`px-4 py-2 border rounded-lg transition-all ${
                      selectedSize === size 
                        ? 'bg-[#BD9526] text-black border-[#BD9526]' 
                        : 'border-white/20 hover:border-yellow-400 hover:bg-yellow-400/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-red-500 mt-2 text-sm">Please select a size before adding to cart</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              {/* Add to Cart Button */}              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:to-yellow-500 transition-all transform hover:scale-105"                style={{ fontFamily: fonts.body }}
              >
                {addedToCart ? 'Added to Cart! ✓' : `Add to Cart ${selectedSize ? `(Size: ${selectedSize})` : ''}`}
              </button>
              
              {/* Add to Wishlist Button */}              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  inWishlist 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <HeartIcon size={22} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Back to Products */}
            <Link 
              to="/products" 
              className="inline-block text-yellow-400 hover:underline mt-4"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
        
        {/* Suggested Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {suggestedProducts.map(suggestedProduct => (
              <Link key={suggestedProduct.id} to={`/product/${suggestedProduct.id}`}>
                <div className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[#BD9526]/20 transition-all duration-300 group">
                  <div className="h-52 overflow-hidden">
                    <img 
                      src={suggestedProduct.image} 
                      alt={suggestedProduct.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[#BD9526] transition-colors">{suggestedProduct.title}</h3>
                    <p className="text-[#BD9526]">{suggestedProduct.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
            Customer Reviews
          </h2>
          
          {/* Reviews List */}
          <div className="space-y-6 mb-12">
            {reviews.length > 0 ? reviews.map((review, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <div className="flex text-yellow-500 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon 
                          key={star} 
                          size={16} 
                          fill={star <= review.rating ? "currentColor" : "none"}
                          className="mr-1"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">{review.date}</span>
                </div>
                <p className="text-gray-300">{review.text}</p>
              </div>
            )) : (
              <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
          
          {/* Review Form */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#BD9526]"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl mr-1 focus:outline-none text-yellow-500"
                    >
                      <StarIcon 
                        size={24} 
                        fill={(hoverRating || rating) >= star ? "currentColor" : "none"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 h-32 focus:outline-none focus:border-[#BD9526]"
                  placeholder="Share your thoughts about this product"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#BD9526] to-[#14452F] text-white font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                Submit Review <SendIcon size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
