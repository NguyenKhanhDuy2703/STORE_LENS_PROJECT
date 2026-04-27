import StatusBadge from '../../../components/common/StatusBadge';

export function MemberTable({ members, onSelectMember, selectedMemberId }) {

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-6 py-4">Khách hàng</th>
              <th className="text-left px-6 py-4">Liên hệ</th>
              <th className="text-left px-6 py-4">Tần suất</th>
              <th className="text-left px-6 py-4">Trạng thái</th>
              <th className="text-left px-6 py-4">Ghi chú nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`cursor-pointer transition-colors ${
                  selectedMemberId === member.id
                    ? 'bg-accent/8'
                    : 'hover:bg-muted/40'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {member.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{member.name}</div>
                      <div className="text-muted-foreground">{member.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-accent font-medium">{member.phone}</span>
                  <div className="text-muted-foreground mt-0.5">{member.birthday}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="text-foreground tabular-nums">
                      {member.sessionsThisMonth}/{member.totalSessions} buổi
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${(member.sessionsThisMonth / member.totalSessions) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={member.status} type="member" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-muted-foreground">{member.note}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
