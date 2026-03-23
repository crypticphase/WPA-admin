import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Megaphone, 
  FileText, 
  MessageSquare, 
  Bell,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import type { DashboardStats } from '../types';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load dashboard statistics. Please try again later.
      </div>
    );
  }

  const statCards = [
    { name: 'Total Delegates', value: stats?.delegates.total, icon: Users, color: 'bg-blue-500' },
    { name: 'Announcements', value: stats?.announcements.total, icon: Megaphone, color: 'bg-purple-500' },
    { name: 'Leave Forms', value: stats?.leave_forms.total, icon: FileText, color: 'bg-orange-500' },
    { name: 'Group Chats', value: stats?.group_chats.total, icon: MessageSquare, color: 'bg-emerald-500' },
    { name: 'Notifications', value: stats?.notifications.total, icon: Bell, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-zinc-500 mt-1">Real-time system statistics and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className={stat.color + " p-3 rounded-xl text-white shadow-lg shadow-zinc-200"}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
              <h3 className="text-3xl font-bold text-zinc-900 mt-1">{stat.value?.toLocaleString() || 0}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900 mb-6">System Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-700">API Server</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-700">WebSocket Service</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-700">Background Workers</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Operational</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-8 rounded-2xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <p className="text-zinc-400 text-sm mb-8">Common administrative tasks accessible at your fingertips.</p>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors border border-white/5">
                <Megaphone className="w-5 h-5 mb-2 text-purple-400" />
                <span className="text-sm font-semibold">New Announcement</span>
              </button>
              <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors border border-white/5">
                <Users className="w-5 h-5 mb-2 text-blue-400" />
                <span className="text-sm font-semibold">Manage Delegates</span>
              </button>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
