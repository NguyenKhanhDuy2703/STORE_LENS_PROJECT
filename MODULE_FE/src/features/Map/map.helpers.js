export const processImageUpload = (file, maxSize) => {
  if (!file) {
    return { url: "", name: "", error: "Vui lòng chọn một tập tin." };
  }
  if (!file.type.startsWith("image/")) {
    return { url: "", name: "", error: "Định dạng tập tin không hợp lệ. Vui lòng chọn ảnh." };
  }
  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { 
      url: "", 
      name: "", 
      error: `Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới ${sizeInMB}MB.` 
    };
  }
  try {
    const previewUrl = URL.createObjectURL(file);
    return {
      url: previewUrl,
      name: file.name,
      error: ""
    };
  } catch (err) {
    return { url: "", name: "", error: "Có lỗi xảy ra khi xử lý ảnh." };
  }
};