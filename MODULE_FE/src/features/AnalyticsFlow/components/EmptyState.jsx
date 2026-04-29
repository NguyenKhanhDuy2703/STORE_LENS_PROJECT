const EmptyState = ({ hasAnalyzed }) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="text-4xl mb-3">{hasAnalyzed ? "🔍" : "📊"}</div>
        <p className="text-sm font-semibold text-slate-700 mb-1">
            {hasAnalyzed ? "Không tìm thấy xu hướng nào" : "Chưa có dữ liệu phân tích"}
        </p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {hasAnalyzed
                ? "Thử giảm độ phổ biến tối thiểu hoặc độ chắc chắn để tìm thêm xu hướng."
                : "Chọn loại phân tích và nhấn \"Phân tích ngay\" để khám phá hành vi khách hàng."}
        </p>
    </div>
);

export default EmptyState;
