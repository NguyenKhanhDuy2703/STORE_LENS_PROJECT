export default function StatsCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-600 text-sm">{title}</div>
        <div className="text-blue-500">{icon}</div>
      </div>
      <div className="text-3xl font-semibold text-gray-900 mb-1">{value}</div>
      {trend && <div className="text-xs text-gray-500">{trend}</div>}
    </div>
  );
}

StatsCard.propTypes = {
  title: (props, propName) => {
    if (typeof props[propName] !== 'string') {
      return new Error(`${propName} must be a string`);
    }
  },
  value: (props, propName) => {
    if (typeof props[propName] !== 'string' && typeof props[propName] !== 'number') {
      return new Error(`${propName} must be a string or number`);
    }
  },
  icon: () => null,
  trend: () => null,
};
