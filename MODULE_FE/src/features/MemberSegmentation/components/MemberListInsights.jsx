
const MemberListInsights = ({ members }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-medium tracking-tight text-lg text-slate-900">Danh sách phân cụm hội viên</h3>
        <span className="text-sm text-slate-500 tracking-tight tabular-nums">Tổng số: {members.length} hội viên</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-medium tracking-tight">
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 border-r border-slate-200">ID</th>
              <th className="px-6 py-4 border-r border-slate-200">Nhóm</th>
              <th className="px-6 py-4 border-r border-slate-200">Khu tập ngực - vai</th>
              <th className="px-6 py-4 border-r border-slate-200">Khu tập lưng</th>
              <th className="px-6 py-4 border-r border-slate-200">Khu tập chân - mông</th>
              <th className="px-6 py-4 border-r border-slate-200">Lượt/tháng</th>
              <th className="px-6 py-4 border-r border-slate-200">Dwell Time</th>
              <th className="px-6 py-4">Nhận xét</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-xs text-teal-600 font-medium tracking-tight tabular-nums">USR-{member.member_code}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.segment_name === "Khách thân thiết"
                        ? "bg-emerald-50 text-emerald-700"
                        : member.segment_name === "Khách vãng lai"
                        ? "bg-blue-50 text-blue-700"
                        : member.segment_name === "Khách tiềm năng"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                    >
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor:
                        member.segment_name === "Khách thân thiết"
                          ? "#10b981"
                          : member.segment_name === "Khách vãng lai"
                          ? "#3b82f6"
                          : member.segment_name === "Khách tiềm năng"
                          ? "#f59e0b"
                          : "#94a3b8"
                    }}></span>
                    {member.segment_name}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700 tracking-tight tabular-nums">{member.chest_shoulder}</td>
                <td className="px-6 py-4 font-medium text-slate-700 tracking-tight tabular-nums">{member.back}</td>
                <td className="px-6 py-4 font-medium text-slate-700 tracking-tight tabular-nums">{member.legs_glutes}</td>
                <td className="px-6 py-4 font-medium text-slate-700 tracking-tight tabular-nums">{member.visits_per_month}</td>
                <td className="px-6 py-4 font-medium text-slate-700 tracking-tight tabular-nums">{member.dwell_time}</td>
                <td className="px-6 py-4 text-slate-600 tracking-tight">{member.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberListInsights;