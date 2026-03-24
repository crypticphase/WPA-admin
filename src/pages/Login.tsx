import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, User, Key } from 'lucide-react';
import api from '../services/api';
import { cn } from '../utils';

export default function Login() {
  const [loginType, setLoginType] = useState<'admin' | 'delegate'>('admin');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      // Test token by calling dashboard
      await api.get('/admin/dashboard', {
        headers: { 'X-Admin-Token': token }
      });
      
      localStorage.setItem('admin_token', token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid admin token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelegateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      const delegateToken = response.data.token || response.data.access_token;
      
      if (delegateToken) {
        localStorage.setItem('delegate_token', delegateToken);
        // Also store user info if available
        if (response.data.user) {
          localStorage.setItem('delegate_user', JSON.stringify(response.data.user));
        }
        navigate('/');
      } else {
        throw new Error('No token received from server');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200">
                {loginType === 'admin' ? (
                  <ShieldAlert className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900">WPA Portal</h1>
              <p className="text-zinc-500 mt-2">
                {loginType === 'admin' ? 'Administrative Access' : 'Delegate Access'}
              </p>
            </div>

            <div className="flex p-1 bg-zinc-100 rounded-2xl mb-8">
              <button
                onClick={() => setLoginType('admin')}
                className={cn(
                  "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                  loginType === 'admin' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Admin
              </button>
              <button
                onClick={() => setLoginType('delegate')}
                className={cn(
                  "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                  loginType === 'delegate' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Delegate
              </button>
            </div>

            {loginType === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label htmlFor="token" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Admin Token
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      id="token"
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Sign In as Admin'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleDelegateLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="delegate@example.com"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In as Delegate'
                  )}
                </button>
              </form>
            )}
          </div>
          
          <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Authorized Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
