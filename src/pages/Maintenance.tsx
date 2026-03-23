import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Settings, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  Bell,
  MessageSquare,
  History,
  Database,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { cn } from '../utils';

export default function Maintenance() {
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">System Maintenance</h2>
          <p className="text-zinc-500 mt-1">Manage system data and perform administrative resets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", section.bgColor, section.color)}>
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">{section.title}</h3>
            </div>
            
            <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-1">
              {section.description}
            </p>

            {isConfirming === section.id ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Warning: This action is permanent and cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirming(null)}
                    className="flex-1 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReset(section.id)}
                    disabled={resetMutation.isPending}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Confirm Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirming(section.id)}
                className="w-full py-3 bg-zinc-50 text-zinc-600 rounded-xl font-bold hover:bg-zinc-100 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Initialize Reset
              </button>
            )}
          </div>
        ))}

        <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-32 h-32 text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Full System Reset</h3>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-2xl">
              This will clear ALL notifications, messages, logs, and announcements. 
              The system will be returned to its initial state. This action is extremely 
              destructive and should only be used as a last resort.
            </p>

            {isConfirming === 'all' ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsConfirming(null)}
                  className="px-8 py-4 bg-zinc-800 text-white rounded-2xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReset('all')}
                  disabled={resetMutation.isPending}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  {resetMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  Confirm Full System Reset
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirming('all')}
                className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Reset All System Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
