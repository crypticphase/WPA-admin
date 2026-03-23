import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Share2, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import type { ConnectionRequest, PaginatedResponse } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function ConnectionRequests() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');

  const { data, isLoading, error } = useQuery<PaginatedResponse<ConnectionRequest, 'requests'>>({
    queryKey: ['connection-requests', page, status],
    queryFn: async () => {
      const response = await api.get('/admin/connection_requests', {
        params: { page, per_page: 50, status }
      });
      return response.data;
    },
  });

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load connection requests. Please try again later.
      </div>
    );
  }

  const statuses = [
    { id: '', label: 'All Statuses' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Connection Requests</h2>
          <p className="text-zinc-500 mt-1">Monitor networking requests between delegates.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none text-sm font-medium"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Requester</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">Direction</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Target</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mx-auto" />
                  </td>
                </tr>
              ) : data?.requests?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No connection requests found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.requests?.map((request, index) => (
                  <tr key={request.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{request.requester.name}</p>
                          <p className="text-[10px] text-zinc-400">{request.requester.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ArrowRight className="w-4 h-4 text-zinc-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{request.target.name}</p>
                          <p className="text-[10px] text-zinc-400">{request.target.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        request.status === 'accepted' ? "bg-emerald-50 text-emerald-600" :
                        request.status === 'rejected' ? "bg-rose-50 text-rose-600" :
                        "bg-orange-50 text-orange-600"
                      )}>
                        {request.status}
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
              of <span className="font-medium text-zinc-900">{data.total}</span> requests
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
