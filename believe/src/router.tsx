import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { CartProvider } from './features/cart/CartContext';
import { WishlistProvider } from './features/wishlist/WishlistContext';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';
import ErrorElement from './components/ErrorElement';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminGuard } from './components/admin/AdminGuard';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminInvitations from './pages/admin/Invitations';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';
import AdminReports from './pages/admin/Reports';
import AdminSiteConfig from './pages/admin/SiteConfig';
import AdminPayments from './pages/admin/Payments';
import AdminMarketing from './pages/admin/Marketing';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/products',
    element: <Products />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/product/:id',
    element: <Product />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/categories',
    element: <Categories />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/cart',
    element: <Cart />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/profile',
    element: <Profile />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/about',
    element: <About />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/contact',
    element: <Contact />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/wishlist',
    element: <Wishlist />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/search',
    element: <Search />,
    errorElement: <ErrorElement />,
  },
  // Admin routes
  {
    path: '/admin',
    element: <AdminGuard><AdminDashboard /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/products',
    element: <AdminGuard><AdminProducts /></AdminGuard>,
    errorElement: <ErrorElement />,
  },  {
    path: '/admin/categories',
    element: <AdminGuard><AdminCategories /></AdminGuard>,
    errorElement: <ErrorElement />,
  },  {
    path: '/admin/orders',
    element: <AdminGuard><AdminOrders /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/customers',
    element: <AdminGuard><AdminCustomers /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/reports',
    element: <AdminGuard><AdminReports /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/settings',
    element: <AdminGuard><AdminSiteConfig /></AdminGuard>,
    errorElement: <ErrorElement />,
  },  {
    path: '/admin/users',
    element: <AdminGuard><AdminDashboard /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/invitations',
    element: <AdminGuard><AdminInvitations /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/promotions',
    element: <AdminGuard><AdminMarketing /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
  {
    path: '/admin/payments',
    element: <AdminGuard><AdminPayments /></AdminGuard>,
    errorElement: <ErrorElement />,
  },
]);

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
