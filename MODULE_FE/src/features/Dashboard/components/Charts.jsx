import  { useMemo } from 'react';
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

const ChartHeader = ({ title, onCSV }) => (
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-base font-medium tracking-tight text-slate-900">{title}</h3>
    <button
      onClick={onCSV}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
    >
      <Download size={14} /> Tải CSV
    </button>
  </div>
);

const Traffic = () => {
  // Memoize traffic data inside component
  const trafficDataMemo = useMemo(() => trafficData, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <ChartHeader
        title="Lưu Lượng Khách Theo Giờ"
        onCSV={() => exportCSV(trafficDataMemo, 'traffic.csv')}
      />

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficDataMemo}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#0f172a' }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#0d9488"
              strokeWidth={2}
              fill="url(#colorTraffic)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Revenue = () => {
  // Memoize revenue data inside component
  const revenueDataMemo = useMemo(() => revenueData, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <ChartHeader
        title="Doanh Thu 7 Ngày"
        onCSV={() => exportCSV(revenueDataMemo, 'revenue.csv')}
      />

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueDataMemo}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#0f172a' }}
            />

            <Bar
              dataKey="value"
              fill="#0d9488"
              radius={[8, 8, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Charts = {
  Traffic,
  Revenue,
};

export default Charts;