import { Users, MapPin, BarChart3, Trash2, } from 'lucide-react';
const CATEGORIES = {
  RETENTION: { id: 'retention', label: 'Hội viên', icon: Users, color: 'indigo' },
  ZONE: { id: 'zone', label: 'Khu vực', icon: MapPin, color: 'teal' },
  REVENUE: { id: 'revenue', label: 'Doanh thu', icon: BarChart3, color: 'amber' }
};
const RuleTable = ({ rules, onDelete, onToggle }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
    <table className="w-full text-left text-sm border-collapse">
      <thead className="bg-slate-50 border-b border-slate-300">
        <tr>
          <th className="px-4 py-3 font-semibold text-slate-600 uppercase text-[11px] border-r border-slate-200">Quy tắc</th>
          <th className="px-4 py-3 font-semibold text-slate-600 uppercase text-[11px] border-r border-slate-200">Trạng thái</th>
          <th className="px-4 py-3 font-semibold text-slate-600 uppercase text-[11px] text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {rules.length === 0 ? (
          <tr>
            <td colSpan="3" className="px-4 py-10 text-center text-slate-400 italic">Chưa có quy tắc nào được thiết lập</td>
          </tr>
        ) : (
          rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 border-r border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Left color bar helps quickly identify rule group by category. */}
                  <div className={`w-1 h-8 rounded-full bg-${CATEGORIES[rule.category.toUpperCase()]?.color}-500`} />
                  <div>
                    <p className="font-medium text-slate-900">
                      Khi <span className="text-teal-600">{rule.condition}</span> đạt từ <span className="font-mono">{rule.value} {rule.unit}</span> trở lên
                    </p>
                    <p className="text-xs text-slate-500 italic">Hành động: {rule.action}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 border-r border-slate-100">
                {/* Toggle updates active/inactive state for this specific rule. */}
                <button 
                  onClick={() => onToggle(rule.id)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${rule.isActive ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </td>
              <td className="px-4 py-4 text-right">
                <button onClick={() => onDelete(rule.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
export default RuleTable;