import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarDays, Store, ChevronDown, Download, Upload, FileText } from 'lucide-react';
import useScrollVisibility from '@/hooks/useScrollVisibility';
import { setLocation, initializeFilterByUserRole } from '../../redux/slices/global.slice';

// Date preset options
const datePresetOptions = [
  { id: 'today', label: 'Hôm nay', offsetDays: 0 },
  { id: 'yesterday', label: 'Hôm qua', offsetDays: 1 },
  { id: 'last7', label: '7 ngày qua', offsetDays: 6 },
  { id: 'last30', label: '30 ngày qua', offsetDays: 29 }
];

export const GlobalFilter = () => {
  const dispatch = useDispatch();

  // Get user + filter data from global slice only
  const { user, allocation, locationId: selectedLocationId, userLocationId, isAutoSelected } = useSelector(
    (state) => state.filter
  );

  // Auto-hide with higher threshold (150px)
  const isVisible = useScrollVisibility(150);

  // Initialize filter based on user role on component mount
  useEffect(() => {
    if (user && user.role) {
      dispatch(
        initializeFilterByUserRole({
          userRole: user.role,
          userLocationId: user.location_id,
        })
      );
    }
  }, [user, dispatch]);

  const handleLocationChange = (e) => {
    const newLocationId = e.target.value;
    dispatch(setLocation(newLocationId));
  };

  /**
   * Get filtered location options based on user role
   * Uses allocation data fetched from Redux global state
   */
  const getAvailableLocations = () => {
    const locationOptions = [];

    if (user?.role === 'ADMIN_SUPER') {
      locationOptions.push({
        id: 'loc_all',
        name: 'Tất cả cơ sở',
        isDisabled: false,
      });
    }

    // Add current user's allocation location
    if (allocation) {
      const locationOptionId = allocation.location_code || allocation._id || userLocationId;
      const isDisabled =
        (user?.role === 'MANAGER' || user?.role === 'USER') &&
        locationOptionId !== userLocationId;

      locationOptions.push({
        id: locationOptionId,
        name: allocation.name || `Cửa hàng ${locationOptionId}`,
        isDisabled: isDisabled,
      });
    }

    return locationOptions;
  };

  /**
   * Check if user can change location
   * - ADMIN_SUPER: Can change freely
   * - MANAGER/USER: Can only view their own location (disabled from changing)
   * - Others: As per role rules
   */
  const canChangeLocation = (role) => {
    return role === 'ADMIN_SUPER';
  };

  const availableLocations = getAvailableLocations();
  const isLocationDisabled =
    !canChangeLocation(user?.role) && isAutoSelected;

  return (
    <div
      className={`sticky top-16 z-20 px-6 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="mx-auto w-full max-w-[1760px]">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-6 rounded-xl border border-border bg-card px-6 py-3">
          {/* LEFT: Location and Date Selectors */}
          <div className="flex items-center gap-8">
            {/* Location Selector */}
            <div className="flex items-center gap-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
                Cửa hàng
              </label>
              <div className="relative">
                <select
                  value={selectedLocationId || 'loc_all'}
                  onChange={handleLocationChange}
                  disabled={isLocationDisabled}
                  title={isLocationDisabled ? 'Bạn chỉ có thể xem dữ liệu của cửa hàng được gán' : ''}
                  className={`appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm text-foreground outline-none cursor-pointer hover:border-accent/40 transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 ${
                    isLocationDisabled ? 'bg-muted cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {availableLocations.map((location) => (
                    <option key={location.id} value={location.id} disabled={location.isDisabled}>
                      {location.name}{location.isDisabled ? ' (không có quyền truy cập)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date Preset Selector */}
            <div className="flex items-center gap-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
                Khoảng thời gian
              </label>
              <div className="relative">
                <select className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm text-foreground outline-none cursor-pointer hover:border-accent/40 transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15">
                  {datePresetOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
              <Download size={15} />
              Tải xuống
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
