import { useMemo, useState } from 'react';
import { Search, Edit2, Trash2, Package, TrendingUp, TrendingDown, Filter, ChevronDown, X, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const MOCK_PRODUCTS = [
  {
    product_id: 'SP001',
    name_product: 'Sữa tươi không đường',
    category_name: 'Đồ uống',
    brand: 'Vinamilk',
    unit: 'Hộp',
    price: 32000,
    stock_quantity: 120,
    status: true,
  },
  {
    product_id: 'SP002',
    name_product: 'Nước khoáng',
    category_name: 'Đồ uống',
    brand: 'Lavie',
    unit: 'Chai',
    price: 10000,
    stock_quantity: 80,
    status: true,
  },
  {
    product_id: 'SP003',
    name_product: 'Bánh quy bơ',
    category_name: 'Bánh kẹo',
    brand: 'Cosy',
    unit: 'Hộp',
    price: 55000,
    stock_quantity: 25,
    status: true,
  },
  {
    product_id: 'SP004',
    name_product: 'Mì ăn liền vị bò',
    category_name: 'Đồ khô',
    brand: 'Hảo Hảo',
    unit: 'Gói',
    price: 4500,
    stock_quantity: 0,
    status: false,
  },
  {
    product_id: 'SP005',
    name_product: 'Nước rửa tay',
    category_name: 'Gia dụng',
    brand: 'Lifebuoy',
    unit: 'Chai',
    price: 78000,
    stock_quantity: 15,
    status: true,
  },
  {
    product_id: 'SP006',
    name_product: 'Bột giặt',
    category_name: 'Gia dụng',
    brand: 'Ariel',
    unit: 'Túi',
    price: 135000,
    stock_quantity: 60,
    status: true,
  },
  {
    product_id: 'SP007',
    name_product: 'Snack khoai tây',
    category_name: 'Bánh kẹo',
    brand: 'Oishi',
    unit: 'Gói',
    price: 12000,
    stock_quantity: 8,
    status: true,
  },
  {
    product_id: 'SP008',
    name_product: 'Dầu ăn',
    category_name: 'Đồ khô',
    brand: 'Neptune',
    unit: 'Chai',
    price: 69000,
    stock_quantity: 42,
    status: true,
  },
];

const PAGE_SIZE = 5;

const AssetManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    return [...new Set(MOCK_PRODUCTS.map((item) => item.category_name))];
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((product) => {
      const matchedKeyword =
        keyword === '' ||
        product.name_product.toLowerCase().includes(keyword) ||
        product.product_id.toLowerCase().includes(keyword);
      const matchedCategory = selectedCategory === 'all' || product.category_name === selectedCategory;
      return matchedKeyword && matchedCategory;
    });
  }, [searchTerm, selectedCategory]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const inventoryValue = useMemo(() => {
    return MOCK_PRODUCTS.reduce((sum, p) => sum + p.price * p.stock_quantity, 0);
  }, []);

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    // Mock UI only: no API/Redux side effects.
    window.alert('Chế độ mock UI: chưa thực hiện xóa thật.');
  };

  const goToPage = (pageNum) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, pageNum)));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Tổng sản phẩm</p>
            <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{MOCK_PRODUCTS.length}</p>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-blue-600 font-medium">87.3%</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Đang kinh doanh</p>
            <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{MOCK_PRODUCTS.filter((p) => p.status).length}</p>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-red-600 font-medium">Cảnh báo</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Hết hàng</p>
            <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{MOCK_PRODUCTS.filter((p) => p.stock_quantity === 0).length}</p>
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-green-600 font-medium">+5.2%</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight mb-0.5">Giá trị kho</p>
            <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">{formatCurrency(inventoryValue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-medium text-slate-500 tracking-tight">
                  <th className="text-left py-2 px-3 border-r border-slate-200">Mã SP</th>
                  <th className="text-left py-2 px-3 border-r border-slate-200">Tên sản phẩm</th>
                  <th className="text-left py-2 px-3 border-r border-slate-200">Danh mục</th>
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
                        <span className="text-sm text-slate-700 font-medium tracking-tight">{product.brand}</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="font-medium text-sm text-slate-900 tracking-tight tabular-nums">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`font-medium text-base tracking-tight tabular-nums ${
                          product.stock_quantity === 0 ? 'text-red-600' :
                          product.stock_quantity < 100 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                          product.status
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {product.status ? '✓ Đang bán' : '⊗ Ngưng'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(product)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 tracking-tight">Không tìm thấy sản phẩm</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalItems > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-600 tabular-nums tracking-tight">
                Hiển thị <span className="font-medium text-teal-600">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalItems)}</span> / <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ← Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors font-medium ${
                      currentPage === pageNum
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-lg font-medium tracking-tight text-slate-900">Chỉnh sửa sản phẩm (Mock UI)</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Mã sản phẩm</label>
                  <input type="text" value={editingProduct.product_id} disabled className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-tight">Đơn vị</label>
                  <input type="text" value={editingProduct.unit} onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors tracking-tight">
                Hủy
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors flex items-center gap-2 tracking-tight">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;