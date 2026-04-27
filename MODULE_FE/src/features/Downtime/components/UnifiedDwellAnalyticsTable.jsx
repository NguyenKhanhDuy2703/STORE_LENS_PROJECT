import { AlertTriangle, CheckCircle, Moon, Star, Zap } from 'lucide-react';
import { formatCurrency as formatCurrencyVND } from '../../../utils/formatCurrency';

const formatSeconds = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = Math.floor(safeSeconds % 60);
  return minutes > 0 ? `${minutes}m ${remainSeconds}s` : `${remainSeconds}s`;
};

const STATUS_CONFIG = {
  STAR: {
    label: 'Hiệu quả cao',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Star,
  },
  CASH_COW: {
    label: 'Chốt đơn tốt',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Zap,
  },
  CRITICAL_WARNING: {
    label: 'Cần tối ưu',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
  },
  POOR: {
    label: 'Hiệu suất thấp',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Moon,
  },
  NORMAL: {
    label: 'Ổn định',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: CheckCircle,
  },
};

const UnifiedDwellAnalyticsTable = ({ rows = [], isLoading = false }) => {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const maxAvgTime = normalizedRows.length ? Math.max(...normalizedRows.map((item) => item.avgTime)) || 1 : 1;
  const maxSales = normalizedRows.length ? Math.max(...normalizedRows.map((item) => item.totalSales)) || 1 : 1;

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-10 text-center text-sm text-slate-500">Đang tải dữ liệu dwell time...</div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
      <div className="px-8 py-5 border-b border-border">
        <h3 className="font-semibold text-foreground tracking-tight">Bảng Phân Tích Thời Gian Dừng Hợp Nhất</h3>
        <p className="text-muted-foreground mt-1">Kết hợp lượt khách, lượt dừng, thời gian dừng trung bình và doanh thu theo từng khu vực.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left border-collapse">
          <thead className="border-b border-border">
            <tr>
              <th className="px-8 py-4">Khu vực</th>
              <th className="px-8 py-4 text-center">Lượng khách</th>
              <th className="px-8 py-4 text-center">Lượt dừng</th>
              <th className="px-8 py-4">TG Dừng TB</th>
              <th className="px-8 py-4">Doanh thu</th>
              <th className="px-8 py-4">Đánh giá</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {normalizedRows.map((row) => {
              const timePercent = (row.avgTime / maxAvgTime) * 100;
              const salesPercent = (row.totalSales / maxSales) * 100;
              const status = STATUS_CONFIG[row.type] || STATUS_CONFIG.NORMAL;
              const StatusIcon = status.icon;

              return (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-8 py-5 font-semibold text-foreground">{row.categoryName}</td>

                  <td className="px-8 py-5 text-center">
                    <span className="font-semibold text-foreground tabular-nums">{row.peopleCount.toLocaleString('vi-VN')}</span>
                  </td>

                  <td className="px-8 py-5 text-center">
                    <span className="font-semibold text-foreground tabular-nums">{row.stopCount.toLocaleString('vi-VN')}</span>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 min-w-60">
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${timePercent}%` }} />
                      </div>
                      <span className="font-semibold text-foreground min-w-[88px] tabular-nums">
                        {formatSeconds(row.avgTime)}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 min-w-[290px]">
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${salesPercent}%` }} />
                      </div>
                      <span className="font-semibold text-foreground min-w-40 text-right tabular-nums">
                        {formatCurrencyVND(row.totalSales)}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold border ${status.color}`}>
                      <StatusIcon size={14} strokeWidth={2.2} />
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {normalizedRows.length === 0 && (
              <tr>
                <td colSpan="6" className="px-8 py-10 text-center text-muted-foreground">
                  Không có dữ liệu thời gian dừng trong khoảng thời gian đã chọn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UnifiedDwellAnalyticsTable;
