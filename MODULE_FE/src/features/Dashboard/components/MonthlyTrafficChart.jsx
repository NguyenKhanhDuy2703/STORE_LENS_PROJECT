import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { fetchYearlyStats } from '../dashboard.thunk';

// ── Constants ─────────────────────────────────────────────────────────────────
const COLOR_DEFAULT  = '#0052FF'; // accent — tháng thường
const COLOR_CURRENT  = '#4D7CFF'; // accent-secondary — tháng hiện tại

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatYAxis = (value) => {
  if (value === 0) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const MonthlyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '10px 14px',
      minWidth: 160
    }}>
      <p style={{ color: '#0f172a', fontWeight: 600, marginBottom: 6, fontSize: 12 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          backgroundColor: payload[0]?.fill ?? COLOR_DEFAULT,
          display: 'inline-block'
        }} />
        <span style={{ color: '#64748b', fontSize: 12 }}>Khách:</span>
        <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 12, marginLeft: 'auto', paddingLeft: 8 }}>
          {Number(payload[0].value).toLocaleString('vi-VN')} người
        </span>
      </div>
    </div>
  );
};

// ── Build chart data (12 tháng cố định) ──────────────────────────────────────
const buildChartData = (yearlyStats) => {
  const source = yearlyStats?.yearly_data ?? [];
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const found = source.find(d => d.month === month);
    return {
      month,
      label: `Th.${month}`,
      value: found?.total_customers ?? 0
    };
  });
};

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * MonthlyTrafficChart
 *
 * Hiển thị biểu đồ cột tổng lưu lượng khách theo từng tháng trong năm.
 * Cột tháng hiện tại được highlight bằng màu accent-secondary (#4D7CFF).
 *
 * Props:
 *   locationId   {string}  — ID địa điểm
 *   year         {number}  — Năm cần hiển thị
 *   currentMonth {number}  — Tháng hiện tại (1–12) để highlight
 */
const MonthlyTrafficChart = ({ locationId, year, currentMonth }) => {
  const dispatch = useDispatch();
  const { yearlyStats, yearlyStatsLoading, yearlyStatsError } = useSelector(s => s.dashboard);

  useEffect(() => {
    if (locationId && year) {
      dispatch(fetchYearlyStats({ locationId, year }));
    }
  }, [dispatch, locationId, year]);

  const chartData = buildChartData(yearlyStats);
  const isEmpty   = chartData.every(d => d.value === 0);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (yearlyStatsLoading && !yearlyStats) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (yearlyStatsError && !yearlyStats) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3 min-h-[280px]">
        <AlertTriangle className="text-rose-600 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được biểu đồ theo tháng</p>
          <p className="text-sm text-rose-600">{yearlyStatsError}</p>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Chưa có dữ liệu trong năm này.
      </div>
    );
  }

  // ── Chart ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLOR_DEFAULT }} />
          <span className="text-xs text-muted-foreground">Lưu lượng khách (người)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLOR_CURRENT }} />
          <span className="text-xs text-muted-foreground">Tháng hiện tại</span>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 20, left: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              height={36}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={formatYAxis}
              label={{ value: 'Khách', angle: -90, position: 'insideLeft', offset: 8, fill: '#94a3b8', fontSize: 11 }}
              width={52}
            />
            <Tooltip content={<MonthlyTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar
              dataKey="value"
              name="Lưu lượng"
              radius={[4, 4, 0, 0]}
              barSize={28}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.month}`}
                  fill={entry.month === currentMonth ? COLOR_CURRENT : COLOR_DEFAULT}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default MonthlyTrafficChart;
