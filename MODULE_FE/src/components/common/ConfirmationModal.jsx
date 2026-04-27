import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, message, onYes, onNo, yesText = 'Có', noText = 'Không' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity"
        onClick={onNo}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100">
              <AlertCircle className="text-amber-600" size={18} />
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Xác nhận</h3>
          </div>
          <button
            onClick={onNo}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
          <button
            onClick={onNo}
            className="px-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-all duration-200"
          >
            {noText}
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all duration-200 shadow-sm hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {yesText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
