import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Settings, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  Bell,
  MessageSquare,
  History,
  Database,
  RefreshCw,
  Cpu,
  Server,
  Activity,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { cn } from '../utils';
import type { SidekiqStatus, RedisStatus } from '../types';

export default function Maintenance() {
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

  const { data: sidekiq, isLoading: sidekiqLoading } = useQuery<SidekiqStatus>({
    queryKey: ['sidekiq-status'],
    queryFn: async () => {
      const response = await api.get('/admin/maintenance/sidekiq_status');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: redis, isLoading: redisLoading } = useQuery<RedisStatus>({
    queryKey: ['redis-status'],
    queryFn: async () => {
      const response = await api.get('/admin/maintenance/redis_status');
      return response.data;
    },
    refetchInterval: 60000,
  });

  const resetMutation = useMutation({
    mutationFn: async (type: string) => {
      let endpoint = '';
      switch (type) {
        case 'notifications': endpoint = '/admin/maintenance/reset_notifications'; break;
        case 'messages': endpoint = '/admin/maintenance/reset_messages'; break;
        case 'logs': endpoint = '/admin/maintenance/reset_logs'; break;
        case 'all': endpoint = '/admin/maintenance/reset_all'; break;
        case 'sidekiq': endpoint = '/admin/maintenance/clear_sidekiq'; break;
      }
      const response = await api.delete(endpoint);
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message || 'System reset successful!');
      setIsConfirming(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to perform system reset.');
      setIsConfirming(null);
    }
  });

  const handleReset = (type: string) => {
    resetMutation.mutate(type);
  };

  const sections = [
    {
      id: 'notifications',
      title: 'Reset Notifications',
      description: 'Delete all system notifications sent to delegates. This will clear the notification history for everyone.',
      icon: Bell,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'messages',
      title: 'Reset Messages',
      description: 'Delete all chat messages and group chat history. This will clear all conversations across the platform.',
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'logs',
      title: 'Reset Logs',
      description: 'Delete all audit and security logs. This will remove the administrative history of the system.',
      icon: History,
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-50'
    },
    {
      id: 'sidekiq',
      title: 'Clear Sidekiq Queues',
      description: 'Clear all background jobs, retries, and scheduled tasks. Use this if background processes are stuck.',
      icon: RefreshCw,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">System Maintenance</h2>
          <p className="text-zinc-500 mt-2 font-medium">Manage system data, clear caches, and perform administrative resets.</p>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sidekiq Status Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm premium-shadow overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-32 h-32 text-purple-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 font-display">Sidekiq Queues</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Background Jobs</p>
                </div>
              </div>
              {sidekiqLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </div>
              )}
            </div>

            {sidekiq && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Processed</p>
                    <p className="text-lg font-bold text-zinc-900">{sidekiq.overview.processed.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Failed</p>
                    <p className="text-lg font-bold text-red-600">{sidekiq.overview.failed.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Enqueued</p>
                    <p className="text-lg font-bold text-purple-600">{sidekiq.overview.enqueued.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sidekiq.queues.map(q => (
                    <div key={q.name} className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-xs font-bold text-zinc-700 uppercase tracking-widest">{q.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Size: {q.size}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Latency: {q.latency}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Redis Status Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm premium-shadow overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Server className="w-32 h-32 text-red-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 font-display">Redis Server</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cache & Session</p>
                </div>
              </div>
              {redisLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Stable
                </div>
              )}
            </div>

            {redis && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Memory Used</p>
                    <p className="text-lg font-bold text-zinc-900">{redis.memory_used}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Peak Memory</p>
                    <p className="text-lg font-bold text-zinc-900">{redis.memory_peak}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Clients</p>
                    <p className="text-lg font-bold text-zinc-900">{redis.connected_clients}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Uptime</p>
                    <p className="text-lg font-bold text-zinc-900">{redis.uptime}s</p>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Redis Version</span>
                  <span className="text-xs font-bold text-zinc-700">{redis.version}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-10 rounded-[2.5rem] border border-zinc-200/60 shadow-sm flex flex-col premium-shadow hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 group">
            <div className="flex items-center gap-6 mb-8">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300", section.bgColor, section.color)}>
                <section.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 font-display">{section.title}</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Maintenance Action</p>
              </div>
            </div>
            
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 flex-1 font-medium">
              {section.description}
            </p>

            {isConfirming === section.id ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em] leading-relaxed">
                    Warning: This action is permanent and cannot be undone. All related data will be purged.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsConfirming(null)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReset(section.id)}
                    disabled={resetMutation.isPending}
                    className="flex-2 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-red-200"
                  >
                    {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Confirm Purge
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirming(section.id)}
                className="w-full py-5 bg-zinc-50 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-900 hover:text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-zinc-100"
              >
                <Trash2 className="w-4 h-4" />
                Initialize Reset
              </button>
            )}
          </div>
        ))}

        <div className="lg:col-span-2 bg-zinc-900 p-12 rounded-[3rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <Database className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white font-display">Full System Reset</h3>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mt-1">Critical Administrative Action</p>
              </div>
            </div>

            <p className="text-zinc-400 text-base leading-relaxed mb-12 max-w-2xl font-medium">
              This will clear ALL notifications, messages, logs, and announcements. 
              The system will be returned to its initial state. This action is extremely 
              destructive and should only be used as a last resort.
            </p>

            {isConfirming === 'all' ? (
              <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  onClick={() => setIsConfirming(null)}
                  className="px-10 py-5 bg-zinc-800 text-white rounded-2xl font-bold hover:bg-zinc-700 transition-all text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReset('all')}
                  disabled={resetMutation.isPending}
                  className="px-10 py-5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-900/40"
                >
                  {resetMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  Confirm Full System Reset
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirming('all')}
                className="px-12 py-5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center gap-4 text-xs uppercase tracking-widest shadow-xl shadow-red-900/40 group"
              >
                <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Reset All System Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
