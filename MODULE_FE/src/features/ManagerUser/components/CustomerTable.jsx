import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

// Hàm định dạng màu sắc cho Vai trò
const getRoleStyles = (role) => {
  switch (role) {
    case 'superadmin':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'admin':
      return 'bg-purple-50 text-purple-700 border-purple-100';
    case 'manager':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'staff':
      return 'bg-slate-50 text-slate-700 border-slate-100';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

// Hàm định dạng text vai trò
const getRoleText = (role) => {
  switch (role) {
    case 'superadmin':
      return 'SuperAdmin';
    case 'admin':
      return 'Admin';
    case 'manager':
      return 'Manager';
    case 'staff':
      return 'Staff';
    default:
      return role;
  }
};

// Hàm định dạng màu sắc cho Trạng thái
const getStatusStyles = (status) => {
  switch (status) {
    case 'Hoạt động':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Tạm dừng':
      return 'bg-rose-50 text-rose-500 border-rose-100';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

export const CustomerTable = ({ data, onOpenDetail, onOpenEdit, onConfirmDelete }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {/* Table Header */}
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-[10px] font-medium text-slate-500 tracking-tight">
            <th className="px-6 py-4 border-r border-slate-200 text-left">Họ và tên</th>
            <th className="px-4 py-4 border-r border-slate-200 text-left">Tài khoản</th>
            <th className="px-4 py-4 border-r border-slate-200 text-center">Vai trò</th>
            <th className="px-4 py-4 border-r border-slate-200 text-center">Chi nhánh</th>
            <th className="px-4 py-4 border-r border-slate-200 text-center">Trạng thái truy cập</th>
            <th className="px-6 py-4 text-right">Hành động</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
              {/* Họ và tên: Avatar + Name + ID */}
              <td className="px-6 py-4 border-r border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-sm" 
                      src={user.avatar} 
                      alt={user.name} 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-tight tracking-tight">{user.name}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 tracking-tight tabular-nums font-mono">{user.id}</p>
                  </div>
                </div>
              </td>

              {/* Tài khoản */}
              <td className="px-4 py-4 border-r border-slate-200 text-sm text-slate-600 font-medium tracking-tight">
                <div className="space-y-0.5">
                  <p className="text-slate-900">{user.accountName}</p>
                  <p className="text-[11px] text-slate-400 font-normal">{user.email}</p>
                </div>
              </td>

              {/* Vai trò: Badge */}
              <td className="px-4 py-4 border-r border-slate-200 text-center">
                <span className={`inline-flex px-3 py-1 rounded-lg text-[11px] font-medium border tracking-tight ${getRoleStyles(user.role)}`}>
                  {getRoleText(user.role)}
                </span>
              </td>

              {/* Chi nhánh */}
              <td className="px-4 py-4 border-r border-slate-200 text-sm text-slate-600 text-center font-medium tracking-tight tabular-nums font-mono">
                {user.assignedStore}
              </td>

              {/* Trạng thái truy cập */}
              <td className="px-4 py-4 border-r border-slate-200 text-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-medium border tracking-tight ${getStatusStyles(user.status)}`}>
                  {user.status}
                </span>
              </td>

              {/* Hành động: 3 Icon */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button 
                    onClick={() => onOpenDetail(user)}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => onOpenEdit(user)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => onConfirmDelete(user)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Thông báo nếu không có dữ liệu */}
      {data.length === 0 && (
        <div className="py-20 text-center bg-white">
          <p className="text-slate-400 text-sm font-medium italic">Không tìm thấy tài khoản nào...</p>
        </div>
      )}
    </div>
  );
};