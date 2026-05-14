const EmptyState = ({ hasAnalyzed }) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
        <p className="text-base font-semibold text-slate-700 mb-2">
            {hasAnalyzed
                ? "Chưa tìm thấy xu hướng nào phù hợp"
                : "Chưa có kết quả phân tích"}
        </p>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {hasAnalyzed
                ? 'Thử mở "Bộ lọc nâng cao" và kéo thanh "Bỏ qua xu hướng quá hiếm gặp" sang trái để tìm thêm kết quả.'
                : 'Nhấn nút "Phân tích ngay" bên trên. Hệ thống sẽ tự động xem lại toàn bộ dữ liệu camera và tìm ra các xu hướng di chuyển của khách hàng.'}
        </p>
    </div>
);

export default EmptyState;
