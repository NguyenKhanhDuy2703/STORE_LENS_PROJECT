import { Clock3, Minus, TrendingDown, TrendingUp, Users, Loader, Radio } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchZoneAnalyticsDashboard, fetchMonthlyZoneAnalytics } from '../dashboard.thunk';

const formatLastUpdated = (value) => {
  const timestamp = value ? new Date(value) : new Date();
  if (Number.isNaN(timestamp.getTime())) return 'Vừa cập nhật';
  return timestamp.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDwellTime = (milliseconds = 0) => {
  const safeMs = Number.isFinite(milliseconds) ? Math.max(milliseconds, 0) : 0;
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 10) return `${minutes}p ${seconds}s`;
  return `${(safeMs / 60000).toFixed(1)}p`;
};

const getConversionStyle = (rate = 0) => {
  if (rate > 60) return {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  if (rate >= 30) return {
    bar: 'bg-amber-500',
    text: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return {
    bar: 'bg-rose-500',
    text: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  };
};

const getTrendIcon = (rate = 0) => {
  if (rate > 60) return TrendingUp;
  if (rate < 30) return TrendingDown;
  return Minus;
};

// Badge số người hiện tại — màu theo mức độ
const getCurrentBadgeStyle = (count) => {
  if (count >= 5) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (count >= 2) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (count >= 1) return 'bg-teal-50 text-teal-700 border-teal-200';
  return 'bg-muted text-muted-foreground border-border';
};

const ZoneAnalyticsDashboard = ({ year, month, isCurrentMonth } = {}) => {
  const dispatch = useDispatch();
  const { monthlyZoneAnalytics, monthlyZoneLoading, monthlyZoneError, monthlyKPIMetrics } = useSelector(state => state.dashboard);
  const { locationId, userLocationId } = useSelector(state => state.filter);
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  const zoneCounts = monthlyKPIMetrics?.zone_counts ?? {};

  // Label theo tháng
  const periodLabel = `Tháng ${month}/${year}`;
  const isLive = isCurrentMonth;

  useEffect(() => {
    if (effectiveLocationId && year && month) {
      dispatch(fetchMonthlyZoneAnalytics({
        locationId: effectiveLocationId,
        year,
        month,
      }));
    }
  }, [dispatch, effectiveLocationId, year, month]);

  const zoneData = monthlyZoneAnalytics || { zones: [], performance: [] };
  const zones = Array.isArray(zoneData?.zones) ? zoneData.zones : [];
  const performance = Array.isArray(zoneData?.performance) ? zoneData.performance : [];
  const performanceMap = new Map(performance.map((item) => [item.zone_id || item._id, item]));

  const mergedRows = zones.map((zone) => {
    const zoneId = zone.zone_id || zone._id;
    const perf = performanceMap.get(zoneId);
    return {
      zone_id: zoneId,
      zone_name: zone.zone_name || perf?.zone_name || 'Khu vực',
      people_count: Number(zone.people_count || 0),
      current_count: Number(zoneCounts[zoneId] ?? 0),
      conversion_rate: Number(zone.conversion_rate ?? perf?.conversion_rate ?? 0),
      avg_dwell_time: Number(perf?.avg_dwell_time || 0),
      peak_hour: zone.peak_hour,
    };
  });

  if (monthlyZoneLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-2">
            <Loader size={28} className="text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu khu vực...</p>
          </div>
        </div>
      </section>
    );
  }

  if (monthlyZoneError) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="rounded-xl border border-dashed border-rose-200 p-8 text-center">
          <p className="text-sm text-rose-600 font-medium">Lỗi: {monthlyZoneError}</p>
          <p className="text-xs text-rose-500 mt-1">Vui lòng kiểm tra kết nối và thử lại</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">Phân Tích Hiệu Suất Khu Vực</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLive ? 'Dữ liệu hôm nay · Thời gian thực từ camera AI' : `Dữ liệu ${periodLabel}`}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Cập nhật lúc: {formatLastUpdated(monthlyZoneAnalytics?.lastUpdated)}
        </span>
      </div>

      {/* Column headers */}
      {mergedRows.length > 0 && (
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-2 bg-muted border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="md:col-span-1">#</div>
          <div className="md:col-span-2">Khu vực</div>
          <div className="md:col-span-2 flex items-center gap-1"><Users size={10} /> {periodLabel}</div>
          <div className="md:col-span-2 flex items-center gap-1"><Radio size={10} /> {isLive ? 'Hiện tại' : '—'}</div>
          <div className="md:col-span-2 flex items-center gap-1"><Clock3 size={10} /> Thời gian dừng</div>
          <div className="md:col-span-3">Tỷ lệ chuyển đổi</div>
        </div>
      )}

      {/* Rows */}
      <div className="divide-y divide-border">
        {mergedRows.map((row, index) => {
          const styles = getConversionStyle(row.conversion_rate);
          const TrendIcon = getTrendIcon(row.conversion_rate);
          const currentBadge = getCurrentBadgeStyle(row.current_count);

          return (
            <div
              key={row.zone_id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-muted/70 transition-colors"
            >
              {/* Rank */}
              <div className="md:col-span-1">
                <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>
              </div>

              {/* Zone name */}
              <div className="md:col-span-2 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{row.zone_name}</p>
              </div>

              {/* Tổng hôm nay */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                <Users size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold text-foreground tabular-nums">{row.people_count}</span>
                <TrendIcon
                  size={13}
                  className={
                    row.conversion_rate > 60 ? 'text-emerald-500'
                    : row.conversion_rate < 30 ? 'text-rose-500'
                    : 'text-amber-500'
                  }
                />
              </div>

              {/* Hiện tại — chỉ hiển thị khi xem hôm nay */}
              <div className="md:col-span-2">
                {isLive ? (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${currentBadge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.current_count > 0 ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
                    {row.current_count} người
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Dwell time */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                <Clock3 size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{formatDwellTime(row.avg_dwell_time)}</span>
              </div>

              {/* Conversion rate */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold tabular-nums ${styles.text}`}>
                    {row.conversion_rate.toFixed(0)}%
                  </span>
                  {typeof row.peak_hour === 'number' && (
                    <span className="text-[10px] text-muted-foreground">Giờ cao điểm {row.peak_hour}:00</span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
                    style={{ width: `${Math.min(Math.max(row.conversion_rate, 0), 100)}%` }}
                  />
                </div>
                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium mt-1.5 ${styles.badge}`}>
                  {row.conversion_rate > 60 ? 'Tốt' : row.conversion_rate >= 30 ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
            </div>
          );
        })}

        {mergedRows.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">Không có dữ liệu khu vực trong khoảng thời gian đã chọn.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const AreaDetails = { ZoneAnalyticsDashboard };
export default AreaDetails;
