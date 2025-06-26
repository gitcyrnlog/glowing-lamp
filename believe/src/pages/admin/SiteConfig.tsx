import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Save, 
  Image, 
  Upload, 
  Globe, 
  Palette, 
  Type, 
  AlertTriangle,
  FileSpreadsheet,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Layout,
  Plus,
  Check,
  X
} from 'lucide-react';
import SiteConfigService, { SiteConfig as SiteConfigType, NavigationItem, CustomPage } from '../../lib/siteConfigService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import useFirestore from '../../hooks/useFirestore';
import Modal from '../../components/admin/Modal';

export default function SiteConfig() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isDeletePageModalOpen, setIsDeletePageModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CustomPage | null>(null);
  const [isNavItemModalOpen, setIsNavItemModalOpen] = useState(false);
  const [selectedNavItem, setSelectedNavItem] = useState<NavigationItem | null>(null);
  const [isDeleteNavItemModalOpen, setIsDeleteNavItemModalOpen] = useState(false);

  // Fetch site config
  const { 
    data: siteConfig, 
    loading: configLoading, 
    error: configError,
    refetch: refetchConfig
  } = useFirestore<SiteConfigType>(() => SiteConfigService.getSiteConfig());

  // Fetch navigation
  const {
    data: navigation,
    loading: navLoading,
    error: navError,
    refetch: refetchNav
  } = useFirestore<NavigationItem[]>(() => SiteConfigService.getNavigation());

  // Fetch custom pages
  const {
    data: pages,
    loading: pagesLoading,
    error: pagesError,
    refetch: refetchPages
  } = useFirestore<CustomPage[]>(() => SiteConfigService.getCustomPages());

  // Form state
  const [formData, setFormData] = useState<SiteConfigType>({
    name: '',
    logo: '',
    favicon: '',
    colors: {
      primary: '#BD9526',
      secondary: '#14452F',
      accent: '#E6C65B',
      background: '#121212',
      text: '#FFFFFF',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
    },
    hero: {
      title: '',
      subtitle: '',
      image: '',
      buttonText: '',
      buttonLink: '',
    },
    featuredProducts: [],
    featuredCategories: [],
    social: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
    },
    contact: {
      email: '',
      phone: '',
      address: '',
    },
    footer: {
      columns: [],
      bottomText: '',
    },
    updatedAt: null,
  });

  // Set initial form data from config
  useEffect(() => {
    if (siteConfig) {
      setFormData(siteConfig);
      setLogoPreview(siteConfig.logo);
      setFaviconPreview(siteConfig.favicon);
      setHeroImagePreview(siteConfig.hero.image);
    }
  }, [siteConfig]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof SiteConfigType],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle color changes
  const handleColorChange = (colorName: string, value: string) => {
    setFormData({
      ...formData,
      colors: {
        ...formData.colors,
        [colorName]: value,
      },
    });
  };

  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'hero') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        if (type === 'logo') {
          setLogoPreview(event.target.result as string);
          setLogoFile(file);
        } else if (type === 'favicon') {
          setFaviconPreview(event.target.result as string);
          setFaviconFile(file);
        } else if (type === 'hero') {
          setHeroImagePreview(event.target.result as string);
          setHeroImageFile(file);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  // Upload a file to storage and get the URL
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      let updatedConfig = { ...formData };

      // Upload logo if changed
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, `config/logo-${Date.now()}`);
        updatedConfig.logo = logoUrl;
      }

      // Upload favicon if changed
      if (faviconFile) {
        const faviconUrl = await uploadFile(faviconFile, `config/favicon-${Date.now()}`);
        updatedConfig.favicon = faviconUrl;
      }

      // Upload hero image if changed
      if (heroImageFile) {
        const heroImageUrl = await uploadFile(heroImageFile, `config/hero-${Date.now()}`);
        updatedConfig.hero.image = heroImageUrl;
      }

      // Save the config
      await SiteConfigService.updateSiteConfig(updatedConfig);
      
      setSaveSuccess(true);
      refetchConfig();
      
      // Reset file states
      setLogoFile(null);
      setFaviconFile(null);
      setHeroImageFile(null);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving site config:', error);
      setErrorMessage('Failed to save site configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page create/edit
  const handleSavePage = async (pageData: Partial<CustomPage>) => {
    try {
      setIsSubmitting(true);
        if (selectedPage) {
        // Update existing page
        await SiteConfigService.updateCustomPage(selectedPage.id, {
          ...pageData,
        });
      } else {
        // Create new page
        await SiteConfigService.createCustomPage(pageData as Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      setIsPageModalOpen(false);
      refetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      setErrorMessage('Failed to save page');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page delete
  const handleDeletePage = async () => {
    if (!selectedPage) return;
    
    try {
      setIsSubmitting(true);
      await SiteConfigService.deleteCustomPage(selectedPage.id);
      setIsDeletePageModalOpen(false);
      refetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      setErrorMessage('Failed to delete page');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle navigation item create/edit
  const handleSaveNavItem = async (navData: Partial<NavigationItem>) => {
    try {
      setIsSubmitting(true);
        if (selectedNavItem) {
        // Update existing nav item
        await SiteConfigService.updateNavigationItem(selectedNavItem.id, {
          ...navData,
        });
      } else {
        // Create new nav item
        await SiteConfigService.createNavigationItem(navData as Omit<NavigationItem, 'id'>);
      }
      
      setIsNavItemModalOpen(false);
      refetchNav();
    } catch (error) {
      console.error('Error saving navigation item:', error);
      setErrorMessage('Failed to save navigation item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle navigation item delete
  const handleDeleteNavItem = async () => {
    if (!selectedNavItem) return;
    
    try {
      setIsSubmitting(true);
      await SiteConfigService.deleteNavigationItem(selectedNavItem.id);
      setIsDeleteNavItemModalOpen(false);
      refetchNav();
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      setErrorMessage('Failed to delete navigation item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (configLoading || navLoading || pagesLoading) {
    return (
      <AdminLayout title="Site Configuration">
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (configError || navError || pagesError) {
    return (
      <AdminLayout title="Site Configuration">
        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg text-red-200 mb-6">
          <h3 className="font-bold flex items-center">
            <AlertTriangle className="mr-2" size={18} />
            Error Loading Configuration
          </h3>          <p className="mt-1">
            {configError ? configError.toString() : (navError ? navError.toString() : (pagesError ? pagesError.toString() : 'Failed to load site configuration data'))}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Configuration">
      <div className="space-y-6">
        {/* Success Message */}
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500 bg-opacity-20 p-4 rounded-lg text-green-200 mb-6"
          >
            <p className="font-medium">Configuration saved successfully!</p>
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
        
        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'general' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'appearance' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'hero' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('hero')}
            >
              Hero Section
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'navigation' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('navigation')}
            >
              Navigation
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'pages' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('pages')}
            >
              Custom Pages
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'social' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('social')}
            >
              Social & Contact
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'footer' ? 'text-[#BD9526] border-b-2 border-[#BD9526]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('footer')}
            >
              Footer
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Site Name
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="Your Store Name"
                  />
                </div>
                
                {/* Logo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {logoPreview && (
                      <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <label className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-md cursor-pointer hover:bg-gray-700">
                      <Upload size={16} className="mr-2" />
                      <span>Upload Logo</span>
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Recommended size: 200x50px</p>
                </div>
                
                {/* Favicon */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Favicon
                  </label>
                  <div className="flex items-center space-x-4">
                    {faviconPreview && (
                      <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={faviconPreview} 
                          alt="Favicon Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <label className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-md cursor-pointer hover:bg-gray-700">
                      <Upload size={16} className="mr-2" />
                      <span>Upload Favicon</span>
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'favicon')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Recommended size: 32x32px</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Appearance */}
          {activeTab === 'appearance' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium">Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Primary Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Primary Color
                  </label>
                  <div className="flex">
                    <input 
                      type="color"
                      value={formData.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded-l-md"
                    />
                    <input 
                      type="text"
                      value={formData.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    />
                  </div>
                </div>
                
                {/* Secondary Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Secondary Color
                  </label>
                  <div className="flex">
                    <input 
                      type="color"
                      value={formData.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded-l-md"
                    />
                    <input 
                      type="text"
                      value={formData.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    />
                  </div>
                </div>
                
                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Accent Color
                  </label>
                  <div className="flex">
                    <input 
                      type="color"
                      value={formData.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded-l-md"
                    />
                    <input 
                      type="text"
                      value={formData.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    />
                  </div>
                </div>
                
                {/* Background Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Background Color
                  </label>
                  <div className="flex">
                    <input 
                      type="color"
                      value={formData.colors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded-l-md"
                    />
                    <input 
                      type="text"
                      value={formData.colors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    />
                  </div>
                </div>
                
                {/* Text Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Text Color
                  </label>
                  <div className="flex">
                    <input 
                      type="color"
                      value={formData.colors.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded-l-md"
                    />
                    <input 
                      type="text"
                      value={formData.colors.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-r-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    />
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-8">Typography</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Heading Font */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Heading Font
                  </label>
                  <select
                    name="fonts.heading"
                    value={formData.fonts.heading}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                  >
                    <option value="Montserrat">Montserrat</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Oswald">Oswald</option>
                  </select>
                </div>
                
                {/* Body Font */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Body Font
                  </label>
                  <select
                    name="fonts.body"
                    value={formData.fonts.body}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Nunito">Nunito</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Hero Title
                  </label>
                  <input 
                    type="text"
                    name="hero.title"
                    value={formData.hero.title}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="Welcome to our store"
                  />
                </div>
                
                {/* Hero Subtitle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Hero Subtitle
                  </label>
                  <input 
                    type="text"
                    name="hero.subtitle"
                    value={formData.hero.subtitle}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="Discover our amazing products"
                  />
                </div>
                
                {/* Button Text */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Button Text
                  </label>
                  <input 
                    type="text"
                    name="hero.buttonText"
                    value={formData.hero.buttonText}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="Shop Now"
                  />
                </div>
                
                {/* Button Link */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Button Link
                  </label>
                  <input 
                    type="text"
                    name="hero.buttonLink"
                    value={formData.hero.buttonLink}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="/products"
                  />
                </div>
                
                {/* Hero Image */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Hero Background Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {heroImagePreview && (
                      <div className="w-32 h-20 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={heroImagePreview} 
                          alt="Hero Image Preview" 
                          className="max-w-full max-h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-md cursor-pointer hover:bg-gray-700">
                      <Upload size={16} className="mr-2" />
                      <span>Upload Image</span>
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'hero')}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Recommended size: 1920x1080px</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Navigation Management */}
          {activeTab === 'navigation' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Navigation Items</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNavItem(null);
                    setIsNavItemModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD9526] text-black rounded-md flex items-center hover:bg-[#E6C65B] transition"
                >
                  <Plus size={16} className="mr-2" />
                  Add Item
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Order
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        External
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {navigation && navigation.length > 0 ? (
                      navigation.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{item.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{item.url}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{item.order}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{item.isExternal ? 'Yes' : 'No'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNavItem(item);
                                setIsNavItemModalOpen(true);
                              }}
                              className="text-[#BD9526] hover:text-[#E6C65B] mr-3"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNavItem(item);
                                setIsDeleteNavItemModalOpen(true);
                              }}
                              className="text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                          No navigation items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Custom Pages */}
          {activeTab === 'pages' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Custom Pages</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPage(null);
                    setIsPageModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD9526] text-black rounded-md flex items-center hover:bg-[#E6C65B] transition"
                >
                  <Plus size={16} className="mr-2" />
                  Add Page
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Slug
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {pages && pages.length > 0 ? (
                      pages.map((page) => (
                        <tr key={page.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{page.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{page.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${page.isPublished ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'}`}>
                              {page.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {page.updatedAt ? new Date(page.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPage(page);
                                setIsPageModalOpen(true);
                              }}
                              className="text-[#BD9526] hover:text-[#E6C65B] mr-3"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPage(page);
                                setIsDeletePageModalOpen(true);
                              }}
                              className="text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                          No custom pages found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Social & Contact */}
          {activeTab === 'social' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium">Social Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Instagram */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Instagram size={16} className="mr-2" />
                    Instagram
                  </label>
                  <input 
                    type="text"
                    name="social.instagram"
                    value={formData.social.instagram || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>
                
                {/* Facebook */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Facebook size={16} className="mr-2" />
                    Facebook
                  </label>
                  <input 
                    type="text"
                    name="social.facebook"
                    value={formData.social.facebook || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>
                
                {/* Twitter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Twitter size={16} className="mr-2" />
                    Twitter
                  </label>
                  <input 
                    type="text"
                    name="social.twitter"
                    value={formData.social.twitter || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="https://twitter.com/yourstore"
                  />
                </div>
                
                {/* YouTube */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Youtube size={16} className="mr-2" />
                    YouTube
                  </label>
                  <input 
                    type="text"
                    name="social.youtube"
                    value={formData.social.youtube || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="https://youtube.com/channel/yourstore"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-8">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Mail size={16} className="mr-2" />
                    Email
                  </label>
                  <input 
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="contact@yourstore.com"
                  />
                </div>
                
                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Phone size={16} className="mr-2" />
                    Phone
                  </label>
                  <input 
                    type="text"
                    name="contact.phone"
                    value={formData.contact.phone || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                {/* Address */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Address
                  </label>
                  <textarea 
                    name="contact.address"
                    value={formData.contact.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                    placeholder="123 Store Street, City, Country"
                  ></textarea>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Footer Settings */}
          {activeTab === 'footer' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Footer Text */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Footer Copyright Text
                </label>
                <input 
                  type="text"
                  name="footer.bottomText"
                  value={formData.footer.bottomText}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
                  placeholder="© 2023 Your Store. All rights reserved."
                />
              </div>
              
              {/* Footer Columns - would be implemented with dynamic form fields */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Footer Columns
                </label>
                <p className="text-xs text-gray-500">
                  Footer column management is available in a future update.
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#BD9526] text-black rounded-md flex items-center hover:bg-[#E6C65B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Page Create/Edit Modal */}
      <Modal
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        title={selectedPage ? "Edit Page" : "Create New Page"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Page Title
            </label>
            <input 
              type="text"
              value={selectedPage?.title || ''}
              onChange={(e) => setSelectedPage({
                ...selectedPage || { id: '', content: '', slug: '', isPublished: false, createdAt: null, updatedAt: null },
                title: e.target.value,
                slug: selectedPage?.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="Page Title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Slug
            </label>
            <input 
              type="text"
              value={selectedPage?.slug || ''}
              onChange={(e) => setSelectedPage({
                ...selectedPage || { id: '', title: '', content: '', isPublished: false, createdAt: null, updatedAt: null },
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="page-slug"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea 
              value={selectedPage?.content || ''}
              onChange={(e) => setSelectedPage({
                ...selectedPage || { id: '', title: '', slug: '', isPublished: false, createdAt: null, updatedAt: null },
                content: e.target.value
              })}
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="Page content..."
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Meta Title (SEO)
            </label>
            <input 
              type="text"
              value={selectedPage?.metaTitle || ''}
              onChange={(e) => setSelectedPage({
                ...selectedPage || { id: '', title: '', slug: '', content: '', isPublished: false, createdAt: null, updatedAt: null },
                metaTitle: e.target.value
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="Meta Title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Meta Description (SEO)
            </label>
            <textarea 
              value={selectedPage?.metaDescription || ''}
              onChange={(e) => setSelectedPage({
                ...selectedPage || { id: '', title: '', slug: '', content: '', isPublished: false, createdAt: null, updatedAt: null },
                metaDescription: e.target.value
              })}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="Meta description..."
            ></textarea>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={selectedPage?.isPublished || false}
              onChange={(e) => setSelectedPage({
                ...selectedPage || { id: '', title: '', slug: '', content: '', createdAt: null, updatedAt: null },
                isPublished: e.target.checked
              })}
              className="h-4 w-4 rounded border-gray-300 text-[#BD9526] focus:ring-[#BD9526]"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-300">
              Published
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsPageModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSavePage(selectedPage || {})}
              disabled={isSubmitting || !selectedPage?.title || !selectedPage?.slug}
              className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-[#E6C65B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Page Delete Confirmation Modal */}
      <Modal
        isOpen={isDeletePageModalOpen}
        onClose={() => setIsDeletePageModalOpen(false)}
        title="Delete Page"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete the page <span className="font-semibold text-white">"{selectedPage?.title}"</span>? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsDeletePageModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeletePage}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Page'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Navigation Item Create/Edit Modal */}
      <Modal
        isOpen={isNavItemModalOpen}
        onClose={() => setIsNavItemModalOpen(false)}
        title={selectedNavItem ? "Edit Navigation Item" : "Add Navigation Item"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input 
              type="text"
              value={selectedNavItem?.title || ''}
              onChange={(e) => setSelectedNavItem({
                ...selectedNavItem || { id: '', url: '', order: navigation?.length || 0, isExternal: false },
                title: e.target.value
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="Home"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL
            </label>
            <input 
              type="text"
              value={selectedNavItem?.url || ''}
              onChange={(e) => setSelectedNavItem({
                ...selectedNavItem || { id: '', title: '', order: navigation?.length || 0, isExternal: false },
                url: e.target.value
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="/home"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Order
            </label>
            <input 
              type="number"
              value={selectedNavItem?.order || 0}
              onChange={(e) => setSelectedNavItem({
                ...selectedNavItem || { id: '', title: '', url: '', isExternal: false },
                order: parseInt(e.target.value)
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#BD9526]"
              placeholder="0"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isExternal"
              checked={selectedNavItem?.isExternal || false}
              onChange={(e) => setSelectedNavItem({
                ...selectedNavItem || { id: '', title: '', url: '', order: navigation?.length || 0 },
                isExternal: e.target.checked
              })}
              className="h-4 w-4 rounded border-gray-300 text-[#BD9526] focus:ring-[#BD9526]"
            />
            <label htmlFor="isExternal" className="ml-2 block text-sm text-gray-300">
              External Link
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsNavItemModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveNavItem(selectedNavItem || {})}
              disabled={isSubmitting || !selectedNavItem?.title || !selectedNavItem?.url}
              className="px-4 py-2 bg-[#BD9526] text-black rounded-md hover:bg-[#E6C65B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Navigation Item Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteNavItemModalOpen}
        onClose={() => setIsDeleteNavItemModalOpen(false)}
        title="Delete Navigation Item"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete the navigation item <span className="font-semibold text-white">"{selectedNavItem?.title}"</span>? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteNavItemModalOpen(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteNavItem}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Item'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
