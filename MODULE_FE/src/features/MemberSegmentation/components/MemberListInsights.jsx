
const MemberListInsights = ({ members }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-lg">Danh sách phân cụm hội viên</h3>
        <span className="text-sm text-slate-500">Tổng số: {members.length} hội viên</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nhóm</th>
              <th className="px-6 py-4">Khu tập ngực - vai</th>
              <th className="px-6 py-4">Khu tập lưng</th>
              <th className="px-6 py-4">Khu tập chân - mông</th>
              <th className="px-6 py-4">Lượt/tháng</th>
              <th className="px-6 py-4">Dwell Time</th>
              <th className="px-6 py-4">Nhận xét</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-semibold">USR-{member.member_code}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      member.segment_name === "Khách thân thiết"
                        ? "bg-emerald-50 text-emerald-700"
                        : member.segment_name === "Khách vãng lai"
                        ? "bg-blue-50 text-blue-700"
                        : member.segment_name === "Khách tiềm năng"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
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
                <td className="px-6 py-4 font-semibold text-slate-700">{member.chest_shoulder}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">{member.back}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">{member.legs_glutes}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">{member.visits_per_month}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">{member.dwell_time}</td>
                <td className="px-6 py-4 text-slate-600">{member.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberListInsights;