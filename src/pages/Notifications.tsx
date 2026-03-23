import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  FileText
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h2>
          <p className="text-zinc-500 mt-1">Monitor all system notifications sent to delegates.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none text-sm font-medium"
            >
              {notificationTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by Delegate ID..."
              value={delegateId}
              onChange={(e) => {
                setDelegateId(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm font-medium"
            />
          </div>

          <button
            onClick={() => {
              setUnreadOnly(!unreadOnly);
              setPage(1);
            }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all border",
              unreadOnly 
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200" 
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            )}
          >
            Unread Only
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Delegate</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mx-auto" />
                  </td>
                </tr>
              ) : data?.notifications?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No notifications found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.notifications?.map((notification, index) => (
                  <tr key={notification.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {notification.notification_type === 'new_message' && <MessageSquare className="w-3 h-3 text-blue-500" />}
                        {notification.notification_type === 'admin_announce' && <Megaphone className="w-3 h-3 text-purple-500" />}
                        {notification.notification_type === 'leave_reported' && <FileText className="w-3 h-3 text-orange-500" />}
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                          {notification.notification_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{notification.delegate.name}</p>
                          <p className="text-[10px] text-zinc-400">{notification.delegate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        notification.is_read ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
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
              Showing <span className="font-medium text-zinc-900">{(page - 1) * 50 + 1}</span> to{' '}
              <span className="font-medium text-zinc-900">
                {Math.min(page * 50, data.total)}
              </span>{' '}
              of <span className="font-medium text-zinc-900">{data.total}</span> notifications
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
    </div>
  );
}
