import { Users, UserPlus } from 'lucide-react';
const SegmentationOverview = ({ data }) => {
    const stats = data || { total: 0, active: 0, growth: "0%", segments: 0 };

    const Card = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-medium text-slate-500 tracking-tight">{title}</p>
                <h3 className="text-2xl font-semibold text-slate-800 mt-1 tracking-tight tabular-nums">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <Card title="Tổng hội viên" value={stats.total} icon={Users} colorClass="bg-blue-50 text-blue-500" />
            <Card title="Hội viên mới (Tháng)" value={stats.active} icon={UserPlus} colorClass="bg-emerald-50 text-emerald-500" />
        </div>
    );
};

export default SegmentationOverview;