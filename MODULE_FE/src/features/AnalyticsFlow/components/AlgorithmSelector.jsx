import { useState } from "react";

const PARAM_CONFIG = [
    {
        key: "minSupport",
        label: "Bỏ qua xu hướng quá hiếm gặp",
        example: 'Ví dụ: Chỉ 2 trong 100 khách đi từ khu A → B thì bỏ qua, không báo cáo.',
        lowLabel: "Hiếm (tìm nhiều kết quả hơn)",
        highLabel: "Phổ biến (chỉ hiện xu hướng rõ nét)",
        min: 0.01, max: 1, step: 0.05,
        format: (v) => `≥ ${Math.round(v * 100)}% khách`,
    },
    {
        key: "minConfidence",
        label: "Mức chắc chắn của xu hướng",
        example: 'Ví dụ: "70%" nghĩa là 7 trong 10 khách ghé khu A đều đi tiếp sang khu B.',
        lowLabel: "Thấp (chấp nhận xu hướng ít chắc hơn)",
        highLabel: "Cao (chỉ hiện xu hướng rất rõ ràng)",
        min: 0.1, max: 1, step: 0.05,
        format: (v) => `${Math.round(v * 100)}% chắc chắn`,
    },
    {
        key: "minLift",
        label: "Loại bỏ trùng hợp ngẫu nhiên",
        example: 'Ví dụ: Nếu mọi khách đều ghé quầy thu ngân, thì việc đi từ A → thu ngân không phải xu hướng đặc biệt. Tham số này lọc bỏ các trường hợp đó.',
        lowLabel: "Rộng hơn",
        highLabel: "Chặt hơn",
        min: 1, max: 5, step: 0.1,
        format: (v) => `${v.toFixed(1)}×`,
    },
];

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
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">Phân tích hành vi di chuyển của khách</p>
                    <p className="text-sm text-muted-foreground">
                        Hệ thống sẽ tự động tìm các xu hướng di chuyển phổ biến từ dữ liệu camera.
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((v) => !v)}
                        className="rounded-lg border border-border bg-muted/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
                    >
                        {showAdvanced ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
                    </button>
                    <button
                        type="button"
                        onClick={() => onAnalyze(params)}
                        disabled={analyzing}
                        className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        {analyzing ? "Đang phân tích..." : "Phân tích ngay"}
                    </button>
                </div>
            </div>

            {showAdvanced && (
                <div className="border-t border-border bg-muted/40 px-5 py-5 space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Điều chỉnh các bộ lọc bên dưới để kiểm soát kết quả hiển thị. Nếu không chắc, giữ nguyên mặc định.
                    </p>
                    {PARAM_CONFIG.map(({ key, label, example, lowLabel, highLabel, min, max, step, format }) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-0.5 text-sm font-semibold text-teal-700">
                                    {format(params[key])}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={min} max={max} step={step}
                                value={params[key]}
                                onChange={(e) => handleParam(key, e.target.value)}
                                className="w-full h-2 appearance-none rounded-full bg-slate-200 accent-teal-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{lowLabel}</span>
                                <span>{highLabel}</span>
                            </div>
                            <p className="text-xs text-slate-400 italic leading-relaxed">{example}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlgorithmSelector;
