import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, Users, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { fetchKPIMetrics } from '../dashboard.thunk';

const StatsCards = () => {
  const dispatch = useDispatch();
  const { locationId } = useSelector((state) => state.filter);
  const { kpiMetrics, kpiMetricsLoading, kpiMetricsError } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (locationId) {
      dispatch(fetchKPIMetrics({
        locationId,
        type: 'today',
        startCustom: null,
        endCustom: null,
      }));
    }
  }, [dispatch, locationId]);

  const fallbackStats = {
    total_revenue: 0,
    total_customers: 0,
    conversion_rate: 0,
    current_visitors: 0,
    waiting_queue: 0,
  };

  const stats = {
    total_revenue: kpiMetrics?.total_revenue ?? fallbackStats.total_revenue,
    total_customers: kpiMetrics?.total_customers ?? fallbackStats.total_customers,
    conversion_rate: kpiMetrics?.conversion_rate ?? fallbackStats.conversion_rate,
    current_visitors: kpiMetrics?.current_visitors ?? fallbackStats.current_visitors,
    waiting_queue: kpiMetrics?.waiting_queue ?? fallbackStats.waiting_queue,
  };

  const missingFields = ['total_revenue', 'total_customers', 'conversion_rate', 'current_visitors', 'waiting_queue']
    .filter((field) => kpiMetrics?.[field] === undefined || kpiMetrics?.[field] === null);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const formatNumber = (value) => {
    return value.toLocaleString('vi-VN');
  };

  const MetricCard = ({ label, value, icon: Icon, iconBg }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-2">{label}</p>
        <h2 className="text-4xl font-semibold text-slate-900 tabular-nums tracking-tight">{value}</h2>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  if (kpiMetricsLoading && !kpiMetrics) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={28} />
      </div>
    );
  }

  if (kpiMetricsError && !kpiMetrics) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được KPI từ API</p>
          <p className="text-sm text-rose-600">{kpiMetricsError}. Bạn có thể fake dữ liệu tạm thời trong component này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missingFields.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          Một số field KPI chưa có dữ liệu thật: {missingFields.join(', ')}. Tạm dùng dữ liệu fake và cần note lại để chỉnh DB sau.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <MetricCard
        label="Tổng Doanh Thu"
        value={formatCurrency(stats.total_revenue)}
        icon={DollarSign}
        iconBg="bg-teal-600"
      />

      {/* Total Customers */}
      <MetricCard
        label="Tổng Khách Hàng"
        value={formatNumber(stats.total_customers)}
        icon={Users}
        iconBg="bg-teal-600"
      />

      {/* Conversion Rate */}
      <MetricCard
        label="Tỷ Lệ Chuyển Đổi"
        value={`${stats.conversion_rate.toFixed(1)}%`}
        icon={TrendingUp}
        iconBg="bg-teal-600"
      />

      {/* Live Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-teal-600"></div>
          <span className="text-teal-600 text-[10px] font-medium tracking-tight">Live</span>
        </div>
        
        <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-1">Khách Hiện Tại</p>
        <h2 className="text-4xl font-semibold text-slate-900 mb-2 tabular-nums tracking-tight">{stats.current_visitors}</h2>
        
        <p className="text-[9px] text-slate-500 mb-4">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
        
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-2">Chờ Tại Quầy</p>
          <h3 className="text-2xl font-semibold text-slate-900 tabular-nums tracking-tight">{stats.waiting_queue}</h3>
        </div>
      </div>
      </div>
    </div>
  );
};

export default StatsCards;