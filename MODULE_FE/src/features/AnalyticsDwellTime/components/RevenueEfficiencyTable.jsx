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
    color: 'bg-gray-50 text-gray-600 border-gray-200', 
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
      <div className="bg-white rounded-xl border border-slate-100 p-8 h-full flex flex-col gap-4">
        <div className="h-8 bg-slate-100 rounded w-1/3 animate-pulse"></div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 rounded w-full animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full font-sans transition-all hover:shadow-md">
      
      {/* --- HEADER --- */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Phân Tích Hiệu Quả Kinh Doanh</h3>
          <p className="text-xs text-slate-500 mt-1">Ma trận tương quan giữa Thời gian dừng & Doanh thu thực tế</p>
        </div>
        
        <div className="text-right text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex justify-between gap-4 mb-1">
            <span className="font-medium">TB Thời gian:</span>
            <span className="font-bold text-slate-700">{benchmarks.avgTime.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium">TB Doanh thu:</span>
            <span className="font-bold text-slate-700">{formatCurrency(benchmarks.avgSales)}</span>
          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Khu vực</th>
              <th className="px-6 py-4">Thời gian dừng (Avg)</th>
              <th className="px-6 py-4">Doanh thu</th>
              <th className="px-6 py-4">Đánh giá</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-50">
            {data.map((row, index) => {
              const statusConfig = STATUS_CONFIG[row.type] || STATUS_CONFIG.NORMAL;
              const StatusIcon = statusConfig.icon;

              const timePercent = (row.avgTime / maxTime) * 100;
              const salesPercent = (row.totalSales / maxSales) * 100;

              return (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                  
                  <td className="px-6 py-5 font-bold text-slate-700">
                    {row.categoryName}
                  </td>

                  <td className="px-6 py-5">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-600">{formatSeconds(row.avgTime)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${timePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-600">{formatCurrency(row.totalSales)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${salesPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color} shadow-sm`}>
                      <StatusIcon size={12} strokeWidth={3} />
                      {row.evaluation || statusConfig.label}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 px-3 py-1.5 rounded-lg transition-all uppercase tracking-tighter">
                      {row.action}
                    </button>
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