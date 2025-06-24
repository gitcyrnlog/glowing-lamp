import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { CartProvider } from './features/cart/CartContext';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/product/:id',
    element: <Product />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}
