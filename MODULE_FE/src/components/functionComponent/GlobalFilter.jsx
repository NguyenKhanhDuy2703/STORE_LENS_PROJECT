import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Upload, FileText } from 'lucide-react';
import useScrollVisibility from '@/hooks/useScrollVisibility';
import { setLocation, initializeFilterByUserRole } from '../../redux/slices/global.slice';
import { getCameraAndZoneInfo } from '../../services/camera.api';
import { syncLocationStats, syncZoneStats } from '../../services/async.api';
import { showCompactSuccessAlert, showCompactErrorAlert } from '../../utils/swal';
import FilterSelect from '../common/FilterSelect';

const datePresetOptions = [
  { id: 'today',     label: 'Hôm nay' },
  { id: 'yesterday', label: 'Hôm qua' },
  { id: 'last7',     label: '7 ngày qua' },
  { id: 'last30',    label: '30 ngày qua' },
];

export const GlobalFilter = () => {
  const dispatch = useDispatch();
  const { user, allocation, locationId: selectedLocationId, userLocationId, isAutoSelected } = useSelector(
    (state) => state.filter
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const isVisible = useScrollVisibility(150);

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

  // Lấy locationId hiệu lực (bỏ qua loc_all)
  const effectiveLocationId = selectedLocationId !== 'loc_all' ? selectedLocationId : userLocationId;

  // Đồng bộ LocationStats + ZoneStats
  const handleSync = async () => {
    if (!effectiveLocationId || isSyncing) return;

    setIsSyncing(true);
    try {
      // 1. Đồng bộ LocationStats
      await syncLocationStats(effectiveLocationId);

      // 2. Lấy danh sách zone rồi đồng bộ từng zone song song
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

      showCompactSuccessAlert({ title: 'Đồng bộ thành công', text: 'Dữ liệu đã được cập nhật.' });
    } catch (err) {
      showCompactErrorAlert({ title: 'Đồng bộ thất bại', text: err?.message || 'Vui lòng thử lại.' });
    } finally {
      setIsSyncing(false);
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
      className={`sticky top-16 z-20 px-6 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="mx-auto w-full max-w-[1760px]">
        <div className="flex items-center justify-between gap-6 rounded-xl border border-border bg-card px-6 py-3">

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

            {/* Date preset */}
            <FilterSelect
              label="Khoảng thời gian"
              value={datePresetOptions[0].id}
              onChange={() => {}}
              options={datePresetOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2.5">
            {/* Đồng bộ — gọi asyncLocationStats + asyncZoneStats */}
            <button
              onClick={handleSync}
              disabled={isSyncing || !effectiveLocationId}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Đồng bộ dữ liệu thống kê từ AI"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
            </button>

            <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
              <Upload size={15} />
              Nhập POS
            </button>

            <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-accent text-sm font-semibold text-white shadow-sm hover:shadow-accent transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
              <FileText size={15} />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
