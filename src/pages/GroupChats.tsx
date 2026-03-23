import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Users, 
  Loader2,
  ChevronRight,
  User,
  X,
  Hash,
  Trash2,
  MessageCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';
import type { GroupChat, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function GroupChats() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [viewingMessages, setViewingMessages] = useState(false);
  const queryClient = useQueryClient();

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

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ['group-chats-messages', selectedChatId],
    queryFn: async () => {
      const response = await api.get(`/admin/group_chats/${selectedChatId}/messages`);
      return response.data;
    },
    enabled: !!selectedChatId && viewingMessages,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/group_chats/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
      setSelectedChatId(null);
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group chat?')) {
      deleteMutation.mutate(id);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Group Chats</h2>
          <p className="text-zinc-500 mt-1">Monitor and manage delegate group communication rooms.</p>
        </div>
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
              className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative"
              onClick={() => {
                setSelectedChatId(chat.id);
                setViewingMessages(false);
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Room"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
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

      {/* Chat Details Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
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
                <div className="flex items-center gap-4 mb-8 p-1 bg-zinc-100 rounded-2xl">
                  <button
                    onClick={() => setViewingMessages(false)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      !viewingMessages ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Members
                  </button>
                  <button
                    onClick={() => setViewingMessages(true)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      viewingMessages ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Messages
                  </button>
                </div>

                <div className="max-h-[32rem] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {!viewingMessages ? (
                    isLoadingChat ? (
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
                    ))
                  ) : (
                    isLoadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                      </div>
                    ) : messagesData?.messages?.length === 0 ? (
                      <div className="text-center py-12 text-zinc-400">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium">No messages in this room yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {messagesData?.messages?.map((msg) => (
                          <div key={msg.id} className="flex gap-4">
                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                              {msg.sender.avatar_url ? (
                                <img src={msg.sender.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-900">{msg.sender.name}</span>
                                <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="p-4 bg-zinc-50 rounded-2xl rounded-tl-none border border-zinc-100">
                                <p className="text-sm text-zinc-600 leading-relaxed">{msg.content}</p>
                                {msg.image_url && (
                                  <img src={msg.image_url} alt="" className="mt-3 rounded-xl max-w-full border border-zinc-200" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
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
