import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import type { AuditLog, PaginatedResponse } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>('');
  const [delegateId, setDelegateId] = useState<string>('');

  const { data, isLoading, error } = useQuery<PaginatedResponse<AuditLog, 'logs'>>({
    queryKey: ['audit-logs', page, action, delegateId],
    queryFn: async () => {
      const response = await api.get('/admin/audit_logs', {
        params: { page, per_page: 50, action, delegate_id: delegateId }
      });
      return response.data;
    },
  });

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load audit logs. Please try again later.
      </div>
    );
  }

  const actions = [
    { id: '', label: 'All Actions' },
    { id: 'login', label: 'Login' },
    { id: 'logout', label: 'Logout' },
    { id: 'reset_password', label: 'Reset Password' },
    { id: 'send_announcement', label: 'Send Announcement' },
    { id: 'approve_leave', label: 'Approve Leave' },
    { id: 'reject_leave', label: 'Reject Leave' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Audit Logs</h2>
          <p className="text-zinc-500 mt-1">Track and monitor all administrative and delegate actions.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none text-sm font-medium"
          >
            {actions.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
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
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Delegate</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mx-auto" />
                  </td>
                </tr>
              ) : data?.logs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No audit logs found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.logs?.map((log, index) => (
                  <tr key={log.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        log.action.includes('reset') ? "bg-red-50 text-red-600" :
                        log.action.includes('approve') ? "bg-emerald-50 text-emerald-600" :
                        log.action.includes('login') ? "bg-blue-50 text-blue-600" :
                        "bg-zinc-100 text-zinc-500"
                      )}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.delegate_id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                            <User className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">{log.delegate_name}</p>
                            <p className="text-[10px] text-zinc-400">ID: #{log.delegate_id}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System / Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-600 font-medium leading-relaxed max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                        {log.details}
                      </p>
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
              of <span className="font-medium text-zinc-900">{data.total}</span> logs
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
