import React from 'react';
import { Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';

// Hàm định dạng màu sắc cho Trạng thái giống trong ảnh
const getStatusStyles = (status) => {
  switch (status) {
    case 'Đang hoạt động':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Hết hạn':
      return 'bg-rose-50 text-rose-500 border-rose-100';
    case 'Bảo lưu':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

export const CustomerTable = ({ data, onOpenDetail, onOpenEdit, onConfirmDelete }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {/* Table Header */}
        <thead className="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-sm font-bold text-slate-800">Thành viên</th>
            <th className="px-4 py-4 text-sm font-bold text-slate-800">Gói tập</th>
            <th className="px-4 py-4 text-sm font-bold text-slate-800 text-center">Trạng thái</th>
            <th className="px-4 py-4 text-sm font-bold text-slate-800 text-center">Tần suất</th>
            <th className="px-4 py-4 text-sm font-bold text-slate-800 text-center">Ngày hết hạn</th>
            <th className="px-4 py-4 text-sm font-bold text-slate-800 text-center">Cảnh báo</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-800 text-right">Hành động</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
              {/* Thành viên: Avatar + Name + ID */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-sm" 
                      src={member.avatar} 
                      alt={member.name} 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{member.name}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 tracking-wide">{member.id}</p>
                  </div>
                </div>
              </td>

              {/* Gói tập */}
              <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                {member.membershipPackage}
              </td>

              {/* Trạng thái: Badge bo tròn mềm mại */}
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyles(member.status)}`}>
                  {member.status}
                </span>
              </td>

              {/* Tần suất */}
              <td className="px-4 py-4 text-sm text-slate-600 text-center font-medium">
                {member.frequency} buổi/tuần
              </td>

              {/* Ngày hết hạn */}
              <td className="px-4 py-4 text-sm text-slate-500 text-center font-medium">
                {member.expiryDate}
              </td>

              {/* Cảnh báo: Hiện icon đỏ nếu có nguy cơ */}
              <td className="px-4 py-4 text-center">
                {member.riskWarning ? (
                  <AlertTriangle size={18} className="text-rose-500 inline-block" />
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>

              {/* Hành động: 3 Icon */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button 
                    onClick={() => onOpenDetail(member)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => onOpenEdit(member)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => onConfirmDelete(member)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Xóa khách hàng"
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
          <p className="text-slate-400 text-sm font-medium italic">Không tìm thấy thành viên nào...</p>
        </div>
      )}
    </div>
  );
};