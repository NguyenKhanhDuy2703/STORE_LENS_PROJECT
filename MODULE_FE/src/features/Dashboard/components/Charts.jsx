import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, Loader2, AlertTriangle } from 'lucide-react';
import { fetchHourlyCustomerFlow, fetchRevenueLast7Days } from '../dashboard.thunk';

const exportCSV = (data, filename) => {
  if (!data || data.length === 0) {
    return;
  }
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

const normalizeHourlyFlow = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    time: item.time || item.hour || item.label || `${String(index).padStart(2, '0')}:00`,
    value: item.value ?? item.people_count ?? item.count ?? item.total ?? item.visitors ?? 0,
  }));
};

const normalizeRevenueData = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    day: item.day || item.date || item.label || `Day ${index + 1}`,
    value: item.value ?? item.revenue ?? item.total_revenue ?? 0,
  }));
};

const formatHourLabel = (value) => {
  if (!value) {
    return '';
  }

  const normalized = String(value).trim();
  if (normalized.includes(':')) {
    return normalized;
  }

  if (/^\d+$/.test(normalized)) {
    return `${normalized.padStart(2, '0')}:00`;
  }

  return normalized;
};

const formatRevenueLabel = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

const Traffic = () => {
  const dispatch = useDispatch();
  const { locationId } = useSelector((state) => state.filter);
  const { hourlyCustomerFlow, hourlyCustomerFlowLoading, hourlyCustomerFlowError } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (locationId) {
      dispatch(fetchHourlyCustomerFlow({
        locationId,
        type: 'today',
        startCustom: null,
        endCustom: null,
      }));
    }
  }, [dispatch, locationId]);

  const hourlyItems = hourlyCustomerFlow?.hourly || hourlyCustomerFlow?.data || [];
  const trafficData = normalizeHourlyFlow(hourlyItems).map((item) => ({
    time: formatHourLabel(item.time),
    value: item.value,
  }));
  const hasTrafficData = trafficData.length > 0;

  if (hourlyCustomerFlowLoading && !hasTrafficData) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[360px]">
        <Loader2 className="animate-spin text-teal-600" size={28} />
      </div>
    );
  }

  if (hourlyCustomerFlowError && !hasTrafficData) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3 min-h-[360px]">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được biểu đồ lưu lượng khách</p>
          <p className="text-sm text-rose-600">{hourlyCustomerFlowError}. Bạn có thể fake dữ liệu tạm thời nếu DB chưa có chart_data.</p>
        </div>
      </div>
    );
  }

  if (!hasTrafficData) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <ChartHeader
          title="Lưu Lượng Khách Theo Giờ"
          onCSV={() => exportCSV([], 'traffic.csv')}
        />
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          API chưa có dữ liệu hourly flow phù hợp. Nếu cần, bạn có thể fake tạm hourly theo format time/value rồi note lại để chỉnh DB sau.
        </div>
        <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
          Chưa có dữ liệu để vẽ biểu đồ.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <ChartHeader
        title="Lưu Lượng Khách Theo Giờ"
        onCSV={() => exportCSV(trafficData, 'traffic.csv')}
      />

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficData}>
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
  const dispatch = useDispatch();
  const { locationId } = useSelector((state) => state.filter);
  const { revenueLast7Days, revenueLast7DaysLoading, revenueLast7DaysError } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (locationId) {
      dispatch(fetchRevenueLast7Days({
        locationId,
        type: 'last7days',
        startCustom: null,
        endCustom: null,
      }));
    }
  }, [dispatch, locationId]);

  const revenueItems = revenueLast7Days?.revenue_data || revenueLast7Days?.data || [];
  const revenueData = normalizeRevenueData(revenueItems).map((item) => ({
    day: formatRevenueLabel(item.day),
    value: item.value,
  }));
  const hasRevenueData = revenueData.length > 0;

  if (revenueLast7DaysLoading && !hasRevenueData) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[360px]">
        <Loader2 className="animate-spin text-teal-600" size={28} />
      </div>
    );
  }

  if (revenueLast7DaysError && !hasRevenueData) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3 min-h-[360px]">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được biểu đồ doanh thu</p>
          <p className="text-sm text-rose-600">{revenueLast7DaysError}. Bạn có thể fake dữ liệu tạm thời nếu DB chưa có `revenue_data`.</p>
        </div>
      </div>
    );
  }

  if (!hasRevenueData) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <ChartHeader
          title="Doanh Thu 7 Ngày"
          onCSV={() => exportCSV([], 'revenue.csv')}
        />
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          API chưa có dữ liệu revenue 7 ngày phù hợp. Nếu cần, bạn có thể fake tạm revenue_data theo format date và total_revenue rồi note lại để chỉnh DB sau.
        </div>
        <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
          Chưa có dữ liệu để vẽ biểu đồ.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <ChartHeader
        title="Doanh Thu 7 Ngày"
        onCSV={() => exportCSV(revenueData, 'revenue.csv')}
      />

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
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