import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import formatDuration from '../../../utils/formatDuration';

const BarLineChart = ({ data = [], isLoading = false }) => {
  const chartData = Array.isArray(data) ? data : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const trafficVal = payload.find((p) => p.dataKey === 'traffic');
      const dwellVal = payload.find((p) => p.dataKey === 'dwellTime');
      return (
        <div className="bg-card/95 backdrop-blur-md p-4 border border-border shadow-lg rounded-xl min-w-[190px]">
          <p className="text-sm font-semibold text-foreground mb-3">{label}</p>
          <div className="space-y-2">
            {trafficVal && (
              <div className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                  <span className="text-muted-foreground">Lượng khách</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">
                  {Number(trafficVal.value).toLocaleString('vi-VN')} người
                </span>
              </div>
            )}
            {dwellVal && (
              <div className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-muted-foreground">TG dừng TB</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatDuration(dwellVal.value)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm h-[480px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-500 font-medium text-sm">Đang vẽ biểu đồ...</span>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm h-[480px] flex items-center justify-center">
        <span className="text-muted-foreground font-medium text-sm">Chưa có dữ liệu biểu đồ dwell time.</span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Hiệu suất Thu hút</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tương quan lượng khách (cột) và thời gian dừng trung bình (đường) theo giờ</p>
      </div>

      {/* Legend thủ công — tránh bị che bởi Recharts Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          <span className="text-xs text-muted-foreground">Lượng khách (trục trái)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-xs text-muted-foreground">TG dừng TB — giây (trục phải)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 72, bottom: 32, left: 16 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.35} />
              </linearGradient>
              <filter id="lineShadow" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.25" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={6}
              label={{
                value: 'Giờ trong ngày',
                position: 'insideBottom',
                offset: -14,
                fill: '#94a3b8',
                fontSize: 11,
              }}
              height={48}
            />

            {/* Trục trái — lượng khách */}
            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => Math.round(v).toLocaleString('vi-VN')}
              allowDecimals={false}
              domain={[0, 'auto']}
              label={{
                value: 'Khách',
                angle: -90,
                position: 'insideLeft',
                offset: 16,
                fill: '#94a3b8',
                fontSize: 11,
              }}
              width={56}
            />

            {/* Trục phải — thời gian dừng (giây) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => `${Math.round(v)}s`}
              allowDecimals={false}
              domain={[0, 'auto']}
              label={{
                value: 'Giây',
                angle: 90,
                position: 'insideRight',
                offset: -8,
                fill: '#94a3b8',
                fontSize: 11,
              }}
              width={56}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.5)' }} />

            <Bar
              yAxisId="left"
              dataKey="traffic"
              name="Lượng khách"
              barSize={20}
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="dwellTime"
              name="TG dừng TB"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 4, fill: '#fff', stroke: '#F59E0B', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }}
              isAnimationActive={false}
              filter="url(#lineShadow)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarLineChart;
