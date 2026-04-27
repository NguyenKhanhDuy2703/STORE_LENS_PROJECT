import { X, CheckCircle, AlertTriangle, Image as ImageIcon, Maximize, Layers } from 'lucide-react';

const RULES = [
  {
    icon: ImageIcon,
    title: '1. Tỷ lệ ảnh chuẩn',
    desc: 'Bắt buộc dùng ảnh Snapshot từ Camera (thường là 16:9). Không dùng ảnh bị cắt, ảnh dọc hoặc sơ đồ 2D.',
    color: 'bg-blue-50 border-blue-100 text-blue-600',
  },
  {
    icon: Layers,
    title: '2. Vẽ dưới mặt sàn',
    desc: 'Vẽ vùng bao quanh khu vực đi lại của khách hàng. Không vẽ trùm lên nóc kệ hàng hay trần nhà.',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  },
  {
    icon: Maximize,
    title: '3. Kích thước đủ lớn',
    desc: 'Vùng vẽ phải đủ rộng để chứa trọn vẹn ít nhất 1 người. Tránh vẽ các đường quá mảnh hoặc vùng quá nhỏ.',
    color: 'bg-amber-50 border-amber-100 text-amber-600',
  },
  {
    icon: CheckCircle,
    title: '4. Tránh chồng lấn',
    desc: 'Hạn chế vẽ các vùng đè lên nhau để tránh việc một người bị tính trùng lặp ở nhiều khu vực.',
    color: 'bg-violet-50 border-violet-100 text-violet-600',
  },
];

const ZoneGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-accent/5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle size={20} className="text-accent" />
            Quy tắc vẽ Zone chuẩn cho AI
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-muted-foreground italic">
            Để hệ thống AI (Tracking & Heatmap) hoạt động chính xác, vui lòng tuân thủ các nguyên tắc sau:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div key={rule.title} className={`border rounded-xl p-4 ${rule.color.split(' ')[0]} ${rule.color.split(' ')[1]}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${rule.color.split(' ')[0]} shrink-0`}>
                      <Icon size={18} className={rule.color.split(' ')[2]} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{rule.title}</h4>
                      <p className="text-muted-foreground mt-1">{rule.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-accent text-white font-semibold rounded-xl shadow-sm hover:shadow-accent transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Đã hiểu, bắt đầu vẽ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneGuideModal;
