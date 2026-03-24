import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  User, 
  MoreVertical, 
  Key, 
  Eye, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Edit2,
  Download,
  Send,
  Calendar,
  LogIn
} from 'lucide-react';
import api from '../services/api';
import type { Delegate, PaginatedResponse } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { useNavigate } from 'react-router-dom';

export default function Delegates() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState<string>('');
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [pushForm, setPushForm] = useState({ title: '', message: '' });
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Delegate, 'delegates'>>({
    queryKey: ['delegates', page, keyword, year],
    queryFn: async () => {
      const response = await api.get('/admin/delegates', {
        params: { 
          page, 
          per_page: 20, 
          keyword,
          year: year || undefined
        }
      });
      return response.data;
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/admin/delegates/${id}/login`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token || data.access_token) {
        localStorage.setItem('delegate_token', data.token || data.access_token);
        if (data.user) {
          localStorage.setItem('delegate_user', JSON.stringify(data.user));
        }
        navigate('/delegate-chat');
      }
    },
    onMutate: (id) => {
      setIsImpersonating(id);
    },
    onSettled: () => {
      setIsImpersonating(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to impersonate delegate.');
    }
  });

  const handleImpersonate = (id: number) => {
    if (confirm('Are you sure you want to login as this delegate?')) {
      impersonateMutation.mutate(id);
    }
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/admin/delegates/${id}/reset_password`);
      return response.data.temp_password;
    },
    onSuccess: (password) => {
      setTempPassword(password);
    },
  });

  const updateDelegateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/admin/delegates/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegates'] });
      setIsEditing(false);
      setSelectedDelegate(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to update delegate.');
    }
  });

  const handleEdit = (delegate: Delegate) => {
    setEditForm({
      name: delegate.name,
      email: delegate.email,
      phone: delegate.phone || ''
    });
    setIsEditing(true);
    setSelectedDelegate(delegate);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate) return;
    updateDelegateMutation.mutate({ id: selectedDelegate.id, data: editForm });
  };

  const handleResetPassword = (id: number) => {
    if (confirm('Are you sure you want to reset this delegate\'s password?')) {
      resetPasswordMutation.mutate(id);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('https://wpadocker-production.up.railway.app/api/v1/admin/delegates/export_csv', {
        headers: {
          'X-Admin-Token': token || ''
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delegates_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate || !pushForm.title || !pushForm.message) return;
    
    setIsSendingPush(true);
    try {
      await api.post('/admin/notifications/push', {
        delegate_id: selectedDelegate.id,
        title: pushForm.title,
        message: pushForm.message
      });
      alert('Push notification sent successfully!');
      setPushForm({ title: '', message: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send push notification. Ensure delegate has a device token.');
    } finally {
      setIsSendingPush(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load delegates. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">Delegates Registry</h2>
          <p className="text-zinc-500 mt-2 font-medium">Manage and monitor all registered participants.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-zinc-200 rounded-3xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:shadow-md transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-40 group">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none" />
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-6 py-4 bg-white border border-zinc-200/60 rounded-3xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all shadow-sm font-bold text-sm appearance-none text-zinc-900"
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-200/60 rounded-3xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all shadow-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 shadow-sm overflow-hidden premium-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Delegate Profile</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Affiliation</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Registration</th>
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-zinc-200" />
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading registry...</p>
                    </div>
                  </td>
                </tr>
              ) : data?.delegates?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-zinc-400">No delegates found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.delegates?.map((delegate) => (
                  <tr key={delegate.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 group-hover:text-zinc-900 transition-colors">{delegate.name}</p>
                          <p className="text-xs font-medium text-zinc-400 mt-0.5">{delegate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-xl border border-zinc-100">
                        <span className="text-xs font-bold text-zinc-600">{delegate.company?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          delegate.has_logged_in ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-zinc-300"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          delegate.has_logged_in ? "text-emerald-600" : "text-zinc-400"
                        )}>
                          {delegate.has_logged_in ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono text-zinc-400">
                        {new Date(delegate.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleImpersonate(delegate.id)}
                          disabled={isImpersonating === delegate.id}
                          className="p-2.5 text-zinc-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Login as Delegate"
                        >
                          {isImpersonating === delegate.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogIn className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => setSelectedDelegate(delegate)}
                          className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(delegate.id)}
                          className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total_pages > 1 && (
          <div className="px-8 py-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Showing <span className="text-zinc-900">{(page - 1) * 20 + 1}</span> - <span className="text-zinc-900">{Math.min(page * 20, data.total)}</span> of <span className="text-zinc-900">{data.total}</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 bg-white border border-zinc-200 rounded-2xl hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-900">
                {page} / {data.total_pages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-3 bg-white border border-zinc-200 rounded-2xl hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delegate Detail Modal */}
      <AnimatePresence>
        {selectedDelegate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedDelegate(null);
                setIsEditing(false);
              }}
              className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-bold text-zinc-900 font-display tracking-tight">
                      {isEditing ? 'Update Profile' : 'Delegate Info'}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1 font-medium">
                      {isEditing ? 'Modify registration details below.' : 'Comprehensive participant overview.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedDelegate(null);
                      setIsEditing(false);
                    }}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400 hover:text-zinc-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="flex items-center gap-8 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-zinc-300 shadow-sm border border-zinc-200">
                      <User className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Identity</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                            required
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="text-2xl font-bold text-zinc-900 font-display">{selectedDelegate.name}</h4>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-200/50 rounded-lg mt-2">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{selectedDelegate.company?.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                          required
                        />
                      ) : (
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <p className="text-sm font-bold text-zinc-900 truncate">{selectedDelegate.email}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Contact Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                        />
                      ) : (
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <p className="text-sm font-bold text-zinc-900">{selectedDelegate.phone || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">System Status</label>
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", selectedDelegate.has_logged_in ? "bg-emerald-500" : "bg-zinc-300")} />
                            <p className="text-sm font-bold text-zinc-900">{selectedDelegate.has_logged_in ? 'Active' : 'Inactive'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Member Since</label>
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-sm font-bold text-zinc-900">
                              {new Date(selectedDelegate.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Push Notification Section */}
                      <div className="p-8 bg-zinc-900 rounded-[2rem] text-white space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl">
                            <Send className="w-4 h-4 text-emerald-400" />
                          </div>
                          <h5 className="text-sm font-bold">Direct Push Notification</h5>
                        </div>
                        
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Notification Title"
                            value={pushForm.title}
                            onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                          />
                          <textarea
                            placeholder="Message content..."
                            value={pushForm.message}
                            onChange={(e) => setPushForm({ ...pushForm, message: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 resize-none"
                          />
                          <button
                            type="button"
                            onClick={handleSendPush}
                            disabled={isSendingPush || !pushForm.title || !pushForm.message}
                            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                          >
                            {isSendingPush ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send Push Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 py-5 bg-zinc-100 text-zinc-900 rounded-[1.5rem] font-bold hover:bg-zinc-200 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updateDelegateMutation.isPending}
                          className="flex-[2] py-5 bg-zinc-900 text-white rounded-[1.5rem] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-200"
                        >
                          {updateDelegateMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(selectedDelegate)}
                          className="flex-1 py-5 bg-zinc-50 text-zinc-900 rounded-[1.5rem] font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 border border-zinc-200"
                        >
                          <Edit2 className="w-5 h-5" />
                          Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(selectedDelegate.id)}
                          className="flex-1 py-5 bg-zinc-900 text-white rounded-[1.5rem] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-200"
                        >
                          <Key className="w-5 h-5" />
                          Reset Password
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Temp Password Modal */}
      <AnimatePresence>
        {tempPassword && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">Password Reset</h3>
              <p className="text-zinc-500 mb-8">Please provide this temporary password to the delegate. It will not be shown again.</p>
              
              <div className="p-6 bg-zinc-900 rounded-2xl mb-8">
                <p className="text-3xl font-mono font-bold text-white tracking-widest">{tempPassword}</p>
              </div>

              <button
                onClick={() => setTempPassword(null)}
                className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
