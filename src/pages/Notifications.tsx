import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  Megaphone,
  FileText,
  Trash2,
  Trash
} from 'lucide-react';
import api from '../services/api';
import type { Notification, PaginatedResponse } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function Notifications() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>('');
  const [delegateId, setDelegateId] = useState<string>('');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Notification, 'notifications'>>({
    queryKey: ['notifications', page, type, delegateId, unreadOnly],
    queryFn: async () => {
      const response = await api.get('/admin/notifications', {
        params: { 
          page, 
          per_page: 50, 
          type, 
          delegate_id: delegateId,
          unread: unreadOnly || undefined
        }
      });
      return response.data;
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete notification.');
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/notifications/${id}/mark_read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to mark notification as read.');
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch('/admin/notifications/mark_all_read', {}, {
        params: { 
          delegate_id: delegateId || undefined,
          type: type || undefined
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      alert('All matching notifications marked as read!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to mark notifications as read.');
    }
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/admin/notifications', {
        params: { 
          delegate_id: delegateId || undefined,
          type: type || undefined
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      alert('Notifications cleared successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to clear notifications.');
    }
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const handleClearAll = () => {
    const filterDesc = [
      delegateId ? `for Delegate #${delegateId}` : '',
      type ? `of type ${type}` : ''
    ].filter(Boolean).join(' ');

    if (confirm(`Are you sure you want to delete ALL notifications ${filterDesc}? This action cannot be undone.`)) {
      clearAllNotificationsMutation.mutate();
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load notifications. Please try again later.
      </div>
    );
  }

  const notificationTypes = [
    { id: '', label: 'All Types', icon: Bell },
    { id: 'new_message', label: 'New Message', icon: MessageSquare },
    { id: 'admin_announce', label: 'Admin Announce', icon: Megaphone },
    { id: 'new_group_message', label: 'Group Message', icon: MessageSquare },
    { id: 'leave_reported', label: 'Leave Reported', icon: FileText },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">System Notifications</h2>
          <p className="text-zinc-500 mt-2 font-medium">Monitor and manage all system notifications sent to delegates.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm space-y-8 premium-shadow">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-1 w-full group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all appearance-none text-sm font-bold text-zinc-900"
            >
              {notificationTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder="Filter by Delegate ID..."
              value={delegateId}
              onChange={(e) => {
                setDelegateId(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button
              onClick={() => {
                setUnreadOnly(!unreadOnly);
                setPage(1);
              }}
              className={cn(
                "flex-1 lg:flex-none px-8 py-4 rounded-2xl text-xs font-bold transition-all border uppercase tracking-widest",
                unreadOnly 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-200" 
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              )}
            >
              Unread Only
            </button>

            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex-1 lg:flex-none px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest border border-emerald-100"
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark All Read
            </button>

            <button
              onClick={handleClearAll}
              disabled={clearAllNotificationsMutation.isPending}
              className="flex-1 lg:flex-none px-8 py-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest border border-red-100"
            >
              {clearAllNotificationsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash className="w-4 h-4" />
              )}
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 shadow-sm overflow-hidden premium-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Delegate</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-200 mx-auto" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">Loading notifications...</p>
                  </td>
                </tr>
              ) : data?.notifications?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200 mx-auto mb-6">
                      <Bell className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400">No notifications found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                data?.notifications?.map((notification, index) => (
                  <tr key={notification.id} className="hover:bg-zinc-50/50 transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                        <div className="w-8 h-8 bg-white border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        {new Date(notification.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                          notification.notification_type === 'new_message' && "bg-blue-50 text-blue-500",
                          notification.notification_type === 'admin_announce' && "bg-purple-50 text-purple-500",
                          notification.notification_type === 'leave_reported' && "bg-orange-50 text-orange-500",
                          !['new_message', 'admin_announce', 'leave_reported'].includes(notification.notification_type) && "bg-zinc-50 text-zinc-500"
                        )}>
                          {notification.notification_type === 'new_message' && <MessageSquare className="w-5 h-5" />}
                          {notification.notification_type === 'admin_announce' && <Megaphone className="w-5 h-5" />}
                          {notification.notification_type === 'leave_reported' && <FileText className="w-5 h-5" />}
                          {!['new_message', 'admin_announce', 'leave_reported'].includes(notification.notification_type) && <Bell className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                          {notification.notification_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 font-bold text-xs">
                          {notification.delegate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{notification.delegate.name}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{notification.delegate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border",
                        notification.is_read 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-orange-50 text-orange-600 border-orange-100"
                      )}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {!notification.is_read && (
                          <button
                            onClick={() => markReadMutation.mutate(notification.id)}
                            disabled={markReadMutation.isPending}
                            className="p-3 text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all"
                            title="Mark as Read"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          title="Delete Notification"
                        >
                          <Trash2 className="w-5 h-5" />
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
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Showing <span className="text-zinc-900">{(page - 1) * 50 + 1}</span> to{' '}
              <span className="text-zinc-900">
                {Math.min(page * 50, data.total)}
              </span>{' '}
              of <span className="text-zinc-900">{data.total}</span> notifications
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 bg-white border border-zinc-200 rounded-xl hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                {page} / {data.total_pages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-3 bg-white border border-zinc-200 rounded-xl hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
