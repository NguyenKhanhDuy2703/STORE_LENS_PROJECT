const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-slate-900 mb-1">Cài đặt tài khoản</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Trang cài đặt tạm thời cho hồ sơ, bảo mật và tùy chỉnh cá nhân.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>
          <p className="mt-2 text-sm text-slate-600">
            Khu vực này sẽ chứa tên hiển thị, email, số điện thoại và ảnh đại diện.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Bảo mật</h2>
          <p className="mt-2 text-sm text-slate-600">
            Khu vực này sẽ chứa đổi mật khẩu, phiên đăng nhập và các tùy chọn xác thực.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Settings;