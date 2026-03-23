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

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Delegates', href: '/delegates', icon: Users },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Leave Forms', href: '/leave-forms', icon: FileText },
  { name: 'Leave Types', href: '/leave-types', icon: Tags },
  { name: 'Group Chats', href: '/group-chats', icon: MessageSquare },
  { name: 'Direct Messages', href: '/direct-messages', icon: MessageCircle },
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
    navigate('/login');
  };

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
          {navigation.map((item) => {
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

        <div className="p-6 mt-auto">
          <div className="bg-zinc-50 rounded-3xl p-4 mb-4 border border-zinc-100">
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
            {navigation.map((item) => {
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
