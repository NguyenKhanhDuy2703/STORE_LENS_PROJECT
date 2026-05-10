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
    <div className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Trạng thái chi tiết khu vực
        </h3>
      </div>
      <div className="overflow-auto max-h-[560px]">
        <table className="w-full min-w-[1200px] text-left">
          <thead className="bg-muted border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-7 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Khu vực
              </th>
              <th className="px-7 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Khách hiện tại
              </th>
              <th className="px-7 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lượt ghé hôm nay
              </th>
              <th className="px-7 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Thời gian dừng TB
              </th>
              <th className="px-7 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hiệu suất chuyển đổi
              </th>
              <th className="px-7 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Biến động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
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
                  className="hover:bg-muted transition"
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

                  <td className="px-7 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border text-sm font-semibold ${getDensityBadgeStyle(row.currentPeople)}`}
                    >
                      {row.currentPeople}
                    </span>
                  </td>

                  <td className="px-7 py-4 text-sm font-semibold text-foreground tabular-nums">
                    {row.visitsToday.toLocaleString("vi-VN")}
                  </td>

                  <td className="px-7 py-4 min-w-60">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 rounded-full bg-orange-100 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
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
                      <div className="w-full h-2 rounded-full bg-teal-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${conversionPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground min-w-[60px] tabular-nums">
                        {row.conversionRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-7 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${isGrowthUp ? "text-emerald-600" : "text-rose-600"}`}
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
