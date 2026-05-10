import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Download, Loader2, AlertTriangle, Radio } from 'lucide-react';
import { fetchDailyStats, fetchHourlyCustomerFlow } from '../dashboard.thunk';

const exportCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  link.click();
};

const ChartHeader = ({ title, subtitle, onCSV }) => (
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <button
      onClick={onCSV}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors border border-border"
    >
      <Download size={14} /> Tải CSV
    </button>
  </div>
);

const formatRevenueYAxis = (value) => {
  if (value === 0) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
};

const TrafficTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '10px 14px', minWidth: 140 }}>
      <p style={{ color: '#0f172a', fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Ngày {label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0d9488', display: 'inline-block' }} />
        <span style={{ color: '#64748b', fontSize: 12 }}>Khách:</span>
        <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 12, marginLeft: 'auto', paddingLeft: 8 }}>
          {Number(payload[0].value).toLocaleString('vi-VN')} người
        </span>
      </div>
    </div>
  );
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const formatted = Number(payload[0].value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '10px 14px', minWidth: 160 }}>
      <p style={{ color: '#0f172a', fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Ngày {label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0d9488', display: 'inline-block' }} />
        <span style={{ color: '#64748b', fontSize: 12 }}>Doanh thu:</span>
        <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 12, marginLeft: 'auto', paddingLeft: 8 }}>{formatted}</span>
      </div>
    </div>
  );
};

// Hook dùng chung để fetch daily stats
const useDailyStats = (locationId, year, month) => {
  const dispatch = useDispatch();
  const { dailyStats, dailyStatsLoading, dailyStatsError } = useSelector(s => s.dashboard);

  useEffect(() => {
    if (locationId && year && month) {
      dispatch(fetchDailyStats({ locationId, year, month }));
    }
  }, [dispatch, locationId, year, month]);

  return { dailyStats, dailyStatsLoading, dailyStatsError };
};

const DailyTraffic = ({ locationId, year, month }) => {
  const { dailyStats, dailyStatsLoading, dailyStatsError } = useDailyStats(locationId, year, month);

  const trafficData = (dailyStats?.daily_data || []).map(d => ({
    day: d.day,
    value: d.people_count
  }));

  if (dailyStatsLoading && !trafficData.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[420px]">
        <Loader2 className="animate-spin text-teal-600" size={28} />
      </div>
    );
  }

  if (dailyStatsError && !trafficData.length) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3 min-h-[420px]">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được biểu đồ lưu lượng</p>
          <p className="text-sm text-rose-600">{dailyStatsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <ChartHeader
        title="Lưu Lượng Khách Theo Ngày"
        subtitle={`Tháng ${month}/${year}`}
        onCSV={() => exportCSV(trafficData, `traffic_${year}_${month}.csv`)}
      />
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
        <span className="text-xs text-muted-foreground">Số khách (người)</span>
      </div>
      {trafficData.length === 0 ? (
        <div className="h-[340px] flex items-center justify-center text-muted-foreground text-sm">
          Chưa có dữ liệu trong tháng này.
        </div>
      ) : (
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficData} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={day => `N${day}`}
                height={28}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={v => v.toLocaleString('vi-VN')}
                label={{ value: 'Khách', angle: -90, position: 'insideLeft', offset: 8, fill: '#94a3b8', fontSize: 11 }}
                width={52}
              />
              <Tooltip content={<TrafficTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" name="Số khách" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const DailyRevenue = ({ locationId, year, month }) => {
  const { dailyStats, dailyStatsLoading, dailyStatsError } = useDailyStats(locationId, year, month);

  const revenueData = (dailyStats?.daily_data || []).map(d => ({
    day: d.day,
    value: d.revenue
  }));

  if (dailyStatsLoading && !revenueData.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[420px]">
        <Loader2 className="animate-spin text-teal-600" size={28} />
      </div>
    );
  }

  if (dailyStatsError && !revenueData.length) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3 min-h-[420px]">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được biểu đồ doanh thu</p>
          <p className="text-sm text-rose-600">{dailyStatsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <ChartHeader
        title="Doanh Thu Theo Ngày"
        subtitle={`Tháng ${month}/${year}`}
        onCSV={() => exportCSV(revenueData, `revenue_${year}_${month}.csv`)}
      />
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block" />
        <span className="text-xs text-muted-foreground">Doanh thu (VNĐ)</span>
      </div>
      {revenueData.length === 0 ? (
        <div className="h-[340px] flex items-center justify-center text-muted-foreground text-sm">
          Chưa có dữ liệu trong tháng này.
        </div>
      ) : (
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={day => `N${day}`}
                height={28}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={formatRevenueYAxis}
                label={{ value: 'Doanh thu', angle: -90, position: 'insideLeft', offset: 8, fill: '#94a3b8', fontSize: 11 }}
                width={56}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" name="Doanh thu" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const HourlyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '10px 14px', minWidth: 150 }}>
      <p style={{ color: '#0f172a', fontWeight: 600, marginBottom: 6, fontSize: 12 }}>{label}:00 — {label}:59</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1', display: 'inline-block' }} />
        <span style={{ color: '#64748b', fontSize: 12 }}>Khách:</span>
        <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 12, marginLeft: 'auto', paddingLeft: 8 }}>
          {Number(payload[0].value).toLocaleString('vi-VN')} người
        </span>
      </div>
    </div>
  );
};

const HourlyTraffic = ({ locationId }) => {
  const dispatch = useDispatch();
  const { hourlyCustomerFlow, hourlyCustomerFlowLoading, hourlyCustomerFlowError } = useSelector(s => s.dashboard);

  useEffect(() => {
    if (locationId) {
      dispatch(fetchHourlyCustomerFlow({ locationId, type: 'today' }));
    }
  }, [dispatch, locationId]);

  // Xây dựng 24 điểm dữ liệu cố định (0h–23h)
  const rawHourly = Array.isArray(hourlyCustomerFlow?.hourly)
    ? hourlyCustomerFlow.hourly
    : Array.isArray(hourlyCustomerFlow)
      ? hourlyCustomerFlow
      : [];

  const hourMap = {};
  rawHourly.forEach(d => { hourMap[d.hour] = d.people_count || 0; });

  const chartData = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    value: hourMap[h] ?? 0,
  }));

  const now = new Date();
  const currentHour = now.getHours();
  const totalToday = chartData.slice(0, currentHour + 1).reduce((s, d) => s + d.value, 0);

  if (hourlyCustomerFlowLoading && !rawHourly.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[420px]">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  if (hourlyCustomerFlowError && !rawHourly.length) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3 min-h-[420px]">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được biểu đồ lưu lượng hôm nay</p>
          <p className="text-sm text-rose-600">{hourlyCustomerFlowError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium tracking-tight text-foreground">Lưu Lượng Trong Ngày</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hôm nay
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Tổng hôm nay</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{totalToday.toLocaleString('vi-VN')}</p>
          <p className="text-[10px] text-muted-foreground">người</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
        <span className="text-xs text-muted-foreground">Số khách theo giờ</span>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="hour"
              axisLine={false} tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={h => `${h}h`}
              interval={1}
              height={28}
            />
            <YAxis
              axisLine={false} tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={v => v.toLocaleString('vi-VN')}
              label={{ value: 'Khách', angle: -90, position: 'insideLeft', offset: 8, fill: '#94a3b8', fontSize: 11 }}
              width={52}
            />
            <Tooltip content={<HourlyTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 2' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#hourlyGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.hour === currentHour) {
                  return <circle key={`dot-${payload.hour}`} cx={cx} cy={cy} r={5} fill="#6366f1" stroke="#fff" strokeWidth={2} />;
                }
                return <circle key={`dot-${payload.hour}`} cx={cx} cy={cy} r={0} fill="transparent" />;
              }}
              activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Charts = { DailyTraffic, DailyRevenue, HourlyTraffic };
export default Charts;
