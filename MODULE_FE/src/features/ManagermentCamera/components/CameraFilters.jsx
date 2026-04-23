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
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Tìm kiếm camera</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Tìm kiếm camera..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Cửa hàng</label>
            <select
              value={selectedStore}
              onChange={(e) => onSelectedStoreChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Tất cả cửa hàng</option>
              {storeOptions.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => onSelectedStatusChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
          className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 xl:w-auto"
        >
          + Thêm mới camera
        </button>
      </div>
    </div>
  );
};
