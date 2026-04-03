import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

export const CustomerFilter = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  canCreateUser,
  onOpenCreate,
}) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
    <div className="relative flex-1 min-w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder="Tìm theo tên, tài khoản hoặc ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
      />
    </div>
    
    <div className="flex items-center gap-2">
      <Filter size={18} className="text-slate-400" />
      <select 
        value={selectedCategory} 
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="all">Tất cả vai trò</option>
        <option value="superadmin">SuperAdmin</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="staff">Staff</option>
      </select>
    </div>

    {canCreateUser && (
      <button
        type="button"
        onClick={onOpenCreate}
        className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium tracking-tight hover:bg-teal-500 transition-colors shadow-sm"
      >
        <Plus size={16} />
        Thêm tài khoản
      </button>
    )}
  </div>
);