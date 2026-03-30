import React from 'react';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

const StatsCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Doanh thu */}
    <div className="bg-white border border-gray-100 rounded-xl p-6 flex justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase mb-2">TỔNG DOANH THU</p>
        <h2 className="text-4xl font-bold text-gray-800">25.0M</h2>
      </div>
      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
        <DollarSign size={24} />
      </div>
    </div>

    {/* Khách hàng */}
    <div className="bg-white border border-gray-100 rounded-xl p-6 flex justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase mb-2">TỔNG KHÁCH HÀNG</p>
        <h2 className="text-4xl font-bold text-gray-800">1.3K</h2>
      </div>
      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-500">
        <Users size={24} />
      </div>
    </div>

    {/* Chuyển đổi */}
    <div className="bg-white border border-gray-100 rounded-xl p-6 flex justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase mb-2">TỶ LỆ CHUYỂN ĐỔI</p>
        <h2 className="text-4xl font-bold text-gray-800">12.5%</h2>
      </div>
      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-400">
        <TrendingUp size={24} />
      </div>
    </div>

    {/* Live Status */}
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        <span className="text-emerald-600 text-xs font-bold">LIVE</span>
      </div>
      <p className="text-gray-500 text-[11px] font-bold uppercase mb-1">KHÁCH HIỆN TẠI TRONG CỬA HÀNG</p>
      <h2 className="text-4xl font-bold text-gray-800 mb-1">42</h2>
      <p className="text-gray-400 text-[10px] mb-4">Cập nhật 20:42:47</p>
      
      <p className="text-gray-500 text-[11px] font-bold uppercase mb-1">CHỜ TẠI QUẦY</p>
      <h2 className="text-2xl font-bold text-gray-800">8</h2>
    </div>
  </div>
);

export default StatsCards;