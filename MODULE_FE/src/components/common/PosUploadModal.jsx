import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, UploadCloud, FileSpreadsheet } from 'lucide-react';
import { uploadPosExcelThunk } from '../../features/BusinessEvent/businessEvent.thunk';
import { showCompactSuccessAlert, showCompactErrorAlert } from '../../utils/swal';

const PosUploadModal = ({ isOpen, onClose, locationId }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { isUploading } = useSelector((state) => state.businessEvent || {});

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      checkAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      checkAndSetFile(e.target.files[0]);
    }
  };

  const checkAndSetFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      showCompactErrorAlert({ title: 'Định dạng không hợp lệ', text: 'Vui lòng chọn file .xlsx, .xls hoặc .csv' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await dispatch(uploadPosExcelThunk({ file: selectedFile, locationId })).unwrap();
      showCompactSuccessAlert({ title: 'Đã tải lên hệ thống', text: 'Dữ liệu POS đang được xử lý ngầm.' });
      handleClose();
    } catch (error) {
      showCompactErrorAlert({ title: 'Lỗi tải lên', text: error?.message || 'Không thể upload file' });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-500/20">
              <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Nhập dữ liệu POS</h2>
              <p className="text-sm text-muted-foreground">Tải lên file Excel hóa đơn bán hàng</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div 
          className={`relative flex flex-col items-center justify-center p-8 mt-2 border-2 border-dashed rounded-xl transition-all duration-200 ${
            dragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-border bg-muted/30 hover:bg-muted/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleChange} 
            className="hidden" 
          />
          
          <div className="p-4 mb-4 bg-background rounded-full shadow-sm">
            <UploadCloud size={32} className={dragActive ? 'text-emerald-500' : 'text-muted-foreground'} />
          </div>

          {selectedFile ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              <button 
                onClick={() => setSelectedFile(null)}
                className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Hủy chọn
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <button 
                  type="button"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mr-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Bấm để chọn file
                </button>
                hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-muted-foreground mt-2">Hỗ trợ định dạng: .xlsx, .csv</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : 'Tải lên dữ liệu'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PosUploadModal;
