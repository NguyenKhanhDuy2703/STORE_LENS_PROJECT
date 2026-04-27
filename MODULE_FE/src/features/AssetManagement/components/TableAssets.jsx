import { Edit2, Package, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import Pagination from '../../../components/common/Pagination';

const TableAssets = ({
  pagedProducts,
  searchTerm,
  selectedCategory,
  selectedZone,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onEdit,
  onDelete,
  onGoToPage,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-medium text-slate-500 tracking-tight">
              <th className="text-left py-2 px-3 border-r border-slate-200">Mã SP</th>
              <th className="text-left py-2 px-3 border-r border-slate-200">Tên sản phẩm</th>
              <th className="text-left py-2 px-3 border-r border-slate-200">Danh mục</th>
              <th className="text-left py-2 px-3 border-r border-slate-200">Vùng</th>
              <th className="text-left py-2 px-3 border-r border-slate-200">Thương hiệu</th>
              <th className="text-right py-2 px-3 border-r border-slate-200">Giá bán</th>
              <th className="text-center py-2 px-3 border-r border-slate-200">Tồn kho</th>
              <th className="text-center py-2 px-3 border-r border-slate-200">Trạng thái</th>
              <th className="text-center py-2 px-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.length > 0 ? (
              pagedProducts.map((product) => (
                <tr key={product.product_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-3">
                    <span className="text-xs text-teal-600 font-medium tracking-tight tabular-nums bg-teal-50 px-2 py-0.5 rounded">
                      {product.product_id}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate tracking-tight">{product.name_product}</p>
                        <p className="text-xs text-slate-500">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200 tracking-tight">
                      {product.category_name}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium border border-teal-200 tracking-tight">
                      {product.zone_name || 'Chưa gán vùng'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-sm text-slate-700 font-medium tracking-tight">{product.brand}</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="font-medium text-sm text-slate-900 tracking-tight tabular-nums">{formatCurrency(product.price)}</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`font-medium text-base tracking-tight tabular-nums ${
                        product.stock_quantity === 0
                          ? 'text-red-600'
                          : product.stock_quantity < 100
                            ? 'text-orange-600'
                            : 'text-green-600'
                      }`}
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                        product.status
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {product.status ? '✓ Đang bán' : '⊗ Ngưng'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(product)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(product)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 tracking-tight">
                      {searchTerm || selectedCategory !== 'all' || selectedZone !== 'all'
                        ? 'Không tìm thấy sản phẩm phù hợp'
                        : 'Chưa có sản phẩm'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onGoToPage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default TableAssets;
