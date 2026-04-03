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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <h3 className="font-medium tracking-tight text-lg mb-6 text-slate-900">Tuyến Đường Di Chuyển</h3>
      
      <div className="flex justify-between text-xs font-medium text-slate-400 tracking-tight mb-4 px-2">
        <span>Tuyến Đường</span>
        <span>Độ Tin Cậy</span>
      </div>

      {/* Scrollable container */}
      <div className="space-y-2.5 overflow-y-auto pr-2 max-h-[350px]">
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