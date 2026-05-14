import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Zap, BarChart3 } from 'lucide-react';

import StatCard from './components/StatCard';
import BarLineChart from './components/BarLineChart';
import UnifiedDwellAnalyticsTable from './components/UnifiedDwellAnalyticsTable';
import {
  fetchAnalysisDwellTime,
  fetchDwellTimeMetrics,
  fetchPerformanceInteract,
} from './dwellTime.thunk';
import formatDuration from '../../utils/formatDuration';
import { MapPin } from 'lucide-react';

const Downtime = () => {
  const dispatch = useDispatch();
  const { locationId, userLocationId, date } = useSelector((state) => state.filter);
  const dwellTimeState = useSelector((state) => state.dwellTime);

  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  useEffect(() => {
    if (!effectiveLocationId) {
      return;
    }

    dispatch(fetchDwellTimeMetrics({ locationId: effectiveLocationId, date }));
    dispatch(fetchPerformanceInteract({ locationId: effectiveLocationId, date }));
    dispatch(fetchAnalysisDwellTime({ locationId: effectiveLocationId, date }));
  }, [dispatch, effectiveLocationId, date]);

  const metrics = dwellTimeState.metrics || { max_time: 0, min_time: 0, avg_time: 0 };
  const kpis = {
    max: { value: metrics.max_time, zone: metrics.max_zone_name || 'Khu vực chưa xác định', change: 0 },
    min: { value: metrics.min_time, zone: metrics.min_zone_name || 'Khu vực chưa xác định', change: 0 },
    avg: { value: metrics.avg_time, zone: 'Trung bình toàn cửa hàng', change: 0 },
  };

  const chartData = (dwellTimeState.performanceInteract || []).map((item) => ({
    name: item.hour,
    traffic: Math.round(Number(item.visitors || 0)),
    dwellTime: Math.round(Number(item.Time_stop || 0)),
  }));

  const tableRows = (dwellTimeState.analysisDwellTime || []).map((item, index) => ({
    id: `${item.zone_name || 'zone'}-${index}`,
    zoneName: item.zone_name || 'Khu vực chưa đặt tên',
    categoryName: item.category_name || 'Chưa phân loại',
    peopleCount: Number(item.people_count || 0),
    stopCount: Number(item.total_stop_events || 0),
    avgTime: Number(item.avg_dwell_time || 0),
    totalSales: Number(item.total_sales_value || 0),
    type: item.type || 'NORMAL',
  }));

  const isLoadingKPI = dwellTimeState.metricsLoading;
  const isLoadingChart = dwellTimeState.performanceLoading;
  const isLoadingTable = dwellTimeState.analysisLoading;

  if (isLoadingKPI) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-emerald-600 font-medium tracking-tight text-sm animate-pulse">Đang tải dữ liệu phân tích thời gian dừng...</p>
      </div>
    );
  }

  if (!effectiveLocationId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <MapPin size={28} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Chưa chọn cơ sở</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Để xem báo cáo Phân tích Thời gian lưu lại, vui lòng chọn một cơ sở cụ thể ở thanh công cụ phía trên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 md:py-8 pb-20">
      {/* KPI CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="TG DỪNG LÂU NHẤT"
          value={formatDuration(kpis.max.value)}
          subtitle={kpis.max.zone || "Chưa có dữ liệu"}
          icon={<Clock size={18} />}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
          accent="bg-rose-500"
        />
        <StatCard
          title="TG DỪNG NGẮN NHẤT"
          value={formatDuration(kpis.min.value)}
          subtitle={kpis.min.zone || "Chưa có dữ liệu"}
          icon={<Zap size={18} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          accent="bg-emerald-500"
        />
        <StatCard
          title="TRUNG BÌNH TOÀN CỬA HÀNG"
          value={formatDuration(kpis.avg.value)}
          subtitle="Tất cả các khu vực"
          icon={<BarChart3 size={18} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          accent="bg-amber-500"
        />
      </div>

      {/* Biểu đồ */}
      <div className="mb-8">
        <BarLineChart data={chartData} isLoading={isLoadingChart} />
      </div>

      {/* Bảng */}
      <div className="shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border border-border bg-card">
        <UnifiedDwellAnalyticsTable rows={tableRows} isLoading={isLoadingTable} />
      </div>
    </div>
  );
};

export default Downtime;