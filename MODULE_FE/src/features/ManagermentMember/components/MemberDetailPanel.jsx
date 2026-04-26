export function MemberDetailPanel({ member, onClose }) {
  const recentVisits = member.recentVisits || [
    { date: '18/04/2026', checkIn: '06:30', checkOut: '08:00' },
    { date: '16/04/2026', checkIn: '06:15', checkOut: '07:45' },
  ];

  const frequentZones = member.frequentZones || ['Khu Cardio', 'Khu Tạ'];

  const getCareSuggestion = () => {
    if (member.status === 'absent-long') return '⚠️ Hội viên đã vắng hơn 7 ngày. Vui lòng liên hệ.';
    if (member.status === 'absent-short') return '💬 Hội viên chưa đến tập trong tuần này. Gửi nhắc nhở.';
    return '✅ Hội viên đang tập đều đặn. Tiếp tục theo dõi.';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Chi tiết hội viên</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-medium">
            {member.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.code}</p>
            <p className="text-sm text-blue-600 mt-1">{member.phone}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Gợi ý chăm sóc</h4>
          <p className="text-sm text-gray-700">{getCareSuggestion()}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Lịch sử ghé thăm gần nhất</h4>
          <div className="space-y-3">
            {recentVisits.map((visit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{visit.date}</div>
                  <div className="text-xs text-gray-500">{visit.checkIn} - {visit.checkOut}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Khu vực thường xuyên</h4>
          <div className="flex flex-wrap gap-2">
            {frequentZones.map((zone, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                {zone}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}