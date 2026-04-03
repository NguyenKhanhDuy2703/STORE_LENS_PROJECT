import  { useMemo } from 'react';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

const StatsCards = () => {
  const mockStats = useMemo(() => {
    return {
      total_revenue: 25000000, 
      total_customers: 1300,
      conversion_rate: 12.5,
      current_visitors: 42,
      waiting_queue: 8,
    };
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const formatNumber = (value) => {
    return value.toLocaleString('vi-VN');
  };

  const MetricCard = ({ label, value, icon: Icon, iconBg }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-2">{label}</p>
        <h2 className="text-4xl font-semibold text-slate-900 tabular-nums tracking-tight">{value}</h2>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <MetricCard
        label="Tổng Doanh Thu"
        value={formatCurrency(mockStats.total_revenue)}
        icon={DollarSign}
        iconBg="bg-teal-600"
      />

      {/* Total Customers */}
      <MetricCard
        label="Tổng Khách Hàng"
        value={formatNumber(mockStats.total_customers)}
        icon={Users}
        iconBg="bg-teal-600"
      />

      {/* Conversion Rate */}
      <MetricCard
        label="Tỷ Lệ Chuyển Đổi"
        value={`${mockStats.conversion_rate.toFixed(1)}%`}
        icon={TrendingUp}
        iconBg="bg-teal-600"
      />

      {/* Live Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-teal-600"></div>
          <span className="text-teal-600 text-[10px] font-medium tracking-tight">Live</span>
        </div>
        
        <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-1">Khách Hiện Tại</p>
        <h2 className="text-4xl font-semibold text-slate-900 mb-2 tabular-nums tracking-tight">{mockStats.current_visitors}</h2>
        
        <p className="text-[9px] text-slate-500 mb-4">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
        
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-medium text-slate-400 tracking-tight mb-2">Chờ Tại Quầy</p>
          <h3 className="text-2xl font-semibold text-slate-900 tabular-nums tracking-tight">{mockStats.waiting_queue}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;