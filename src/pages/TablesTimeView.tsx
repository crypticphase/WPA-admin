import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid3X3, 
  Loader2,
  Calendar,
  Clock,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Layout,
  ArrowRight,
  Building2
} from 'lucide-react';
import api from '../services/api';
import type { TableTimeView } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

export default function TablesTimeView() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery<TableTimeView>({
    queryKey: ['tables-time-view', selectedDate, selectedTime],
    queryFn: async () => {
      const response = await api.get('/admin/tables/time_view', {
        params: { date: selectedDate, time: selectedTime }
      });
      return response.data;
    },
  });

  // Set initial date and time from response if not set
  useEffect(() => {
    if (data) {
      if (!selectedDate && data.days?.length > 0) {
        setSelectedDate(data.days[0]);
      }
      
      // Ensure selectedTime is valid for the current data
      if (data.times_today?.length > 0) {
        if (!selectedTime || !data.times_today.includes(selectedTime)) {
          setSelectedTime(data.times_today[0]);
        }
      }
    }
  }, [data, selectedDate, selectedTime]);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      // Check if it's an ISO string or just a time string
      if (timeStr.includes('T')) {
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          });
        }
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load tables view. Please try again later.
      </div>
    );
  }

  const filteredTables = data?.tables?.filter(table => 
    (table.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    table.delegates?.some(d => (d.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: data?.tables?.length || 0,
    busy: data?.tables?.filter(t => t.meetings?.length > 0).length || 0,
    available: data?.tables?.filter(t => !t.meetings || t.meetings.length === 0).length || 0,
    booths: data?.tables?.filter(t => t.booth_owner).length || 0
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">Tables Time View</h2>
          <p className="text-zinc-500 mt-2 font-medium">Monitor table assignments and meeting slots in real-time.</p>
        </div>
        
        {/* Stats Summary */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="px-5 py-3 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold text-zinc-900 leading-none mt-1">{stats.total}</p>
            </div>
          </div>
          <div className="px-5 py-3 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Busy</p>
              <p className="text-lg font-bold text-zinc-900 leading-none mt-1">{stats.busy}</p>
            </div>
          </div>
          <div className="px-5 py-3 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Available</p>
              <p className="text-lg font-bold text-zinc-900 leading-none mt-1">{stats.available}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-8 premium-shadow">
            <div>
              <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Select Date
              </label>
              <div className="space-y-2">
                {data?.days?.map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(''); 
                    }}
                    className={cn(
                      "w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-left transition-all border",
                      selectedDate === day 
                        ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200 border-zinc-900 translate-x-1" 
                        : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 hover:translate-x-1"
                    )}
                  >
                    {new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
                <Clock className="w-3.5 h-3.5" />
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {data?.times_today?.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "px-3 py-3 rounded-xl text-[10px] font-black text-center transition-all border uppercase tracking-widest",
                      selectedTime === time 
                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-100 border-emerald-500 scale-105" 
                        : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 hover:scale-105"
                    )}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by table name, company, or delegate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all font-medium text-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-zinc-200" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-6">Loading floor plan...</p>
              </div>
            ) : filteredTables?.length === 0 ? (
              <div className="col-span-full p-32 bg-white border border-dashed border-zinc-200 rounded-[2.5rem] text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200 mx-auto mb-6">
                  <Grid3X3 className="w-10 h-10" />
                </div>
                <p className="text-sm font-bold text-zinc-400">No tables found matching your search.</p>
              </div>
            ) : (
              filteredTables?.map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "bg-white rounded-[2rem] border shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-zinc-200 transition-all duration-300",
                    table.meetings?.length > 0 ? "border-blue-100" : "border-zinc-200"
                  )}
                >
                  <div className={cn(
                    "p-6 border-b flex items-center justify-between",
                    table.meetings?.length > 0 ? "bg-blue-50/30 border-blue-50" : "bg-zinc-50/50 border-zinc-100"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                        table.meetings?.length > 0 ? "bg-blue-600 text-white shadow-blue-100" : "bg-zinc-900 text-white shadow-zinc-200"
                      )}>
                        <Layout className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-lg">{table.name}</h4>
                        {table.table_number && (
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                            Table: {table.table_number}
                          </p>
                        )}
                      </div>
                    </div>
                    {table.booth_owner && (
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Booth</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-6">
                    {table.meetings?.length > 0 ? (
                      table.meetings?.map((meeting: any, mIdx: number) => (
                        <div key={mIdx} className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-100" />
                            <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                              Active Meeting
                            </div>
                            <div className="h-px flex-1 bg-zinc-100" />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {/* Booker Side */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">Booker</span>
                                <Users className="w-3.5 h-3.5 text-blue-300" />
                              </div>
                              <div className="space-y-2">
                                {meeting.booker_team?.members?.map((member: any) => (
                                  <div key={member.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-white group-hover:border-blue-100 transition-all shadow-sm hover:shadow-md">
                                    <div className="w-9 h-9 bg-white border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm shrink-0">
                                      <User className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-zinc-900 truncate">{member.name}</p>
                                      <p className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-tight">{member.company?.name || 'Delegate'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-center py-2">
                              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shadow-xl shadow-zinc-200 border-4 border-white z-10">
                                <span className="text-[10px] font-black text-white italic">VS</span>
                              </div>
                            </div>

                            {/* Target Side */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between flex-row-reverse">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">Target</span>
                                <Users className="w-3.5 h-3.5 text-purple-300" />
                              </div>
                              <div className="space-y-2">
                                {meeting.target_team?.members ? (
                                  meeting.target_team.members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-white group-hover:border-purple-100 transition-all shadow-sm hover:shadow-md flex-row-reverse text-right">
                                      <div className="w-9 h-9 bg-white border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm shrink-0">
                                        <User className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-zinc-900 truncate">{member.name}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-tight">{member.company?.name || 'Delegate'}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : meeting.target_delegate ? (
                                  <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-white group-hover:border-purple-100 transition-all shadow-sm hover:shadow-md flex-row-reverse text-right">
                                    <div className="w-9 h-9 bg-white border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm shrink-0">
                                      <User className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-zinc-900 truncate">{meeting.target_delegate.name}</p>
                                      <p className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-tight">{meeting.target_delegate.company?.name || 'Delegate'}</p>
                                    </div>
                                  </div>
                                ) : table.booth_owner ? (
                                  <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-white group-hover:border-emerald-100 transition-all shadow-sm hover:shadow-md flex-row-reverse text-right">
                                    <div className="w-9 h-9 bg-white border border-zinc-100 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-zinc-900 truncate">{table.booth_owner.name}</p>
                                      <p className="text-[10px] font-black text-emerald-500 truncate uppercase tracking-widest">Booth Host</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-6 text-center bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">No Target Info</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-zinc-50 rounded-[2rem] flex items-center justify-center text-zinc-200 border border-zinc-100 shadow-inner">
                          <Layout className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Table Available</p>
                          <p className="text-[9px] font-bold text-zinc-400 mt-1">Ready for next slot</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
