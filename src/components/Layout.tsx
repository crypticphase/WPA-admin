import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  FileText, 
  Tags,
  MessageSquare, 
  MessageCircle,
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Grid3X3,
  Bell,
  Share2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils';
import BaseUrlManager from './BaseUrlManager';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Delegates', href: '/delegates', icon: Users },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Leave Forms', href: '/leave-forms', icon: FileText },
  { name: 'Leave Types', href: '/leave-types', icon: Tags },
  { name: 'Group Chats', href: '/group-chats', icon: MessageSquare },
  { name: 'Direct Messages', href: '/direct-messages', icon: MessageCircle },
  { name: 'Delegate Chat', href: '/delegate-chat', icon: MessageSquare, delegateOnly: true },
  { name: 'Audit Logs', href: '/audit-logs', icon: History },
  { name: 'Security Logs', href: '/security-logs', icon: ShieldAlert },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Connections', href: '/connection-requests', icon: Share2 },
  { name: 'Maintenance', href: '/maintenance', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('delegate_token');
    localStorage.removeItem('delegate_user');
    navigate('/login');
  };

  const adminToken = localStorage.getItem('admin_token');
  const delegateToken = localStorage.getItem('delegate_token');
  const delegateUserJson = localStorage.getItem('delegate_user');
  const delegateUser = delegateUserJson ? JSON.parse(delegateUserJson) : null;

  const handleStopImpersonating = () => {
    localStorage.removeItem('delegate_token');
    localStorage.removeItem('delegate_user');
    navigate('/delegates');
  };

  const filteredNavigation = navigation.filter(item => {
    if (item.delegateOnly) return !!delegateToken;
    return !!adminToken;
  });

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-zinc-200/60 sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-display">WPA Admin</h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
          <p className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Main Menu</p>
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200 translate-x-1" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:translate-x-1"
                )}
              >
                <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto space-y-4">
          <BaseUrlManager />
          
          {delegateUser && (
            <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-100 relative group">
              <button
                onClick={handleStopImpersonating}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Stop Impersonating"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-emerald-200 flex items-center justify-center overflow-hidden">
                  {delegateUser.avatar_url ? (
                    <img src={delegateUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-900 truncate">{delegateUser.name}</p>
                  <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-widest">Impersonating</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-zinc-50 rounded-3xl p-4 border border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Admin User</p>
                <p className="text-[10px] text-zinc-400 font-medium">Super Administrator</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 z-50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">WPA Admin</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-600"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16">
          <nav className="p-4 space-y-2">
            {delegateUser && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-emerald-200 flex items-center justify-center overflow-hidden">
                    {delegateUser.avatar_url ? (
                      <img src={delegateUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">{delegateUser.name}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Impersonating</p>
                  </div>
                </div>
                <button
                  onClick={handleStopImpersonating}
                  className="p-2 bg-red-100 text-red-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium",
                    isActive 
                      ? "bg-zinc-900 text-white" 
                      : "text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 mt-4"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
