import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { TabsContent, TabsList, TabsTrigger, Tabs } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { 
  PlusIcon, 
  Pencil, 
  Trash2, 
  Mail, 
  ImageIcon, 
  CalendarIcon, 
  TagIcon,
  Search,
  FilterIcon,
  XIcon
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { DatePickerWithRange } from '../../components/ui/date-range-picker';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'react-hot-toast';
import marketingService, { Coupon, EmailCampaign, Banner } from '../../lib/marketingService';
import { format } from 'date-fns';
import { Switch } from '../../components/ui/switch';
import { Editor } from '../../components/ui/editor';

const Marketing: React.FC = () => {
  // State variables for all marketing entities
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('coupons');

  // Dialog state
  const [couponDialog, setCouponDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [bannerDialog, setBannerDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<'coupon' | 'email' | 'banner' | null>(null);

  // Form state
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    type: 'percentage',
    value: 0,
    minPurchase: 0,
    isActive: true,
    validFrom: new Date(),
    validTo: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });

  const [emailForm, setEmailForm] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    content: '',
    audience: 'all',
    status: 'draft'
  });

  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    image: '',
    link: '',
    position: 'home_hero',
    isActive: true,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });

  const [editMode, setEditMode] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [couponsData, emailsData, bannersData] = await Promise.all([
          marketingService.getAllCoupons(),
          marketingService.getAllEmailCampaigns(),
          marketingService.getAllBanners()
        ]);
        
        setCoupons(couponsData);
        setEmailCampaigns(emailsData);
        setBanners(bannersData);
      } catch (error) {
        console.error('Error fetching marketing data:', error);
        toast.error('Failed to load marketing data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter functions
  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmails = emailCampaigns.filter(email => 
    email.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBanners = banners.filter(banner => 
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations for Coupons
  const handleAddCoupon = async () => {
    try {
      if (!couponForm.code || !couponForm.type || couponForm.value === undefined) {
        toast.error('Please fill all required fields');
        return;
      }

      if (editMode && couponForm.id) {
        await marketingService.updateCoupon(couponForm.id, couponForm);
        setCoupons(prev => prev.map(c => c.id === couponForm.id ? { ...c, ...couponForm } as Coupon : c));
        toast.success('Coupon updated successfully');
      } else {
        const newCouponId = await marketingService.createCoupon(couponForm as Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>);
        const newCoupon = { ...couponForm, id: newCouponId, usedCount: 0, createdAt: new Date() } as Coupon;
        setCoupons(prev => [newCoupon, ...prev]);
        toast.success('Coupon created successfully');
      }
      
      setCouponDialog(false);
      resetForms();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  // CRUD operations for Email Campaigns
  const handleAddEmailCampaign = async () => {
    try {
      if (!emailForm.name || !emailForm.subject || !emailForm.content) {
        toast.error('Please fill all required fields');
        return;
      }

      if (editMode && emailForm.id) {
        await marketingService.updateEmailCampaign(emailForm.id, emailForm);
        setEmailCampaigns(prev => prev.map(e => e.id === emailForm.id ? { ...e, ...emailForm } as EmailCampaign : e));
        toast.success('Email campaign updated successfully');
      } else {
        const newEmailId = await marketingService.createEmailCampaign(emailForm as Omit<EmailCampaign, 'id' | 'createdAt'>);
        const newEmail = { ...emailForm, id: newEmailId, createdAt: new Date() } as EmailCampaign;
        setEmailCampaigns(prev => [newEmail, ...prev]);
        toast.success('Email campaign created successfully');
      }
      
      setEmailDialog(false);
      resetForms();
    } catch (error) {
      console.error('Error saving email campaign:', error);
      toast.error('Failed to save email campaign');
    }
  };

  // CRUD operations for Banners
  const handleAddBanner = async () => {
    try {
      if (!bannerForm.title || !bannerForm.image || !bannerForm.link) {
        toast.error('Please fill all required fields');
        return;
      }

      if (editMode && bannerForm.id) {
        await marketingService.updateBanner(bannerForm.id, bannerForm);
        setBanners(prev => prev.map(b => b.id === bannerForm.id ? { ...b, ...bannerForm } as Banner : b));
        toast.success('Banner updated successfully');
      } else {
        const newBannerId = await marketingService.createBanner(bannerForm as Omit<Banner, 'id' | 'createdAt'>);
        const newBanner = { ...bannerForm, id: newBannerId, createdAt: new Date() } as Banner;
        setBanners(prev => [newBanner, ...prev]);
        toast.success('Banner created successfully');
      }
      
      setBannerDialog(false);
      resetForms();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  // Delete operations
  const handleDeleteConfirm = async () => {
    if (!deleteItemId || !deleteItemType) return;
    
    try {
      switch (deleteItemType) {
        case 'coupon':
          await marketingService.deleteCoupon(deleteItemId);
          setCoupons(prev => prev.filter(c => c.id !== deleteItemId));
          toast.success('Coupon deleted successfully');
          break;
        case 'email':
          await marketingService.deleteEmailCampaign(deleteItemId);
          setEmailCampaigns(prev => prev.filter(e => e.id !== deleteItemId));
          toast.success('Email campaign deleted successfully');
          break;
        case 'banner':
          await marketingService.deleteBanner(deleteItemId);
          setBanners(prev => prev.filter(b => b.id !== deleteItemId));
          toast.success('Banner deleted successfully');
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${deleteItemType}:`, error);
      toast.error(`Failed to delete ${deleteItemType}`);
    } finally {
      setConfirmDialog(false);
      setDeleteItemId(null);
      setDeleteItemType(null);
    }
  };

  // Helper functions
  const openDeleteConfirm = (id: string, type: 'coupon' | 'email' | 'banner') => {
    setDeleteItemId(id);
    setDeleteItemType(type);
    setConfirmDialog(true);
  };

  const editCoupon = (coupon: Coupon) => {
    setCouponForm(coupon);
    setEditMode(true);
    setCouponDialog(true);
  };

  const editEmailCampaign = (email: EmailCampaign) => {
    setEmailForm(email);
    setEditMode(true);
    setEmailDialog(true);
  };

  const editBanner = (banner: Banner) => {
    setBannerForm(banner);
    setEditMode(true);
    setBannerDialog(true);
  };

  const resetForms = () => {
    setCouponForm({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      isActive: true,
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
    
    setEmailForm({
      name: '',
      subject: '',
      content: '',
      audience: 'all',
      status: 'draft'
    });
    
    setBannerForm({
      title: '',
      image: '',
      link: '',
      position: 'home_hero',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
    
    setEditMode(false);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    // Handle Firebase timestamps
    if (date.toDate && typeof date.toDate === 'function') {
      return format(date.toDate(), 'MMM dd, yyyy');
    }
    
    // Handle regular Date objects
    if (date instanceof Date) {
      return format(date, 'MMM dd, yyyy');
    }
    
    // Handle string dates
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Component rendering
  return (
    <AdminLayout title="Marketing">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Marketing</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-8 bg-gray-800 border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs 
          defaultValue="coupons" 
          className="w-full" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              <span>Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Banners</span>
            </TabsTrigger>
          </TabsList>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Coupon Codes</h2>
              <Button 
                onClick={() => { 
                  resetForms();
                  setCouponDialog(true); 
                }}
                className="bg-[#BD9526] hover:bg-[#A18121] text-black"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Coupon
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BD9526]"></div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.length > 0 ? (
                      filteredCoupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium">{coupon.code}</TableCell>
                          <TableCell>
                            {coupon.type === 'percentage' && `${coupon.value}% off`}
                            {coupon.type === 'fixed' && `$${coupon.value} off`}
                            {coupon.type === 'free_shipping' && 'Free shipping'}
                          </TableCell>
                          <TableCell>${coupon.value}</TableCell>
                          <TableCell>
                            {formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={coupon.isActive ? "success" : "default"}
                              className={coupon.isActive ? "bg-green-600" : "bg-gray-600"}
                            >
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{coupon.usedCount} times</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editCoupon(coupon)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteConfirm(coupon.id, 'coupon')}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                          {searchTerm ? 'No matching coupons found' : 'No coupons created yet'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Email Campaigns Tab */}
          <TabsContent value="emails" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Campaigns</h2>
              <Button 
                onClick={() => { 
                  resetForms();
                  setEmailDialog(true); 
                }}
                className="bg-[#BD9526] hover:bg-[#A18121] text-black"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BD9526]"></div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled/Sent Date</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmails.length > 0 ? (
                      filteredEmails.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.subject}</TableCell>
                          <TableCell>
                            {campaign.audience === 'all' && 'All Customers'}
                            {campaign.audience === 'new_customers' && 'New Customers'}
                            {campaign.audience === 'returning_customers' && 'Returning Customers'}
                            {campaign.audience === 'inactive' && 'Inactive Customers'}
                            {campaign.audience === 'custom' && 'Custom List'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                campaign.status === 'sent' ? "success" : 
                                campaign.status === 'scheduled' ? "info" : 
                                campaign.status === 'draft' ? "default" :
                                "destructive"
                              }
                              className={
                                campaign.status === 'sent' ? "bg-green-600" : 
                                campaign.status === 'scheduled' ? "bg-blue-600" : 
                                campaign.status === 'draft' ? "bg-gray-600" :
                                "bg-red-600"
                              }
                            >
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {campaign.status === 'scheduled' && campaign.scheduledDate ? 
                              formatDate(campaign.scheduledDate) : 
                              campaign.status === 'sent' && campaign.sentDate ? 
                              formatDate(campaign.sentDate) : 
                              '-'}
                          </TableCell>
                          <TableCell>
                            {campaign.status === 'sent' ? (
                              <span>
                                {campaign.openRate || 0}% open, {campaign.clickRate || 0}% click
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editEmailCampaign(campaign)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteConfirm(campaign.id, 'email')}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                          {searchTerm ? 'No matching email campaigns found' : 'No email campaigns created yet'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Promotional Banners</h2>
              <Button 
                onClick={() => { 
                  resetForms();
                  setBannerDialog(true); 
                }}
                className="bg-[#BD9526] hover:bg-[#A18121] text-black"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BD9526]"></div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Active Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanners.length > 0 ? (
                      filteredBanners.map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell className="font-medium">{banner.title}</TableCell>
                          <TableCell>
                            {banner.position === 'home_hero' && 'Home Hero'}
                            {banner.position === 'home_middle' && 'Home Middle'}
                            {banner.position === 'sidebar' && 'Sidebar'}
                            {banner.position === 'category_top' && 'Category Top'}
                            {banner.position === 'custom' && 'Custom Position'}
                          </TableCell>
                          <TableCell>
                            <div className="w-16 h-10 relative bg-gray-700 rounded overflow-hidden">
                              <img 
                                src={banner.image} 
                                alt={banner.title}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <a 
                              href={banner.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#BD9526] hover:underline truncate max-w-[150px] inline-block"
                            >
                              {new URL(banner.link).hostname}
                            </a>
                          </TableCell>
                          <TableCell>
                            {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={banner.isActive ? "success" : "default"}
                              className={banner.isActive ? "bg-green-600" : "bg-gray-600"}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editBanner(banner)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteConfirm(banner.id, 'banner')}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                          {searchTerm ? 'No matching banners found' : 'No banners created yet'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Coupon Dialog */}
      <Dialog open={couponDialog} onOpenChange={setCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update the coupon details below.' : 'Enter the details for the new coupon.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select 
                  value={couponForm.type} 
                  onValueChange={(value) => setCouponForm({ ...couponForm, type: value as any })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {couponForm.type === 'percentage' ? 'Percentage (%)' : 
                   couponForm.type === 'fixed' ? 'Amount ($)' : 'Value'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={couponForm.value}
                  onChange={(e) => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) })}
                  placeholder="20"
                  className="bg-gray-800 border-gray-700"
                  disabled={couponForm.type === 'free_shipping'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={couponForm.minPurchase}
                  onChange={(e) => setCouponForm({ ...couponForm, minPurchase: parseFloat(e.target.value) })}
                  placeholder="100"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: parseInt(e.target.value) })}
                  placeholder="100"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="block mb-2">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="status"
                    checked={couponForm.isActive} 
                    onCheckedChange={(checked) => setCouponForm({ ...couponForm, isActive: checked })}
                  />
                  <Label htmlFor="status" className="cursor-pointer">
                    {couponForm.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Valid Date Range</Label>
              <DatePickerWithRange 
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    setCouponForm({
                      ...couponForm,
                      validFrom: range.from,
                      validTo: range.to
                    });
                  }
                }}
                date={{
                  from: couponForm.validFrom instanceof Date ? couponForm.validFrom : new Date(),
                  to: couponForm.validTo instanceof Date ? couponForm.validTo : new Date()
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCouponDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCoupon} className="bg-[#BD9526] hover:bg-[#A18121] text-black">
              {editMode ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Campaign Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Email Campaign' : 'Create New Email Campaign'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update the campaign details below.' : 'Enter the details for the new email campaign.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={emailForm.name}
                  onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                  placeholder="Summer Sale Announcement"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Get 20% Off All Summer Items!"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select 
                  value={emailForm.audience} 
                  onValueChange={(value) => setEmailForm({ ...emailForm, audience: value as any })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="new_customers">New Customers</SelectItem>
                    <SelectItem value="returning_customers">Returning Customers</SelectItem>
                    <SelectItem value="inactive">Inactive Customers</SelectItem>
                    <SelectItem value="custom">Custom List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Campaign Status</Label>
                <Select 
                  value={emailForm.status} 
                  onValueChange={(value) => setEmailForm({ ...emailForm, status: value as any })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {emailForm.status === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={emailForm.scheduledDate instanceof Date ? emailForm.scheduledDate.toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEmailForm({ ...emailForm, scheduledDate: new Date(e.target.value) })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={emailForm.content}
                onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                placeholder="Write your email content here..."
                className="bg-gray-800 border-gray-700 min-h-[200px]"
              />
              {/* Uncomment when Editor component is available */}
              {/* <Editor 
                value={emailForm.content || ''}
                onChange={(content) => setEmailForm({ ...emailForm, content })}
              /> */}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmailCampaign} className="bg-[#BD9526] hover:bg-[#A18121] text-black">
              {editMode ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialog} onOpenChange={setBannerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update the banner details below.' : 'Enter the details for the new promotional banner.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Banner Title</Label>
              <Input
                id="title"
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="Summer Sale Banner"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Banner Image URL</Label>
              <Input
                id="image"
                value={bannerForm.image}
                onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link">Link URL</Label>
              <Input
                id="link"
                value={bannerForm.link}
                onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                placeholder="https://example.com/summer-sale"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Banner Position</Label>
                <Select 
                  value={bannerForm.position} 
                  onValueChange={(value) => setBannerForm({ ...bannerForm, position: value as any })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_hero">Home Hero</SelectItem>
                    <SelectItem value="home_middle">Home Middle</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="category_top">Category Top</SelectItem>
                    <SelectItem value="custom">Custom Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bannerStatus" className="block mb-2">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="bannerStatus"
                    checked={bannerForm.isActive} 
                    onCheckedChange={(checked) => setBannerForm({ ...bannerForm, isActive: checked })}
                  />
                  <Label htmlFor="bannerStatus" className="cursor-pointer">
                    {bannerForm.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Active Date Range</Label>
              <DatePickerWithRange 
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    setBannerForm({
                      ...bannerForm,
                      startDate: range.from,
                      endDate: range.to
                    });
                  }
                }}
                date={{
                  from: bannerForm.startDate instanceof Date ? bannerForm.startDate : new Date(),
                  to: bannerForm.endDate instanceof Date ? bannerForm.endDate : new Date()
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setBannerDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBanner} className="bg-[#BD9526] hover:bg-[#A18121] text-black">
              {editMode ? 'Update Banner' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteItemType}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Marketing;
