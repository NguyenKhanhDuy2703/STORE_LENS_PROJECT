import StatCard from '../../../components/common/StatCard';

// Wrapper giữ backward compatible với props cũ (isUp, trend string)
const AreaStatCard = ({ title, value, trend, isUp, icon, bgColor }) => (
  <StatCard
    variant="trend"
    title={title}
    value={value}
    icon={icon}
    change={trend ? parseFloat(trend) : 0}
    isUp={isUp}
  />
);

export default AreaStatCard;
