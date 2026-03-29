import React from 'react';
import { Store, Calendar, RefreshCw, Upload, Download, ChevronDown } from 'lucide-react';

const Header = () => (
  // Thêm sticky, top-0 và z-50 để Header luôn nằm trên cùng khi lướt
  <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Cửa hàng selector */}
        <div className="flex items-center border border-gray-200 rounded-full px-4 py-1.5 cursor-pointer hover:bg-gray-50">
          <Store size={18} className="text-emerald-500 mr-2" />
          <span className="text-sm text-gray-700 mr-4">Cửa hàng</span>
          <div className="flex items-center font-medium text-sm text-gray-900 border-l pl-3">
            Tất cả cơ sở <ChevronDown size={14} className="ml-1 text-gray-400" />
          </div>
        </div>

        {/* Thời gian selector */}
        <div className="flex items-center border border-gray-200 rounded-full px-4 py-1.5 cursor-pointer hover:bg-gray-50">
          <Calendar size={18} className="text-blue-500 mr-2" />
          <span className="text-sm text-gray-700 mr-4">Khoảng thời gian</span>
          <div className="flex items-center font-medium text-sm text-gray-900 border-l pl-3">
            Hôm nay <ChevronDown size={14} className="ml-1 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center text-gray-700 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <RefreshCw size={14} className="mr-2" /> Đồng bộ
        </button>
        <button className="flex items-center text-gray-700 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <Upload size={14} className="mr-2" /> Import POS
        </button>
        <button className="flex items-center bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-emerald-100">
          <Download size={14} className="mr-2" /> Xuất báo cáo
        </button>
      </div>
    </div>
  </header>
);

export default Header;