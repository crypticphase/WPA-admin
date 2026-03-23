import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Save,
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import type { LeaveType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function LeaveTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ total: number; leave_types: LeaveType[] }>({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await api.get('/admin/leave_types');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await api.post('/admin/leave_types', { leave_type: { name: newName } });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      setIsModalOpen(false);
      setName('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to create leave type.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: number; newName: string }) => {
      const response = await api.patch(`/admin/leave_types/${id}`, { leave_type: { name: newName } });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      setIsModalOpen(false);
      setEditingType(null);
      setName('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to update leave type.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/leave_types/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete leave type.');
    }
  });

  const handleOpenModal = (type?: LeaveType) => {
    if (type) {
      setEditingType(type);
      setName(type.name);
    } else {
      setEditingType(null);
      setName('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingType) {
      updateMutation.mutate({ id: editingType.id, newName: name });
    } else {
      createMutation.mutate(name);
    }
  };

  const handleDelete = (type: LeaveType) => {
    if (type.leave_forms_count > 0) {
      alert(`Cannot delete — this type has ${type.leave_forms_count} leave form(s) using it.`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
      deleteMutation.mutate(type.id);
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        Failed to load leave types. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight font-display">Leave Types</h2>
          <p className="text-zinc-500 mt-2 font-medium">Manage master data for leave categories.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-zinc-200 transition-all active:scale-95 text-sm uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Add New Type
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 shadow-sm overflow-hidden premium-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">ID</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Usage Count</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-200 mx-auto" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">Loading leave types...</p>
                  </td>
                </tr>
              ) : data?.leave_types?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200 mx-auto mb-6">
                      <Tags className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400">No leave types found. Create your first one!</p>
                  </td>
                </tr>
              ) : (
                data?.leave_types?.map((type, index) => (
                  <tr key={type.id} className="hover:bg-zinc-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono text-zinc-400">#{type.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:shadow-md transition-all">
                          <Tags className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-zinc-900">{type.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          type.leave_forms_count > 0 
                            ? "bg-blue-50 text-blue-600 border-blue-100" 
                            : "bg-zinc-50 text-zinc-400 border-zinc-100"
                        )}>
                          {type.leave_forms_count} Forms
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleOpenModal(type)}
                          className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all"
                          title="Edit Type"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(type)}
                          disabled={deleteMutation.isPending}
                          className={cn(
                            "p-3 rounded-2xl transition-all",
                            type.leave_forms_count > 0 
                              ? "text-zinc-200 cursor-not-allowed" 
                              : "text-zinc-400 hover:text-red-500 hover:bg-red-50"
                          )}
                          title={type.leave_forms_count > 0 ? "Cannot delete used type" : "Delete Type"}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-zinc-200 overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200">
                    <Tags className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 font-display">
                      {editingType ? 'Edit Leave Type' : 'Add Leave Type'}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Master Data Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Type Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sick Leave, Annual Leave..."
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all font-bold text-zinc-900 placeholder:text-zinc-300"
                  />
                </div>

                {editingType && editingType.leave_forms_count > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-relaxed">
                      Note: This type is currently used by {editingType.leave_forms_count} leave forms. Changing the name will affect all existing records.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-2 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-zinc-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingType ? 'Update Type' : 'Save Type'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
