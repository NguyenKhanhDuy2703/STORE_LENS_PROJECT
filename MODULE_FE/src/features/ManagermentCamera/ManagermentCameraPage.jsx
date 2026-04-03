import { useMemo } from 'react';
import { CameraSummaryCards } from './components/CameraSummaryCards';
import { CameraTable } from './components/CameraTable';
import { MOCK_CAMERAS } from './mockData';

const ManagermentCameraPage = () => {
  const cameras = useMemo(() => MOCK_CAMERAS, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-[1760px] space-y-6">
        <CameraSummaryCards cameras={cameras} />
        <CameraTable cameras={cameras} />
      </div>
    </div>
  );
};

export default ManagermentCameraPage;
