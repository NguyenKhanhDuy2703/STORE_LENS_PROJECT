import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Format số khách ngắn gọn cho trục Y
const formatYAxis = (value) => {
  if (value === 0) return "0";
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "10px 14px",
        minWidth: 150,
      }}
    >
      <p style={{ color: "#0f172a", fontWeight: 600, marginBottom: 6, fontSize: 12 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#0d9488",
            display: "inline-block",
          }}
        />
        <span style={{ color: "#64748b", fontSize: 12 }}>Lượt khách:</span>
        <span
          style={{
            color: "#0f172a",
            fontWeight: 600,
            fontSize: 12,
            marginLeft: "auto",
            paddingLeft: 8,
          }}
        >
          {Number(payload[0].value).toLocaleString("vi-VN")} khách
        </span>
      </div>
    </div>
  );
};

const AreaTrafficChart = ({ data }) => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-medium tracking-tight text-foreground">
          Lưu lượng biến động theo giờ
        </h3>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
        <span className="text-xs text-muted-foreground">Lượt khách (người)</span>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 24, left: 12 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{
                value: "Giờ trong ngày",
                position: "insideBottom",
                offset: -8,
                fill: "#94a3b8",
                fontSize: 11,
              }}
              height={44}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={formatYAxis}
              label={{
                value: "Khách",
                angle: -90,
                position: "insideLeft",
                offset: 8,
                fill: "#94a3b8",
                fontSize: 11,
              }}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              name="Lượt khách"
              stroke="#0d9488"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaTrafficChart;
