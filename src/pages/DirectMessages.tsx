import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Loader2,
  User,
  Search,
  ArrowRight,
  Clock,
  MessageCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import type { ChatMessage, DirectChatRoom } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function DirectMessages() {
  const [selectedRoom, setSelectedRoom] = useState<DirectChatRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: roomsData, isLoading: isLoadingRooms } = useQuery<{ 
    rooms: DirectChatRoom[];
    total: number;
    total_pages: number;
    page: number;
  }>({
    queryKey: ['direct-chat-rooms', page],
    queryFn: async () => {
      const response = await api.get('/admin/messages/rooms', {
        params: { page, per_page: 20 }
      });
      return response.data;
    },
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<{ 
    messages: ChatMessage[];
    delegate_a: any;
    delegate_b: any;
  }>({
    queryKey: ['direct-messages', selectedRoom?.delegate_a.id, selectedRoom?.delegate_b.id],
    queryFn: async () => {
      const response = await api.get('/admin/messages/direct', {
        params: { 
          delegate_a_id: selectedRoom?.delegate_a.id, 
          delegate_b_id: selectedRoom?.delegate_b.id 
        }
      });
      return response.data;
    },
    enabled: !!selectedRoom,
  });

  const filteredRooms = roomsData?.rooms.filter(room => 
    room.delegate_a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.delegate_b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.delegate_a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.delegate_b.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Direct Messages</h2>
        <p className="text-zinc-500 mt-1">Monitor private conversations between delegates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
        {/* Rooms Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {isLoadingRooms ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
              </div>
            ) : filteredRooms?.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200 text-zinc-400">
                <p className="text-sm">No conversations found.</p>
              </div>
            ) : (
              filteredRooms?.map((room) => {
                const isSelected = selectedRoom?.delegate_a.id === room.delegate_a.id && 
                                 selectedRoom?.delegate_b.id === room.delegate_b.id;
                return (
                  <button
                    key={`${room.delegate_a.id}-${room.delegate_b.id}`}
                    onClick={() => setSelectedRoom(room)}
                    className={cn(
                      "w-full p-4 rounded-3xl border transition-all text-left group relative",
                      isSelected 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" 
                        : "bg-white border-zinc-100 hover:border-zinc-300 text-zinc-900 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                          {room.delegate_a.avatar_url ? (
                            <img src={room.delegate_a.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                          {room.delegate_b.avatar_url ? (
                            <img src={room.delegate_b.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">
                          {room.delegate_a.name} & {room.delegate_b.name}
                        </p>
                        <p className={cn("text-[10px] truncate", isSelected ? "text-zinc-400" : "text-zinc-500")}>
                          {room.delegate_a.company} / {room.delegate_b.company}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {room.unread_count}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-[11px] truncate flex-1", isSelected ? "text-zinc-300" : "text-zinc-500")}>
                        {room.last_message_type === 'image' ? 'Sent an image' : room.last_message}
                      </p>
                      <span className={cn("text-[10px] shrink-0", isSelected ? "text-zinc-500" : "text-zinc-400")}>
                        {new Date(room.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {roomsData && roomsData.total_pages > 1 && (
            <div className="flex items-center justify-between px-2 py-2 border-t border-zinc-100 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Page {page} of {roomsData.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(roomsData.total_pages, p + 1))}
                disabled={page === roomsData.total_pages}
                className="p-2 rounded-xl hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {!selectedRoom ? (
            <div className="flex-1 bg-white border border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Select a Conversation</h3>
              <p className="text-sm max-w-xs">Choose a chat room from the list to view the message history between delegates.</p>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 overflow-hidden">
                    {selectedRoom.delegate_a.avatar_url ? (
                      <img src={selectedRoom.delegate_a.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{selectedRoom.delegate_a.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedRoom.delegate_a.company}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-300" />
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{selectedRoom.delegate_b.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedRoom.delegate_b.company}</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 overflow-hidden">
                    {selectedRoom.delegate_b.avatar_url ? (
                      <img src={selectedRoom.delegate_b.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-200" />
                  </div>
                ) : messagesData?.messages?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <MessageCircle className="w-12 h-12 opacity-10 mb-4" />
                    <p className="text-sm">No messages found.</p>
                  </div>
                ) : (
                  [...messagesData.messages].reverse().map((msg) => {
                    const isFromA = msg.sender.id === selectedRoom.delegate_a.id;
                    return (
                      <div key={msg.id} className={cn(
                        "flex gap-4 max-w-[80%]",
                        !isFromA && "ml-auto flex-row-reverse"
                      )}>
                        <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden">
                          {msg.sender.avatar_url ? (
                            <img src={msg.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className={cn(
                          "space-y-1",
                          !isFromA && "text-right"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-zinc-900">{msg.sender.name}</span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={cn(
                            "p-4 rounded-2xl border text-sm leading-relaxed",
                            isFromA 
                              ? "bg-zinc-50 border-zinc-100 rounded-tl-none text-zinc-700" 
                              : "bg-zinc-900 border-zinc-900 text-white rounded-tr-none"
                          )}>
                            {msg.is_deleted ? (
                              <span className="italic opacity-50">ข้อความถูกลบแล้ว</span>
                            ) : msg.message_type === 'image' ? (
                              <img src={msg.image_url!} alt="" className="rounded-xl max-w-full border border-zinc-200/10" />
                            ) : (
                              msg.content
                            )}
                            {msg.read_at && (
                              <div className={cn("mt-1 text-[9px] opacity-40", !isFromA && "text-zinc-400")}>
                                Read at {new Date(msg.read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
