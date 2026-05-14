import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Upload, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import useScrollVisibility from '@/hooks/useScrollVisibility';
import { setLocation, setSelectedMonth, initializeFilterByUserRole } from '../../redux/slices/global.slice';
import { getCameraAndZoneInfo } from '../../services/camera.api';
import { syncLocationStats, syncZoneStats } from '../../services/async.api';
import exportReportService from '../../services/exportreport.api';
import { showCompactSuccessAlert, showCompactErrorAlert } from '../../utils/swal';
import FilterSelect from '../common/FilterSelect';
import PosUploadModal from '../common/PosUploadModal';
import { fetchMonthlyKPIMetrics, fetchDailyStats, fetchYearlyStats, fetchMonthlyZoneAnalytics } from '../../features/Dashboard/dashboard.thunk';

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export const GlobalFilter = () => {
  const dispatch = useDispatch();
  const { user, allocation, locationId: selectedLocationId, selectedMonth, userLocationId, isAutoSelected } = useSelector(
    (state) => state.filter
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);

  const isVisible = useScrollVisibility(150);

  const now = new Date();
  const { year, month } = selectedMonth || { year: now.getFullYear(), month: now.getMonth() + 1 };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  // Khởi tạo filter theo role khi user thay đổi
  useEffect(() => {
    if (user?.role) {
      dispatch(initializeFilterByUserRole({
        userRole: user.role,
        userLocationId: user.location_id,
      }));
    }
  }, [user, dispatch]);

  const handleLocationChange = (e) => {
    dispatch(setLocation(e.target.value));
  };

  // Điều hướng tháng
  const handlePrevMonth = () => {
    const d = new Date(year, month - 2); // month-2 vì month là 1-indexed
    dispatch(setSelectedMonth({ year: d.getFullYear(), month: d.getMonth() + 1 }));
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    const d = new Date(year, month); // month là next month (0-indexed)
    dispatch(setSelectedMonth({ year: d.getFullYear(), month: d.getMonth() + 1 }));
  };

  // Lấy locationId hiệu lực (bỏ qua loc_all)
  const effectiveLocationId = selectedLocationId !== 'loc_all' ? selectedLocationId : userLocationId;

  // Đồng bộ LocationStats + ZoneStats
  const handleSync = async () => {
    if (!effectiveLocationId || isSyncing) return;

    setIsSyncing(true);
    try {
      // 1. Ghi dữ liệu vào MongoDB qua worker
      await syncLocationStats(effectiveLocationId);
      const zones = await getCameraAndZoneInfo(effectiveLocationId);
      if (Array.isArray(zones) && zones.length > 0) {
        await Promise.allSettled(
          zones.map((zone) =>
            syncZoneStats(
              effectiveLocationId,
              zone.zone_id || zone.zoneId,
              zone.camera_code || zone.cameraCode
            )
          )
        );
      }

      // 2. Re-fetch dashboard data để cập nhật UI từ MongoDB
      await Promise.allSettled([
        dispatch(fetchMonthlyKPIMetrics({ locationId: effectiveLocationId, year, month })),
        dispatch(fetchDailyStats({ locationId: effectiveLocationId, year, month })),
        dispatch(fetchYearlyStats({ locationId: effectiveLocationId, year })),
        dispatch(fetchMonthlyZoneAnalytics({ locationId: effectiveLocationId, year, month })),
      ]);

      showCompactSuccessAlert({ title: 'Đồng bộ thành công', text: 'Dữ liệu đã được cập nhật.' });
    } catch (err) {
      showCompactErrorAlert({ title: 'Đồng bộ thất bại', text: err?.message || 'Vui lòng thử lại.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    if (!effectiveLocationId || isExporting) return;

    setIsExporting(true);
    try {
      const response = await exportReportService.exportComprehensiveReport(effectiveLocationId, {
        type: 'thisYear',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Bao_Cao_Tong_Hop.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showCompactSuccessAlert({ title: 'Xuất báo cáo thành công' });
    } catch (err) {
      console.error(err);
      showCompactErrorAlert({ title: 'Lỗi', text: 'Không thể xuất báo cáo.' });
    } finally {
      setIsExporting(false);
    }
  };

  // Danh sách location theo role
  const availableLocations = (() => {
    const options = [];
    if (user?.role === 'ADMIN_SUPER') {
      options.push({ id: 'loc_all', name: 'Tất cả cơ sở', isDisabled: false });
    }
    if (allocation) {
      const id = allocation.location_code || allocation._id || userLocationId;
      const isDisabled = (user?.role === 'MANAGER' || user?.role === 'USER') && id !== userLocationId;
      options.push({ id, name: allocation.name || `Cửa hàng ${id}`, isDisabled });
    }
    return options;
  })();

  const isLocationDisabled = user?.role !== 'ADMIN_SUPER' && isAutoSelected;

  return (
    <div
      className={`sticky top-16 z-20 px-4 lg:px-6 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="mx-auto w-full max-w-[1760px]">
        <div className="flex items-center justify-between gap-6 rounded-xl border border-border bg-card px-4 lg:px-6 py-3">

          {/* LEFT: Selectors */}
          <div className="flex items-center gap-6">
            {/* Location */}
            <FilterSelect
              label="Cửa hàng"
              value={selectedLocationId || 'loc_all'}
              onChange={(val) => handleLocationChange({ target: { value: val } })}
              disabled={isLocationDisabled}
              options={availableLocations.map((loc) => ({
                value: loc.id,
                label: loc.isDisabled ? `${loc.name} (không có quyền truy cập)` : loc.name,
                disabled: loc.isDisabled,
              }))}
            />

            {/* Month Navigator */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Khoảng thời gian
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Tháng trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-foreground min-w-[110px] text-center select-none">
                  {MONTH_NAMES[month - 1]}/{year}
                  {isCurrentMonth && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                      Hiện tại
                    </span>
                  )}
                </span>
                <button
                  onClick={handleNextMonth}
                  disabled={isCurrentMonth}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Tháng sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSync}
              disabled={isSyncing || !effectiveLocationId}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Đồng bộ dữ liệu thống kê từ AI"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
            </button>

            <button 
              onClick={() => setIsPosModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30 transition-all duration-200"
              title="Nhập dữ liệu hóa đơn bán hàng từ máy POS"
            >
              <Upload size={15} />
              Nhập POS
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting || !effectiveLocationId}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-accent text-sm font-semibold text-white shadow-sm hover:shadow-accent transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <RefreshCw className="animate-spin" size={15} /> : <FileText size={15} />}
              {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
            </button>
          </div>
        </div>
      </div>
      
      {/* POS Upload Modal */}
      <PosUploadModal 
        isOpen={isPosModalOpen} 
        onClose={() => setIsPosModalOpen(false)} 
        locationId={effectiveLocationId}
      />
    </div>
  );
};
