export function MemberTable({ members, onSelectMember, selectedMemberId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-600">Khách hàng</th>
              <th className="text-left px-6 py-4 text-sm text-gray-600">Liên hệ</th>
              <th className="text-left px-6 py-4 text-sm text-gray-600">Tần suất</th>
              <th className="text-left px-6 py-4 text-sm text-gray-600">Trạng thái</th>
              <th className="text-left px-6 py-4 text-sm text-gray-600">Ghi chú nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMemberId === member.id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                      {member.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-blue-600">{member.phone}</span>
                  <div className="text-sm text-gray-500 mt-1">{member.birthday}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      {member.sessionsThisMonth}/{member.totalSessions} buổi
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(member.sessionsThisMonth / member.totalSessions) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {getStatusText(member.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">{member.note}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}