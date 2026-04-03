import React from 'react';
import { Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const CustomerAnalytics = ({ analytics }) => {
  if (!analytics || !analytics.usersByRole) {
    return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu phân tích...</div>;
  }

  return (
    <div className="mt-6 animate-in fade-in duration-700">
      {/* Tiêu đề chung cho khu vực phân tích */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
          <Shield size={18} />
        </div>
        <h3 className="text-sm font-medium tracking-tight text-slate-700">
          Phân bố tài khoản theo vai trò
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* --- BÊN TRÁI: BIỂU ĐỒ TRÒN --- */}
        <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.usersByRole}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {analytics.usersByRole.map((entry, index) => (
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
            <p className="text-[10px] font-medium text-slate-400 tracking-tight">Tổng cộng</p>
            <p className="text-2xl font-semibold text-slate-700">{analytics.usersByRole.reduce((sum, r) => sum + r.count, 0)}</p>
          </div>
        </div>

        {/* --- BÊN PHẢI: DANH SÁCH THẺ VAI TRÒ --- */}
        <div className="space-y-4">
          {analytics.usersByRole.map((role, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                {/* Chấm màu đại diện */}
                <div 
                  className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform" 
                  style={{ backgroundColor: role.color }} 
                />
                <div>
                  <p className="font-medium tracking-tight text-slate-800 text-[15px]">{role.name}</p>
                  <p className="text-[12px] text-slate-400 font-medium">
                    {role.count} tài khoản
                  </p>
                </div>
              </div>
              
              {/* Số lượng bên phải */}
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-semibold text-slate-600 text-sm min-w-[50px] text-center tracking-tight">
                {role.count}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};