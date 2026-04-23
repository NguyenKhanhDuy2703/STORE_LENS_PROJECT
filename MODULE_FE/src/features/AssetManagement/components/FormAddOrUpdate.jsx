import { X, Save } from 'lucide-react';

const FormAddOrUpdate = ({
  isOpen,
  isCreateMode,
  editingProduct,
  isSaving,
  categoryOptions = [],
  zoneOptions = [],
  onClose,
  onSave,
  onFieldChange,
  onAttributeChange,
}) => {
  if (!isOpen || !editingProduct) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-medium tracking-tight text-slate-900">
            {isCreateMode ? 'Tạo bản ghi tài nguyên' : 'Cập nhật bản ghi tài nguyên'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-132px)] overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Mã định danh</label>
              <input
                type="text"
                value={editingProduct.product_id}
                onChange={(e) => onFieldChange('product_id', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Nhóm phân loại</label>
              <select
                value={editingProduct.category_name || ''}
                onChange={(e) => onFieldChange('category_name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="">-- Chọn nhóm phân loại --</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Tên hiển thị</label>
              <input
                type="text"
                value={editingProduct.name_product}
                onChange={(e) => onFieldChange('name_product', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Khu vực áp dụng</label>
              <select
                value={editingProduct.zone_name || ''}
                onChange={(e) => onFieldChange('zone_name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="">-- Chọn khu vực áp dụng --</option>
                {zoneOptions.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Nhãn / Nguồn gốc</label>
              <input
                type="text"
                value={editingProduct.brand}
                onChange={(e) => onFieldChange('brand', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Đơn vị</label>
              <input
                type="text"
                value={editingProduct.unit}
                onChange={(e) => onFieldChange('unit', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Giá trị ước tính</label>
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) => onFieldChange('price', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Số lượng khả dụng</label>
              <input
                type="number"
                value={editingProduct.stock_quantity}
                onChange={(e) => onFieldChange('stock_quantity', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Trạng thái</label>
              <select
                value={editingProduct.status ? 'active' : 'inactive'}
                onChange={(e) => onFieldChange('status', e.target.value === 'active')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="active">Kích hoạt</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-medium text-slate-900 mb-3">Thông tin bổ sung</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Ngày kiểm tra / bảo trì</label>
                <input
                  type="text"
                  value={editingProduct.asset_attributes?.maintenance_date || ''}
                  onChange={(e) => onAttributeChange('maintenance_date', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Màu sắc</label>
                <input
                  type="text"
                  value={editingProduct.asset_attributes?.color || ''}
                  onChange={(e) => onAttributeChange('color', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Ghi chú</label>
                <input
                  type="text"
                  value={editingProduct.asset_attributes?.custom_note || ''}
                  onChange={(e) => onAttributeChange('custom_note', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors tracking-tight"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors flex items-center gap-2 tracking-tight disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : (isCreateMode ? 'Thêm tài sản' : 'Lưu thay đổi')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormAddOrUpdate;
