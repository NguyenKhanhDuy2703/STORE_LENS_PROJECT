import { Clock3, Minus, TrendingDown, TrendingUp, Users, Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchZoneAnalyticsDashboard } from '../dashboard.thunk';

const formatLastUpdated = (value) => {
  const timestamp = value ? new Date(value) : new Date();
  if (Number.isNaN(timestamp.getTime())) return 'Vua cap nhat';
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

  if (minutes === 0) return `${seconds} giay`;
  if (minutes < 10) return `${minutes} phut ${seconds} giay`;

  const decimalMinutes = (safeMs / 60000).toFixed(1);
  return `${decimalMinutes} phut`;
};

const getConversionStyle = (rate = 0) => {
  if (rate > 60) {
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (rate >= 30) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

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

const ZoneAnalyticsDashboard = ({ filterType = 'today', startDate = null, endDate = null } = {}) => {
  const dispatch = useDispatch();
  const { zoneAnalytics, zoneAnalyticsLoading, zoneAnalyticsError } = useSelector(state => state.dashboard);
  const { locationId, userLocationId } = useSelector(state => state.filter);
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;
  
  useEffect(() => {
    if (effectiveLocationId) {
      dispatch(fetchZoneAnalyticsDashboard({ 
        locationId: effectiveLocationId,
        type: filterType, 
        startCustom: startDate, 
        endCustom: endDate 
      }));
    }
  }, [dispatch, effectiveLocationId, filterType, startDate, endDate]);

  const zones = Array.isArray(zoneAnalytics?.zones) ? zoneAnalytics.zones : [];
  const performance = Array.isArray(zoneAnalytics?.performance) ? zoneAnalytics.performance : [];
  const performanceMap = new Map(
    performance.map((item) => [item.zone_id || item._id, item])
  );

  const mergedRows = zones.map((zone) => {
    const zoneId = zone.zone_id || zone._id;
    const perf = performanceMap.get(zoneId);
    const hasPerformance = Boolean(perf);

    return {
      zone_id: zoneId,
      zone_name: zone.zone_name || perf?.zone_name || 'Unknown Zone',
      people_count: Number(zone.people_count || 0),
      conversion_rate: hasPerformance
        ? Number(zone.conversion_rate ?? perf?.conversion_rate ?? 0)
        : 0,
      avg_dwell_time: hasPerformance ? Number(perf?.avg_dwell_time || 0) : 0,
      peak_hour: zone.peak_hour,
    };
  });

  if (zoneAnalyticsLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm pb-10">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader size={32} className="text-slate-400 animate-spin" />
            <p className="text-sm text-slate-500">Dang tai du lieu zone analysis...</p>
          </div>
        </div>
      </section>
    );
  }

  if (zoneAnalyticsError) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm pb-10">
        <div className="rounded-xl border border-dashed border-rose-200 p-8 text-center">
          <p className="text-sm text-rose-600 font-medium">Loi: {zoneAnalyticsError}</p>
          <p className="text-xs text-rose-500 mt-2">Vui long kiem tra ket noi va thu lai</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
          Phan Tich Hieu Suat Khu Vuc
        </h3>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Cap nhat luc: {formatLastUpdated(zoneAnalytics?.lastUpdated)}
        </span>
      </div>

      <div className="space-y-3">
        {mergedRows.map((row, index) => {
          const styles = getConversionStyle(row.conversion_rate);
          const TrendIcon = getTrendIcon(row.conversion_rate);

          return (
            <article
              key={row.zone_id}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-1 flex items-center">
                  <span className="text-sm font-semibold text-slate-500">#{index + 1}</span>
                </div>

                <div className="md:col-span-3 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{row.zone_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Zone ID: {row.zone_id}</p>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <Users size={16} className="text-slate-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{row.people_count}</span>
                    <TrendIcon
                      size={16}
                      className={
                        row.conversion_rate > 60
                          ? 'text-emerald-600'
                          : row.conversion_rate < 30
                            ? 'text-rose-600'
                            : 'text-amber-600'
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <Clock3 size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-700">{formatDwellTime(row.avg_dwell_time)}</span>
                </div>

                <div className="md:col-span-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Conversion Rate</span>
                    <span className={`text-xs font-semibold tabular-nums ${styles.text}`}>
                      {row.conversion_rate.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
                      style={{ width: `${Math.min(Math.max(row.conversion_rate, 0), 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 hidden md:flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}>
                      Muc hieu suat
                    </span>
                    {typeof row.peak_hour === 'number' && (
                      <span className="text-[10px] text-slate-500">Peak hour: {row.peak_hour}:00</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {mergedRows.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Khong co du lieu khu vuc trong khoang thoi gian da chon.
          </div>
        )}
      </div>
    </section>
  );
};

const AreaDetails = {
  ZoneAnalyticsDashboard,
};

export default AreaDetails;