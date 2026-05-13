import { Save } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { useSelector } from "react-redux";

const CATEGORIES = [
  "Lễ tân / Check-in",
  "Khu vực Cardio",
  "Khu vực Tạ tự do",
  "Máy tập cơ (Machine Weights)",
  "Phòng Yoga / Lớp học",
  "Khu vực Giãn cơ",
  "Khu vực Nghỉ ngơi",
  "Tủ đồ / Hành lang",
];
const ZoneForm = ({ zone, isEditing, onSave, onCancel, onChange, onEdit }) => {
  const productsState = useSelector((state) => state.products || {});
  const categories = productsState?.categories || [];
  
  // Lấy danh sách các zone hiện tại để gợi ý lại các category custom mà user đã nhập
  const cameraZonesObj = useSelector((state) => state.cameraZones?.selectedCamera?.zones);
  const existingZonesArray = Array.isArray(cameraZonesObj) ? cameraZonesObj : (cameraZonesObj?.zones || []);
  
  const customCategories = existingZonesArray
    .map(z => z.categoryName || z.category_name)
    .filter(Boolean);

  // Gộp danh mục mặc định và danh mục user tự nhập (loại bỏ trùng lặp)
  const categoryOptions = [...new Set([...(categories.length > 0 ? categories : CATEGORIES), ...customCategories])];

  return (
    <div className="mt-4 bg-card p-5 rounded-2xl border border-border shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <h3 className="font-bold mb-5 text-emerald-800 dark:text-emerald-400 text-lg flex items-center gap-2 relative z-10">
        {isEditing ? "✏️ Chỉnh sửa khu vực" : "➕ Thiết lập khu vực mới"}
      </h3>
      
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Zone Name Input */}
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Tên Zone
            </label>
            <input
              type="text"
              value={zone?.zoneName || ""}
              onChange={(e) => onChange({ ...zone, zoneName: e.target.value })}
              placeholder="Ví dụ: Quầy thanh toán..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm"
            />
          </div>

          {/* Category Select */}
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Phân loại
            </label>
            <div className="relative">
              <input
                type="text"
                list="category-suggestions"
                value={zone?.categoryName || ""}
                onChange={(e) => onChange({ ...zone, categoryName: e.target.value })}
                placeholder="Chọn hoặc nhập mới..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm"
              />
              <datalist id="category-suggestions">
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Color Picker */}
          <div className="md:col-span-4 flex flex-col">
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Màu nhận diện
            </label>
            <div className="p-1 bg-background border border-border rounded-xl inline-block shadow-sm self-start">
              <ColorPicker
                selectedColor={zone?.color || "#10B981"}
                onColorChange={(color) => onChange({ ...zone, color: color })}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-5 mt-5 border-t border-emerald-200/50 dark:border-emerald-800/50 justify-end">
          {isEditing && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 border border-border bg-card hover:bg-muted font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Hủy bỏ
            </button>
          )}
          <button
            onClick={!isEditing ? onSave : onEdit }
            disabled={!zone?.zoneName || !zone?.color}
            className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 text-sm min-w-[160px]"
          >
            <Save size={18} className="mr-2" />
            {isEditing ? "Cập nhật thay đổi" : "Lưu vùng nhận diện"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneForm;