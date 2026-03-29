import React from 'react';
import { 
  Users, UserCheck, Clock, Target, RefreshCw, 
  Upload, Download, Store, ChevronDown, Calendar 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import StatCard from './components/StatCard';
import AreaTableRow from './components/AreaTableRow';
import MovementRoutes from './components/MovementRoutes'; // Import component mới

const chartData = [
  { time: '08:00', value: 80 }, { time: '10:00', value: 250 },
  { time: '12:00', value: 320 }, { time: '14:00', value: 280 },
  { time: '16:00', value: 410 }, { time: '18:00', value: 380 },
  { time: '20:00', value: 220 }, { time: '22:00', value: 100 },
];

const AnalyticsArea = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-700 font-sans">
      {/* Header Cố định */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-gray-100">
            <Store size={18} className="text-emerald-500" />
            <span className="text-sm font-medium">Cửa hàng</span>
            <div className="flex items-center gap-1 cursor-pointer border-l pl-2 ml-1">
              <span className="text-sm">Tất cả cơ sở</span>
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-gray-100">
            <Calendar size={18} className="text-blue-500" />
            <span className="text-sm font-medium">Khoảng thời gian</span>
            <div className="flex items-center gap-1 cursor-pointer border-l pl-2 ml-1">
              <span className="text-sm">Hôm nay</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"><RefreshCw size={16} /> Đồng bộ</button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"><Upload size={16} /> Import POS</button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-100 transition"><Download size={16} /> Xuất báo cáo</button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Phạm vi đang xem */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm overflow-x-auto no-scrollbar">
          <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Phạm vi đang xem:</span>
          <div className="flex gap-2">
            {['Tất cả khu vực', 'Lối vào chính', 'Quầy thanh toán', 'Khu vực giảm giá', 'Mỹ phẩm cao cấp'].map((tab, idx) => (
              <button key={idx} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Chỉ số tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tổng lưu lượng ngày" value="769" trend="+12%" isUp icon={<Users className="text-blue-500" />} bgColor="bg-blue-50" />
          <StatCard title="Số khách hiện tại" value="122" trend="-2%" isUp={false} icon={<UserCheck className="text-emerald-500" />} bgColor="bg-emerald-50" />
          <StatCard title="Thời gian dừng TB" value="10:26m" trend="-2%" isUp={false} icon={<Clock className="text-amber-500" />} bgColor="bg-amber-50" />
          <StatCard title="Hiệu suất khu vực" value="88.2%" trend="+5.4%" isUp icon={<Target className="text-indigo-500" />} bgColor="bg-indigo-50" />
        </div>

        {/* Biểu đồ và Tuyến đường */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg mb-6">Lưu lượng biến động theo giờ</h3>
            <div className="h-[350px] w-full"> {/* Chỉnh chiều cao khớp với component tuyến đường */}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sử dụng component MovementRoutes mới */}
          <MovementRoutes />
        </div>

        {/* Trạng thái chi tiết khu vực */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-lg">Trạng thái chi tiết từng khu vực</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Khu vực</th>
                  <th className="px-6 py-4">Camera ID</th>
                  <th className="px-6 py-4">Số người hiện tại</th>
                  <th className="px-6 py-4">Số người hôm nay</th>
                  <th className="px-6 py-4">So với hôm qua</th>
                  <th className="px-6 py-4 text-center">Thời gian dừng TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AreaTableRow name="Lối vào chính" cameraId="CAM-001" live={32} today={250} change="+4.2%" time="5:20" isUp={true} />
                <AreaTableRow name="Quầy thanh toán" cameraId="CAM-002" live={28} today={185} change="-5.1%" time="8:45" isUp={false} />
                <AreaTableRow name="Khu vực giảm giá" cameraId="CAM-003" live={18} today={212} change="-11.7%" time="12:30" isUp={false} />
                <AreaTableRow name="Mỹ phẩm cao cấp" cameraId="CAM-004" live={8} today={89} change="-3.3%" time="14:20" isUp={false} />
                <AreaTableRow name="Đồ chơi trẻ em" cameraId="CAM-005" live={22} today={112} change="-22.8%" time="11:15" isUp={false} />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsArea;