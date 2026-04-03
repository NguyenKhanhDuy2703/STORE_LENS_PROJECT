
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Color palette for member segments
 * Each color is distinct and accessible for better visual distinction
 * Colors: Indigo, Emerald, Amber, Red, Violet
 */
const COLORS = ['#4338ca', '#059669', '#d97706', '#dc2626', '#7c3aed'];

/**
 * ClusterProfiles Component
 * 
 * Purpose: Displays a comprehensive breakdown of member segments using a donut chart
 * - Shows member distribution across different segments
 * - Calculates percentage for each segment relative to total members
 * - Provides both visual (pie chart) and tabular (list) representations
 * 
 * Props:
 *   segments: Array of segment objects containing segment_name and member_count
 */
const ClusterProfiles = ({ segments }) => {
  // Handle empty or null segments data
  if (!segments || segments.length === 0) return null;

  // Calculate total member count across all segments
  // Used as denominator for percentage calculations
  const totalCount = segments.reduce((sum, seg) => sum + (seg.member_count || 0), 0);

  // Map segments to chart data with calculated percentages
  // Assigns colors cyclically and maintains segment metadata
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
      <h3 className="font-medium tracking-tight text-xl mb-2 text-slate-900">Phân bổ nhóm đối tượng</h3>
      <div className="h-[1px] bg-slate-200 my-4"></div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 items-center">
        {/* Donut Chart Visualization */}
        <div className="h-[360px] md:h-[420px] flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl"> 
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={145}
                paddingAngle={4}
                dataKey="member_count"
                nameKey="segment_name"
                labelLine={true}
                label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                  // Calculate precise label position outside the pie
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 35;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const textAnchor = x > cx ? 'start' : 'end';
                  const percentText = `${Math.round(percent * 100)}%`;
                  
                  return (
                    <g>
                      {/* Label background for better readability */}
                      <rect
                        x={x - (textAnchor === 'start' ? 5 : 35)}
                        y={y - 12}
                        width="45"
                        height="24"
                        fill="white"
                        rx="4"
                        opacity="0.9"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      {/* Percentage text */}
                      <text 
                        x={x} 
                        y={y} 
                        fill="#0f172a" 
                        fontSize="14" 
                        fontWeight="700" 
                        textAnchor={textAnchor} 
                        dominantBaseline="central"
                      >
                        {percentText}
                      </text>
                    </g>
                  );
                }}
              >
                {/* Color cells with enhanced styling */}
                {segmentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#ffffff" 
                    strokeWidth={3}
                    opacity={0.95}
                  />
                ))}
              </Pie>
              {/* Enhanced tooltip with better formatting */}
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'member_count') return [`${value} thành viên`, 'Số lượng'];
                  return value;
                }}
                labelFormatter={(label) => label}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  backgroundColor: '#ffffff',
                  padding: '12px'
                }}
                cursor={{ fill: 'rgba(67, 56, 202, 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Details - List View */}
        {/* Segment Details - List View */}
        <div className="space-y-3">
          {/* Segment Detail Card - Displays each segment's information */}
          {segmentData.map((seg) => (
            <div 
              key={seg._id} 
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {/* Color indicator dot */}
                <span 
                  className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: seg.color }}
                ></span>
                <div>
                  {/* Segment name and member count */}
                  <p className="text-sm font-medium tracking-tight text-slate-800">{seg.segment_name}</p>
                  <p className="text-xs text-slate-500 tracking-tight tabular-nums">~{seg.member_count} thành viên</p>
                </div>
              </div>
              {/* Percentage badge */}
              <div className="text-lg font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-lg min-w-[60px] text-center tracking-tight tabular-nums">
                {seg.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend - Bottom reference guide for segments */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-600 tracking-tight mb-3">Chú thích</p>
        <div className="flex flex-wrap gap-3">
          {segmentData.map((seg) => (
            <div 
              key={`legend-${seg._id}`} 
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200"
            >
              {/* Legend color dot */}
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: seg.color }}
              ></span>
              {/* Segment name in legend */}
              <span className="text-sm text-slate-700 font-medium tracking-tight">{seg.segment_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClusterProfiles;