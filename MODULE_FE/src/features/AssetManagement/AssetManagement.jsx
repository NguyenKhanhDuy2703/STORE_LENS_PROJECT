import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { fetchAssets, addOrUpdateAssetThunk, deleteAssetThunk, fetchAssetMetricThunk } from './asset.thunk';
import { clearSuccessMessage } from './asset.slice';
import MetricsAsset from './components/MetricsAsset';
import FormAddOrUpdate from './components/FormAddOrUpdate';
import TableAssets from './components/TableAssets';
import {
  showErrorAlert,
  showWarningAlert,
  showSuccessAlert,
  showConfirmDeleteAlert,
  showCompactSuccessAlert,
  showCompactErrorAlert,
} from '../../utils/swal';

const PAGE_SIZE = 5;

const createEmptyAssetForm = (locationId = '') => ({
  locationId,
  product_id: '',
  category_name: '',
  name_product: '',
  zone_name: '',
  brand: '',
  price: '',
  unit: '',
  stock_quantity: '',
  status: true,
  asset_attributes: {
    maintenance_date: '',
    color: '',
    custom_note: '',
  },
});

const FALLBACK_CATEGORY_OPTIONS = ['Nhóm mặc định'];
const FALLBACK_ZONE_OPTIONS = ['Khu vực mặc định'];


const AssetManagement = () => {
  const dispatch = useDispatch();
  
  // ✅ Lấy locationId từ global filter state
  const locationId = useSelector(state => state.filter.locationId);
  
  // ✅ Lấy asset data từ Redux store
  const { listAsset, isLoading, error, isSaving, saveError, metric, metricLoading, metricError } = useSelector(state => state.asset);

  // ✅ Local component state: filter & modal
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (locationId) {
      dispatch(fetchAssets({
        locationId: locationId,
        categoryName: 'all',
        zoneId: 'all',
        page: 1,
        limit: 100,
      }));

      dispatch(fetchAssetMetricThunk(locationId));
    }
  }, [locationId, dispatch]);

  useEffect(() => {
    if (saveError) {
      showErrorAlert({
        title: 'Lưu thất bại',
        text: saveError,
      });
    }
  }, [saveError]);

  useEffect(() => {
    if (metricError) {
      showErrorAlert({
        title: 'Không tải được metric',
        text: metricError,
      });
    }
  }, [metricError]);
  const categories = useMemo(() => {
    const derived = [...new Set(listAsset.map((item) => item.category_name).filter(Boolean))];
    return derived.length > 0 ? derived : FALLBACK_CATEGORY_OPTIONS;
  }, [listAsset]);
  const zones = useMemo(() => {
    const derived = [...new Set(listAsset.map((item) => item.zone_name).filter(Boolean))];
    return derived.length > 0 ? derived : FALLBACK_ZONE_OPTIONS;
  }, [listAsset]);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return listAsset.filter((product) => {
      const matchedKeyword =
        keyword === '' ||
        product.name_product.toLowerCase().includes(keyword) ||
        product.product_id.toLowerCase().includes(keyword);
      const matchedCategory = selectedCategory === 'all' || product.category_name === selectedCategory;
      const matchedZone = selectedZone === 'all' || product.zone_name === selectedZone;
      return matchedKeyword && matchedCategory && matchedZone;
    });
  }, [listAsset, searchTerm, selectedCategory, selectedZone]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const openCreateModal = () => {
    setIsCreateMode(true);
    const emptyForm = createEmptyAssetForm(locationId);
    emptyForm.category_name = categories[0] || '';
    emptyForm.zone_name = zones[0] || '';
    setEditingProduct(emptyForm);
    setShowEditModal(true);
  };

  const handleEdit = (product) => {
    setIsCreateMode(false);
    setEditingProduct({
      locationId,
      product_id: product.product_id || '',
      category_name: product.category_name || '',
      name_product: product.name_product || '',
      zone_name: product.zone_name || '',
      brand: product.brand || '',
      price: product.price ?? '',
      unit: product.unit || '',
      stock_quantity: product.stock_quantity ?? '',
      status: Boolean(product.status),
      asset_attributes: product.asset_attributes || {
        maintenance_date: '',
        color: '',
        custom_note: '',
      },
    });
    setShowEditModal(true);
  };

  const handleAssetFieldChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAssetAttributeChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      asset_attributes: {
        ...(prev?.asset_attributes || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async () => {
    if (!locationId || !editingProduct?.product_id || !editingProduct?.category_name || !editingProduct?.name_product) {
      showWarningAlert({
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập mã định danh, nhóm phân loại và tên hiển thị.',
      });
      return;
    }

    try {
      await dispatch(addOrUpdateAssetThunk({
        ...editingProduct,
        locationId,
      })).unwrap();

      await dispatch(fetchAssets({
        locationId,
        categoryName: 'all',
        zoneId: 'all',
        page: 1,
        limit: 100,
      })).unwrap();

      setShowEditModal(false);
      setEditingProduct(null);
      setIsCreateMode(false);
      dispatch(clearSuccessMessage());

      showSuccessAlert({
        title: isCreateMode ? 'Đã thêm tài sản' : 'Đã cập nhật tài sản',
        text: isCreateMode ? 'Tài sản mới đã được lưu lên BE.' : 'Thông tin tài sản đã được cập nhật lên BE.',
      });
    } catch (error) {
      showErrorAlert({
        title: isCreateMode ? 'Thêm thất bại' : 'Cập nhật thất bại',
        text: error?.message || 'Không thể lưu tài sản.',
      });
    }
  };

  const handleDelete = async (product) => {
    const result = await showConfirmDeleteAlert();

    if (result.isConfirmed) {
      try {
        const deleteResult = await dispatch(deleteAssetThunk({
          locationId: product.location_id,
          assetId: product.product_id,
        })).unwrap();

        showCompactSuccessAlert({
          title: 'Đã xóa',
          text: 'Sản phẩm đã được xóa thành công.',
        });

        dispatch(fetchAssets({
          locationId,
          page: currentPage,
          limit: PAGE_SIZE,
        }));

        if (locationId && locationId !== 'all') {
          dispatch(fetchAssetMetricThunk(locationId));
        }
      } catch (error) {
        showCompactErrorAlert({
          title: 'Lỗi',
          text: error || 'Không thể xóa sản phẩm. Vui lòng thử lại.',
        });
      }
    }
  };

  const goToPage = (pageNum) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, pageNum)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md text-center shadow-sm border border-red-200">
          <p className="text-red-600 font-medium mb-2">⚠️ Lỗi tải dữ liệu</p>
          <p className="text-slate-600 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => {
              showErrorAlert({
                title: 'Không tải được dữ liệu',
                text: error,
              });
            }}
            className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[96rem] mx-auto px-2 sm:px-3 py-4">
        <MetricsAsset metric={metric} metricLoading={metricLoading} metricError={metricError} />

        <div className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
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

            <div className="relative sm:w-52">
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

            <div className="relative sm:w-52">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả vùng</option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={!locationId}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300 sm:ml-auto"
            >
              Thêm tài sản
            </button>
          </div>
        </div>

        <TableAssets
          pagedProducts={pagedProducts}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedZone={selectedZone}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGoToPage={goToPage}
        />
      </div>

      <FormAddOrUpdate
        isOpen={showEditModal}
        isCreateMode={isCreateMode}
        editingProduct={editingProduct}
        isSaving={isSaving}
        categoryOptions={categories}
        zoneOptions={zones}
        onClose={() => {
          setShowEditModal(false);
          setIsCreateMode(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveEdit}
        onFieldChange={handleAssetFieldChange}
        onAttributeChange={handleAssetAttributeChange}
      />
    </div>
  );
};

export default AssetManagement;