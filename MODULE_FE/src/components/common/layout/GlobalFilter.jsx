import { useState } from 'react';
import { CalendarDays, Database, Download, Store, Upload } from 'lucide-react';

// Dữ liệu giả cho các cơ sở
const locations = [
  { id: 'loc_all', label: 'Tất cả cơ sở' },
  { id: 'loc_q1', label: 'Gym Quận 1' },
  { id: 'loc_q7', label: 'Gym Quận 7' }
];

// Dữ liệu giả cho các khoảng thời gian
const datePresetOptions = [
  { id: 'today', label: 'Hôm nay', offsetDays: 0 },
  { id: 'yesterday', label: 'Hôm qua', offsetDays: 1 },
  { id: 'last7', label: '7 ngày qua', offsetDays: 6 },
  { id: 'last30', label: '30 ngày qua', offsetDays: 29 }
];

// Hàm tính toán ngày giả định
const getDateByOffset = (offsetDays) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - offsetDays);
  return now.toISOString().split('T')[0];
};

export const GlobalFilter = () => {
  // THAY THẾ REDUX BẰNG LOCAL STATE
  const [locationId, setLocationId] = useState('loc_all');
  const [selectedPreset, setSelectedPreset] = useState('today');

  const handleLocationChange = (event) => {
    setLocationId(event.target.value);
    console.log("Cơ sở đã chọn:", event.target.value);
  };

  const handleDatePresetChange = (event) => {
    setSelectedPreset(event.target.value);
    console.log("Thời gian đã chọn:", event.target.value);
  };

  return (
    <section className="mt-4 mb-4">
      {/* Container với glassmorphism nhẹ nhàng */}
      <div className="rounded-full border border-slate-200 bg-white/90 px-6 py-2 shadow-lg shadow-slate-100/50 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 lg:gap-6">
          
          {/* Selector Cơ sở */}
          <div className="flex items-center gap-2 shrink-0">
            <Store size={16} className="text-teal-500" />
            <span className="text-sm font-bold text-slate-700">Cửa hàng</span>
            <select
              value={locationId}
              onChange={handleLocationChange}
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
            >
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.label}</option>
              ))}
            </select>
          </div>

          {/* Selector Thời gian */}
          <div className="flex items-center gap-2 shrink-0">
            <CalendarDays size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-slate-700">Khoảng thời gian</span>
            <select
              value={selectedPreset}
              onChange={handleDatePresetChange}
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
            >
              {datePresetOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Các nút chức năng bổ trợ (Chỉ hiển thị cho đẹp) */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Đang đồng bộ dữ liệu...")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95"
            >
              <Database size={15} />
              Đồng bộ
            </button>
            
            <button
              type="button"
              onClick={() => alert("Chức năng Import POS đang phát triển")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95"
            >
              <Upload size={15} />
              Import POS
            </button>
            
            <button
              type="button"
              onClick={() => alert("Đang chuẩn bị tệp báo cáo...")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 text-xs font-bold text-teal-700 transition hover:bg-teal-100 active:scale-95 shadow-sm shadow-teal-100"
            >
              <Download size={15} />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};