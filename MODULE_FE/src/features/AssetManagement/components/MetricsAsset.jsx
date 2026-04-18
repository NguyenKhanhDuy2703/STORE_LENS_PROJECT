import { Package, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

const MetricsAsset = ({ metric, metricLoading, metricError }) => {
  if (metricLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="col-span-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
          Đang tải metric...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-green-600 font-medium">+12%</span>
        </div>
        <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Tổng sản phẩm</p>
        <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{metric?.totalProduct || 0}</p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-blue-600 font-medium">87.3%</span>
        </div>
        <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Đang kinh doanh</p>
        <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{metric?.activeProduct || 0}</p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-red-600 font-medium">Cảnh báo</span>
        </div>
        <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Hết hàng</p>
        <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{metric?.outOfStockProduct || 0}</p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-green-600 font-medium">+5.2%</span>
        </div>
        <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Giá trị kho</p>
        <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{formatCurrency(metric?.totalInventoryValue || 0)}</p>
      </div>
    </div>
  );
};

export default MetricsAsset;
