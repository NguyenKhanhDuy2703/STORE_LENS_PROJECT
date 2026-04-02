import { useState } from 'react';
import { Clock, Zap, BarChart3 } from 'lucide-react';

// 1. Import Components (Đảm bảo các file này cũng đã được bạn sửa bỏ Redux như tôi hướng dẫn trước đó)
import StatCard from './components/StatCard';
import BarLineChart from './components/BarLineChart';
import ZoneTableDownTime from './components/ZoneTableDownTime'; // Đổi tên cho đúng file thực tế
import RevenueEfficiency from './components/RevenueEfficiencyTable';

// Hàm format thời gian nội bộ
const formatSecondsLocal = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const Downtime = () => {
  // 1. DỮ LIỆU GIẢ CHO KPI (MOCK DATA)
  const mockKPIs = {
    max: { value: 1240, zone: "Khu vực Máy chạy", change: 15 },
    min: { value: 45, zone: "Quầy lễ tân", change: -8 },
    avg: { value: 385, zone: "Trung bình hệ thống", change: 5 }
  };

  const [kpis] = useState(mockKPIs);
  const [isLoadingKPI] = useState(false); // Luôn tắt loading để hiện UI ngay

  if (isLoadingKPI) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu phân tích...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 pb-20 bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* 2. TOP SECTION: STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard 
            title="TG dừng TB lâu nhất" 
            value={formatSecondsLocal(kpis.max.value)} 
            subtitle={kpis.max.zone} 
            change={kpis.max.change} 
            icon={<Clock className="w-6 h-6" />} 
        />
        <StatCard 
            title="TG dừng TB ngắn nhất" 
            value={formatSecondsLocal(kpis.min.value)} 
            subtitle={kpis.min.zone} 
            change={kpis.min.change} 
            icon={<Zap className="w-6 h-6" />} 
        />
        <StatCard 
            title="TB toàn cửa hàng" 
            value={formatSecondsLocal(kpis.avg.value)} 
            subtitle={kpis.avg.zone} 
            change={kpis.avg.change} 
            icon={<BarChart3 className="w-6 h-6" />} 
        />
      </div>

      {/* 3. MIDDLE SECTION: CHART & ZONE TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart Container */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-2 md:p-4 hover:shadow-md transition-shadow"> 
            <div className="h-[400px] md:h-[450px] w-full"> 
                <BarLineChart />
            </div>
          </div>

          {/* Detailed List Container */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"> 
            <div className="h-[400px] md:h-[450px] w-full overflow-y-auto custom-scrollbar p-2"> 
                <ZoneTableDownTime />
            </div>
          </div>
      </div>

      {/* 4. BOTTOM SECTION: REVENUE TABLE */}
      <div className="w-full mt-2 transition-all hover:translate-y-[-4px]">
          <RevenueEfficiency />
      </div>

    </div>
  );
};

export default Downtime;