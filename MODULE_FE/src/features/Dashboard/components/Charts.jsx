import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download } from 'lucide-react';

const trafficData = [
  { time: '08:00', value: 120 }, { time: '10:00', value: 450 },
  { time: '12:00', value: 380 }, { time: '14:00', value: 550 },
  { time: '16:00', value: 850 }, { time: '18:00', value: 720 },
  { time: '20:00', value: 480 }, { time: '22:00', value: 210 },
];

const revenueData = [
  { day: '12 Mar', value: 3200 }, { day: '13 Mar', value: 3800 },
  { day: '14 Mar', value: 2800 }, { day: '15 Mar', value: 4200 },
  { day: '16 Mar', value: 4800 }, { day: '17 Mar', value: 5800 },
  { day: '18 Mar', value: 7500 },
];


const exportCSV = (data, filename) => {
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  const csv = `${header}\n${rows}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  link.click();
};

const exportPNG = (id) => {
  const el = document.getElementById(id);
  html2canvas(el).then(canvas => {
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL();
    link.click();
  });
};

const ChartHeader = ({ title, onCSV, onPNG }) => (
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-bold text-gray-800">{title}</h3>

    <div className="flex gap-2">
      <button
        onClick={onCSV}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
      >
        <Download size={14} /> CSV
      </button>

      <button
        onClick={onPNG}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
      >
        <Download size={14} /> PNG
      </button>
    </div>
  </div>
);

const Charts = () => (
  <>
    <div id="trafficChart" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <ChartHeader
        title="Lưu Lượng Khách Theo Giờ"
        onCSV={() => exportCSV(trafficData, 'traffic.csv')}
        onPNG={() => exportPNG('trafficChart')}
      />

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficData}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorTraffic)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>


    <div id="revenueChart" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <ChartHeader
        title="Doanh Thu Theo Ngày (7 Ngày Gần Đây)"
        onCSV={() => exportCSV(revenueData, 'revenue.csv')}
        onPNG={() => exportPNG('revenueChart')}
      />

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />

            <Bar
              dataKey="value"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              barSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </>
);

export default Charts;