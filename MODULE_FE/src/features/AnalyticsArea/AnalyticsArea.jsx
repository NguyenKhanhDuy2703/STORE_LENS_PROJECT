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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header - Sticky Filter Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-200">
            <Store size={18} className="text-teal-600" />
            <span className="text-sm font-medium text-slate-700">Cửa hàng</span>
            <div className="flex items-center gap-1 cursor-pointer border-l border-slate-200 pl-2 ml-1">
              <span className="text-sm text-slate-600">Tất cả cơ sở</span>
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-200">
            <Calendar size={18} className="text-teal-600" />
            <span className="text-sm font-medium text-slate-700">Khoảng thời gian</span>
            <div className="flex items-center gap-1 cursor-pointer border-l border-slate-200 pl-2 ml-1">
              <span className="text-sm text-slate-600">Hôm nay</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"><RefreshCw size={16} /> Đồng bộ</button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"><Upload size={16} /> Import POS</button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg border border-teal-600 transition"><Download size={16} /> Xuất báo cáo</button>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-[1760px] mx-auto space-y-6">
        {/* View Range Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm overflow-x-auto">
          <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Phạm vi đang xem:</span>
          <div className="flex gap-2">
            {['Tất cả khu vực', 'Lối vào chính', 'Quầy thanh toán', 'Khu vực giảm giá', 'Mỹ phẩm cao cấp'].map((tab, idx) => (
              <button key={idx} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap tracking-tight transition ${idx === 0 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tổng lưu lượng ngày" value="769" trend="+12%" isUp icon={<Users className="text-teal-600" />} bgColor="bg-teal-50" />
          <StatCard title="Số khách hiện tại" value="122" trend="-2%" isUp={false} icon={<UserCheck className="text-teal-600" />} bgColor="bg-teal-50" />
          <StatCard title="Thời gian dừng TB" value="10:26m" trend="-2%" isUp={false} icon={<Clock className="text-orange-500" />} bgColor="bg-orange-50" />
          <StatCard title="Hiệu suất khu vực" value="88.2%" trend="+5.4%" isUp icon={<Target className="text-indigo-600" />} bgColor="bg-indigo-50" />
        </div>

        {/* Charts & Movement Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-lg font-medium mb-6 text-slate-900">Lưu lượng biến động theo giờ</h3>
            <div className="h-[350px] w-full"> {/* Chỉnh chiều cao khớp với component tuyến đường */}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Movement Routes Component */}
          <MovementRoutes />
        </div>

        {/* Zone Status Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">Trạng thái chi tiết từng khu vực</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight">Khu Vực</th>
                  <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight">Camera ID</th>
                  <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight text-center">Số Người Hiện Tại</th>
                  <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight text-center">Số Người Hôm Nay</th>
                  <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight text-center">So Với Hôm Qua</th>
                  <th className="px-6 py-4 text-[10px] font-medium text-slate-400 tracking-tight text-center">Thời Gian Dừng TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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