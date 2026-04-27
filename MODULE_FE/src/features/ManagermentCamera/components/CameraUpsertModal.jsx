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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/40 px-3 py-2 backdrop-blur-sm">
      <div className="w-full max-w-[1180px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="border-b border-border bg-gradient-accent-d px-5 py-3.5 text-white">
          <h3 className="text-sm font-semibold tracking-tight">
            {isEditMode ? 'Cập nhật camera' : 'Thêm mới camera'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Mã camera *', field: 'cameraCode', readOnly: isEditMode, placeholder: 'VD: CAM-001', span: '' },
              { label: 'Tên camera *', field: 'cameraName', placeholder: 'Camera cổng chính', span: '' },
              { label: 'RTSP URL *', field: 'rtspUrl', placeholder: 'rtsp://user:password@host:554/stream', span: 'xl:col-span-2' },
              { label: 'URL ảnh chụp', field: 'snapshotUrl', placeholder: 'https://camera.local/snapshot.jpg', span: 'xl:col-span-2' },
            ].map(({ label, field, readOnly, placeholder, span }) => (
              <label key={field} className={`space-y-1.5 ${span}`}>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
                <input
                  value={formData[field]}
                  onChange={handleChange(field)}
                  readOnly={readOnly}
                  placeholder={placeholder}
                  className="w-full h-9 rounded-xl border border-border bg-muted/50 px-3 text-xs text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 read-only:cursor-not-allowed read-only:opacity-60"
                />
              </label>
            ))}

            <label className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Trạng thái</span>
              <select
                value={formData.status}
                onChange={handleChange('status')}
                className="w-full h-9 rounded-xl border border-border bg-muted/50 px-3 text-xs text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ngày lắp đặt</span>
              <input
                type="datetime-local"
                value={formData.installationDate}
                onChange={handleChange('installationDate')}
                className="w-full h-9 rounded-xl border border-border bg-muted/50 px-3 text-xs text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </label>

            <label className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Độ phân giải tối đa</span>
              <input
                value={formData.maxResolution}
                onChange={handleChange('maxResolution')}
                placeholder="1920x1080"
                className="w-full h-9 rounded-xl border border-border bg-muted/50 px-3 text-xs text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </label>

            <label className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Độ phân giải hiện tại</span>
              <input
                value={formData.currentResolution}
                onChange={handleChange('currentResolution')}
                placeholder="1280x720"
                className="w-full h-9 rounded-xl border border-border bg-muted/50 px-3 text-xs text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </label>
          </div>

          {submitError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">{submitError}</div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-3.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 rounded-xl border border-border px-4 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 rounded-xl bg-gradient-accent px-4 text-xs font-semibold text-white shadow-sm hover:shadow-accent transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? 'Đang lưu...' : isEditMode ? 'Lưu cập nhật' : 'Tạo mới camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
