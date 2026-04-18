import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'disconnect', label: 'Mất kết nối' },
  { value: 'error', label: 'Lỗi kết nối' },
];

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const toInputString = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const formatResolutionForInput = (value) => {
  if (value === undefined || value === null || value === '') return '';

  if (typeof value === 'object') {
    const width = value.width ?? value.w;
    const height = value.height ?? value.h;

    if (width !== undefined && height !== undefined) {
      return `${width}x${height}`;
    }

    return toInputString(value);
  }

  return String(value);
};

const parseResolutionValue = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return undefined;

  const resolutionMatch = trimmed.match(/^(\d+)\s*[xX]\s*(\d+)$/);
  if (resolutionMatch) {
    return {
      width: Number(resolutionMatch[1]),
      height: Number(resolutionMatch[2]),
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch {
    // Keep original string when value is not JSON.
  }

  return trimmed;
};

const normalizeFormData = (formData, locationId, fallbackCameraCode) => {
  const cameraSpec = {};
  if (formData.maxResolution.trim()) {
    cameraSpec.max_resolution = parseResolutionValue(formData.maxResolution);
  }
  if (formData.currentResolution.trim()) {
    cameraSpec.current_resolution = parseResolutionValue(formData.currentResolution);
  }

  return {
    cameraCode: (formData.cameraCode || fallbackCameraCode || '').trim(),
    cameraData: {
      camera_code: (formData.cameraCode || fallbackCameraCode || '').trim(),
      camera_name: formData.cameraName.trim(),
      rtsp_url: formData.rtspUrl.trim(),
      location_id: locationId,
      status: formData.status,
      url_image_snapshot: formData.snapshotUrl.trim() || undefined,
      installation_date: formData.installationDate
        ? new Date(formData.installationDate).toISOString()
        : undefined,
      camera_spec: Object.keys(cameraSpec).length ? cameraSpec : undefined,
    },
  };
};

export const CameraUpsertModal = ({
  isOpen,
  mode,
  locationId,
  initialCamera,
  onClose,
  onSubmit,
  loading,
}) => {
  const isEditMode = mode === 'edit';

  const initialFormState = useMemo(
    () => ({
      cameraCode: initialCamera?.camera_code || initialCamera?.id || '',
      cameraName: initialCamera?.camera_name || initialCamera?.name || '',
      rtspUrl: initialCamera?.rtsp_url || initialCamera?.rtspUrl || '',
      snapshotUrl: initialCamera?.url_image_snapshot || initialCamera?.urlImageSnapshot || '',
      status: initialCamera?.status || 'inactive',
      installationDate: toDateTimeLocal(initialCamera?.installation_date || initialCamera?.installationDate),
      maxResolution: formatResolutionForInput(
        initialCamera?.camera_spec?.max_resolution ||
          initialCamera?.cameraSpec?.max_resolution ||
          initialCamera?.max_resolution ||
          initialCamera?.maxResolution
      ),
      currentResolution: formatResolutionForInput(
        initialCamera?.camera_spec?.current_resolution ||
          initialCamera?.cameraSpec?.current_resolution ||
          initialCamera?.current_resolution ||
          initialCamera?.currentResolution
      ),
    }),
    [initialCamera]
  );

  const [formData, setFormData] = useState(initialFormState);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setSubmitError('');
    }
  }, [isOpen, initialFormState]);

  if (!isOpen) return null;

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    if (!formData.cameraCode.trim()) return 'Vui lòng nhập mã camera.';
    if (!formData.cameraName.trim()) return 'Vui lòng nhập tên camera.';
    if (!formData.rtspUrl.trim()) return 'Vui lòng nhập RTSP URL.';
    if (!locationId || locationId === 'all') return 'Vui lòng chọn cửa hàng trước khi lưu camera.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    setSubmitError('');
    await onSubmit(normalizeFormData(formData, locationId, initialCamera?.camera_code || initialCamera?.id));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-3 py-2 backdrop-blur-sm">
      <div className="w-full max-w-[1180px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-black/20">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-3 text-white">
          <h3 className="text-base font-semibold">
            {isEditMode ? 'Cập nhật camera' : 'Thêm mới camera'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Mã camera *</span>
              <input
                value={formData.cameraCode}
                onChange={handleChange('cameraCode')}
                readOnly={isEditMode}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 read-only:cursor-not-allowed read-only:bg-slate-100"
                placeholder="VD: CAM-001"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Tên camera *</span>
              <input
                value={formData.cameraName}
                onChange={handleChange('cameraName')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Camera cong chinh"
              />
            </label>

            <label className="space-y-1 xl:col-span-2">
              <span className="text-xs font-semibold text-slate-700">RTSP URL *</span>
              <input
                value={formData.rtspUrl}
                onChange={handleChange('rtspUrl')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="rtsp://user:password@host:554/stream"
              />
            </label>

            <label className="space-y-1 xl:col-span-2">
              <span className="text-xs font-semibold text-slate-700">URL ảnh chụp</span>
              <input
                value={formData.snapshotUrl}
                onChange={handleChange('snapshotUrl')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="https://camera.local/snapshot.jpg"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Trạng thái</span>
              <select
                value={formData.status}
                onChange={handleChange('status')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Ngày lắp đặt</span>
              <input
                type="datetime-local"
                value={formData.installationDate}
                onChange={handleChange('installationDate')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Độ phân giải tối đa</span>
              <input
                value={formData.maxResolution}
                onChange={handleChange('maxResolution')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="1920x1080"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-700">Độ phân giải hiện tại</span>
              <input
                value={formData.currentResolution}
                onChange={handleChange('currentResolution')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="1280x720"
              />
            </label>
          </div>

          {submitError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{submitError}</div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : isEditMode ? 'Lưu cập nhật' : 'Tạo mới camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
