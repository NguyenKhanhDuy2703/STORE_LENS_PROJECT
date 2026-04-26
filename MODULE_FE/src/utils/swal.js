import Swal from 'sweetalert2';

const baseAlertOptions = {
  confirmButtonText: 'Đóng',
};

const baseCompactModalOptions = {
  width: 360,
  backdrop: 'rgba(15, 23, 42, 0.12)',
  customClass: {
    popup: 'rounded-xl shadow-2xl',
    title: 'text-lg font-semibold',
    htmlContainer: 'text-sm',
  },
};

export const showAlert = (options = {}) => Swal.fire({ ...baseAlertOptions, ...options });

export const showSuccessAlert = ({ title = 'Thành công', text = '', ...options } = {}) => {
  return showAlert({ icon: 'success', title, text, ...options });
};

export const showErrorAlert = ({ title = 'Lỗi', text = '', ...options } = {}) => {
  return showAlert({ icon: 'error', title, text, ...options });
};

export const showWarningAlert = ({ title = 'Cảnh báo', text = '', ...options } = {}) => {
  return showAlert({ icon: 'warning', title, text, ...options });
};

export const showCompactSuccessAlert = ({ title = 'Thành công', text = '', ...options } = {}) => {
  return showSuccessAlert({ ...baseCompactModalOptions, title, text, ...options });
};

export const showCompactErrorAlert = ({ title = 'Lỗi', text = '', ...options } = {}) => {
  return showErrorAlert({ ...baseCompactModalOptions, title, text, ...options });
};

export const showConfirmDeleteAlert = ({
  title = 'Xóa sản phẩm?',
  text = 'Bạn có chắc muốn xóa sản phẩm này không?',
  confirmButtonText = 'Xóa',
  cancelButtonText = 'Hủy',
  ...options
} = {}) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#64748b',
    width: 360,
    backdrop: 'rgba(15, 23, 42, 0.18)',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      title: 'text-lg font-semibold',
      htmlContainer: 'text-sm',
    },
    ...options,
  });
};
