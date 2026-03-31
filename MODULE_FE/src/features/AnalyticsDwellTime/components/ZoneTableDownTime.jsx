import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Hàm format thời gian nội bộ (để không phụ thuộc file utils)
const formatSecondsLocal = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const TableDownTime = () => {
  // 1. DỮ LIỆU GIẢ (MOCK DATA)
  const mockList = [
    { id: 1, categoryName: 'Khu vực Tạ đơn', avgTime: 450, stopCount: 124, peopleCount: 89, percentageChange: 12.5 },
    { id: 2, categoryName: 'Khu vực Cardio (Máy chạy)', avgTime: 1200, stopCount: 45, peopleCount: 42, percentageChange: -4.2 },
    { id: 3, categoryName: 'Quầy Protein Bar', avgTime: 185, stopCount: 210, peopleCount: 195, percentageChange: 28.0 },
    { id: 4, categoryName: 'Khu vực Giãn cơ', avgTime: 320, stopCount: 56, peopleCount: 50, percentageChange: 0 },
    { id: 5, categoryName: 'Khu vực Yoga', avgTime: 2400, stopCount: 22, peopleCount: 20, percentageChange: -15.8 },
    { id: 6, categoryName: 'Lối vào chính', avgTime: 15, stopCount: 540, peopleCount: 512, percentageChange: 5.4 },
  ];

  // 2. TRẠNG THÁI GIẢ LẬP
  const [list] = useState(mockList);
  const [isLoadingList] = useState(false);

  if (isLoadingList) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Đang tải bảng dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">
          Chi tiết tương tác theo khu vực
        </h3>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Tên khu vực</th>
              <th className="px-6 py-4">Dwell Time TB</th>
              <th className="px-6 py-4 text-center">Lượt dừng</th>
              <th className="px-6 py-4 text-center">Traffic</th>
              <th className="px-6 py-4 text-right">Biến động (%)</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-50">
            {list.map((row) => {
              const change = row.percentageChange || 0;
              let badgeClass = "bg-slate-100 text-slate-500 border-slate-200";
              let Icon = Minus;

              if (change > 0) {
                badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
                Icon = TrendingUp;
              } else if (change < 0) {
                badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
                Icon = TrendingDown;
              }

              return (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* Tên khu vực */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 group-hover:text-teal-600 transition-colors">
                        {row.categoryName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Zone ID: #{row.id.toString().padStart(3, '0')}</span>
                    </div>
                  </td>

                  {/* Thời gian TB */}
                  <td className="px-6 py-5 font-black text-slate-600">
                    {formatSecondsLocal(row.avgTime)}
                  </td>

                  {/* Số lượt dừng */}
                  <td className="px-6 py-5 text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                      {row.stopCount.toLocaleString()}
                    </span>
                  </td>

                  {/* Số người */}
                  <td className="px-6 py-5 text-center font-medium text-slate-500">
                    {row.peopleCount.toLocaleString()} <span className="text-[10px] text-slate-400">khách</span>
                  </td>

                  {/* % Thay đổi */}
                  <td className="px-6 py-5 text-right">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${badgeClass}`}>
                      <Icon size={12} strokeWidth={3} />
                      {change > 0 ? '+' : ''}{change}%
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableDownTime;