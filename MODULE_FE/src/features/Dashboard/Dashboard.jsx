import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import AreaDetails from './components/AreaDetails';
import ChartSection from './components/ChartSection';
import MonthlyTrafficChart from './components/MonthlyTrafficChart';
import { fetchMonthlyKPIMetrics, fetchDailyStats, fetchMonthlyZoneAnalytics, fetchYearlyStats } from './dashboard.thunk';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { selectedMonth, locationId, userLocationId } = useSelector((state) => state.filter);

  const now = new Date();
  const { year, month } = selectedMonth || { year: now.getFullYear(), month: now.getMonth() + 1 };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  // Dispatch 4 thunks song song khi mount và khi filter thay đổi
  useEffect(() => {
    if (!effectiveLocationId) return;
    dispatch(fetchMonthlyKPIMetrics({ locationId: effectiveLocationId, year, month }));
    dispatch(fetchDailyStats({ locationId: effectiveLocationId, year, month }));
    dispatch(fetchYearlyStats({ locationId: effectiveLocationId, year }));
    dispatch(fetchMonthlyZoneAnalytics({ locationId: effectiveLocationId, year, month }));
  }, [dispatch, effectiveLocationId, year, month]);

  return (
    <div className="py-6 md:py-8 space-y-6 max-w-[1760px] mx-auto">

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <StatsCards year={year} month={month} isCurrentMonth={isCurrentMonth} />

      {/* ── Biểu đồ theo ngày ──────────────────────────────────────────────── */}
      <ChartSection
        title="Biểu Đồ Theo Ngày"
        subtitle="Theo dõi biến động lưu lượng và doanh thu ngắn hạn"
        badgeLabel={`Tháng ${month}/${year}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Charts.DailyTraffic
              locationId={effectiveLocationId}
              year={year}
              month={month}
            />
          </div>
          <div className="lg:col-span-2">
            <Charts.DailyRevenue
              locationId={effectiveLocationId}
              year={year}
              month={month}
            />
          </div>
        </div>
        {isCurrentMonth && (
          <div className="mt-6">
            <Charts.HourlyTraffic locationId={effectiveLocationId} />
          </div>
        )}
      </ChartSection>

      {/* ── Biểu đồ theo tháng ─────────────────────────────────────────────── */}
      <ChartSection
        title="Biểu Đồ Theo Tháng"
        subtitle="Theo dõi xu hướng dài hạn và tăng trưởng hệ thống"
        badgeLabel={`Năm ${year}`}
      >
        <MonthlyTrafficChart
          locationId={effectiveLocationId}
          year={year}
          currentMonth={month}
        />
      </ChartSection>

      {/* ── Phân tích khu vực ──────────────────────────────────────────────── */}
      <AreaDetails.ZoneAnalyticsDashboard
        year={year}
        month={month}
        isCurrentMonth={isCurrentMonth}
      />

    </div>
  );
};

export default Dashboard;
