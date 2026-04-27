import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CameraSummaryCards } from './components/CameraSummaryCards';
import { CameraTable } from './components/CameraTable';
import { CameraUpsertModal } from './components/CameraUpsertModal';
import { CameraFilters } from './components/CameraFilters';
import {
  deleteCameraThunk,
  fetchCameraDashboardThunk,
  upsertCameraThunk,
  turnOnCameraThunk,
  turnOffCameraThunk,
} from './camera.thunk';
import {
  showWarningAlert,
  showConfirmDeleteAlert,
  showCompactErrorAlert,
  showCompactSuccessAlert,
} from '../../utils/swal';

const ManagermentCameraPage = () => {
  const dispatch = useDispatch();
  const { locationId, userLocationId } = useSelector((state) => state.filter);
  // Dùng effectiveLocationId để handle cả ADMIN (loc_all) và user thường
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  const { cameras, metrics, loading, error, togglingCameraCode } = useSelector((state) => state.camera);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [isUpsertSubmitting, setIsUpsertSubmitting] = useState(false);

  useEffect(() => {
    if (effectiveLocationId) {
      dispatch(fetchCameraDashboardThunk(effectiveLocationId));
    }
  }, [dispatch, effectiveLocationId]);

  const safeCameras = useMemo(() => cameras || [], [cameras]);

  const storeOptions = useMemo(() => {
    const stores = safeCameras
      .map((camera) => camera.location_name || camera.storeName || camera.location_id)
      .filter(Boolean);
    return [...new Set(stores)];
  }, [safeCameras]);

  const filteredCameras = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return safeCameras.filter((camera) => {
      const cameraName = (camera.camera_name || camera.name || '').toLowerCase();
      const cameraCode = (camera.camera_code || camera.id || '').toLowerCase();
      const storeName = camera.location_name || camera.storeName || camera.location_id || '';
      const status = camera.status || '';

      const matchedKeyword =
        keyword === '' ||
        cameraName.includes(keyword) ||
        cameraCode.includes(keyword) ||
        storeName.toLowerCase().includes(keyword);

      const matchedStore = selectedStore === 'all' || storeName === selectedStore;
      const matchedStatus = selectedStatus === 'all' || status === selectedStatus;

      return matchedKeyword && matchedStore && matchedStatus;
    });
  }, [safeCameras, searchTerm, selectedStore, selectedStatus]);

  const openCreateModal = () => {
    if (!effectiveLocationId) {
      showWarningAlert({ title: 'Thiếu vị trí', text: 'Vui lòng chọn cửa hàng trước khi thêm camera.' });
      return;
    }
    setEditingCamera(null);
    setIsUpsertModalOpen(true);
  };

  const openEditModal = (camera) => {
    if (!effectiveLocationId) {
      showWarningAlert({ title: 'Thiếu vị trí', text: 'Vui lòng chọn cửa hàng trước khi cập nhật camera.' });
      return;
    }
    setEditingCamera(camera);
    setIsUpsertModalOpen(true);
  };

  const handleCloseUpsertModal = () => {
    if (isUpsertSubmitting) return;
    setIsUpsertModalOpen(false);
    setEditingCamera(null);
  };

  const handleUpsertCamera = async ({ cameraCode, cameraData }) => {
    const isEditMode = Boolean(editingCamera);
    try {
      setIsUpsertSubmitting(true);
      await dispatch(upsertCameraThunk({ cameraCode, cameraData })).unwrap();
      setIsUpsertModalOpen(false);
      setEditingCamera(null);
      showCompactSuccessAlert({
        title: isEditMode ? 'Đã cập nhật camera' : 'Đã thêm camera',
        text: isEditMode ? 'Thông tin camera đã được cập nhật thành công.' : 'Camera mới đã được lưu thành công.',
      });
      await dispatch(fetchCameraDashboardThunk(effectiveLocationId)).unwrap();
    } catch (upsertError) {
      showCompactErrorAlert({
        title: isEditMode ? 'Cập nhật thất bại' : 'Thêm thất bại',
        text: upsertError || (isEditMode ? 'Không thể cập nhật camera.' : 'Không thể thêm camera.'),
      });
    } finally {
      setIsUpsertSubmitting(false);
    }
  };

  const handleDeleteCamera = async (cameraCode) => {
    const result = await showConfirmDeleteAlert({
      title: 'Xóa camera?',
      text: `Bạn có chắc muốn xóa camera ${cameraCode}?`,
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteCameraThunk(cameraCode)).unwrap();
      showCompactSuccessAlert({ title: 'Đã xóa', text: 'Camera đã được xóa thành công.' });
      if (effectiveLocationId) dispatch(fetchCameraDashboardThunk(effectiveLocationId));
    } catch (deleteError) {
      showCompactErrorAlert({ title: 'Xóa thất bại', text: deleteError || 'Không thể xóa camera.' });
    }
  };

  const handleToggleCameraPower = async (camera) => {
    const cameraCode = camera?.camera_code || camera?.id;
    const urlRtsp = camera?.rtsp_url || camera?.rtspUrl;
    const normalizedStatus = String(camera?.status || '').toLowerCase();
    const isCameraRunning = normalizedStatus === 'active' || normalizedStatus === 'online';

    if (!cameraCode || !urlRtsp || !effectiveLocationId) {
      showCompactErrorAlert({
        title: 'Thiếu dữ liệu',
        text: 'Không đủ thông tin camera để thực hiện bật/tắt. Vui lòng chọn cửa hàng.',
      });
      return;
    }

    try {
      if (isCameraRunning) {
        await dispatch(turnOffCameraThunk({ cameraCode, urlRtsp })).unwrap();
      } else {
        await dispatch(turnOnCameraThunk({ cameraCode, urlRtsp, locationId: effectiveLocationId })).unwrap();
      }

      showCompactSuccessAlert({
        title: isCameraRunning ? 'Đã tắt phân tích' : 'Đã bật phân tích',
        text: `Camera ${cameraCode} đã được ${isCameraRunning ? 'tắt' : 'bật'} thành công.`,
      });

      await dispatch(fetchCameraDashboardThunk(effectiveLocationId));
    } catch (toggleError) {
      showCompactErrorAlert({
        title: isCameraRunning ? 'Tắt camera thất bại' : 'Bật camera thất bại',
        text: toggleError || 'Không thể thay đổi trạng thái camera.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="text-center">
          <div className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-base text-slate-600">Đang tải dữ liệu camera...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center">
          <p className="mb-2 text-lg font-medium text-rose-600">Không tải được dữ liệu camera</p>
          <p className="text-base text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1760px] space-y-5">
        <CameraSummaryCards cameras={safeCameras} metrics={metrics} />

        <CameraFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedStore={selectedStore}
          onSelectedStoreChange={setSelectedStore}
          selectedStatus={selectedStatus}
          onSelectedStatusChange={setSelectedStatus}
          storeOptions={storeOptions}
          onCreateCamera={openCreateModal}
        />

        <CameraTable
          cameras={filteredCameras}
          onDelete={handleDeleteCamera}
          onEdit={openEditModal}
          onTogglePower={handleToggleCameraPower}
          togglingCameraCode={togglingCameraCode}
        />

        <CameraUpsertModal
          isOpen={isUpsertModalOpen}
          mode={editingCamera ? 'edit' : 'create'}
          locationId={effectiveLocationId}
          initialCamera={editingCamera}
          onClose={handleCloseUpsertModal}
          onSubmit={handleUpsertCamera}
          loading={isUpsertSubmitting}
        />
      </div>
    </div>
  );
};

export default ManagermentCameraPage;
