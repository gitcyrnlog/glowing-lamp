import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  AlertTriangle,
  Upload,
  ShoppingBag
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import { useFirestore } from '../../hooks/useFirestore';
import ProductService from '../../lib/productService';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  slug: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryActive, setCategoryActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  // In a real implementation, this would be fetched from a categoryService
  // For now, let's derive it from product data
  const { 
    data: products, 
    loading, 
    error, 
    refetch 
  } = useFirestore<any[]>(() => ProductService.getAllProducts());
  
  // Generate category data from products
  const categories: Category[] = React.useMemo(() => {
    if (!products) return [];
    
    const categoryMap: Record<string, Category> = {};
    
    products.forEach(product => {
      if (product.category) {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = {
            id: product.category.toLowerCase().replace(/\s+/g, '-'),
            name: product.category,
            slug: product.category.toLowerCase().replace(/\s+/g, '-'),
            productCount: 1,
            isActive: true
          };
        } else {
          categoryMap[product.category].productCount += 1;
        }
      }
    });
    
    return Object.values(categoryMap);
  }, [products]);
  
  // Filter categories based on search
  const filteredCategories = !categories ? [] : categories.filter(category => {
    if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Sort categories by name
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would call categoryService.createCategory
    // For now, we'll just show a success message
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Category created:', {
        name: categoryName,
        description: categoryDescription,
        image: categoryImage,
        isActive: categoryActive
      });
      
      // Reset form and close modal
      setCategoryName('');
      setCategoryDescription('');
      setCategoryImage(null);
      setCategoryActive(true);
      setIsCategoryModalOpen(false);
      
      // In a real implementation, we would refetch the categories
      // refetch();
      
      alert('Category created successfully! This is just a demonstration - in a real implementation, this would save to Firebase.');
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    // In a real implementation, this would call categoryService.deleteCategory
    try {
      setIsSubmitting(true);
      setDeleteError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Category deleted:', selectedCategory);
      
      // Close modal and reset selected category
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      
      // In a real implementation, we would refetch the categories
      // refetch();
      
      alert('Category deleted successfully! This is just a demonstration - in a real implementation, this would delete from Firebase.');
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteError('Failed to delete category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setCategoryActive(category.isActive);
    setIsCategoryModalOpen(true);
  };
  
  const openCreateModal = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryImage(null);
    setCategoryActive(true);
    setIsCategoryModalOpen(true);
  };
  
  return (
    <AdminLayout title="Categories">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Category Management
        </motion.h1>
        
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button 
            className="flex items-center gap-2 bg-[#BD9526] text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            <span>Add Category</span>
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
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#BD9526] placeholder-gray-400"
              />
            </div>
          </div>
        </div>
        
        {/* Categories Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-2">Failed to load categories</p>
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
                      <span>Category</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">
                    <div className="flex items-center">
                      <span>Products</span>
                      <ArrowUpDown size={14} className="ml-1 cursor-pointer" />
                    </div>
                  </th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            {category.image ? (
                              <img 
                                src={category.image} 
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/14452F/FFFFFF?text=BITD';
                                }}
                              />
                            ) : (
                              <ShoppingBag size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate">{category.name}</h3>
                            <p className="text-xs text-gray-400 truncate">Slug: {category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {category.description || 'No description'}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          category.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="View Products"
                            onClick={() => window.open(`/categories/${category.slug}`, '_blank')}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                            title="Edit Category"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 transition-colors"
                            title="Delete Category"
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedCategories.length)} of {sortedCategories.length} categories
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
      
      {/* Category Form Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={selectedCategory ? `Edit Category: ${selectedCategory.name}` : "Create New Category"}
        size="md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              placeholder="Enter category description (optional)"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <label
                    htmlFor="category-image"
                    className="relative cursor-pointer rounded-md font-medium text-[#BD9526] hover:text-[#E5B230] focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="category-image"
                      name="category-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && setCategoryImage(e.target.files[0])}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={categoryActive}
              onChange={(e) => setCategoryActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 text-[#BD9526] focus:ring-[#BD9526] focus:ring-opacity-25 bg-gray-700"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
              Active
            </label>
          </div>
          
          <div className="border-t border-gray-700 pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !categoryName.trim()}
              className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-opacity-90 flex items-center disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save Category'
              )}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center text-red-400 space-x-2">
            <AlertTriangle size={20} />
            <span>Are you sure you want to delete this category?</span>
          </div>
          <p className="text-gray-400 text-sm">
            This action cannot be undone. Deleting a category does not delete the associated products, but they will no longer be categorized.
          </p>
          
          <div className="p-3 bg-amber-900/30 border border-amber-800 rounded-md text-amber-400 text-sm">
            <p><strong>Warning:</strong> This category has {selectedCategory?.productCount} product{selectedCategory?.productCount !== 1 ? 's' : ''}. These products will not be deleted but will need to be reassigned to another category.</p>
          </div>
          
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
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
