import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Moon, Zap, Star } from 'lucide-react';

// --- 1. MOCK UTILS (Thay thế cho các file utils bên ngoài nếu cần) ---
const formatCurrency = (val) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatSeconds = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Map Type sang Icon và Style
const STATUS_CONFIG = {
  STAR: { 
    label: 'Hiệu quả cao',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
    icon: Star 
  },
  CASH_COW: { 
    label: 'Chốt đơn nhanh',
    color: 'bg-blue-50 text-blue-700 border-blue-100', 
    icon: Zap 
  },
  CRITICAL_WARNING: { 
    label: 'Cần tối ưu',
    color: 'bg-rose-50 text-rose-700 border-rose-100', 
    icon: AlertTriangle 
  },
  POOR: { 
    label: 'Hiệu suất thấp',
    color: 'bg-slate-100 text-slate-600 border-slate-200', 
    icon: Moon 
  },
  NORMAL: { 
    label: 'Hoạt động ổn định',
    color: 'bg-slate-50 text-slate-600 border-slate-200', 
    icon: CheckCircle 
  }
};

const RevenueEfficiencyTable = () => {
  // --- 2. DỮ LIỆU GIẢ (MOCK DATA) ---
  const mockData = [
    { categoryName: 'Khu vực Tạ đơn', avgTime: 450, totalSales: 12500000, type: 'STAR', evaluation: 'Tương tác cực tốt', action: 'Giữ nguyên' },
    { categoryName: 'Khu vực Máy chạy', avgTime: 820, totalSales: 3200000, type: 'CRITICAL_WARNING', evaluation: 'Xem lại mặt bằng', action: 'Tối ưu lại' },
    { categoryName: 'Quầy Protein Bar', avgTime: 120, totalSales: 18000000, type: 'CASH_COW', evaluation: 'Tỉ lệ chuyển đổi cao', action: 'Tăng Stock' },
    { categoryName: 'Khu vực Yoga', avgTime: 1500, totalSales: 1500000, type: 'POOR', evaluation: 'Khách ngồi quá lâu', action: 'Kiểm tra Rule' },
    { categoryName: 'Phòng thay đồ', avgTime: 300, totalSales: 0, type: 'NORMAL', evaluation: 'Lưu lượng bình thường', action: 'Bảo trì' },
  ];

  const mockBenchmarks = {
    avgTime: 638.5,
    avgSales: 7040000
  };

  const [data] = useState(mockData);
  const [benchmarks] = useState(mockBenchmarks);
  const [isLoading] = useState(false);

  // --- 3. TÍNH TOÁN MAX ĐỂ VẼ THANH BAR ---
  const { maxTime, maxSales } = useMemo(() => {
    if (!data || data.length === 0) return { maxTime: 1, maxSales: 1 };
    return {
      maxTime: Math.max(...data.map(i => i.avgTime)) || 1,
      maxSales: Math.max(...data.map(i => i.totalSales)) || 1
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col gap-4">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-100 rounded w-full animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-medium tracking-tight text-slate-900">Phân Tích Hiệu Quả Kinh Doanh</h3>
          <p className="text-xs text-slate-500 mt-1.5 tracking-tight">Ma trận tương quan giữa Thời gian dừng & Doanh thu thực tế</p>
        </div>
        
        <div className="text-right text-xs bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
          <div className="flex justify-between gap-6 mb-2">
            <span className="font-medium text-slate-500 tracking-tight">TB Thời gian:</span>
            <span className="font-medium text-slate-900 tabular-nums tracking-tight">{benchmarks.avgTime.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="font-medium text-slate-500 tracking-tight">TB Doanh thu:</span>
            <span className="font-medium text-slate-900 tabular-nums tracking-tight">{formatCurrency(benchmarks.avgSales)}</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight border-r border-slate-200">Tên Khu Vực</th>
              <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight text-center border-r border-slate-200">Thời Gian Dừng TB</th>
              <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight text-right border-r border-slate-200">Doanh Thu</th>
              <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight">Đánh Giá</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => {
              const statusConfig = STATUS_CONFIG[row.type] || STATUS_CONFIG.NORMAL;
              const StatusIcon = statusConfig.icon;
              const timePercent = (row.avgTime / maxTime) * 100;
              const salesPercent = (row.totalSales / maxSales) * 100;

              return (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium tracking-tight text-slate-900 border-r border-slate-100">
                    {row.categoryName}
                  </td>

                  <td className="px-6 py-4 border-r border-slate-100">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="flex-1 max-w-[100px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full" 
                            style={{ width: `${timePercent}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 min-w-[70px] text-center tabular-nums tracking-tight">
                        {formatSeconds(row.avgTime)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 border-r border-slate-100">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex-1 max-w-[100px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${salesPercent}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 min-w-[140px] text-right tabular-nums tracking-tight">
                        {formatCurrency(row.totalSales)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium border tracking-tight ${statusConfig.color}`}>
                      <StatusIcon size={14} strokeWidth={2} />
                      <span>{row.evaluation || statusConfig.label}</span>
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

export default RevenueEfficiencyTable;