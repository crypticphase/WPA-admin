import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Megaphone, 
  Send, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import type { Announcement, PaginatedResponse } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function Announcements() {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Announcement, 'announcements'>>({
    queryKey: ['announcements', page],
    queryFn: async () => {
      const response = await api.get('/admin/announcements', {
        params: { page, per_page: 20 }
      });
      return response.data;
    },
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async (msg: string) => {
      const response = await api.post('/admin/announcements', { message: msg });
      return response.data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      alert('Announcement sent to all delegates successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to send announcement. Please try again.');
    },
    onSettled: () => {
      setIsSending(false);
    }
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/announcements/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete announcement.');
    }
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this announcement? This will remove it from the database.')) {
      deleteAnnouncementMutation.mutate(id);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    if (confirm('Are you sure you want to send this announcement to all delegates?')) {
      setIsSending(true);
      sendAnnouncementMutation.mutate(message);
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load announcements. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Announcements</h2>
          <p className="text-zinc-500 mt-1">Broadcast messages to all delegates instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Announcement Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">New Broadcast</h3>
            </div>

            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-widest">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-48 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm"
                  required
                />
                <p className="text-xs text-zinc-400 mt-2">
                  This message will be sent via WebSocket and FCM Push Notification to all active delegates.
                </p>
              </div>

              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Announcement
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Announcement History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900">Broadcast History</h3>
            {data && <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{data.total} total</span>}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
              </div>
            ) : data?.announcements?.length === 0 ? (
              <div className="p-12 bg-white border border-dashed border-zinc-200 rounded-3xl text-center text-zinc-500">
                No announcements sent yet.
              </div>
            ) : (
              data?.announcements?.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-zinc-900">Admin</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {new Date(announcement.sent_at).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {announcement.message}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 border border-zinc-200 rounded-xl hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-zinc-900">Page {page} of {data.total_pages}</span>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-3 border border-zinc-200 rounded-xl hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
