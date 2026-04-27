import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DollarSign, Users, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { fetchKPIMetrics } from '../dashboard.thunk';
import { updateRealtimePeople } from '../dashboard.slice';
import socket from '../../../services/socket';

// Trả về màu dot theo mức độ đông tương đối
const getZoneDotColor = (count, maxCount) => {
  if (maxCount === 0) return 'bg-slate-300';
  const ratio = count / maxCount;
  if (ratio >= 0.7) return 'bg-rose-500';
  if (ratio >= 0.35) return 'bg-amber-400';
  return 'bg-slate-300';
};

const StatsCards = () => {
  const dispatch = useDispatch();
  const { locationId } = useSelector((state) => state.filter);
  const { kpiMetrics, kpiMetricsLoading, kpiMetricsError } = useSelector((state) => state.dashboard);
  const lastUpdatedRef = useRef(new Date());

  // Fetch KPI lần đầu
  useEffect(() => {
    if (locationId) {
      dispatch(fetchKPIMetrics({ locationId, type: 'today', startCustom: null, endCustom: null }));
    }
  }, [dispatch, locationId]);

  // Socket.IO — join room và lắng nghe realtime_people_count
  useEffect(() => {
    if (!locationId) return;

    if (!socket.connected) socket.connect();

    socket.emit('join_location', locationId);

    const handleRealtimeUpdate = (data) => {
      lastUpdatedRef.current = new Date();
      dispatch(updateRealtimePeople({
        people_current: data.people_current,
        zone_counts: data.zone_counts,
      }));
    };

    socket.on('realtime_people_count', handleRealtimeUpdate);

    return () => {
      socket.off('realtime_people_count', handleRealtimeUpdate);
    };
  }, [dispatch, locationId]);

  const stats = {
    total_revenue: kpiMetrics?.total_revenue ?? 0,
    total_customers: kpiMetrics?.total_customers ?? 0,
    conversion_rate: kpiMetrics?.conversion_rate ?? 0,
    current_visitors: kpiMetrics?.current_visitors ?? 0,
    waiting_queue: kpiMetrics?.waiting_queue ?? 0,
    zone_counts: kpiMetrics?.zone_counts ?? {},
  };

  const missingFields = ['total_revenue', 'total_customers', 'conversion_rate', 'current_visitors', 'waiting_queue']
    .filter((field) => kpiMetrics?.[field] === undefined || kpiMetrics?.[field] === null);

  const formatCurrency = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toString();
  };

  const formatNumber = (value) => value.toLocaleString('vi-VN');

  // Top 3 zone đông nhất từ zone_counts
  const topZones = Object.entries(stats.zone_counts)
    .map(([zoneId, count]) => ({ zoneId, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const maxZoneCount = topZones[0]?.count ?? 0;

  const MetricCard = ({ label, value, icon: Icon, iconBg }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-2">{label}</p>
        <h2 className="text-4xl font-semibold text-slate-900 tabular-nums tracking-tight">{value}</h2>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
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
      {missingFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          Một số field KPI chưa có dữ liệu thật: {missingFields.join(', ')}. Tạm dùng dữ liệu fake và cần note lại để chỉnh DB sau.
        </div>
      )}

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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">

          {/* Header: Live badge + timestamp */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-teal-600 text-[10px] font-semibold tracking-tight uppercase">Trực tiếp</span>
            </div>
            <span className="text-[9px] text-slate-400">
              {lastUpdatedRef.current.toLocaleTimeString('vi-VN')}
            </span>
          </div>

          {/* Tổng khách hiện tại */}
          <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-0.5">Khách trong cửa hàng</p>
          <h2 className="text-4xl font-semibold text-slate-900 tabular-nums tracking-tight mb-3">
            {stats.current_visitors}
          </h2>

          {/* Zone breakdown */}
          <div className="border-t border-slate-100 pt-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium text-slate-400 tracking-tight">Theo khu vực</p>
              <Link
                to="/management/areas"
                className="text-[10px] text-teal-600 hover:text-teal-700 font-medium shrink-0"
              >
                Xem tất cả →
              </Link>
            </div>

            {topZones.length > 0 ? (
              <div className="space-y-2">
                {topZones.map(({ zoneId, count }) => {
                  const barWidth = maxZoneCount > 0 ? Math.round((count / maxZoneCount) * 100) : 0;
                  const dotColor = getZoneDotColor(count, maxZoneCount);
                  const barColor = dotColor === 'bg-rose-500'
                    ? 'bg-rose-400'
                    : dotColor === 'bg-amber-400'
                      ? 'bg-amber-400'
                      : 'bg-slate-300';

                  return (
                    <div key={zoneId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                          <span className="text-[10px] text-slate-600 truncate">{zoneId}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-800 tabular-nums shrink-0 ml-2">
                          {count}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(stats.zone_counts).length > 3 && (
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    +{Object.keys(stats.zone_counts).length - 3} khu vực khác
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">Chưa có dữ liệu khu vực</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
