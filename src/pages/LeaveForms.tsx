import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import type { LeaveForm, PaginatedResponse } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function LeaveForms() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('reported');

  const { data, isLoading, error } = useQuery<PaginatedResponse<LeaveForm, 'leave_forms'>>({
    queryKey: ['leave-forms', page, status],
    queryFn: async () => {
      const response = await api.get('/admin/leave_forms', {
        params: { page, per_page: 20, status }
      });
      return response.data;
    },
  });

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load leave forms. Please try again later.
      </div>
    );
  }

  const statusFilters = [
    { id: 'reported', label: 'Reported', icon: Clock, color: 'text-orange-500 bg-orange-50' },
    { id: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-rose-500 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Leave Forms</h2>
          <p className="text-zinc-500 mt-1">Review and manage delegate leave requests.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setStatus(filter.id);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                status === filter.id 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <filter.icon className={cn("w-4 h-4", status === filter.id ? filter.color.split(' ')[0] : "")} />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
          </div>
        ) : data?.leave_forms?.length === 0 ? (
          <div className="col-span-full p-24 bg-white border border-dashed border-zinc-200 rounded-3xl text-center text-zinc-500">
            No leave forms found with status "{status}".
          </div>
        ) : (
          data?.leave_forms?.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{form.reported_by.name}</h4>
                    <p className="text-xs text-zinc-500">Delegate ID: #{form.reported_by.id}</p>
                  </div>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  form.status === 'reported' ? "bg-orange-50 text-orange-600" :
                  form.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                  "bg-rose-50 text-rose-600"
                )}>
                  {form.status === 'reported' ? <Clock className="w-4 h-4" /> :
                   form.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> :
                   <XCircle className="w-4 h-4" />}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Type: {form.leave_type}</p>
                  <p className="text-sm text-zinc-700 leading-relaxed italic">"{form.explanation}"</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Schedule ID</p>
                  <p className="text-xs font-bold text-zinc-900">#{form.schedule_id}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Submitted {new Date(form.reported_at).toLocaleDateString()}
                </span>
                <button className="text-xs font-bold text-zinc-900 hover:underline">View Details</button>
              </div>
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
  );
}
