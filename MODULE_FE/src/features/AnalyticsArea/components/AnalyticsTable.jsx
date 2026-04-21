import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const getDensityBadgeStyle = (currentPeople) => {
  if (currentPeople <= 10) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (currentPeople <= 20) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-rose-100 text-rose-700 border-rose-200";
};

const formatDwellMinutes = (minutes) => `${minutes.toFixed(1)} phút`;

const AnalyticsTable = ({ performanceDetails, maxDwellTime }) => {
  const rows = Array.isArray(performanceDetails) ? performanceDetails : [];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Trạng thái chi tiết khu vực
        </h3>
      </div>
      <div className="overflow-auto max-h-[560px]">
        <table className="w-full min-w-[1200px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-7 py-5 text-sm font-semibold text-slate-500 tracking-tight">
                Khu vực
              </th>
              <th className="px-7 py-5 text-sm font-semibold text-slate-500 tracking-tight">
                Khách hiện tại
              </th>
              <th className="px-7 py-5 text-sm font-semibold text-slate-500 tracking-tight">
                Lượt ghé hôm nay
              </th>
              <th className="px-7 py-5 text-sm font-semibold text-slate-500 tracking-tight">
                Thời gian dừng TB
              </th>
              <th className="px-7 py-5 text-sm font-semibold text-slate-500 tracking-tight">
                Hiệu suất chuyển đổi
              </th>
              <th className="px-7 py-5 text-sm font-semibold text-slate-500 tracking-tight">
                Biến động
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
              const isGrowthUp = row.growthRate >= 0;

              return (
                <tr
                  key={row.zoneId}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-7 py-5">
                    <p className="text-base font-bold text-slate-900 leading-tight">
                      {row.zoneName}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {row.categoryName}
                    </p>
                  </td>

                  <td className="px-7 py-5">
                    <span
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-full border text-sm font-semibold ${getDensityBadgeStyle(row.currentPeople)}`}
                    >
                      {row.currentPeople}
                    </span>
                  </td>

                  <td className="px-7 py-5 text-base font-semibold text-slate-900 tabular-nums">
                    {row.visitsToday.toLocaleString("vi-VN")}
                  </td>

                  <td className="px-7 py-5 min-w-60">
                    <div className="flex items-center gap-4">
                      <div className="w-full h-2.5 rounded-full bg-orange-100 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${dwellPercent}%` }}
                        />
                      </div>
                      <span className="text-base font-medium text-slate-800 min-w-[90px] tabular-nums">
                        {formatDwellMinutes(row.avgDwellMinutes)}
                      </span>
                    </div>
                  </td>

                  <td className="px-7 py-5 min-w-60">
                    <div className="flex items-center gap-4">
                      <div className="w-full h-2.5 rounded-full bg-teal-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${conversionPercent}%` }}
                        />
                      </div>
                      <span className="text-base font-medium text-slate-800 min-w-[70px] tabular-nums">
                        {row.conversionRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-7 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-base font-semibold tabular-nums ${isGrowthUp ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isGrowthUp ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownRight size={18} />
                      )}
                      {isGrowthUp ? "+" : ""}
                      {row.growthRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-7 py-10 text-center text-base text-slate-500"
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
