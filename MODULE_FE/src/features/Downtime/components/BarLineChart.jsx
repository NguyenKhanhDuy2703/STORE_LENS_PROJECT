import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Giả lập hàm format nếu bạn chưa có file utils
const formatSecondsMock = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const BarLineChart = () => {
  // 1. DỮ LIỆU GIẢ (MOCK DATA)
  const mockData = [
    { name: '08:00', traffic: 45, dwellTime: 120 },
    { name: '10:00', traffic: 120, dwellTime: 340 },
    { name: '12:00', traffic: 280, dwellTime: 520 },
    { name: '14:00', traffic: 190, dwellTime: 410 },
    { name: '16:00', traffic: 320, dwellTime: 680 },
    { name: '18:00', traffic: 450, dwellTime: 900 },
    { name: '20:00', traffic: 210, dwellTime: 380 },
  ];

  // 2. TRẠNG THÁI GIẢ LẬP
  const [data] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);

  // Tooltip tùy chỉnh
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl z-50 min-w-[180px]">
          <p className="text-sm font-medium tracking-tight text-slate-700 mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-500">Lượng khách</span>
              </div>
              <span className="font-medium text-slate-700">{payload[0].value}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-500">TG dừng TB</span>
              </div>
              <span className="font-medium text-slate-700">
                {formatSecondsMock(payload[1].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white rounded-2xl border border-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-500 font-medium text-sm">Đang vẽ biểu đồ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col transition-all hover:shadow-md">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-slate-800">Hiệu suất Thu hút</h3>
          <p className="text-xs text-slate-400 mt-1 font-normal tracking-tight">Tương quan Traffic (Cột) & Dwell Time (Đường)</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.4}/>
              </linearGradient>
              <filter id="shadow" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.3"/>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
              dy={10} 
            />
            
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit="s"
              tickFormatter={(val) => `${val}s`}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              iconSize={8} 
              wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b', paddingBottom: '20px' }}
            />

            <Bar 
              yAxisId="left" 
              dataKey="traffic" 
              name="Lượng khách"
              barSize={24} 
              fill="url(#barGradient)" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
            />
            
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="dwellTime" 
              name="TG dừng TB" 
              stroke="#F59E0B" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#fff', stroke: '#F59E0B', strokeWidth: 2 }} 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }}
              animationDuration={1500}
              filter="url(#shadow)" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarLineChart;