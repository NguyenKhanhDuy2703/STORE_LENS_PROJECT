import { useDispatch, useSelector } from "react-redux";
import { setActiveFilter } from "../analyticsFlow.slice";
import PatternCard from "./PatternCard";
import EmptyState from "./EmptyState";

const FILTERS = [
    { id: "all",               label: "Tất cả" },
    { id: "association_rule",  label: "Hay đi cùng nhau" },
    { id: "frequent_sequence", label: "Lộ trình hay đi" },
    { id: "sequential_rule",   label: "Điểm đến tiếp theo" },
];

const PatternList = ({ hasAnalyzed }) => {
    const dispatch = useDispatch();
    const { patterns, activeFilter } = useSelector((s) => s.analyticsFlow);

    const filtered = activeFilter === "all"
        ? patterns
        : patterns.filter((p) => p.pattern_type === activeFilter);

    const availableTypes = new Set(patterns.map((p) => p.pattern_type));
    const visibleFilters = FILTERS.filter(
        (f) => f.id === "all" || availableTypes.has(f.id)
    );
    const countOf = (id) => patterns.filter((p) => p.pattern_type === id).length;

    return (
        <div>
            {patterns.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-5">
                    {visibleFilters.map((f) => {
                        const count = f.id === "all" ? patterns.length : countOf(f.id);
                        const isActive = activeFilter === f.id;
                        return (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => dispatch(setActiveFilter(f.id))}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-teal-600 text-white shadow-sm"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {f.label}
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    isActive ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((p, idx) => (
                        <PatternCard key={p._id ?? idx} pattern={p} />
                    ))}
                </div>
            ) : (
                <EmptyState hasAnalyzed={hasAnalyzed} />
            )}
        </div>
    );
};

export default PatternList;
