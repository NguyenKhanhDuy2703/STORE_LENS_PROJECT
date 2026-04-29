import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Loader } from "lucide-react";
import { fetchFlowPatterns, runFlowAnalysis } from "./analyticsFlow.thunk";
import { clearPatterns } from "./analyticsFlow.slice";
import AlgorithmSelector from "./components/AlgorithmSelector";
import PatternList from "./components/PatternList";

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

    return (
        <div className="space-y-4 pb-12">
            <AlgorithmSelector onAnalyze={handleAnalyze} analyzing={analyzing} />

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                    <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-600">{error}</p>
                </div>
            )}

            {(loading || analyzing) ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center gap-3">
                    <Loader size={24} className="text-teal-500 animate-spin" />
                    <p className="text-sm text-slate-500">
                        {analyzing ? "Đang phân tích dữ liệu camera..." : "Đang tải kết quả..."}
                    </p>
                </div>
            ) : (
                <>
                    {patterns.length > 0 && (
                        <p className="text-xs text-slate-400">
                            Tìm thấy {patterns.length} xu hướng hành vi
                        </p>
                    )}
                    <PatternList hasAnalyzed={hasAnalyzed || patterns.length > 0} />
                </>
            )}
        </div>
    );
};

export default AnalyticsFlow;
