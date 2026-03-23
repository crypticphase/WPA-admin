import { useMutation } from '@tanstack/react-query';
import { 
  Settings, 
  Trash2, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Database,
  Cpu,
  Server
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Maintenance() {
  const [isClearing, setIsClearing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const clearQueuesMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get('/admin/clear_sidekiq');
      return response.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to clear Sidekiq queues. Please try again.');
    },
    onSettled: () => {
      setIsClearing(false);
    }
  });

  const handleClearQueues = () => {
    if (confirm('Are you sure you want to clear all Sidekiq background job queues? This action cannot be undone.')) {
      setIsClearing(true);
      clearQueuesMutation.mutate();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Maintenance</h2>
        <p className="text-zinc-500 mt-1">System administration and maintenance tools.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Background Workers</h3>
              <p className="text-sm text-zinc-500">Manage Sidekiq queues and job processing.</p>
            </div>
          </div>

          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl mb-8 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">Danger Zone</p>
              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                Clearing Sidekiq queues will immediately delete all pending background jobs, including failed retries and scheduled tasks. Use with extreme caution.
              </p>
            </div>
          </div>

          <button
            onClick={handleClearQueues}
            disabled={isClearing}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-100"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Clearing Queues...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Clear Sidekiq Queues
              </>
            )}
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Sidekiq queues cleared successfully.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">System Information</h3>
              <p className="text-sm text-zinc-500">Overview of server and environment status.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-bold text-zinc-700">Database Engine</span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">PostgreSQL 15</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-bold text-zinc-700">Cache Engine</span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Redis 7.0</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-bold text-zinc-700">Environment</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
