import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Users, 
  Loader2,
  ChevronRight,
  User,
  X,
  Hash
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import type { GroupChat } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function GroupChats() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<{ total: number; rooms: GroupChat[] }>({
    queryKey: ['group-chats'],
    queryFn: async () => {
      const response = await api.get('/admin/group_chats');
      return response.data;
    },
  });

  const { data: selectedChat, isLoading: isLoadingChat } = useQuery<GroupChat>({
    queryKey: ['group-chats', selectedChatId],
    queryFn: async () => {
      const response = await api.get(`/admin/group_chats/${selectedChatId}`);
      return response.data;
    },
    enabled: !!selectedChatId,
  });

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load group chats. Please try again later.
      </div>
    );
  }

  const chats = data?.rooms;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Group Chats</h2>
        <p className="text-zinc-500 mt-1">Monitor and manage delegate group communication rooms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
          </div>
        ) : chats?.length === 0 ? (
          <div className="col-span-full p-24 bg-white border border-dashed border-zinc-200 rounded-3xl text-center text-zinc-500">
            No group chats found.
          </div>
        ) : (
          chats?.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => setSelectedChatId(chat.id)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </div>

              <h4 className="text-lg font-bold text-zinc-900 mb-2">{chat.title}</h4>
              
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Users className="w-4 h-4" />
                <span className="font-medium">{chat.member_count} members</span>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Room ID: #{chat.id}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Chat Members Modal */}
      <AnimatePresence>
        {selectedChatId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChatId(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Hash className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Group Room</span>
                    </div>
                    <h3 className="text-2xl font-bold">{selectedChat?.title || 'Loading...'}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedChatId(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Members ({selectedChat?.members?.length || 0})</h4>
                </div>

                <div className="max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {isLoadingChat ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                    </div>
                  ) : selectedChat?.members?.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-zinc-100 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-200">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{member.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Delegate ID: #{member.id}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedChatId(null)}
                  className="w-full mt-8 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
