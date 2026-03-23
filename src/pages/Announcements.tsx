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
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">Broadcast Center</h2>
          <p className="text-zinc-500 mt-2 font-medium">Send real-time announcements to all delegates instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Send Announcement Form */}
        <div className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200/60 shadow-sm sticky top-10 premium-shadow">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 font-display">New Broadcast</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Global Announcement</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-64 px-6 py-5 bg-zinc-50 border border-zinc-200/60 rounded-[2rem] focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                  required
                />
                <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                    Sent via WebSocket and FCM Push Notification to all active delegates.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="w-full py-5 bg-zinc-900 text-white rounded-[1.5rem] font-bold hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 group"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Send Announcement
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Announcement History */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold text-zinc-900 font-display">Broadcast History</h3>
            {data && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full border border-zinc-200">{data.total} total</span>}
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-zinc-100">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-200" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">Retrieving history...</p>
              </div>
            ) : data?.announcements?.length === 0 ? (
              <div className="p-24 bg-white border border-dashed border-zinc-200 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200 mx-auto mb-6">
                  <Megaphone className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-zinc-400">No announcements sent yet.</p>
              </div>
            ) : (
              data?.announcements?.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-900">System Administrator</span>
                        <div className="flex items-center gap-2 text-zinc-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {new Date(announcement.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 transition-all duration-300">
                    <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {announcement.message}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-4 bg-white border border-zinc-200 rounded-2xl hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-900">
                Page {page} of {data.total_pages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-4 bg-white border border-zinc-200 rounded-2xl hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
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
