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
    max: { value: metrics.max_time, zone: 'Khu vực có thời gian dừng dài nhất', change: 0 },
    min: { value: metrics.min_time, zone: 'Khu vực có thời gian dừng ngắn nhất', change: 0 },
    avg: { value: metrics.avg_time, zone: 'Trung bình toàn cửa hàng', change: 0 },
  };

  const chartData = (dwellTimeState.performanceInteract || []).map((item) => ({
    name: item.hour,
    traffic: Number(item.vistors || 0),
    dwellTime: Number(item.Time_stop || 0),
  }));

  const tableRows = (dwellTimeState.analysisDwellTime || []).map((item, index) => ({
    id: `${item.zone_name || 'zone'}-${index}`,
    categoryName: item.category_name || 'Unknown Category',
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
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium tracking-tight text-xs">Đang tải dữ liệu phân tích...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 md:py-10 pb-20">
      {/* KPI CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="TG DỪNG TB LẦU NHẤT" 
          value={formatDuration(kpis.max.value)} 
          subtitle={kpis.max.zone} 
          change={kpis.max.change} 
          icon={<Clock className="w-6 h-6" />} 
        />
        <StatCard 
          title="TG DỪNG TB NGẮN NHẤT" 
          value={formatDuration(kpis.min.value)} 
          subtitle={kpis.min.zone} 
          change={kpis.min.change} 
          icon={<Zap className="w-6 h-6" />} 
        />
        <StatCard 
          title="TB TOÀN CỬA HÀNG" 
          value={formatDuration(kpis.avg.value)} 
          subtitle={kpis.avg.zone} 
          change={kpis.avg.change} 
          icon={<BarChart3 className="w-6 h-6" />} 
        />
      </div>

      {/* Biểu đồ giữ nguyên để theo dõi xu hướng trực quan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow mb-10">
        <div className="h-[420px] md:h-[480px]">
          <BarLineChart data={chartData} isLoading={isLoadingChart} />
        </div>
      </div>

      {/* Bảng hợp nhất để giảm trùng lặp thông tin */}
      <div className="shadow-sm hover:shadow-md transition-shadow">
        <UnifiedDwellAnalyticsTable rows={tableRows} isLoading={isLoadingTable} />
      </div>
    </div>
  );
};

export default Downtime;