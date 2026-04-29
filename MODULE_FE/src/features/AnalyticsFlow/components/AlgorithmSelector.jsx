import { useState } from "react";
import { ChevronDown, ChevronUp, ScanSearch } from "lucide-react";

const AlgorithmSelector = ({ onAnalyze, analyzing }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [params, setParams] = useState({
        minSupport: 0.1,
        minConfidence: 0.5,
        minLift: 1.0,
    });

    const handleParam = (key, value) => {
        const num = parseFloat(value);
        if (!isNaN(num)) setParams((p) => ({ ...p, [key]: num }));
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Main bar */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="text-xs text-slate-500">
                    Phân tích khu vực liên quan và lộ trình di chuyển cùng lúc
                </span>

                {/* Advanced toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    Tùy chỉnh
                </button>

                {/* Analyze button */}
                <button
                    type="button"
                    onClick={() => onAnalyze(params)}
                    disabled={analyzing}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {analyzing ? (
                        <>
                            <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Đang phân tích...
                        </>
                    ) : (
                        <>
                            <ScanSearch size={13} />
                            Phân tích
                        </>
                    )}
                </button>
            </div>

            {/* Advanced params */}
            {showAdvanced && (
                <div className="border-t border-slate-100 px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/60">
                    <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1">
                            Độ phổ biến tối thiểu
                        </label>
                        <input
                            type="number" min="0.01" max="1" step="0.05"
                            value={params.minSupport}
                            onChange={(e) => handleParam("minSupport", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">Mặc định: 10% khách</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1">
                            Độ chắc chắn tối thiểu
                        </label>
                        <input
                            type="number" min="0.1" max="1" step="0.05"
                            value={params.minConfidence}
                            onChange={(e) => handleParam("minConfidence", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">Mặc định: 50%</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1">
                            Mức độ liên quan
                        </label>
                        <input
                            type="number" min="1" max="5" step="0.1"
                            value={params.minLift}
                            onChange={(e) => handleParam("minLift", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-teal-400 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">Mặc định: 1.0</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmSelector;
