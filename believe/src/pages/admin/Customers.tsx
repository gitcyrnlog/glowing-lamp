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
  Mail,
  Star,
  ArrowUpDown,
  Check,
  X,
  AlertTriangle,
  ShoppingBag,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import CustomerService, { Customer } from '../../lib/customerService';
import OrderService, { Order } from '../../lib/orderService';
import useFirestore from '../../hooks/useFirestore';

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({});
  const [customerNote, setCustomerNote] = useState('');
  const itemsPerPage = 10;
  
  // Get all customers
  const { 
    data: customers, 
    loading, 
    error, 
    refetch 
  } = useFirestore<Customer[]>(() => CustomerService.getAllCustomers());
  
  // Get selected customer orders
  const { 
    data: customerOrders 
  } = useFirestore<Order[]>(
    () => selectedCustomer ? OrderService.getOrdersByCustomer(selectedCustomer.id) : Promise.resolve([]),
    { dependencies: [selectedCustomer?.id] }
  );
  
  // Filter customers based on search and filter
  const filteredCustomers = !customers ? [] : customers.filter(customer => {
    // Search filter
    if (searchQuery && 
        !customer.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !customer.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (selectedFilter === 'high-value' && !customer.isHighValue) {
      return false;
    } else if (selectedFilter === 'recent' && !customer.isRecentCustomer) {
      return false;
    } else if (selectedFilter === 'inactive' && customer.isActive) {
      return false;
    } else if (selectedFilter === 'active' && !customer.isActive) {
      return false;
    }
      return true;
  });
  
  // Sort filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'orders-high':
        return (b.orderCount || 0) - (a.orderCount || 0);
      case 'spend-high':
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // View customer details
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };
  
  // Edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditedCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      isHighValue: customer.isHighValue,
      isActive: customer.isActive
    });
    setCustomerNote('');
    setIsEditModalOpen(true);
  };
  
  // Update customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare updated customer data
      const updateData: Partial<Customer> = {
        ...editedCustomer
      };
      
      // Add note if provided
      if (customerNote.trim()) {
        const notes = [...(selectedCustomer.notes || [])];
        notes.push({
          id: Date.now().toString(),
          text: customerNote.trim(),
          createdAt: new Date().toISOString(),
          createdBy: 'Admin' // In a real app, use the actual admin user name
        });
        updateData.notes = notes;
      }
      
      await CustomerService.updateCustomer(selectedCustomer.id, updateData);
      
      // Refetch customers and close modal
      refetch();
      setIsEditModalOpen(false);
      
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Send email to customer
  const handleSendEmail = (customer: Customer) => {
    // In a real implementation, this would open an email composer
    // or integrate with a marketing email service
    alert(`Sending email to ${customer.email}. In a real implementation, this would open an email composer.`);
  };
  
  // Toggle high value status
  const handleToggleHighValue = async (customer: Customer) => {
    try {
      await CustomerService.updateCustomer(customer.id, {
        isHighValue: !customer.isHighValue
      });
      refetch();
    } catch (error) {
      console.error('Error toggling high value status:', error);
    }
  };
  
  // Toggle active status
  const handleToggleActive = async (customer: Customer) => {
    try {
      await CustomerService.updateCustomer(customer.id, {
        isActive: !customer.isActive
      });
      refetch();
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <AdminLayout title="Customers">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Customer Management
        </motion.h1>
        
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            <Mail size={16} />
            <span>Email Selected</span>
          </button>
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            <Download size={16} />
            <span>Export Customers</span>
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
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#BD9526] placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
                >
                  <option value="all">All Customers</option>
                  <option value="high-value">High Value</option>
                  <option value="recent">Recent</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="orders-high">Most Orders</option>
                <option value="spend-high">Highest Spend</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Customers Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-2">Failed to load customers</p>
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
                      <span>Customer</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Orders</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Total Spent</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Joined</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            {customer.avatar ? (
                              <img 
                                src={customer.avatar} 
                                alt={customer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium truncate">{customer.name}</h3>
                              {customer.isHighValue && (
                                <Star size={14} className="ml-1 text-amber-400 fill-amber-400" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          customer.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {customer.orderCount}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="View Customer"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="Edit Customer"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="Send Email"
                            onClick={() => handleSendEmail(customer)}
                          >
                            <Mail size={16} />
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
                                <button
                                  onClick={() => handleToggleHighValue(customer)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Star size={14} />
                                  {customer.isHighValue ? 'Remove High Value Flag' : 'Mark as High Value'}
                                </button>
                                <button
                                  onClick={() => handleToggleActive(customer)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                >
                                  {customer.isActive ? (
                                    <>
                                      <X size={14} />
                                      Mark as Inactive
                                    </>
                                  ) : (
                                    <>
                                      <Check size={14} />
                                      Mark as Active
                                    </>
                                  )}
                                </button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedCustomers.length)} of {sortedCustomers.length} customers
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
      
      {/* View Customer Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Customer Profile: ${selectedCustomer?.name}`}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center mr-4">
                    {selectedCustomer.avatar ? (
                      <img 
                        src={selectedCustomer.avatar} 
                        alt={selectedCustomer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                      {selectedCustomer.isHighValue && (
                        <span className="ml-2 px-2 py-1 text-xs bg-amber-900/30 text-amber-400 rounded-full flex items-center">
                          <Star size={12} className="mr-1 fill-amber-400" />
                          High Value
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{selectedCustomer.email}</p>
                  </div>
                </div>
                
                <div className="bg-gray-750 p-4 rounded-md space-y-3">
                  <h4 className="font-medium text-white">Contact Information</h4>
                  <div className="flex items-center text-sm">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <span>{selectedCustomer.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin size={16} className="mr-3 text-gray-400 mt-0.5" />
                    <div>
                      {selectedCustomer.address ? (
                        <>
                          <div>{selectedCustomer.address.street}</div>
                          {selectedCustomer.address.street2 && (
                            <div>{selectedCustomer.address.street2}</div>
                          )}
                          <div>
                            {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zip}
                          </div>
                          <div>{selectedCustomer.address.country}</div>
                        </>
                      ) : (
                        <span>No address on file</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-750 p-4 rounded-md space-y-3">
                  <h4 className="font-medium text-white">Account Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Customer Since:</span>
                      <span>{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={selectedCustomer.isActive ? 'text-green-400' : 'text-red-400'}>
                        {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Login:</span>
                      <span>{selectedCustomer.lastLogin ? formatDate(selectedCustomer.lastLogin) : 'Never'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Newsletter:</span>
                      <span>{selectedCustomer.subscribedToNewsletter ? 'Subscribed' : 'Not Subscribed'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-750 p-4 rounded-md space-y-3">
                  <h4 className="font-medium text-white">Purchase Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#BD9526]">{selectedCustomer.orderCount}</div>
                      <div className="text-xs text-gray-400">Total Orders</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#BD9526]">${selectedCustomer.totalSpent.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Total Spent</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md text-center">                      <div className="text-2xl font-bold text-[#BD9526]">
                        ${((selectedCustomer.totalSpent || 0) / Math.max(selectedCustomer.orderCount || 0, 1)).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Average Order</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#BD9526]">
                        {selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">Last Order</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-750 p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Recent Orders</h4>
                    <button className="text-xs text-[#BD9526] hover:underline">
                      View All Orders
                    </button>
                  </div>
                  
                  {customerOrders && customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{order.id}</div>
                            <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">${order.total.toFixed(2)}</div>
                            <div className={`text-xs ${
                              order.status === 'completed' ? 'text-green-400' : 
                              order.status === 'cancelled' ? 'text-red-400' : 
                              'text-yellow-400'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800 p-4 rounded-md text-center text-gray-400 text-sm">
                      No orders found
                    </div>
                  )}
                </div>
                
                {/* Customer Notes */}
                {selectedCustomer.notes && selectedCustomer.notes.length > 0 && (
                  <div className="bg-gray-750 p-4 rounded-md space-y-3">
                    <h4 className="font-medium text-white">Customer Notes</h4>
                    <div className="space-y-2">
                      {selectedCustomer.notes.map((note) => (
                        <div key={note.id} className="bg-gray-800 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
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
              </div>
            </div>
            
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
                  handleEditCustomer(selectedCustomer);
                }}
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90"
              >
                Edit Customer
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Customer: ${selectedCustomer?.name}`}
        size="md"
      >
        {selectedCustomer && (
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={editedCustomer.name || ''}
                onChange={(e) => setEditedCustomer({...editedCustomer, name: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Customer name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={editedCustomer.email || ''}
                onChange={(e) => setEditedCustomer({...editedCustomer, email: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Customer email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone (optional)
              </label>
              <input
                type="text"
                id="phone"
                value={editedCustomer.phone || ''}
                onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Phone number"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHighValue"
                  checked={editedCustomer.isHighValue || false}
                  onChange={(e) => setEditedCustomer({...editedCustomer, isHighValue: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-600 text-[#BD9526] focus:ring-[#BD9526] focus:ring-opacity-25 bg-gray-700"
                />
                <label htmlFor="isHighValue" className="ml-2 text-sm text-gray-300">
                  High Value Customer
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editedCustomer.isActive || false}
                  onChange={(e) => setEditedCustomer({...editedCustomer, isActive: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-600 text-[#BD9526] focus:ring-[#BD9526] focus:ring-opacity-25 bg-gray-700"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                  Active
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1">
                Add Note
              </label>
              <textarea
                id="note"
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Add a note about this customer (optional)"
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
                disabled={isSubmitting || !editedCustomer.name || !editedCustomer.email}
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90 flex items-center disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></span>
                    Saving...
                  </>
                ) : (
                  'Update Customer'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
}
