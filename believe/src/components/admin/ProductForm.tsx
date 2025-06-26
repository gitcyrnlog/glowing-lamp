import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';
import ProductService, { Product, ProductVariant } from '../../lib/productService';
import { useFirestore } from '../../hooks/useFirestore';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, 'id'>, imageFile?: File) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const initialProduct: Omit<Product, 'id'> = {
  title: '',
  description: '',
  price: '',
  image: '',
  category: '',
  featured: false,
  inventory: 0,
  sizes: ['S', 'M', 'L', 'XL'],
  variants: [],
  tags: [],
  isPublished: true
};

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSubmit, 
  onCancel,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(
    product ? { ...product } : { ...initialProduct }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variantMode, setVariantMode] = useState(false);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    size: '',
    color: '',
    stock: 0,
    sku: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [availableSizes, setAvailableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  
  // Fetch categories for the dropdown
  const { data: categories } = useFirestore<string[]>(() => {
    return new Promise((resolve) => {
      ProductService.getAllProducts().then(products => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        resolve(uniqueCategories);
      });
    });
  });
  
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setImagePreview(product.image);
    }
  }, [product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Also update the form data with the preview URL
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };
  
  const handleAddVariant = () => {
    if (newVariant.size && newVariant.stock !== undefined) {
      const variants = [...(formData.variants || [])];
      variants.push({
        id: Date.now().toString(),
        size: newVariant.size,
        color: newVariant.color || '',
        stock: newVariant.stock,
        sku: newVariant.sku || ''
      });
      
      setFormData(prev => ({ 
        ...prev, 
        variants,
        // Update total inventory based on variant stock
        inventory: variants.reduce((sum, v) => sum + v.stock, 0)
      }));
      
      // Reset new variant form
      setNewVariant({
        size: '',
        color: '',
        stock: 0,
        sku: ''
      });
    }
  };
  
  const handleRemoveVariant = (variantId: string) => {
    const variants = formData.variants?.filter(v => v.id !== variantId) || [];
    setFormData(prev => ({ 
      ...prev, 
      variants,
      // Update total inventory based on variant stock
      inventory: variants.reduce((sum, v) => sum + v.stock, 0)
    }));
  };
  
  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({ 
      ...prev, 
      [name]: name === 'stock' ? parseInt(value, 10) : value 
    }));
  };
  
  const handleAddTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput]
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, imageFile || undefined);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Product Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              placeholder="Enter product title"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
              Price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              placeholder="$0.00"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
            >
              <option value="">Select a category</option>
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add New Category</option>
            </select>
          </div>
          
          {formData.category === 'new' && (
            <div>
              <label htmlFor="newCategory" className="block text-sm font-medium text-gray-300 mb-1">
                New Category Name
              </label>
              <input
                type="text"
                id="newCategory"
                name="newCategory"
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Enter new category name"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="inventory" className="block text-sm font-medium text-gray-300 mb-1">
              Inventory
            </label>
            <input
              type="number"
              id="inventory"
              name="inventory"
              value={formData.inventory}
              onChange={handleChange}
              min="0"
              disabled={variantMode && formData.variants && formData.variants.length > 0}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              placeholder="0"
            />
            {variantMode && formData.variants && formData.variants.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Inventory is calculated from variants
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-600 text-[#BD9526] focus:ring-[#BD9526] focus:ring-opacity-25 bg-gray-700"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                Featured Product
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-600 text-[#BD9526] focus:ring-[#BD9526] focus:ring-opacity-25 bg-gray-700"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-300">
                Published
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              {imagePreview ? (
                <div className="space-y-2 text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-gray-700 hover:bg-gray-600 py-1 px-3 rounded text-sm text-white flex items-center"
                    >
                      <Upload size={14} className="mr-1" />
                      Change
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#BD9526] hover:text-[#E5B230] focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
            {!imagePreview && !imageFile && formData.image && (
              <div className="mt-2 flex items-center justify-between bg-gray-800 p-2 rounded-md">
                <span className="text-sm text-gray-300 truncate flex-1">
                  Using existing image URL
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
              placeholder="Enter product description"
            ></textarea>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Tags
              </label>
              <button
                type="button"
                className="text-xs text-[#BD9526] hover:text-[#E5B230]"
                onClick={handleAddTag}
              >
                Add Tag
              </button>
            </div>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                placeholder="Enter tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-600 px-3 py-2 rounded-r-md text-white hover:bg-gray-500"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-200"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-white"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Variants Section */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Product Variants</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="variantMode"
              checked={variantMode}
              onChange={(e) => setVariantMode(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 text-[#BD9526] focus:ring-[#BD9526] focus:ring-opacity-25 bg-gray-700"
            />
            <label htmlFor="variantMode" className="ml-2 text-sm text-gray-300">
              Enable Variants
            </label>
          </div>
        </div>
        
        {variantMode && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">
                  Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={newVariant.size}
                  onChange={handleVariantChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                >
                  <option value="">Select Size</option>
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={newVariant.color}
                  onChange={handleVariantChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                  placeholder="Red, Blue, etc."
                />
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={newVariant.stock}
                  onChange={handleVariantChange}
                  min="0"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-1">
                  SKU
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={newVariant.sku}
                    onChange={handleVariantChange}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-4 py-2 text-white focus:outline-none focus:border-[#BD9526]"
                    placeholder="SKU"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    disabled={!newVariant.size || newVariant.stock === undefined}
                    className="bg-[#BD9526] text-black px-4 py-2 rounded-r-md hover:bg-opacity-90 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {formData.variants && formData.variants.length > 0 ? (
              <div className="mt-4 border border-gray-700 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Color
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        SKU
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-750 divide-y divide-gray-700">
                    {formData.variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {variant.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {variant.color || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {variant.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {variant.sku || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 border border-dashed border-gray-700 rounded-md">
                No variants added yet
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 pt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
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
            'Save Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
