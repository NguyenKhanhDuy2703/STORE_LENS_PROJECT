import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DollarSign, Users, TrendingUp, Clock, Loader2, AlertTriangle, Radio } from 'lucide-react';
import { formatCurrency as formatCurrencyVND } from '../../../utils/formatCurrency';
import { fetchMonthlyKPIMetrics } from '../dashboard.thunk';
import { updateRealtimePeople } from '../dashboard.slice';
import socket from '../../../services/socket';

const getZoneDotColor = (count, maxCount) => {
  if (maxCount === 0) return 'bg-muted-foreground';
  const ratio = count / maxCount;
  if (ratio >= 0.7) return 'bg-rose-500';
  if (ratio >= 0.35) return 'bg-amber-400';
  return 'bg-emerald-400';
};

const MetricCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, accent }) => (
  <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden relative">
    {/* Accent bar top */}
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />

    {/* Top row: label + icon */}
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>

    {/* Value */}
    <div>
      <h2 className="text-3xl font-bold text-foreground tabular-nums tracking-tight leading-none">{value}</h2>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  </div>
);

const StatsCards = ({ year, month, isCurrentMonth }) => {
  const dispatch = useDispatch();
  const { locationId, userLocationId } = useSelector((state) => state.filter);
  const { monthlyKPIMetrics, monthlyKPILoading, monthlyKPIError } = useSelector((state) => state.dashboard);
  const lastUpdatedRef = useRef(new Date());

  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  // Fetch monthly KPI khi location hoặc tháng thay đổi
  useEffect(() => {
    if (effectiveLocationId && year && month) {
      dispatch(fetchMonthlyKPIMetrics({ locationId: effectiveLocationId, year, month }));
    }
  }, [dispatch, effectiveLocationId, year, month]);

  // Socket.IO — chỉ kết nối khi đang xem tháng hiện tại
  useEffect(() => {
    if (!effectiveLocationId || !isCurrentMonth) return;

    if (!socket.connected) socket.connect();
    socket.emit('join_location', effectiveLocationId);

    const handleRealtimeUpdate = (data) => {
      lastUpdatedRef.current = new Date();
      dispatch(updateRealtimePeople({
        people_current: data.people_current,
        zone_counts: data.zone_counts,
      }));
    };

    socket.on('realtime_people_count', handleRealtimeUpdate);
    return () => { socket.off('realtime_people_count', handleRealtimeUpdate); };
  }, [dispatch, effectiveLocationId, isCurrentMonth]);

  const kpi = monthlyKPIMetrics;
  const stats = {
    total_revenue:    kpi?.total_revenue    ?? 0,
    total_customers:  kpi?.total_customers  ?? 0,
    conversion_rate:  kpi?.conversion_rate  ?? 0,
    avg_dwell_time:   kpi?.avg_dwell_time   ?? 0,
    current_visitors: kpi?.current_visitors ?? 0,
    zone_counts:      kpi?.zone_counts      ?? {},
  };

  const topZones = Object.entries(stats.zone_counts)
    .map(([zoneId, count]) => ({ zoneId, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const maxZoneCount = topZones[0]?.count ?? 0;

  const formatDwellTime = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}p ${s}s` : `${s}s`;
  };

  if (monthlyKPILoading && !kpi) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (monthlyKPIError && !kpi) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3">
        <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-rose-700">Không tải được KPI</p>
          <p className="text-sm text-rose-600">{monthlyKPIError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tổng Doanh Thu"
          value={formatCurrencyVND(stats.total_revenue)}
          sub={`${kpi?.days_with_data ?? 0} ngày có dữ liệu`}
          icon={DollarSign}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
          accent="bg-emerald-500"
        />
        <MetricCard
          label="Tổng Khách Hàng"
          value={stats.total_customers.toLocaleString('vi-VN')}
          sub="lượt khách trong tháng"
          icon={Users}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600"
          accent="bg-blue-500"
        />
        <MetricCard
          label="Tỷ Lệ Chuyển Đổi"
          value={`${stats.conversion_rate.toFixed(1)}%`}
          sub="sự kiện / lượt khách"
          icon={TrendingUp}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600"
          accent="bg-violet-500"
        />
        <MetricCard
          label="Thời Gian Dừng TB"
          value={formatDwellTime(stats.avg_dwell_time)}
          sub="trung bình mỗi lượt"
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600"
          accent="bg-amber-500"
        />
      </div>

      {/* Live card — chỉ hiện khi xem tháng hiện tại */}
      {isCurrentMonth && (
        <div className="bg-card border border-border rounded-2xl px-5 py-3.5 shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Live badge */}
          <div className="flex items-center gap-2 shrink-0">
            <Radio size={13} className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Trực tiếp</span>
            <span className="text-muted-foreground text-xs">
              {lastUpdatedRef.current.toLocaleTimeString('vi-VN')}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-4 bg-border" />

          {/* Current visitors */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Khách hiện tại:</span>
            <span className="text-xl font-bold text-foreground tabular-nums">{stats.current_visitors}</span>
            <span className="text-xs text-muted-foreground">người</span>
          </div>

          {/* Zone breakdown */}
          {topZones.length > 0 && (
            <>
              <div className="hidden md:block w-px h-4 bg-border" />
              <div className="flex items-center gap-3 flex-wrap">
                {topZones.map(({ zoneId, count }) => (
                  <div key={zoneId} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getZoneDotColor(count, maxZoneCount)}`} />
                    <span className="text-xs text-muted-foreground truncate max-w-20">{zoneId}</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">{count}</span>
                  </div>
                ))}
                <Link to="/management/areas" className="text-xs text-accent hover:underline font-medium ml-1">
                  Xem tất cả →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCards;
