import { X } from 'lucide-react';

export function MemberDetailPanel({ member, onClose }) {
  const recentVisits = member.recentVisits || [
    { date: '18/04/2026', checkIn: '06:30', checkOut: '08:00' },
    { date: '16/04/2026', checkIn: '06:15', checkOut: '07:45' },
  ];

  const frequentZones = member.frequentZones || ['Khu Cardio', 'Khu Tạ'];

  const getCareSuggestion = () => {
    if (member.status === 'absent-long')  return '⚠️ Khách hàng đã vắng hơn 7 ngày. Vui lòng liên hệ.';
    if (member.status === 'absent-short') return '💬 Khách hàng chưa đến trong tuần này. Gửi nhắc nhở.';
    return '✅ Khách hàng đang tập đều đặn. Tiếp tục theo dõi.';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card shadow-xl border-l border-border overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground tracking-tight">Chi tiết khách hàng</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xl font-bold shadow-accent">
            {member.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{member.name}</h3>
            <p className="text-muted-foreground">{member.code}</p>
            <p className="text-accent mt-0.5">{member.phone}</p>
          </div>
        </div>

        {/* Gợi ý chăm sóc */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-1.5">Gợi ý chăm sóc</h4>
          <p className="text-muted-foreground">{getCareSuggestion()}</p>
        </div>

        {/* Lịch sử ghé thăm */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Lịch sử ghé thăm gần nhất</h4>
          <div className="space-y-2">
            {recentVisits.map((visit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                <div>
                  <div className="font-medium text-foreground">{visit.date}</div>
                  <div className="text-muted-foreground">{visit.checkIn} - {visit.checkOut}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khu vực thường xuyên */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Khu vực thường xuyên</h4>
          <div className="flex flex-wrap gap-2">
            {frequentZones.map((zone, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full font-medium bg-accent/10 text-accent border border-accent/20">
                {zone}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
