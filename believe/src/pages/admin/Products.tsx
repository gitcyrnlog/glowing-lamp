import React, { useState, useRef } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import ProductService, { Product } from '../../lib/productService';
import useFirestore from '../../hooks/useFirestore';
import Modal from '../../components/admin/Modal';
import ProductForm from '../../components/admin/ProductForm';

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;
  
  // Get all products
  const { 
    data: products, 
    loading, 
    error, 
    refetch 
  } = useFirestore<Product[]>(() => ProductService.getAllProducts());
  
  // Filter products based on search, filter, and status
  const filteredProducts = !products ? [] : products.filter(product => {
    // Search filter
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedFilter !== 'all' && product.category !== selectedFilter) {
      return false;
    }
    
    // Status filter (inventory status)
    if (selectedStatus === 'in-stock' && (!product.inventory || product.inventory <= 0)) {
      return false;
    } else if (selectedStatus === 'out-of-stock' && product.inventory && product.inventory > 0) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const numericPriceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
    const numericPriceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
    
    switch (sortBy) {
      case 'price-low':
        return numericPriceA - numericPriceB;
      case 'price-high':
        return numericPriceB - numericPriceA;
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'newest':
      default:
        return 0; // Assuming products are already sorted by createdAt in the API call
    }
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
    // Extract unique categories for filter
  const categories = products ? 
    ['all', ...new Set(products.map(product => product.category))] : 
    ['all'];
    
  // Handle creating a new product
  const handleCreateProduct = async (productData: Omit<Product, 'id'>, imageFile?: File) => {
    try {
      setIsSubmitting(true);
      await ProductService.createProduct(productData, imageFile);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle editing a product
  const handleEditProduct = async (productData: Omit<Product, 'id'>, imageFile?: File) => {
    if (!selectedProduct) return;
    
    try {
      setIsSubmitting(true);
      await ProductService.updateProduct(selectedProduct.id, productData, imageFile);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting a product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setIsSubmitting(true);
      setDeleteError(null);
      await ProductService.deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteError('Failed to delete product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle toggling product visibility
  const handleToggleVisibility = async (product: Product) => {
    try {
      await ProductService.toggleProductVisibility(product.id, !product.isPublished);
      refetch();
    } catch (error) {
      console.error('Error toggling product visibility:', error);
    }
  };
  
  // Handle toggling featured status
  const handleToggleFeatured = async (product: Product) => {
    try {
      await ProductService.toggleFeaturedStatus(product.id, !product.featured);
      refetch();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };
  
  // Handle CSV import
  const handleCsvImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process CSV file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Here you would parse the CSV file
      // For now we'll just show a placeholder implementation
      try {
        setIsSubmitting(true);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        refetch();
        alert('Import functionality would be implemented here. CSV processed successfully.');
      } catch (error) {
        console.error('Error importing products:', error);
        alert('Error importing products. Please check the file format and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <AdminLayout title="Products">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Product Management
        </motion.h1>
          <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button 
            className="flex items-center gap-2 bg-[#BD9526] text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
          <button 
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            onClick={handleCsvImport}
          >
            <Upload size={16} />
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            <Download size={16} />
            <span>Export</span>
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
                placeholder="Search products..."
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
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Products Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-2">Failed to load products</p>
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
                      <span>Product</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Category</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Price</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Inventory</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-700 flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/14452F/FFFFFF?text=BITD';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate">{product.title}</h3>
                            <p className="text-xs text-gray-400 truncate">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{product.category}</td>
                      <td className="p-4 text-sm font-medium">{product.price}</td>
                      <td className="p-4 text-sm">
                        {product.inventory ?? 0} units
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          (product.inventory ?? 0) > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {(product.inventory ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="View Product"
                            onClick={() => window.open(`/product/${product.id}`, '_blank')}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="Edit Product"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 transition-colors"
                            title="Delete Product"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
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
                                  onClick={() => handleToggleVisibility(product)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                                >
                                  {product.isPublished ? 'Unpublish' : 'Publish'} Product
                                </button>
                                <button
                                  onClick={() => handleToggleFeatured(product)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                                >
                                  {product.featured ? 'Remove from' : 'Add to'} Featured
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
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
        )}      </motion.div>
      
      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Product"
        size="lg"
      >
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Product: ${selectedProduct?.title}`}
        size="lg"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSubmit={handleEditProduct}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center text-red-400 space-x-2">
            <AlertTriangle size={20} />
            <span>Are you sure you want to delete this product?</span>
          </div>
          <p className="text-gray-400 text-sm">
            This action cannot be undone. This will permanently delete the product 
            <span className="font-semibold text-white"> {selectedProduct?.title}</span>.
          </p>
          
          {deleteError && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400 text-sm">
              {deleteError}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
