import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Mail, 
  MoreHorizontal,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import InvitationService, { Invitation } from '../../lib/invitationService';
import { useAuthContext } from '../../features/auth/AuthContext';
import useFirestore from '../../hooks/useFirestore';

export default function AdminInvitations() {
  const { user } = useAuthContext();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get all invitations
  const { 
    data: invitations, 
    loading, 
    error, 
    refetch 
  } = useFirestore<Invitation[]>(() => InvitationService.getAllInvitations());
  
  // Send invitation
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await InvitationService.createInvitation(inviteEmail, inviteRole, user.uid);
      setSuccessMessage(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Resend invitation
  const handleResendInvitation = async (id: string) => {
    try {
      await InvitationService.resendInvitation(id);
      setSuccessMessage('Invitation resent successfully');
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend invitation');
    }
  };
  
  // Cancel invitation
  const handleCancelInvitation = async (id: string) => {
    try {
      await InvitationService.cancelInvitation(id);
      setSuccessMessage('Invitation cancelled');
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to cancel invitation');
    }
  };
  
  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Check if invitation is expired
  const isExpired = (expiresAt: any) => {
    if (!expiresAt) return false;
    
    const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    return expiryDate < new Date();
  };
  
  return (
    <AdminLayout title="Invitations">
      <div className="mb-6">
        <motion.h1 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Admin Invitations
        </motion.h1>
        
        {/* Success and error messages */}
        {successMessage && (
          <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded mb-4 flex items-center">
            <CheckCircle size={18} className="mr-2" />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {errorMessage}
          </div>
        )}
        
        {/* Invitation form */}
        <motion.div
          className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <form onSubmit={handleSendInvitation} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#BD9526] placeholder-gray-400"
              />
            </div>
            
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-[#BD9526]"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#BD9526] text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>Send Invitation</span>
            </button>
          </form>
        </motion.div>
        
        {/* Invitations list */}
        <motion.div
          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-medium">Invitations</h2>
            <button 
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BD9526]"></div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="p-8 text-center">
              <p className="text-red-400 mb-2">Failed to load invitations</p>
              <button 
                onClick={() => refetch()}
                className="text-sm text-[#BD9526] hover:underline"
              >
                Try again
              </button>
            </div>
          )}
          
          {/* Invitations table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date Sent</th>
                    <th className="p-4 font-medium">Expires</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations && invitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No invitations found
                      </td>
                    </tr>
                  ) : (
                    invitations?.map((invitation) => (
                      <tr key={invitation.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-4">{invitation.email}</td>
                        <td className="p-4 capitalize">{invitation.role}</td>
                        <td className="p-4">
                          {invitation.status === 'pending' && !isExpired(invitation.expiresAt) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                              <Clock size={12} className="mr-1" />
                              Pending
                            </span>
                          ) : invitation.status === 'accepted' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                              <CheckCircle size={12} className="mr-1" />
                              Accepted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                              <XCircle size={12} className="mr-1" />
                              {isExpired(invitation.expiresAt) ? 'Expired' : 'Cancelled'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-400">{formatDate(invitation.createdAt)}</td>
                        <td className="p-4 text-sm text-gray-400">{formatDate(invitation.expiresAt)}</td>
                        <td className="p-4">
                          {invitation.status === 'pending' && !isExpired(invitation.expiresAt) ? (
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleResendInvitation(invitation.id)}
                                className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                                title="Resend Invitation"
                              >
                                <RefreshCw size={16} />
                              </button>
                              <button 
                                onClick={() => handleCancelInvitation(invitation.id)}
                                className="p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 transition-colors"
                                title="Cancel Invitation"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
