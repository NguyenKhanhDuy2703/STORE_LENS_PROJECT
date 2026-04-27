const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-foreground tracking-tight mb-1">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground leading-relaxed">
          Trang cài đặt tạm thời cho hồ sơ, bảo mật và tùy chỉnh cá nhân.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-md">
          <h2 className="font-semibold text-foreground">Thông tin cá nhân</h2>
          <p className="mt-2 text-muted-foreground">
            Khu vực này sẽ chứa tên hiển thị, email, số điện thoại và ảnh đại diện.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-md">
          <h2 className="font-semibold text-foreground">Bảo mật</h2>
          <p className="mt-2 text-muted-foreground">
            Khu vực này sẽ chứa đổi mật khẩu, phiên đăng nhập và các tùy chọn xác thực.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Settings;
