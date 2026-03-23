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
import { cn } from '../utils';

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
    { name: 'Total Delegates', value: stats?.delegates.total, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: '+12% from last week' },
    { name: 'Announcements', value: stats?.announcements.total, icon: Megaphone, color: 'text-purple-600', bgColor: 'bg-purple-50', trend: '3 sent today' },
    { name: 'Leave Forms', value: stats?.leave_forms.total, icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-50', trend: '5 pending review' },
    { name: 'Group Chats', value: stats?.group_chats.total, icon: MessageSquare, color: 'text-emerald-600', bgColor: 'bg-emerald-50', trend: 'Active now' },
    { name: 'Notifications', value: stats?.notifications.total, icon: Bell, color: 'text-rose-600', bgColor: 'bg-rose-50', trend: 'Real-time alerts' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">System Overview</h2>
          <p className="text-zinc-500 mt-2 font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
            Live Status
          </div>
          <div className="flex items-center gap-2 pr-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 group cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className={cn(stat.bgColor, stat.color, "p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300")}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Stats
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-bold text-zinc-900 font-display tracking-tight">{stat.value?.toLocaleString() || 0}</h3>
              <p className="text-sm font-bold text-zinc-500 mt-1">{stat.name}</p>
              <div className="mt-4 pt-4 border-t border-zinc-50">
                <p className={cn("text-[10px] font-bold uppercase tracking-widest", stat.color)}>
                  {stat.trend}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-zinc-900 font-display">Service Health</h3>
            <button className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">View Logs</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'API Gateway', status: 'Operational', uptime: '99.9%' },
              { label: 'WebSocket', status: 'Operational', uptime: '99.8%' },
              { label: 'Database', status: 'Operational', uptime: '100%' },
            ].map((service) => (
              <div key={service.label} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{service.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{service.status}</span>
                  <span className="text-xs font-mono text-zinc-400">{service.uptime}</span>
                </div>
                <div className="mt-4 h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 p-8 rounded-4xl text-white relative overflow-hidden shadow-2xl shadow-zinc-900/20">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-2 font-display">Control Center</h3>
            <p className="text-zinc-400 text-sm mb-10 font-medium">Execute critical system actions instantly.</p>
            <div className="grid grid-cols-1 gap-4 mt-auto">
              <button className="group p-5 bg-white/5 hover:bg-white/10 rounded-3xl text-left transition-all border border-white/5 hover:border-white/10 flex items-center justify-between">
                <div>
                  <Megaphone className="w-5 h-5 mb-3 text-purple-400" />
                  <span className="text-sm font-bold block">Broadcast</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">To all delegates</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
              </button>
              <button className="group p-5 bg-white/5 hover:bg-white/10 rounded-3xl text-left transition-all border border-white/5 hover:border-white/10 flex items-center justify-between">
                <div>
                  <Users className="w-5 h-5 mb-3 text-blue-400" />
                  <span className="text-sm font-bold block">Delegates</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Manage registry</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
