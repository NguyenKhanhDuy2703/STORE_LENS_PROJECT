
import { Users, MapPin, BarChart3, Plus } from 'lucide-react';
import { useState } from 'react';

const CUSTOM_OPTION_VALUE = '__custom__';

const CATEGORIES = {
  RETENTION: {
    id: 'retention',
    label: 'Hội viên',
    icon: Users,
    iconClass: 'text-indigo-500',
    unit: 'ngày',
    thresholdLabel: 'Số ngày đến tập trong 30 ngày gần nhất',
    valuePlaceholder: 'Ví dụ: 8',
    conditionOptions: [
      'Nhóm đi tập ít',
      'Nhóm đi tập đều',
      'Nhóm đi tập thường xuyên'
    ],
    actionOptions: [
      'Nhắc lịch tập qua Zalo',
      'Gọi điện tư vấn lộ trình tập',
      'Tặng ưu đãi gói PT cá nhân'
    ]
  },
  ZONE: {
    id: 'zone',
    label: 'Khu vực',
    icon: MapPin,
    iconClass: 'text-teal-500',
    unit: 'người',
    thresholdLabel: 'Số khách trong khu vực',
    valuePlaceholder: 'Ví dụ: 20',
    conditionOptions: [
      'Khu máy chạy bộ',
      'Khu vực thanh toán',
      'Khu tạ'
    ],
    actionOptions: [
      'Thông báo quản lý',
      'Điều phối thêm nhân sự',
      'Mở thêm quầy phục vụ'
    ]
  },
  REVENUE: {
    id: 'revenue',
    label: 'Doanh thu ',
    icon: BarChart3,
    iconClass: 'text-amber-500',
    unit: 'VNĐ',
    thresholdLabel: 'Giá trị doanh thu ngưỡng',
    valuePlaceholder: 'Ví dụ: 5000000',
    conditionOptions: [
      'Chi tiêu tích lũy',
      'Giá trị đơn trung bình',
      'Doanh thu theo tháng'
    ],
    actionOptions: [
      'Phân tệp VIP',
      'Phân tệp Tiềm năng',
      'Phân tệp Cần kích hoạt lại'
    ]
  }
};

const RuleForm = ({ onAdd, category }) => {
  const [formData, setFormData] = useState({ condition: '', conditionCustom: '', value: '', action: '', actionCustom: '' });
  const config = CATEGORIES[category.toUpperCase()] || CATEGORIES.RETENTION;
  // If user selects "Thêm mới...", use the free-text input instead of dropdown value.
  const selectedCondition = formData.condition === CUSTOM_OPTION_VALUE ? formData.conditionCustom.trim() : formData.condition;
  const selectedAction = formData.action === CUSTOM_OPTION_VALUE ? formData.actionCustom.trim() : formData.action;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Keep validation simple: only submit when all business fields are present.
    if (!selectedCondition || !formData.value || !selectedAction) return;

    onAdd({
      condition: selectedCondition,
      value: Number(formData.value),
      action: selectedAction,
      category: category.toLowerCase(),
      unit: config.unit,
      isActive: true
    });
    setFormData({ condition: '', conditionCustom: '', value: '', action: '', actionCustom: '' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-4">
      <div className="flex items-center gap-2 mb-6">
        <config.icon className={config.iconClass} size={20} />
        <h3 className="font-bold text-slate-900">Thêm quy tắc {config.label}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Điều kiện</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.condition}
            onChange={(e) => setFormData({
              ...formData,
              condition: e.target.value,
              conditionCustom: e.target.value === CUSTOM_OPTION_VALUE ? formData.conditionCustom : ''
            })}
          >
            <option value="">Chọn điều kiện...</option>
            {config.conditionOptions.map((condition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
            <option value={CUSTOM_OPTION_VALUE}>Thêm mới...</option>
          </select>
          {formData.condition === CUSTOM_OPTION_VALUE && (
            <input
              type="text"
              className="mt-2 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Nhập điều kiện mới"
              value={formData.conditionCustom}
              onChange={(e) => setFormData({ ...formData, conditionCustom: e.target.value })}
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">{config.thresholdLabel}</label>
          <div className="relative flex items-center gap-2">
            <input 
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"
              placeholder={config.valuePlaceholder}
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
            />
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{config.unit}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Hành động</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"
            value={formData.action}
            onChange={(e) => setFormData({
              ...formData,
              action: e.target.value,
              actionCustom: e.target.value === CUSTOM_OPTION_VALUE ? formData.actionCustom : ''
            })}
          >
            <option value="">Chọn hành động...</option>
            {config.actionOptions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
            <option value={CUSTOM_OPTION_VALUE}>Thêm mới...</option>
          </select>
          {formData.action === CUSTOM_OPTION_VALUE && (
            <input
              type="text"
              className="mt-2 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Nhập hành động mới"
              value={formData.actionCustom}
              onChange={(e) => setFormData({ ...formData, actionCustom: e.target.value })}
            />
          )}
        </div>

        <div className="pt-2">
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-100">
            <Plus size={18} /> Thêm vào bảng
          </button>
        </div>
      </form>

      {/* NATURAL LANGUAGE PREVIEW */}
      {selectedCondition && (
        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-[12px] text-slate-500 italic">
            "Hệ thống sẽ <span className="text-teal-600 font-bold">{selectedAction || '...'}</span> khi <span className="text-indigo-600 font-bold">{selectedCondition}</span> đạt từ <span className="font-bold">{formData.value || '0'} {config.unit}</span> trở lên."
          </p>
        </div>
      )}
    </div>
  );
};
export default RuleForm;