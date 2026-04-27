// Re-export từ common StatusBadge để backward compatible
import StatusBadge from '../../../components/common/StatusBadge';

export const CameraStatusBadge = ({ status }) => (
  <StatusBadge status={status} type="camera" />
);
