export const CameraFilters = ({
  searchTerm,
  onSearchTermChange,
  selectedStore,
  onSelectedStoreChange,
  selectedStatus,
  onSelectedStatusChange,
  storeOptions,
  onCreateCamera,
}) => {
  const inputClass =
    'w-full h-10 rounded-xl border border-border bg-muted/50 px-3.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 placeholder:text-muted-foreground/50';

  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-md">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Tìm kiếm camera
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Tìm kiếm camera..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Cửa hàng
            </label>
            <select
              value={selectedStore}
              onChange={(e) => onSelectedStoreChange(e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="all">Tất cả cửa hàng</option>
              {storeOptions.map((store) => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onSelectedStatusChange(e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="disconnect">Mất kết nối</option>
              <option value="error">Lỗi kết nối</option>
              <option value="online">Trực tuyến</option>
              <option value="offline">Ngoại tuyến</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateCamera}
          className="group inline-flex items-center gap-2 h-10 rounded-xl bg-gradient-accent px-5 text-sm font-semibold text-white shadow-sm hover:shadow-accent transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] xl:w-auto w-full justify-center"
        >
          + Thêm mới camera
        </button>
      </div>
    </div>
  );
};
