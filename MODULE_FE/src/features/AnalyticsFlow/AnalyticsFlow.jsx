import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Loader } from "lucide-react";
import { fetchFlowPatterns, runFlowAnalysis } from "./analyticsFlow.thunk";
import { clearPatterns } from "./analyticsFlow.slice";
import AlgorithmSelector from "./components/AlgorithmSelector";
import PatternList from "./components/PatternList";

// Stat card — accent bar màu theo loại
const StatCard = ({ label, value, sub, accentColor }) => (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className={`h-1 w-full ${accentColor}`} />
        <div className="px-5 py-4">
            <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-sm font-medium text-foreground mt-2">{label}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
    </div>
);

const AnalyticsFlow = () => {
    const dispatch = useDispatch();
    const { patterns, loading, analyzing, error } = useSelector((s) => s.analyticsFlow);
    const { locationId, userLocationId } = useSelector((s) => s.filter);
    const effectiveLocationId = locationId !== "loc_all" ? locationId : userLocationId;

    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    useEffect(() => {
        if (!effectiveLocationId) return;
        dispatch(fetchFlowPatterns({ locationId: effectiveLocationId }));
        return () => dispatch(clearPatterns());
    }, [dispatch, effectiveLocationId]);

    const handleAnalyze = ({ minSupport, minConfidence, minLift }) => {
        if (!effectiveLocationId) return;
        dispatch(runFlowAnalysis({ locationId: effectiveLocationId, minSupport, minConfidence, minLift }))
            .then(() => setHasAnalyzed(true));
    };

    const countOf = (type) => patterns.filter((p) => p.pattern_type === type).length;
    const showStats = patterns.length > 0 && !loading && !analyzing;

    return (
        <div className="space-y-6 pb-12">
            <AlgorithmSelector onAnalyze={handleAnalyze} analyzing={analyzing} />

            {/* Lỗi */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-rose-700">Không thể phân tích dữ liệu</p>
                        <p className="text-sm text-rose-500 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {(loading || analyzing) ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-14 flex flex-col items-center gap-4 text-center">
                    <Loader size={28} className="text-teal-500 animate-spin" />
                    <div className="space-y-1.5">
                        <p className="text-base font-semibold text-slate-700">
                            {analyzing ? "Đang phân tích hành vi khách hàng..." : "Đang tải kết quả..."}
                        </p>
                        {analyzing && (
                            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                                Hệ thống đang xem lại toàn bộ lịch sử di chuyển của khách để tìm ra các xu hướng. Quá trình này có thể mất vài giây.
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Tổng kết */}
                    {showStats && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Kết quả phân tích
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard
                                    label="Xu hướng tìm thấy"
                                    value={patterns.length}
                                    sub="tổng cộng"
                                    accentColor="bg-slate-400"
                                />
                                <StatCard
                                    label="Hay đi cùng nhau"
                                    value={countOf("association_rule")}
                                    sub="nhóm khu vực"
                                    accentColor="bg-teal-500"
                                />
                                <StatCard
                                    label="Lộ trình hay đi"
                                    value={countOf("frequent_sequence")}
                                    sub="chuỗi di chuyển"
                                    accentColor="bg-blue-500"
                                />
                                <StatCard
                                    label="Điểm đến tiếp theo"
                                    value={countOf("sequential_rule")}
                                    sub="xu hướng dự đoán"
                                    accentColor="bg-purple-500"
                                />
                            </div>
                        </div>
                    )}

                    <PatternList hasAnalyzed={hasAnalyzed || patterns.length > 0} />
                </>
            )}
        </div>
    );
};

export default AnalyticsFlow;
