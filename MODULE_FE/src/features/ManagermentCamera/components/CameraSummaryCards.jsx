import { Camera, Wifi, WifiOff } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';

export const CameraSummaryCards = ({ cameras, metrics }) => {
  const total  = metrics?.total  ?? cameras.length;
  const active = metrics?.active ?? cameras.filter((c) => c.status === 'active' || c.status === 'online').length;
  const error  = metrics?.error  ?? cameras.filter((c) => c.status === 'error'  || c.status === 'disconnect').length;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <StatCard variant="summary" title="Tổng camera"    value={total}  icon={Camera}  gradient="bg-gradient-accent"                          shadowClass="shadow-accent" />
      <StatCard variant="summary" title="Đang hoạt động" value={active} icon={Wifi}    gradient="bg-gradient-to-br from-emerald-500 to-emerald-400" shadowClass="shadow-sm" />
      <StatCard variant="summary" title="Cảnh báo"       value={error}  icon={WifiOff} gradient="bg-gradient-to-br from-rose-500 to-rose-400"      shadowClass="shadow-sm" />
    </div>
  );
};
