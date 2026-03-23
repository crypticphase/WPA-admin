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
  Layout
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Tables Time View</h2>
          <p className="text-zinc-500 mt-1">Monitor table assignments and meeting slots in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                <Calendar className="w-3 h-3" />
                Select Date
              </label>
              <div className="grid grid-cols-1 gap-2">
                {data?.days?.map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(''); // Reset time so it can be re-initialized for the new date
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all",
                      selectedDate === day 
                        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                    )}
                  >
                    {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                <Clock className="w-3 h-3" />
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {data?.times_today?.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-bold text-center transition-all",
                      selectedTime === time 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
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
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by table name or delegate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
              </div>
            ) : filteredTables?.length === 0 ? (
              <div className="col-span-full p-24 bg-white border border-dashed border-zinc-200 rounded-3xl text-center text-zinc-500">
                No tables found matching your search.
              </div>
            ) : (
              filteredTables?.map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center">
                        <Layout className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-zinc-900">{table.name}</h4>
                    </div>
                    {table.booth_owner && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Booth</span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {table.meetings?.length > 0 ? (
                      table.meetings?.map((meeting: any, mIdx: number) => (
                        <div key={mIdx} className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <Users className="w-3 h-3" />
                            Meeting Participants
                          </div>
                          <div className="space-y-2">
                            {meeting.booker_team?.members?.map((member: any) => (
                              <div key={member.id} className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-100">
                                  <User className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-bold text-zinc-900 truncate">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Available</p>
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
