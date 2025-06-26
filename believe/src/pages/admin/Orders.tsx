import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  FileText,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import OrderService, { Order, OrderStatus } from '../../lib/orderService';
import useFirestore from '../../hooks/useFirestore';

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNote, setOrderNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;
  
  // Get all orders
  const { 
    data: orders, 
    loading, 
    error, 
    refetch 
  } = useFirestore<Order[]>(() => OrderService.getAllOrders());
  
  // Filter orders based on search, filter, and status
  const filteredOrders = !orders ? [] : orders.filter(order => {
    // Search filter for order number or customer email
    if (searchQuery && 
        !order.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'total-high':
        return b.total - a.total;
      case 'total-low':
        return a.total - b.total;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // View order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };
  
  // Edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setOrderNote('');
    setIsEditModalOpen(true);
  };
  
  // Update order status
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare updated order data
      const updateData: Partial<Order> = {
        status: newStatus,
        trackingNumber: trackingNumber || undefined
      };
      
      // Add note if provided
      if (orderNote.trim()) {
        const notes = [...(selectedOrder.notes || [])];
        notes.push({
          id: Date.now().toString(),
          text: orderNote.trim(),
          createdAt: new Date().toISOString(),
          createdBy: 'Admin' // In a real app, use the actual admin user name
        });
        updateData.notes = notes;
      }
      
      await OrderService.updateOrder(selectedOrder.id, updateData);
      
      // Refetch orders and close modal
      refetch();
      setIsEditModalOpen(false);
      
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate invoice
  const handleGenerateInvoice = (order: Order) => {
    // In a real implementation, this would generate a PDF invoice
    alert(`Generating invoice for order ${order.id}. In a real implementation, this would create a PDF.`);
  };
  
  // Process refund
  const handleProcessRefund = async (order: Order) => {
    if (window.confirm(`Are you sure you want to process a refund for order ${order.id}?`)) {
      try {
        await OrderService.processRefund(order.id);
        refetch();
        alert('Refund processed successfully');
      } catch (error) {
        console.error('Error processing refund:', error);
        alert('Failed to process refund');
      }
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-400';
      case 'processing':
        return 'bg-blue-900/30 text-blue-400';
      case 'shipped':
        return 'bg-purple-900/30 text-purple-400';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400';
      case 'refunded':
        return 'bg-orange-900/30 text-orange-400';
      case 'pending':
      default:
        return 'bg-yellow-900/30 text-yellow-400';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'processing':
        return <RefreshCw size={16} className="text-blue-400" />;
      case 'shipped':
        return <Truck size={16} className="text-purple-400" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-400" />;
      case 'refunded':
        return <AlertTriangle size={16} className="text-orange-400" />;
      case 'pending':
      default:
        return <Clock size={16} className="text-yellow-400" />;
    }
  };
  
  return (
    <AdminLayout title="Orders">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Order Management
        </motion.h1>
        
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            <Download size={16} />
            <span>Export Orders</span>
          </button>
        </motion.div>
      </div>
      
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by order ID or customer email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#BD9526] placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total-high">Total: High to Low</option>
                <option value="total-low">Total: Low to High</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-2">Failed to load orders</p>
              <button 
                onClick={() => refetch()}
                className="text-sm text-[#BD9526] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Order ID</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Date</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Total</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="font-medium">{order.id}</div>
                        <div className="text-xs text-gray-400">{order.items.length} item(s)</div>
                      </td>
                      <td className="p-4">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-gray-400">{order.customerEmail}</div>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center w-fit gap-1 ${getStatusBadgeClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="View Order"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="Edit Order"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="Generate Invoice"
                            onClick={() => handleGenerateInvoice(order)}
                          >
                            <FileText size={16} />
                          </button>
                          <div className="relative group">
                            <button 
                              className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                              title="More Options"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 hidden group-hover:block z-10">
                              <div className="py-1">
                                {(order.status === 'completed' || order.status === 'shipped') && (
                                  <button
                                    onClick={() => handleProcessRefund(order)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <AlertTriangle size={14} />
                                    Process Refund
                                  </button>
                                )}
                                {order.status === 'processing' && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setNewStatus('shipped');
                                      setTrackingNumber(order.trackingNumber || '');
                                      setOrderNote('Your order has been shipped!');
                                      setIsEditModalOpen(true);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <Truck size={14} />
                                    Mark as Shipped
                                  </button>
                                )}
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setNewStatus('processing');
                                      setTrackingNumber('');
                                      setOrderNote('Your order is now being processed.');
                                      setIsEditModalOpen(true);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <RefreshCw size={14} />
                                    Mark as Processing
                                  </button>
                                )}
                                {order.status === 'shipped' && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setNewStatus('completed');
                                      setTrackingNumber(order.trackingNumber || '');
                                      setOrderNote('Your order is now complete. Thank you for your purchase!');
                                      setIsEditModalOpen(true);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <CheckCircle size={14} />
                                    Mark as Completed
                                  </button>
                                )}
                                {(order.status === 'pending' || order.status === 'processing') && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setNewStatus('cancelled');
                                      setTrackingNumber(order.trackingNumber || '');
                                      setOrderNote('Your order has been cancelled.');
                                      setIsEditModalOpen(true);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <XCircle size={14} />
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of {sortedOrders.length} orders
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 transition-colors'}`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      currentPage === pageNumber 
                        ? 'bg-[#BD9526] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600 transition-colors'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      currentPage === totalPages 
                        ? 'bg-[#BD9526] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600 transition-colors'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 transition-colors'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Order Details: ${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-750 p-4 rounded-md">
                <h3 className="font-medium text-white mb-2">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tracking:</span>
                      <span>{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-md">
                <h3 className="font-medium text-white mb-2">Customer</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="ml-2">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="ml-2">{selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="ml-2">{selectedOrder.customerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-md">
                <h3 className="font-medium text-white mb-2">Shipping Address</h3>
                <div className="space-y-1 text-sm">
                  <div>{selectedOrder.shippingAddress.street}</div>
                  {selectedOrder.shippingAddress.street2 && (
                    <div>{selectedOrder.shippingAddress.street2}</div>
                  )}
                  <div>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                  </div>
                  <div>{selectedOrder.shippingAddress.country}</div>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div>
              <h3 className="font-medium text-white mb-3">Order Items</h3>
              <div className="border border-gray-700 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-750 divide-y divide-gray-700">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ShoppingBag size={16} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{item.name}</div>
                              <div className="text-xs text-gray-400">
                                {item.variant && `${item.variant.size}${item.variant.color ? ` / ${item.variant.color}` : ''}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-800">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                        Subtotal:
                      </td>
                      <td className="px-6 py-3 text-sm text-white">
                        ${selectedOrder.subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                        Shipping:
                      </td>
                      <td className="px-6 py-3 text-sm text-white">
                        ${selectedOrder.shipping.toFixed(2)}
                      </td>
                    </tr>                    {(selectedOrder.discount !== undefined && selectedOrder.discount > 0) && (
                      <tr>
                        <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                          Discount:
                        </td>
                        <td className="px-6 py-3 text-sm text-green-400">
                          -${selectedOrder.discount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                        Tax:
                      </td>
                      <td className="px-6 py-3 text-sm text-white">
                        ${selectedOrder.tax.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-white">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-white">
                        ${selectedOrder.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Order Notes */}
            {selectedOrder.notes && selectedOrder.notes.length > 0 && (
              <div>
                <h3 className="font-medium text-white mb-3">Order Notes</h3>
                <div className="space-y-3">
                  {selectedOrder.notes.map((note) => (
                    <div key={note.id} className="bg-gray-750 p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-[#BD9526]">
                          {note.createdBy}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditOrder(selectedOrder);
                }}
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90"
              >
                Edit Order
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Order: ${selectedOrder?.id}`}
        size="md"
      >
        {selectedOrder && (
          <form onSubmit={handleUpdateOrder} className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Order Status
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            {newStatus === 'shipped' && (
              <div>
                <label htmlFor="tracking" className="block text-sm font-medium text-gray-300 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                  placeholder="Enter tracking number"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1">
                Add Note
              </label>
              <textarea
                id="note"
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Add a note about this update (optional)"
              ></textarea>
            </div>
            
            <div className="border-t border-gray-700 pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90 flex items-center disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></span>
                    Saving...
                  </>
                ) : (
                  'Update Order'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
}
