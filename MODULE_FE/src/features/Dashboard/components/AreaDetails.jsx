import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock zones data - aligned with DB schema: zone_id, zone_name
const topZones = [
  { zone_id: 'zone_001', zone_name: 'Lối vào chính', traffic: 890, trend: 'up' },
  { zone_id: 'zone_002', zone_name: 'Quầy thanh toán', traffic: 756, trend: 'neutral' },
  { zone_id: 'zone_003', zone_name: 'Khu vực giảm giá', traffic: 723, trend: 'up' },
  { zone_id: 'zone_004', zone_name: 'Mỹ phẩm cao cấp', traffic: 654, trend: 'down' },
  { zone_id: 'zone_005', zone_name: 'Đồ chơi trẻ em', traffic: 521, trend: 'up' },
  { zone_id: 'zone_006', zone_name: 'Khu thực phẩm tươi', traffic: 485, trend: 'up' },
  { zone_id: 'zone_007', zone_name: 'Thời trang Nam', traffic: 412, trend: 'neutral' },
  { zone_id: 'zone_008', zone_name: 'Đồ gia dụng thông minh', traffic: 398, trend: 'up' },
  { zone_id: 'zone_009', zone_name: 'Giày dép & Phụ kiện', traffic: 345, trend: 'down' },
  { zone_id: 'zone_010', zone_name: 'Khu vực Food Court', traffic: 310, trend: 'up' },
];

// Performance data - zone metrics aligned with schema
const performanceData = [
  { zone_id: 'zone_001', zone_name: 'Khu vực giảm giá', dwell_time: '19 phút', conversion_rate: 45, color: '#0d9488' },
  { zone_id: 'zone_002', zone_name: 'Mỹ phẩm cao cấp', dwell_time: '12 phút', conversion_rate: 38, color: '#f59e0b' },
  { zone_id: 'zone_003', zone_name: 'Quầy thanh toán', dwell_time: '8 phút', conversion_rate: 92, color: '#6366f1' },
  { zone_id: 'zone_004', zone_name: 'Đồ chơi trẻ em', dwell_time: '25 phút', conversion_rate: 28, color: '#ec4899' },
  { zone_id: 'zone_005', zone_name: 'Khu quần áo', dwell_time: '15 phút', conversion_rate: 22, color: '#8b5cf6' },
  { zone_id: 'zone_006', zone_name: 'Thiết bị điện tử', dwell_time: '30 phút', conversion_rate: 15, color: '#3b82f6' },
  { zone_id: 'zone_007', zone_name: 'Đồ gia dụng', dwell_time: '14 phút', conversion_rate: 31, color: '#06b6d4' },
  { zone_id: 'zone_008', zone_name: 'Thực phẩm đông lạnh', dwell_time: '6 phút', conversion_rate: 55, color: '#14b8a6' },
];

const TopZones = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[480px] flex flex-col">
    <h3 className="text-base font-medium tracking-tight text-slate-900 mb-6">
      Khu Vực Lưu Lượng Cao
    </h3>
    
    <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-slate-200">
      {topZones.map((zone, idx) => {
        const TrendIcon = zone.trend === 'up' ? TrendingUp : zone.trend === 'down' ? TrendingDown : null;
        return (
          <div
            key={zone.zone_id}
            className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-slate-400 font-medium w-6 text-sm">#{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm">{zone.zone_name}</h4>
                <p className="text-[11px] text-slate-500">Zone ID: {zone.zone_id}</p>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-3 flex-shrink-0">
              <div>
                <span className="text-2xl font-semibold text-slate-900 tabular-nums tracking-tight">
                  {zone.traffic}
                </span>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">Người</p>
              </div>
              {TrendIcon && (
                <TrendIcon
                  size={20}
                  className={zone.trend === 'up' ? 'text-teal-600' : 'text-rose-600'}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Performance = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[480px] flex flex-col">
    <h3 className="text-base font-medium tracking-tight text-slate-900 mb-6">
      Hiệu Suất Chi Tiết
    </h3>
    
    <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-slate-200">
      {performanceData.map((detail) => (
        <div key={detail.zone_id} className="mb-6 group">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{detail.zone_name}</h4>
              <p className="text-[11px] text-slate-500">Zone ID: {detail.zone_id}</p>
            </div>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap ml-2 tracking-tight">
              {detail.dwell_time}
            </span>
          </div>
          
          <div className="flex justify-between text-[11px] text-slate-600 mb-2">
            <span>Tỷ Lệ Chuyển Đổi</span>
            <span className="font-medium tabular-nums tracking-tight" style={{ color: detail.color }}>
              {detail.conversion_rate}%
            </span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${detail.conversion_rate}%`, backgroundColor: detail.color }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AreaDetails = {
  TopZones,
  Performance,
};

export default AreaDetails;