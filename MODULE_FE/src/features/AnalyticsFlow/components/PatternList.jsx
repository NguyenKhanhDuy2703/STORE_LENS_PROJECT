import { useDispatch, useSelector } from "react-redux";
import { setActiveFilter } from "../analyticsFlow.slice";
import PatternCard from "./PatternCard";
import EmptyState from "./EmptyState";

const FILTERS = [
    { id: "all", label: "Tất cả" },
    { id: "association_rule", label: "Khu vực liên quan" },
    { id: "frequent_sequence", label: "Lộ trình phổ biến" },
    { id: "sequential_rule", label: "Xu hướng tiếp theo" },
];

const PatternList = ({ hasAnalyzed }) => {
    const dispatch = useDispatch();
    const { patterns, activeFilter } = useSelector((s) => s.analyticsFlow);

    const filtered = activeFilter === "all"
        ? patterns
        : patterns.filter((p) => p.pattern_type === activeFilter);

    // Chỉ hiển thị filter tabs có data
    const availableTypes = new Set(patterns.map((p) => p.pattern_type));
    const visibleFilters = FILTERS.filter(
        (f) => f.id === "all" || availableTypes.has(f.id)
    );

    return (
        <div>
            {/* Filter tabs */}
            {patterns.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {visibleFilters.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => dispatch(setActiveFilter(f.id))}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                activeFilter === f.id
                                    ? "bg-teal-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {f.label}
                            {f.id !== "all" && (
                                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                    activeFilter === f.id ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                    {patterns.filter((p) => p.pattern_type === f.id).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Cards grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                        <PatternCard key={p._id} pattern={p} />
                    ))}
                </div>
            ) : (
                <EmptyState hasAnalyzed={hasAnalyzed} />
            )}
        </div>
    );
};

export default PatternList;
