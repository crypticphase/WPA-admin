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
  X
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import type { Delegate, PaginatedResponse } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function Delegates() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Delegate, 'delegates'>>({
    queryKey: ['delegates', page, keyword],
    queryFn: async () => {
      const response = await api.get('/admin/delegates', {
        params: { page, per_page: 20, keyword }
      });
      return response.data;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/admin/delegates/${id}/reset_password`);
      return response.data.temp_password;
    },
    onSuccess: (password) => {
      setTempPassword(password);
    },
  });

  const handleResetPassword = (id: number) => {
    if (confirm('Are you sure you want to reset this delegate\'s password?')) {
      resetPasswordMutation.mutate(id);
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Delegates</h2>
          <p className="text-zinc-500 mt-1">Manage and view all registered delegates.</p>
        </div>
        
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Delegate</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mx-auto" />
                  </td>
                </tr>
              ) : data?.delegates?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No delegates found matching your search.
                  </td>
                </tr>
              ) : (
                data?.delegates?.map((delegate) => (
                  <tr key={delegate.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{delegate.name}</p>
                          <p className="text-xs text-zinc-500">{delegate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-600">{delegate.company.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        delegate.has_logged_in ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                      )}>
                        {delegate.has_logged_in ? 'Logged In' : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-500">
                        {new Date(delegate.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedDelegate(delegate)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(delegate.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <p className="text-sm text-zinc-500">
              Showing <span className="font-medium text-zinc-900">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium text-zinc-900">
                {Math.min(page * 20, data.total)}
              </span>{' '}
              of <span className="font-medium text-zinc-900">{data.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDelegate(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-zinc-900">Delegate Profile</h3>
                  <button 
                    onClick={() => setSelectedDelegate(null)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-400">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-zinc-900">{selectedDelegate.name}</h4>
                    <p className="text-zinc-500">{selectedDelegate.company.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="text-zinc-900 font-medium">{selectedDelegate.email}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="text-zinc-900 font-medium">{selectedDelegate.phone || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-zinc-900 font-medium capitalize">{selectedDelegate.has_logged_in ? 'Logged In' : 'Never Logged In'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleResetPassword(selectedDelegate.id)}
                  className="w-full mt-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" />
                  Reset Password
                </button>
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
