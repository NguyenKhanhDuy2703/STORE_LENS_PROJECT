import { useState } from 'react';
import { CalendarDays, Store, ChevronDown, Download, Upload, FileText } from 'lucide-react';
import useScrollVisibility from '@/hooks/useScrollVisibility';

// Mock data for locations
const locations = [
  { id: 'loc_all', label: 'Tất cả cơ sở' },
  { id: 'loc_q1', label: 'Gym Quận 1' },
  { id: 'loc_q7', label: 'Gym Quận 7' }
];

// Mock data for date presets
const datePresetOptions = [
  { id: 'today', label: 'Hôm nay', offsetDays: 0 },
  { id: 'yesterday', label: 'Hôm qua', offsetDays: 1 },
  { id: 'last7', label: '7 ngày qua', offsetDays: 6 },
  { id: 'last30', label: '30 ngày qua', offsetDays: 29 }
];

export const GlobalFilter = () => {
  // Filter state
  const [locationId, setLocationId] = useState('loc_all');
  const [selectedPreset, setSelectedPreset] = useState('today');

  // Auto-hide with higher threshold (150px)
  const isVisible = useScrollVisibility(150);

  const handleLocationChange = (e) => {
    setLocationId(e.target.value);
  };

  const handleDatePresetChange = (e) => {
    setSelectedPreset(e.target.value);
  };

  return (
    <div className={`sticky top-16 z-30 px-6 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="mx-auto w-full max-w-[1760px]">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-6 rounded-lg border border-slate-200 bg-white px-6 py-3.5">
          
          {/* LEFT: Location and Date Selectors */}
          <div className="flex items-center gap-8">
            
            {/* Location Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Cửa hàng</label>
              <div className="relative">
                <select
                  value={locationId}
                  onChange={handleLocationChange}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Preset Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Khoảng thời gian</label>
              <div className="relative">
                <select
                  value={selectedPreset}
                  onChange={handleDatePresetChange}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
                >
                  {datePresetOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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