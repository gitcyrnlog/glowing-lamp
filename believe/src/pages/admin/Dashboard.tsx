import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  CircleDollarSign, 
  PackageIcon, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontal,
  LineChart
} from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - in a real app, this would come from Firebase/API
  const summaryCards = [
    {
      title: 'Total Revenue',
      value: '$12,650',
      change: '+12.3%',
      isPositive: true,
      icon: <CircleDollarSign className="text-[#BD9526]" />,
      period: 'vs. last month'
    },
    {
      title: 'Orders',
      value: '356',
      change: '+8.2%',
      isPositive: true,
      icon: <ShoppingBag className="text-[#14452F]" />,
      period: 'vs. last month'
    },
    {
      title: 'Customers',
      value: '2,450',
      change: '+18.7%',
      isPositive: true,
      icon: <Users className="text-[#BD9526]" />,
      period: 'vs. last month'
    },
    {
      title: 'Conversion Rate',
      value: '3.6%',
      change: '-0.8%',
      isPositive: false,
      icon: <TrendingUp className="text-[#14452F]" />,
      period: 'vs. last month'
    },
  ];
  
  const recentOrders = [
    { id: '#ORD-8724', customer: 'John Doe', date: 'Jun 23, 2025', amount: '$350', status: 'Completed' },
    { id: '#ORD-8723', customer: 'Jane Smith', date: 'Jun 22, 2025', amount: '$120', status: 'Processing' },
    { id: '#ORD-8722', customer: 'Robert Johnson', date: 'Jun 22, 2025', amount: '$750', status: 'Completed' },
    { id: '#ORD-8721', customer: 'Emily Wilson', date: 'Jun 21, 2025', amount: '$250', status: 'Shipped' },
    { id: '#ORD-8720', customer: 'Michael Brown', date: 'Jun 20, 2025', amount: '$180', status: 'Completed' },
  ];
  
  const topProducts = [
    { id: 1, name: 'BITD "True Believer" Black T-Shirt', price: '$3000', sales: 48, stock: 10 },
    { id: 2, name: 'BITD "True Believer" White T-Shirt', price: '$3000', sales: 42, stock: 8 },
    { id: 3, name: 'Believe in the Designs T-Shirt, Black', price: '$3500', sales: 36, stock: 12 },
  ];
  
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-lg bg-gray-700">{card.icon}</span>
              <span className={`text-xs font-medium flex items-center ${card.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {card.isPositive ? <ArrowUpIcon size={14} className="mr-1" /> : <ArrowDownIcon size={14} className="mr-1" />}
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-gray-400 flex justify-between">
              <span>{card.title}</span>
              <span className="text-xs opacity-70">{card.period}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Revenue Overview</h2>
            <div className="flex items-center space-x-2">
              <select className="bg-gray-700 border-gray-600 rounded-md text-sm py-1 px-2">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
              <button className="p-1 rounded-md hover:bg-gray-700">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
          
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <LineChart size={48} className="mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400">Revenue chart will be displayed here</p>
              <p className="text-xs text-gray-500 mt-2">Integration with real-time analytics</p>
            </div>
          </div>
        </motion.div>
        
        {/* Orders Chart */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Orders Overview</h2>
            <div className="flex items-center space-x-2">
              <select className="bg-gray-700 border-gray-600 rounded-md text-sm py-1 px-2">
                <option>This Week</option>
                <option>Last Week</option>
                <option>Last Month</option>
              </select>
              <button className="p-1 rounded-md hover:bg-gray-700">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
          
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400">Orders chart will be displayed here</p>
              <p className="text-xs text-gray-500 mt-2">Integration with real-time data</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <button className="text-sm text-[#BD9526] hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700">
                    <td className="py-4 text-sm font-medium">{order.id}</td>
                    <td className="py-4 text-sm">{order.customer}</td>
                    <td className="py-4 text-sm text-gray-400">{order.date}</td>
                    <td className="py-4 text-sm font-medium">{order.amount}</td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                        order.status === 'Processing' ? 'bg-blue-900/30 text-blue-400' :
                        order.status === 'Shipped' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-gray-400 hover:text-white p-1">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Top Products */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Top Products</h2>
            <button className="text-sm text-[#BD9526] hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors">
                <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 mr-3">
                  <PackageIcon size={20} className="text-[#BD9526]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span className="truncate">{product.price}</span>
                    <span className="mx-1.5">•</span>
                    <span>{product.sales} sales</span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <span className={`text-xs ${product.stock > 5 ? 'text-green-400' : 'text-yellow-500'}`}>
                    {product.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
