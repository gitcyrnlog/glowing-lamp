import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  PlusCircle,
  CreditCardIcon,
  Building2Icon, // Replaced BankIcon with Building2Icon as a suitable alternative
  SettingsIcon,
  Check,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import useFirestore from '../../hooks/useFirestore';

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  apiKey?: string;
  secretKey?: string;
  mode: 'test' | 'live';
  supportedCurrencies: string[];
  createdAt: any;
  updatedAt: any;
}

interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  supportedCurrencies: string[];
  documentationUrl: string;
}

// This would normally come from a payment service file
const paymentService = {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // This would be a Firestore call in the real implementation
    return mockPaymentMethods;
  },
  
  async getPaymentProviders(): Promise<PaymentProvider[]> {
    // This would be a Firestore call in the real implementation
    return mockPaymentProviders;
  },
  
  async addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // This would save to Firestore in the real implementation
    console.log('Adding payment method:', method);
    return 'new-method-id';
  },
  
  async updatePaymentMethod(id: string, method: Partial<PaymentMethod>): Promise<void> {
    // This would update in Firestore in the real implementation
    console.log('Updating payment method:', id, method);
  },
  
  async deletePaymentMethod(id: string): Promise<void> {
    // This would delete from Firestore in the real implementation
    console.log('Deleting payment method:', id);
  },
  
  async togglePaymentMethod(id: string, isActive: boolean): Promise<void> {
    // This would update in Firestore in the real implementation
    console.log('Toggling payment method:', id, isActive);
  }
};

// Mock data (would be replaced with actual data from Firebase)
const mockPaymentProviders: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    description: 'Global payment processor with support for credit cards, wallets, and local payment methods.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'],
    documentationUrl: 'https://stripe.com/docs'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png',
    description: 'Online payment system supporting transfers and payments.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'],
    documentationUrl: 'https://developer.paypal.com/docs'
  },
  {
    id: 'square',
    name: 'Square',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Square_Logo.svg',
    description: 'Payment processor with POS integration.',
    supportedCurrencies: ['USD', 'CAD', 'GBP', 'AUD', 'JPY'],
    documentationUrl: 'https://developer.squareup.com/docs'
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
    description: 'Direct bank transfer payment method.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'],
    documentationUrl: '#'
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'stripe-1',
    name: 'Credit Card (Stripe)',
    provider: 'stripe',
    isActive: true,
    apiKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
    secretKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
    mode: 'test',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    createdAt: { seconds: 1626984000, nanoseconds: 0 },
    updatedAt: { seconds: 1626984000, nanoseconds: 0 }
  },
  {
    id: 'paypal-1',
    name: 'PayPal',
    provider: 'paypal',
    isActive: true,
    apiKey: 'client_id_12345',
    secretKey: 'client_secret_12345',
    mode: 'test',
    supportedCurrencies: ['USD', 'EUR'],
    createdAt: { seconds: 1626984000, nanoseconds: 0 },
    updatedAt: { seconds: 1626984000, nanoseconds: 0 }
  },
  {
    id: 'bank-transfer-1',
    name: 'Bank Transfer',
    provider: 'bank-transfer',
    isActive: false,
    mode: 'live',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    createdAt: { seconds: 1626984000, nanoseconds: 0 },
    updatedAt: { seconds: 1626984000, nanoseconds: 0 }
  }
];

export default function Payments() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  
  // Form data for creating/editing payment methods
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    provider: '',
    mode: 'test',
    apiKey: '',
    secretKey: '',
    supportedCurrencies: [],
    isActive: true
  });
  
  // Fetch payment methods
  const { 
    data: paymentMethods, 
    loading: methodsLoading, 
    error: methodsError,
    refetch: refetchMethods
  } = useFirestore<PaymentMethod[]>(() => paymentService.getPaymentMethods());
  
  // Fetch payment providers
  const {
    data: paymentProviders,
    loading: providersLoading,
    error: providersError
  } = useFirestore<PaymentProvider[]>(() => paymentService.getPaymentProviders());
  
  // Reset form data when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setFormData({
        name: '',
        provider: '',
        mode: 'test',
        apiKey: '',
        secretKey: '',
        supportedCurrencies: [],
        isActive: true
      });
      setSelectedProvider(null);
    }
  }, [isAddModalOpen]);
  
  // Set form data when editing
  useEffect(() => {
    if (selectedMethod && isEditModalOpen) {
      setFormData({
        name: selectedMethod.name,
        provider: selectedMethod.provider,
        mode: selectedMethod.mode,
        apiKey: selectedMethod.apiKey,
        secretKey: selectedMethod.secretKey,
        supportedCurrencies: selectedMethod.supportedCurrencies,
        isActive: selectedMethod.isActive
      });
      
      // Find the selected provider
      if (paymentProviders) {
        const provider = paymentProviders.find(p => p.id === selectedMethod.provider);
        if (provider) {
          setSelectedProvider(provider);
        }
      }
    }
  }, [selectedMethod, isEditModalOpen, paymentProviders]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle provider selection
  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setFormData({
      ...formData,
      provider: provider.id,
      supportedCurrencies: provider.supportedCurrencies.slice(0, 3) // Default to first 3 currencies
    });
  };
  
  // Handle currency toggle
  const handleCurrencyToggle = (currency: string) => {
    const currentCurrencies = formData.supportedCurrencies || [];
    
    if (currentCurrencies.includes(currency)) {
      setFormData({
        ...formData,
        supportedCurrencies: currentCurrencies.filter(c => c !== currency)
      });
    } else {
      setFormData({
        ...formData,
        supportedCurrencies: [...currentCurrencies, currency]
      });
    }
  };
  
  // Toggle API key visibility
  const toggleApiKeyVisibility = (methodId: string) => {
    setShowApiKeys({
      ...showApiKeys,
      [methodId]: !showApiKeys[methodId]
    });
  };
  
  // Handle save payment method
  const handleSavePaymentMethod = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      if (!formData.name || !formData.provider) {
        throw new Error('Name and provider are required');
      }
      
      if (selectedMethod) {
        // Update existing method
        await paymentService.updatePaymentMethod(selectedMethod.id, formData);
        setSuccessMessage('Payment method updated successfully');
      } else {
        // Add new method
        await paymentService.addPaymentMethod(formData as Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>);
        setSuccessMessage('Payment method added successfully');
      }
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      refetchMethods();
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving payment method:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete payment method
  const handleDeletePaymentMethod = async () => {
    if (!selectedMethod) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      await paymentService.deletePaymentMethod(selectedMethod.id);
      setIsDeleteModalOpen(false);
      refetchMethods();
      setSuccessMessage('Payment method deleted successfully');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setErrorMessage('Failed to delete payment method');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle toggle payment method
  const handleTogglePaymentMethod = async (method: PaymentMethod) => {
    try {
      await paymentService.togglePaymentMethod(method.id, !method.isActive);
      refetchMethods();
      setSuccessMessage(`Payment method ${method.isActive ? 'disabled' : 'enabled'} successfully`);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error toggling payment method:', error);
      setErrorMessage('Failed to update payment method status');
    }
  };
  
  // Loading state
  if (methodsLoading || providersLoading) {
    return (
      <AdminLayout title="Payment Settings">
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      </AdminLayout>
    );
  }
  
  // Error state
  if (methodsError || providersError) {
    return (
      <AdminLayout title="Payment Settings">
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg text-red-200 mb-6">
          <h3 className="font-bold flex items-center">
            <AlertTriangle className="mr-2" size={18} />
            Error Loading Payment Settings
          </h3>          <p className="mt-1">
            {methodsError ? methodsError.toString() : (providersError ? providersError.toString() : 'Failed to load payment settings')}
          </p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Payment Settings">
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500 bg-opacity-20 p-4 rounded-lg text-green-200 mb-6"
          >
            <p className="font-medium">{successMessage}</p>
          </motion.div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 bg-opacity-20 p-4 rounded-lg text-red-200 mb-6"
          >
            <h3 className="font-bold flex items-center">
              <AlertTriangle className="mr-2" size={18} />
              Error
            </h3>
            <p className="mt-1">{errorMessage}</p>
          </motion.div>
        )}
        
        {/* Payment Methods Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <CreditCard className="mr-2" size={20} />
              Payment Methods
            </h2>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#BD9526] text-black rounded-md flex items-center hover:bg-[#E6C65B] transition"
            >
              <Plus size={16} className="mr-2" />
              Add Payment Method
            </button>
          </div>
          
          {paymentMethods && paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                // Find provider info
                const provider = paymentProviders?.find(p => p.id === method.provider);
                
                return (
                  <div 
                    key={method.id} 
                    className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        {/* Provider Logo */}
                        {provider && (
                          <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1">
                            <img 
                              src={provider.logo} 
                              alt={provider.name} 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        
                        {/* Method Details */}
                        <div>
                          <h3 className="font-medium text-white flex items-center">
                            {method.name}
                            <span 
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                method.isActive 
                                  ? 'bg-green-900 text-green-200' 
                                  : 'bg-gray-700 text-gray-400'
                              }`}
                            >
                              {method.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span 
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                method.mode === 'live'
                                  ? 'bg-blue-900 text-blue-200' 
                                  : 'bg-yellow-900 text-yellow-200'
                              }`}
                            >
                              {method.mode === 'live' ? 'Live' : 'Test'}
                            </span>
                          </h3>
                          
                          <p className="text-sm text-gray-400 mt-1">
                            Currencies: {method.supportedCurrencies.join(', ')}
                          </p>
                          
                          {/* API Key (hidden by default) */}
                          {method.apiKey && (
                            <div className="mt-2">
                              <div className="flex items-center text-sm text-gray-400">
                                <span className="mr-2">API Key:</span>
                                <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                                  {showApiKeys[method.id] ? method.apiKey : '••••••••••••••••'}
                                </code>
                                <button
                                  onClick={() => toggleApiKeyVisibility(method.id)}
                                  className="ml-2 text-gray-500 hover:text-white"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMethod(method);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleTogglePaymentMethod(method)}
                          className={`p-1.5 rounded-md ${
                            method.isActive 
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                              : 'text-green-400 hover:bg-green-900 hover:text-green-200'
                          }`}
                          title={method.isActive ? 'Disable' : 'Enable'}
                        >
                          {method.isActive ? (
                            <AlertTriangle size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMethod(method);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-gray-300 hover:bg-red-900 hover:text-red-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <p className="text-gray-400">No payment methods configured yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition inline-flex items-center"
              >
                <PlusCircle size={16} className="mr-2" />
                Add Your First Payment Method
              </button>
            </div>
          )}
        </div>
        
        {/* General Payment Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="mr-2" size={20} />
            <h2 className="text-xl font-semibold">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
              <div>
                <h3 className="font-medium">Currency Display</h3>
                <p className="text-sm text-gray-400">How prices are displayed to customers</p>
              </div>
              <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]">
                <option value="symbol">Symbol first ($99.99)</option>
                <option value="code">Code first (USD 99.99)</option>
                <option value="symbol-code">Both ($ 99.99 USD)</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
              <div>
                <h3 className="font-medium">Default Currency</h3>
                <p className="text-sm text-gray-400">Primary currency for your store</p>
              </div>
              <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
              <div>
                <h3 className="font-medium">Tax Calculation</h3>
                <p className="text-sm text-gray-400">How taxes are calculated and displayed</p>
              </div>
              <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]">
                <option value="inclusive">Tax Inclusive</option>
                <option value="exclusive">Tax Exclusive</option>
                <option value="auto">Automatic (Based on location)</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
              <div>
                <h3 className="font-medium">Order Number Prefix</h3>
                <p className="text-sm text-gray-400">Prefix for your order numbers</p>
              </div>
              <input 
                type="text" 
                placeholder="BITD-" 
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-[#E6C65B] transition">
              Save Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Payment Method Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={selectedMethod ? "Edit Payment Method" : "Add Payment Method"}
      >
        <div className="space-y-6">
          {/* Step 1: Select Provider (if adding new) */}
          {!selectedMethod && !selectedProvider && (
            <div>
              <h3 className="font-medium mb-4">Select Payment Provider</h3>
              <div className="grid grid-cols-2 gap-4">
                {paymentProviders && paymentProviders.map((provider) => (
                  <div 
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider)}
                    className="p-4 bg-gray-900 rounded-lg cursor-pointer border border-gray-700 hover:border-[#BD9526] transition flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center p-2 mb-3">
                      <img 
                        src={provider.logo} 
                        alt={provider.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {provider.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Configure Payment Method */}
          {(selectedMethod || selectedProvider) && (
            <>
              {/* Provider Info */}
              {selectedProvider && (
                <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-900 rounded-lg">
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center p-1">
                    <img 
                      src={selectedProvider.logo} 
                      alt={selectedProvider.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedProvider.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{selectedProvider.description}</p>
                    {selectedProvider.documentationUrl !== '#' && (
                      <a 
                        href={selectedProvider.documentationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-[#BD9526] hover:text-[#E6C65B] mt-2 inline-flex items-center"
                      >
                        View Documentation
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Method Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Credit Card"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                  />
                </div>
                
                {/* Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mode
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio"
                        name="mode"
                        value="test"
                        checked={formData.mode === 'test'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#BD9526] focus:ring-[#BD9526]"
                      />
                      <span className="ml-2 text-sm text-gray-300">Test Mode</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio"
                        name="mode"
                        value="live"
                        checked={formData.mode === 'live'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#BD9526] focus:ring-[#BD9526]"
                      />
                      <span className="ml-2 text-sm text-gray-300">Live Mode</span>
                    </label>
                  </div>
                </div>
                
                {/* API Keys - Only show for providers that need them */}
                {selectedProvider && selectedProvider.id !== 'bank-transfer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        API Key / Client ID
                      </label>
                      <input 
                        type="text"
                        name="apiKey"
                        value={formData.apiKey || ''}
                        onChange={handleInputChange}
                        placeholder={`${selectedProvider.name} API Key`}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Secret Key / Client Secret
                      </label>
                      <input 
                        type="password"
                        name="secretKey"
                        value={formData.secretKey || ''}
                        onChange={handleInputChange}
                        placeholder={`${selectedProvider.name} Secret Key`}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                      />
                    </div>
                  </>
                )}
                
                {/* Supported Currencies */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Supported Currencies
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProvider && selectedProvider.supportedCurrencies.map(currency => (
                      <label key={currency} className="inline-flex items-center">
                        <input 
                          type="checkbox"
                          checked={formData.supportedCurrencies?.includes(currency) || false}
                          onChange={() => handleCurrencyToggle(currency)}
                          className="h-4 w-4 rounded border-gray-700 text-[#BD9526] focus:ring-[#BD9526]"
                        />
                        <span className="ml-2 text-sm text-gray-300">{currency}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#BD9526] focus:ring-[#BD9526]"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                    Active
                  </label>
                </div>
                
                {/* Bank Transfer Details */}
                {selectedProvider && selectedProvider.id === 'bank-transfer' && (
                  <div className="space-y-4 mt-4 p-4 bg-gray-900 rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <Building2Icon size={16} className="mr-2" />
                      Bank Account Details
                    </h4>
                    <p className="text-sm text-gray-400">
                      These details will be shown to customers who choose bank transfer as their payment method.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Account Name
                      </label>
                      <input 
                        type="text"
                        placeholder="Account Holder Name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Account Number
                      </label>
                      <input 
                        type="text"
                        placeholder="Account Number"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Bank Name
                      </label>
                      <input 
                        type="text"
                        placeholder="Bank Name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Instructions
                      </label>
                      <textarea 
                        placeholder="Special instructions for customers"
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            
            {selectedProvider && (
              <button
                type="button"
                onClick={handleSavePaymentMethod}
                disabled={isSubmitting || !formData.name}
                className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-[#E6C65B] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (selectedMethod ? 'Update Method' : 'Add Method')}
              </button>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Payment Method"
      >
        <div className="space-y-4">
          <div className="bg-yellow-500 bg-opacity-20 p-4 rounded-lg text-yellow-200 flex items-start">
            <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="font-bold">Warning</h3>
              <p className="mt-1 text-sm">
                Deleting a payment method will prevent customers from using it for future orders. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <p className="text-gray-300">
            Are you sure you want to delete <span className="font-semibold text-white">{selectedMethod?.name}</span>?
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeletePaymentMethod}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Method'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
