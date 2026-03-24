import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Loader2,
  User,
  Search,
  ArrowRight,
  Clock,
  MessageCircle,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import type { DelegateUser, DelegateChatRoom, DelegateMessage } from '../types';
import { cn } from '../utils';
import { createConsumer } from '@rails/actioncable';

export default function DelegateChat() {
  const [selectedDelegate, setSelectedDelegate] = useState<DelegateUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const cableRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  const delegateToken = localStorage.getItem('delegate_token');
  const currentUserJson = localStorage.getItem('delegate_user');
  const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

  // 1. Fetch Delegates (2025)
  const { data: delegatesData, isLoading: isLoadingDelegates } = useQuery<{ delegates: DelegateUser[] }>({
    queryKey: ['delegates-2025', searchTerm],
    queryFn: async () => {
      const response = await api.get('/delegates', {
        params: { year: 2025, keyword: searchTerm, per_page: 50 }
      });
      return response.data;
    },
    enabled: !!delegateToken
  });

  // 2. Fetch Existing Rooms
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery<DelegateChatRoom[]>({
    queryKey: ['delegate-rooms'],
    queryFn: async () => {
      const response = await api.get('/messages/rooms');
      return response.data;
    },
    enabled: !!delegateToken
  });

  // 3. Fetch Conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<DelegateMessage[]>({
    queryKey: ['delegate-conversation', selectedDelegate?.id],
    queryFn: async () => {
      const response = await api.get(`/messages/conversation/${selectedDelegate?.id}`, {
        params: { page: 1, per: 50 }
      });
      // API returns newest first, we need to reverse for display
      return [...response.data].reverse();
    },
    enabled: !!selectedDelegate && !!delegateToken,
  });

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, image }: { content?: string, image?: string }) => {
      const payload: any = { recipient_id: selectedDelegate?.id };
      if (content) payload.content = content;
      if (image) payload.image = image;
      
      return api.post('/messages', { message: payload });
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['delegate-conversation', selectedDelegate?.id] });
      queryClient.invalidateQueries({ queryKey: ['delegate-rooms'] });
    }
  });

  // 5. ActionCable Connection
  useEffect(() => {
    if (!delegateToken) return;

    const customBaseUrl = localStorage.getItem('custom_base_url');
    const baseUrl = customBaseUrl || 'https://wpadocker-production.up.railway.app/api/v1';
    const wsUrl = baseUrl.replace('http', 'ws').replace('/api/v1', '/cable');
    
    const cable = createConsumer(`${wsUrl}?token=${delegateToken}`);
    cableRef.current = cable;

    const subscription = cable.subscriptions.create(
      { channel: "ChatChannel" },
      {
        received(data: any) {
          console.log('ActionCable received:', data);
          switch(data.type) {
            case "new_message":
              // Update conversation if it's the current one
              if (selectedDelegate && (data.message.sender_id === selectedDelegate.id || data.message.recipient_id === selectedDelegate.id)) {
                queryClient.setQueryData(['delegate-conversation', selectedDelegate.id], (old: DelegateMessage[] | undefined) => {
                  if (!old) return [data.message];
                  // Check if message already exists (to avoid duplicates from mutation onSuccess)
                  if (old.some(m => m.id === data.message.id)) return old;
                  return [...old, data.message];
                });
              }
              queryClient.invalidateQueries({ queryKey: ['delegate-rooms'] });
              break;
            case "message_read":
              // Update read status
              break;
            case "typing_start":
              if (data.sender_id === selectedDelegate?.id) {
                setTypingUsers(prev => ({ ...prev, [data.sender_id]: true }));
              }
              break;
            case "typing_stop":
              setTypingUsers(prev => ({ ...prev, [data.sender_id]: false }));
              break;
          }
        }
      }
    );
    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      cable.disconnect();
    };
  }, [delegateToken, selectedDelegate, queryClient]);

  // Typing indicator logic
  const typingTimeoutRef = useRef<any>(null);
  const handleTyping = () => {
    if (!subscriptionRef.current || !selectedDelegate) return;

    if (!isTyping) {
      setIsTyping(true);
      subscriptionRef.current.perform("typing_start", { recipient_id: selectedDelegate.id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      subscriptionRef.current.perform("typing_stop", { recipient_id: selectedDelegate.id });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messagesData) {
      scrollToBottom();
    }
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({ content: messageContent });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      sendMessageMutation.mutate({ image: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (!delegateToken) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-[2.5rem] border border-dashed border-zinc-200 p-12 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500 opacity-20" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-2">Delegate Access Required</h3>
        <p className="text-sm text-zinc-500 max-w-xs mb-8">Please sign in as a Delegate to use the direct chat feature.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)]">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Delegate Chat</h2>
          <p className="text-zinc-500 mt-1">Chat as a delegate with other attendees.</p>
        </div>
        {currentUser && (
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-zinc-100 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100">
              <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-400 font-medium">Logged in as Delegate</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search delegates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {/* Existing Rooms */}
            {roomsData && roomsData.length > 0 && (
              <div className="mb-4">
                <p className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Chats</p>
                {roomsData.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedDelegate(room.other_delegate)}
                    className={cn(
                      "w-full p-4 rounded-3xl border transition-all text-left mb-2",
                      selectedDelegate?.id === room.other_delegate?.id 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" 
                        : "bg-white border-zinc-100 hover:border-zinc-300 text-zinc-900 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        <img src={room.other_delegate?.avatar_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold truncate">{room.other_delegate?.name}</p>
                          <span className={cn("text-[9px]", selectedDelegate?.id === room.other_delegate?.id ? "text-zinc-500" : "text-zinc-400")}>
                            {new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={cn("text-[11px] truncate", selectedDelegate?.id === room.other_delegate?.id ? "text-zinc-400" : "text-zinc-500")}>
                          {room.last_message}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* All Delegates */}
            <div>
              <p className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">All Delegates (2025)</p>
              {isLoadingDelegates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
                </div>
              ) : (
                delegatesData?.delegates.map((delegate) => (
                  <button
                    key={delegate.id}
                    onClick={() => setSelectedDelegate(delegate)}
                    className={cn(
                      "w-full p-4 rounded-3xl border transition-all text-left mb-2",
                      selectedDelegate?.id === delegate.id 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" 
                        : "bg-white border-zinc-100 hover:border-zinc-300 text-zinc-900 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        <img src={delegate.avatar_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{delegate.name}</p>
                        <p className={cn("text-[10px] truncate", selectedDelegate?.id === delegate.id ? "text-zinc-400" : "text-zinc-500")}>
                          {delegate.company_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          {!selectedDelegate ? (
            <div className="flex-1 bg-white border border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Start a Conversation</h3>
              <p className="text-sm max-w-xs">Select a delegate from the list to start chatting.</p>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm min-h-0">
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-zinc-200 flex items-center justify-center overflow-hidden">
                    <img src={selectedDelegate.avatar_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-zinc-900">{selectedDelegate.name}</p>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      {typingUsers[selectedDelegate.id] ? (
                        <span className="text-emerald-500 animate-pulse">Typing...</span>
                      ) : (
                        selectedDelegate.company_name
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar min-h-0">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-200" />
                  </div>
                ) : (
                  <>
                    {messagesData?.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      return (
                        <div key={msg.id} className={cn(
                          "flex gap-3 max-w-[80%]",
                          isMe && "ml-auto flex-row-reverse"
                        )}>
                          <div className={cn(
                            "space-y-1",
                            isMe && "text-right"
                          )}>
                            <div className={cn(
                              "p-4 rounded-2xl border text-sm leading-relaxed shadow-sm",
                              isMe 
                                ? "bg-zinc-900 border-zinc-900 text-white rounded-tr-none" 
                                : "bg-zinc-50 border-zinc-100 rounded-tl-none text-zinc-700"
                            )}>
                              {msg.is_deleted ? (
                                <span className="italic opacity-50">Message deleted</span>
                              ) : msg.message_type === 'image' ? (
                                <img src={msg.image_url} alt="" className="rounded-xl max-w-full" />
                              ) : (
                                msg.content
                              )}
                            </div>
                            <div className="flex items-center gap-2 px-1">
                              <span className="text-[9px] text-zinc-400 font-medium">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                msg.read_at ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Check className="w-3 h-3 text-zinc-300" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={messageContent}
                      onChange={(e) => {
                        setMessageContent(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="w-full pl-6 pr-12 py-4 bg-white border border-zinc-200 rounded-[2rem] text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all shadow-sm"
                    />
                    <label className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer">
                      <ImageIcon className="w-5 h-5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    className="w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50 disabled:scale-95"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
