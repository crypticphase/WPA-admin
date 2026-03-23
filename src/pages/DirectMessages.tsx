import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Loader2,
  User,
  Search,
  ArrowRight,
  Clock,
  MessageCircle,
  X
} from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import type { ChatMessage, Delegate } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function DirectMessages() {
  const [delegateA, setDelegateA] = useState<number | null>(null);
  const [delegateB, setDelegateB] = useState<number | null>(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  const { data: delegatesData } = useQuery<{ delegates: Delegate[] }>({
    queryKey: ['delegates-list'],
    queryFn: async () => {
      const response = await api.get('/admin/delegates', { params: { per_page: 100 } });
      return response.data;
    },
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<{ 
    messages: ChatMessage[];
    delegate_a: any;
    delegate_b: any;
  }>({
    queryKey: ['direct-messages', delegateA, delegateB],
    queryFn: async () => {
      const response = await api.get('/admin/messages/direct', {
        params: { delegate_a_id: delegateA, delegate_b_id: delegateB }
      });
      return response.data;
    },
    enabled: !!delegateA && !!delegateB,
  });

  const filteredA = delegatesData?.delegates?.filter(d => 
    d.name.toLowerCase().includes(searchA.toLowerCase()) || 
    d.company.name.toLowerCase().includes(searchA.toLowerCase())
  ).slice(0, 5);

  const filteredB = delegatesData?.delegates?.filter(d => 
    d.name.toLowerCase().includes(searchB.toLowerCase()) || 
    d.company.name.toLowerCase().includes(searchB.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Direct Messages</h2>
        <p className="text-zinc-500 mt-1">View private conversations between delegates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            {/* Delegate A Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Delegate A</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search delegate..."
                  value={searchA}
                  onChange={(e) => setSearchA(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                />
              </div>
              <div className="space-y-2">
                {searchA && filteredA?.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDelegateA(d.id);
                      setSearchA('');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      delegateA === d.id ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-100 hover:border-zinc-300"
                    )}
                  >
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{d.name}</p>
                      <p className="text-[10px] opacity-60 truncate">{d.company.name}</p>
                    </div>
                  </button>
                ))}
              </div>
              {delegateA && !searchA && (
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl text-white">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">
                      {delegatesData?.delegates.find(d => d.id === delegateA)?.name}
                    </p>
                  </div>
                  <button onClick={() => setDelegateA(null)} className="p-1 hover:bg-white/10 rounded-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            {/* Delegate B Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Delegate B</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search delegate..."
                  value={searchB}
                  onChange={(e) => setSearchB(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                />
              </div>
              <div className="space-y-2">
                {searchB && filteredB?.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDelegateB(d.id);
                      setSearchB('');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      delegateB === d.id ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-100 hover:border-zinc-300"
                    )}
                  >
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{d.name}</p>
                      <p className="text-[10px] opacity-60 truncate">{d.company.name}</p>
                    </div>
                  </button>
                ))}
              </div>
              {delegateB && !searchB && (
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl text-white">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">
                      {delegatesData?.delegates.find(d => d.id === delegateB)?.name}
                    </p>
                  </div>
                  <button onClick={() => setDelegateB(null)} className="p-1 hover:bg-white/10 rounded-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-2">
          {!delegateA || !delegateB ? (
            <div className="h-full min-h-[400px] bg-white border border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Select Two Delegates</h3>
              <p className="text-sm max-w-xs">Search and select two delegates from the sidebar to view their private conversation history.</p>
            </div>
          ) : isLoadingMessages ? (
            <div className="h-full min-h-[400px] bg-white border border-zinc-200 rounded-[2.5rem] flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-zinc-200" />
            </div>
          ) : messagesData?.messages?.length === 0 ? (
            <div className="h-full min-h-[400px] bg-white border border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
              <MessageCircle className="w-16 h-16 opacity-10 mb-4" />
              <p className="text-sm font-medium">No messages found between these delegates.</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{messagesData.delegate_a.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Delegate A</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-300" />
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{messagesData.delegate_b.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Delegate B</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messagesData.messages.map((msg) => {
                  const isFromA = msg.sender.id === delegateA;
                  return (
                    <div key={msg.id} className={cn(
                      "flex gap-4 max-w-[80%]",
                      !isFromA && "ml-auto flex-row-reverse"
                    )}>
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 shrink-0">
                        {msg.sender.avatar_url ? (
                          <img src={msg.sender.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
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
                          {msg.content}
                          {msg.image_url && (
                            <img src={msg.image_url} alt="" className="mt-3 rounded-xl max-w-full border border-zinc-200/10" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
