import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import formatDuration from '../../../utils/formatDuration';

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
          <p className="text-sm font-medium text-slate-500 tracking-tight">Đang tải bảng dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden transition-all hover:shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold tracking-tight text-foreground">
          Chi tiết tương tác theo khu vực
        </h3>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-3">Tên khu vực</th>
              <th className="px-6 py-3">Thời gian dừng TB</th>
              <th className="px-6 py-3 text-center">Lượt dừng</th>
              <th className="px-6 py-3 text-center">Lượt khách</th>
              <th className="px-6 py-3 text-right">Biến động (%)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {list.map((row) => {
              const change = row.percentageChange || 0;
              let badgeClass = "bg-muted text-muted-foreground border-border";
              let Icon = Minus;

              if (change > 0) {
                badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
                Icon = TrendingUp;
              } else if (change < 0) {
                badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
                Icon = TrendingDown;
              }

              return (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors group">

                  {/* Tên khu vực — chỉ hiện tên, ẩn ID */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                      {row.categoryName}
                    </span>
                  </td>

                  {/* Thời gian TB */}
                  <td className="px-6 py-4 font-medium text-muted-foreground tabular-nums">
                    {formatDuration(row.avgTime)}
                  </td>

                  {/* Số lượt dừng */}
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 bg-muted text-foreground rounded-lg font-medium tabular-nums">
                      {row.stopCount.toLocaleString()}
                    </span>
                  </td>

                  {/* Số người */}
                  <td className="px-6 py-4 text-center text-muted-foreground tabular-nums">
                    {row.peopleCount.toLocaleString()}
                    <span className="text-xs text-muted-foreground/60 ml-1">khách</span>
                  </td>

                  {/* % Thay đổi */}
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${badgeClass}`}>
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