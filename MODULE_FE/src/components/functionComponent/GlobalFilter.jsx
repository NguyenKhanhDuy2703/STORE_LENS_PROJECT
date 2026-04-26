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
        <div className="flex items-center justify-between gap-6 rounded-lg border border-slate-200 bg-white px-6 py-3.5">
          {/* LEFT: Location and Date Selectors */}
          <div className="flex items-center gap-8">
            {/* Location Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Cửa hàng
              </label>
              <div className="relative">
                <select
                  value={selectedLocationId || 'loc_all'}
                  onChange={handleLocationChange}
                  disabled={isLocationDisabled}
                  title={
                    isLocationDisabled
                      ? 'Bạn chỉ có thể xem dữ liệu của cửa hàng được gán'
                      : ''
                  }
                  className={`appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-100 ${
                    isLocationDisabled
                      ? 'bg-slate-100 cursor-not-allowed opacity-60'
                      : ''
                  }`}
                >
                  {availableLocations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                      disabled={location.isDisabled}
                    >
                      {location.name}
                      {location.isDisabled ? ' (không có quyền truy cập)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Date Preset Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Khoảng thời gian
              </label>
              <div className="relative">
                <select className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-100">
                  {datePresetOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Download size={16} />
              Dùng bộ
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Upload size={16} />
              Import POS
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-sm font-medium text-white hover:bg-teal-500 transition-colors">
              <FileText size={16} />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
