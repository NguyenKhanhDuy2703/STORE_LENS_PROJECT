import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

export const CustomerFilter = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
    <div className="relative flex-1 min-w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder="Tìm tên, mã hoặc số điện thoại..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      />
    </div>
    
    <div className="flex items-center gap-2">
      <Filter size={18} className="text-slate-400" />
      <select 
        value={selectedCategory} 
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="Đang hoạt động">Đang hoạt động</option>
        <option value="Hết hạn">Hết hạn</option>
        <option value="Bảo lưu">Bảo lưu</option>
      </select>
    </div>

    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
      <Calendar size={18} /> Khoảng thời gian
    </button>
  </div>
);