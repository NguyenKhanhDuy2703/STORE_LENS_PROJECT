const formatDwellMinutes = (minutes) => `${minutes.toFixed(1)} phút`;

const AnalyticsTable = ({ performanceDetails, maxDwellTime }) => {
  const rows = Array.isArray(performanceDetails) ? performanceDetails : [];
  return (
    <div className="bg-white/90 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
              Hiệu suất khu vực
            </p>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900">
              Trạng thái chi tiết khu vực
            </h3>
            <p className="text-sm text-slate-600">
              Tổng hợp lượt ghé, thời gian dừng và tỷ lệ chuyển đổi theo từng khu vực.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600">
              Số khu vực: {rows.length}
            </span>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700">
              Dừng lâu nhất: {formatDwellMinutes(maxDwellTime)}
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-auto max-h-[560px]">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur">
            <tr>
              <th className="px-7 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                Khu vực
              </th>
              <th className="px-7 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                Lượt ghé hôm nay
              </th>
              <th className="px-7 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                Thời gian dừng TB
              </th>
              <th className="px-7 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                Hiệu suất chuyển đổi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const dwellPercent = Math.min(
                (row.avgDwellMinutes / maxDwellTime) * 100,
                100,
              );
              const conversionPercent = Math.min(
                row.conversionRate,
                100,
              );

              return (
                <tr
                  key={row.zoneId}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-7 py-4">
                    {/* font-bold kept intentionally: primary identifier cell in data row, not a heading */}
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {row.zoneName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {row.categoryName}
                    </p>
                  </td>

                  <td className="px-7 py-4 text-sm font-semibold text-foreground tabular-nums">
                    {row.visitsToday.toLocaleString("vi-VN")}
                  </td>

                  <td className="px-7 py-4 min-w-60">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                          style={{ width: `${dwellPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground min-w-[80px] tabular-nums">
                        {formatDwellMinutes(row.avgDwellMinutes)}
                      </span>
                    </div>
                  </td>

                  <td className="px-7 py-4 min-w-60">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                          style={{ width: `${conversionPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground min-w-[60px] tabular-nums">
                        {row.conversionRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-7 py-10 text-center text-sm text-muted-foreground"
                >
                  Không có dữ liệu khu vực phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsTable;
