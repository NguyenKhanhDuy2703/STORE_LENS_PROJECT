import StatCard from '../../../components/common/StatCard';

// Wrapper giữ layout KPI nhưng bỏ hiển thị tăng/giảm
const AreaStatCard = ({ title, value, icon, className }) => (
  <StatCard
    variant="simple"
    title={title}
    value={value}
    icon={icon}
    className={className}
  />
);

export default AreaStatCard;
