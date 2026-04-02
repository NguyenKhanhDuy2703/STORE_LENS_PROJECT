import React from 'react';
import { Target, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const CustomerAnalytics = ({ analytics }) => {
  if (!analytics || !analytics.segments) {
    return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu phân tích...</div>;
  }

  return (
    <div className="mt-6 animate-in fade-in duration-700">
      {/* Tiêu đề chung cho khu vực phân tích */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
          <Target size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Phân tích nhóm đối tượng khách hàng
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* --- BÊN TRÁI: BIỂU ĐỒ TRÒN --- */}
        <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.segments}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="percent"
              >
                {analytics.segments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Label tổng thể ở giữa biểu đồ */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Tổng cộng</p>
            <p className="text-2xl font-black text-slate-700">100%</p>
          </div>
        </div>

        {/* --- BÊN PHẢI: DANH SÁCH THẺ NHÓM (Cái bạn bảo thêm vào) --- */}
        <div className="space-y-4">
          {analytics.segments.map((segment, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                {/* Chấm màu đại diện */}
                <div 
                  className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform" 
                  style={{ backgroundColor: segment.color }} 
                />
                <div>
                  <p className="font-bold text-slate-800 text-[15px]">{segment.name}</p>
                  <p className="text-[12px] text-slate-400 font-medium flex items-center gap-1">
                    <Users size={12} /> ~{segment.count} thành viên
                  </p>
                </div>
              </div>
              
              {/* Chỉ số phần trăm bên phải */}
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-black text-indigo-600 text-sm min-w-[60px] text-center">
                {segment.percent}%
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};