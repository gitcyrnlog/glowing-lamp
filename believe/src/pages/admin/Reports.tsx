import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  CreditCard, 
  Calendar,
  ArrowRight,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Package,
  Clock,
  Filter,
  Download,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import AnalyticsService from '../../lib/analyticsService';
import useFirestore from '../../hooks/useFirestore';

export default function AdminReports() {
  const [dateRange, setDateRange] = useState('30d'); // '7d', '30d', '90d', 'ytd', 'all'
  
  // Get sales metrics for the selected date range
  const { 
    data: salesMetrics, 
    loading: loadingSales, 
    error: errorSales 
  } = useFirestore(() => AnalyticsService.getSalesMetrics(dateRange));
  
  // Get inventory metrics
  const { 
    data: inventoryMetrics, 
    loading: loadingInventory, 
    error: errorInventory 
  } = useFirestore(() => AnalyticsService.getInventoryMetrics());
  
  // Get customer metrics
  const { 
    data: customerMetrics, 
    loading: loadingCustomer, 
    error: errorCustomer 
  } = useFirestore(() => AnalyticsService.getCustomerMetrics(dateRange));
  
  // Get top selling products
  const { 
    data: topProducts, 
    loading: loadingProducts, 
    error: errorProducts 
  } = useFirestore(() => AnalyticsService.getTopSellingProducts(dateRange, 5));
  
  // Get recent orders
  const { 
    data: recentOrders, 
    loading: loadingOrders, 
    error: errorOrders 
  } = useFirestore(() => AnalyticsService.getRecentOrders(5));
  
  // Get sales by category
  const { 
    data: categoryData, 
    loading: loadingCategories, 
    error: errorCategories 
  } = useFirestore(() => AnalyticsService.getSalesByCategory(dateRange));
  
  // Calculate percentage change for display
  const getPercentageChange = (current: number, previous: number): { value: number, isPositive: boolean } => {
    if (previous === 0) return { value: 100, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <AdminLayout title="Analytics">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Analytics Dashboard
        </motion.h1>
        
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </motion.div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Sales */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Sales</p>
              {loadingSales ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
              ) : errorSales ? (
                <div className="flex items-center text-red-400 text-sm">
                  <AlertTriangle size={14} className="mr-1" />
                  Error loading data
                </div>
              ) : (
                <h3 className="text-2xl font-bold">{formatCurrency(salesMetrics?.totalSales || 0)}</h3>
              )}
            </div>
            <div className="p-2 bg-[#BD9526]/20 rounded-lg">
              <DollarSign size={20} className="text-[#BD9526]" />
            </div>
          </div>
          
          {!loadingSales && !errorSales && salesMetrics && (
            <div className="flex items-center mt-3">
              {salesMetrics.salesChange.isPositive ? (
                <ArrowUp size={14} className="text-green-400 mr-1" />
              ) : (
                <ArrowDown size={14} className="text-red-400 mr-1" />
              )}
              <span className={`text-xs ${salesMetrics.salesChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {salesMetrics.salesChange.percentage}% from previous period
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Orders */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Orders</p>
              {loadingSales ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
              ) : errorSales ? (
                <div className="flex items-center text-red-400 text-sm">
                  <AlertTriangle size={14} className="mr-1" />
                  Error loading data
                </div>
              ) : (
                <h3 className="text-2xl font-bold">{salesMetrics?.orderCount || 0}</h3>
              )}
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShoppingBag size={20} className="text-blue-500" />
            </div>
          </div>
          
          {!loadingSales && !errorSales && salesMetrics && (
            <div className="flex items-center mt-3">
              {salesMetrics.orderChange.isPositive ? (
                <ArrowUp size={14} className="text-green-400 mr-1" />
              ) : (
                <ArrowDown size={14} className="text-red-400 mr-1" />
              )}
              <span className={`text-xs ${salesMetrics.orderChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {salesMetrics.orderChange.percentage}% from previous period
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Customers */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">New Customers</p>
              {loadingCustomer ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
              ) : errorCustomer ? (
                <div className="flex items-center text-red-400 text-sm">
                  <AlertTriangle size={14} className="mr-1" />
                  Error loading data
                </div>
              ) : (
                <h3 className="text-2xl font-bold">{customerMetrics?.newCustomers || 0}</h3>
              )}
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users size={20} className="text-purple-500" />
            </div>
          </div>
          
          {!loadingCustomer && !errorCustomer && customerMetrics && (
            <div className="flex items-center mt-3">
              {customerMetrics.customerChange.isPositive ? (
                <ArrowUp size={14} className="text-green-400 mr-1" />
              ) : (
                <ArrowDown size={14} className="text-red-400 mr-1" />
              )}
              <span className={`text-xs ${customerMetrics.customerChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {customerMetrics.customerChange.percentage}% from previous period
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Average Order Value */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg. Order Value</p>
              {loadingSales ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
              ) : errorSales ? (
                <div className="flex items-center text-red-400 text-sm">
                  <AlertTriangle size={14} className="mr-1" />
                  Error loading data
                </div>
              ) : (
                <h3 className="text-2xl font-bold">{formatCurrency(salesMetrics?.averageOrderValue || 0)}</h3>
              )}
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp size={20} className="text-green-500" />
            </div>
          </div>
          
          {!loadingSales && !errorSales && salesMetrics && (
            <div className="flex items-center mt-3">
              {salesMetrics.aovChange.isPositive ? (
                <ArrowUp size={14} className="text-green-400 mr-1" />
              ) : (
                <ArrowDown size={14} className="text-red-400 mr-1" />
              )}
              <span className={`text-xs ${salesMetrics.aovChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {salesMetrics.aovChange.percentage}% from previous period
              </span>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Trend */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 p-4 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Sales Trend</h3>
            <span className="text-sm text-gray-400">
              {dateRange === '7d' ? 'Last 7 Days' :
               dateRange === '30d' ? 'Last 30 Days' :
               dateRange === '90d' ? 'Last 90 Days' :
               dateRange === 'ytd' ? 'Year to Date' : 'All Time'}
            </span>
          </div>
          
          {loadingSales ? (
            <div className="h-64 w-full bg-gray-700 rounded animate-pulse flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : errorSales ? (
            <div className="h-64 w-full flex items-center justify-center text-red-400">
              <AlertTriangle size={24} className="mr-2" />
              <span>Failed to load sales data</span>
            </div>
          ) : salesMetrics?.dailySales && salesMetrics.dailySales.length > 0 ? (
            <div className="h-64 relative">
              {/* This is a placeholder for a chart component */}
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 size={80} className="text-gray-600" />
                <div className="absolute text-gray-400 text-sm">
                  In a real implementation, this would be a chart showing sales trend over time
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-gray-400">
              <span>No sales data available</span>
            </div>
          )}
        </motion.div>
        
        {/* Sales by Category */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Sales by Category</h3>
          </div>
          
          {loadingCategories ? (
            <div className="h-64 w-full bg-gray-700 rounded animate-pulse flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : errorCategories ? (
            <div className="h-64 w-full flex items-center justify-center text-red-400">
              <AlertTriangle size={24} className="mr-2" />
              <span>Failed to load category data</span>
            </div>
          ) : categoryData && categoryData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-36 relative">
                {/* This is a placeholder for a pie chart component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PieChart size={60} className="text-gray-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: `hsl(${index * 40}, 70%, 50%)` }}
                    ></div>
                    <span className="text-sm flex-1">{category.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(category.sales)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-gray-400">
              <span>No category data available</span>
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Selling Products */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Top Selling Products</h3>
            <button className="text-sm text-[#BD9526] hover:underline flex items-center">
              View All
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          
          {loadingProducts ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : errorProducts ? (
            <div className="p-8 text-center text-red-400">
              <AlertTriangle size={24} className="mx-auto mb-2" />
              <span>Failed to load product data</span>
            </div>
          ) : topProducts && topProducts.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {topProducts.map((product, index) => (
                <div key={index} className="p-4 flex items-center">
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-700 flex-shrink-0 mr-3">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{product.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-gray-400">{product.unitsSold} units sold</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <span>No product data available</span>
            </div>
          )}
        </motion.div>
        
        {/* Recent Orders */}
        <motion.div 
          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Recent Orders</h3>
            <button className="text-sm text-[#BD9526] hover:underline flex items-center">
              View All
              <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          
          {loadingOrders ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : errorOrders ? (
            <div className="p-8 text-center text-red-400">
              <AlertTriangle size={24} className="mx-auto mb-2" />
              <span>Failed to load order data</span>
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {recentOrders.map((order, index) => (
                <div key={index} className="p-4 flex items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium truncate">{order.id}</h4>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        order.status === 'processing' ? 'bg-blue-900/30 text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-900/30 text-purple-400' :
                        order.status === 'cancelled' ? 'bg-red-900/30 text-red-400' :
                        order.status === 'refunded' ? 'bg-orange-900/30 text-orange-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {order.customerName} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                    <div className="text-xs text-gray-400">{order.items} items</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <span>No order data available</span>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Inventory Status */}
      <motion.div 
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">Inventory Status</h3>
        </div>
        
        {loadingInventory ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
          </div>
        ) : errorInventory ? (
          <div className="p-8 text-center text-red-400">
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <span>Failed to load inventory data</span>
          </div>
        ) : inventoryMetrics ? (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Products</span>
                  <Package size={16} className="text-gray-400" />
                </div>
                <div className="text-2xl font-bold">{inventoryMetrics.totalProducts}</div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">In Stock</span>
                  <Check size={16} className="text-green-400" />
                </div>
                <div className="text-2xl font-bold">{inventoryMetrics.inStock}</div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Low Stock</span>
                  <AlertTriangle size={16} className="text-yellow-400" />
                </div>
                <div className="text-2xl font-bold">{inventoryMetrics.lowStock}</div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Out of Stock</span>
                  <X size={16} className="text-red-400" />
                </div>
                <div className="text-2xl font-bold">{inventoryMetrics.outOfStock}</div>
              </div>
            </div>
            
            {inventoryMetrics.lowStockItems && inventoryMetrics.lowStockItems.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-yellow-400 flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  Low Stock Items
                </h4>
                <div className="bg-gray-750 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Reorder Level
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">                      {inventoryMetrics.lowStockItems.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 mr-2 bg-gray-700 rounded overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package size={14} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="text-sm font-medium">{item.name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {item.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/30 text-yellow-400">
                              {item.stock} units
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {item.reorderLevel} units
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <span>No inventory data available</span>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
