import React from 'react';
import RouteItem from './RouteItem';

const routesData = [
  { from: "Lối vào chính", to: "Quầy thanh toán", percent: "45.8%" },
  { from: "Lối vào chính", to: "Khu vực giảm giá", percent: "32.5%" },
  { from: "Khu vực giảm giá", to: "Quầy thanh toán", percent: "38.2%" },
  { from: "Mỹ phẩm cao cấp", to: "Lối vào chính", percent: "12.4%" },
  { from: "Đồ chơi trẻ em", to: "Quầy thanh toán", percent: "25.1%" },
  { from: "Nội thất lớn", to: "Khu vực giảm giá", percent: "18.9%" },
  { from: "Khu vực giảm giá", to: "Mỹ phẩm cao cấp", percent: "22.3%" },
  { from: "Lối vào chính", to: "Đồ chơi trẻ em", percent: "30.5%" },
  { from: "Mỹ phẩm cao cấp", to: "Quầy thanh toán", percent: "29.7%" },
];

const MovementRoutes = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      <h3 className="font-bold text-lg mb-4">Tuyến đường di chuyển</h3>
      
      <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase mb-3 px-2">
        <span>Tuyến đường</span>
        <span>Độ tin</span>
      </div>

      {/* Container có thanh cuộn */}
      <div className="space-y-3 overflow-y-auto pr-2 max-h-[350px] custom-scrollbar">
        {routesData.map((route, index) => (
          <RouteItem 
            key={index}
            from={route.from} 
            to={route.to} 
            percent={route.percent} 
          />
        ))}
      </div>
    </div>
  );
};

export default MovementRoutes;