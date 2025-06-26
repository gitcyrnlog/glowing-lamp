import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BoxIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  LineChartIcon,
  SettingsIcon, 
  CreditCardIcon, 
  SpeakerIcon, 
  MenuIcon, 
  XIcon,
  LogOutIcon,
  HomeIcon,
  ShieldIcon,
  UserIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
    const menuItems = [
    {
      category: 'Dashboard',
      items: [
        { name: 'Overview', path: '/admin', icon: <HomeIcon size={18} /> }
      ]
    },
    {
      category: 'Catalog',
      items: [
        { name: 'Products', path: '/admin/products', icon: <BoxIcon size={18} /> },
        { name: 'Categories', path: '/admin/categories', icon: <ShoppingBagIcon size={18} /> }
      ]
    },
    {
      category: 'Sales',
      items: [
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingBagIcon size={18} /> },
        { name: 'Customers', path: '/admin/customers', icon: <UsersIcon size={18} /> },
        { name: 'Payments', path: '/admin/payments', icon: <CreditCardIcon size={18} /> }
      ]
    },
    {
      category: 'Analytics',
      items: [
        { name: 'Reports', path: '/admin/reports', icon: <LineChartIcon size={18} /> }
      ]
    },
    {
      category: 'Marketing',
      items: [
        { name: 'Promotions', path: '/admin/promotions', icon: <SpeakerIcon size={18} /> }
      ]
    },    {
      category: 'Configuration',
      items: [
        { name: 'Site Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
        { name: 'Users & Permissions', path: '/admin/users', icon: <ShieldIcon size={18} /> },
        { name: 'Invitations', path: '/admin/invitations', icon: <UserIcon size={18} /> }
      ]
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 rounded-md bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {sidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>
      
      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <motion.aside 
        className={`fixed lg:relative inset-y-0 left-0 w-64 bg-black border-r border-gray-800 overflow-y-auto z-50 lg:translate-x-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#BD9526] to-[#14452F] bg-clip-text text-transparent">
              BITD Admin
            </h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
            >
              <XIcon size={20} />
            </button>
          </div>
          
          <nav>
            {menuItems.map((category) => (
              <div key={category.category} className="mb-6">
                <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {category.category}
                </h2>
                <ul className="space-y-1">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-md ${location.pathname === item.path ? 'bg-[#BD9526] text-black font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          
          <div className="pt-6 mt-6 border-t border-gray-800">
            <Link 
              to="/profile" 
              className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <UserIcon size={18} className="mr-3" />
              Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center px-3 py-2 mt-2 text-sm rounded-md text-gray-300 hover:bg-gray-800 hover:text-white w-full text-left"
            >
              <LogOutIcon size={18} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{title}</h1>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
              >
                <HomeIcon size={16} />
                <span>View Store</span>
              </Link>
              
              <div className="relative">
                <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
