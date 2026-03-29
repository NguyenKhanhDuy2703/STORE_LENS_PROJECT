import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4338ca', '#059669', '#d97706', '#dc2626', '#7c3aed']; // đậm hơn cho phân đoạn dễ phân biệt


const ClusterProfiles = ({ segments }) => {
  if (!segments || segments.length === 0) return null;

  // Tính tổng số hội viên trong các phân khúc để ra %
  const totalCount = segments.reduce((sum, seg) => sum + (seg.member_count || 0), 0);

  const segmentData = segments.map((seg, index) => {
    const percentage = totalCount > 0 ? Math.round((seg.member_count / totalCount) * 100) : 0;
    return {
      ...seg,
      percentage,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-xl mb-2 text-slate-900">Phân bổ nhóm đối tượng</h3>
      <div className="h-[1px] bg-slate-200 my-4"></div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 items-center">
        <div className="h-[360px] md:h-[420px] flex justify-center items-center"> 
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                paddingAngle={3}
                dataKey="member_count"
                nameKey="segment_name"
                labelLine={false}
                label={({ cx, cy, midAngle, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 18;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="#0f172a" fontSize="13" fontWeight="600" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {`${Math.round(percent * 100)}%`}
                    </text>
                  );
                }}
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value} thành viên`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {segmentData.map((seg) => (
            <div key={seg._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{seg.segment_name}</p>
                  <p className="text-xs text-slate-500">~{seg.member_count} thành viên</p>
                </div>
              </div>
              <div className="text-lg font-bold text-slate-900">{seg.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500 flex justify-center gap-4">
        {segmentData.map((seg) => (
          <div key={`legend-${seg._id}`} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
            <span>{seg.segment_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClusterProfiles;