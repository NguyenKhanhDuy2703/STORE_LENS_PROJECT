import React from 'react';

const topAreas = [
  { id: 1, name: 'Lối vào chính', traffic: 890, trend: 'up', status: 'Cực đông' },
  { id: 2, name: 'Quầy thanh toán', traffic: 756, trend: 'stable', status: 'Đang đợi' },
  { id: 3, name: 'Khu vực giảm giá', traffic: 723, trend: 'up', status: 'Sôi nổi' },
  { id: 4, name: 'Mỹ phẩm cao cấp', traffic: 654, trend: 'down', status: 'Ổn định' },
  { id: 5, name: 'Đồ chơi trẻ em', traffic: 521, trend: 'up', status: 'Tăng trưởng' },
  { id: 6, name: 'Khu thực phẩm tươi', traffic: 485, trend: 'up', status: 'Giờ cao điểm' },
  { id: 7, name: 'Thời trang Nam', traffic: 412, trend: 'stable', status: 'Bình thường' },
  { id: 8, name: 'Đồ gia dụng thông minh', traffic: 398, trend: 'up', status: 'Hot' },
  { id: 9, name: 'Giày dép & Phụ kiện', traffic: 345, trend: 'down', status: 'Thưa khách' },
  { id: 10, name: 'Khu vực Food Court', traffic: 310, trend: 'up', status: 'Đang tăng' },
  { id: 11, name: 'Quầy dịch vụ khách hàng', traffic: 120, trend: 'stable', status: 'Ít' },
];

const areaDetails = [
  { name: 'Khu vực giảm giá', time: '19 phút', rate: 45, color: '#10b981', category: 'Promotion' },
  { name: 'Mỹ phẩm cao cấp', time: '12 phút', rate: 38, color: '#f59e0b', category: 'Luxury' },
  { name: 'Quầy thanh toán', time: '8 phút', rate: 92, color: '#6366f1', category: 'Service' },
  { name: 'Đồ chơi trẻ em', time: '25 phút', rate: 28, color: '#ec4899', category: 'Family' },
  { name: 'Khu quần áo', time: '15 phút', rate: 22, color: '#8b5cf6', category: 'Fashion' },
  { name: 'Thiết bị điện tử', time: '30 phút', rate: 15, color: '#3b82f6', category: 'Tech' },
  { name: 'Đồ gia dụng', time: '14 phút', rate: 31, color: '#06b6d4', category: 'Home' },
  { name: 'Thực phẩm đông lạnh', time: '6 phút', rate: 55, color: '#14b8a6', category: 'Grocery' },
  { name: 'Sách & Văn phòng phẩm', time: '22 phút', rate: 19, color: '#f43f5e', category: 'Hobby' },
  { name: 'Thời trang Thể thao', time: '18 phút', rate: 26, color: '#f97316', category: 'Sports' },
];
const AreaDetails = () => (
    <>
        {/* Khu vực hàng đầu */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[480px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Khu Vực Lưu Lượng Cao</h3>
            <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {topAreas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-xl transition-colors group">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-bold w-6">#{area.id}</span>
                            <div>
                                <h4 className="font-bold text-gray-700">{area.name}</h4>
                                <p className="text-[11px] text-gray-400">Độ ưu tiên cao</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-emerald-600 font-black text-xl">{area.traffic}</span>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">người</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chi tiết hiệu suất */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[480px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Hiệu Suất Chi Tiết</h3>
            <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {areaDetails.map((detail, idx) => (
                    <div key={idx} className="mb-6 group">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-700 text-sm">{detail.name}</h4>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{detail.time}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                            <span>Tỷ lệ chuyển đổi</span>
                            <span className="font-bold" style={{ color: detail.color }}>{detail.rate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${detail.rate}%`, backgroundColor: detail.color }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </>
);

export default AreaDetails;