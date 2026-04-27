import { BarChart3, TrendingUp, Package, Search, AlertCircle, Clock } from 'lucide-react';

const EmptyState = ({
  type = 'default',
  title = 'Không có dữ liệu',
  description = 'Hiện tại không có thông tin để hiển thị',
  actionText,
  onAction,
  customIcon,
  size = 'medium',
}) => {
  const icons = {
    chart:   <BarChart3 className="w-12 h-12 text-muted-foreground/40" />,
    trend:   <TrendingUp className="w-12 h-12 text-muted-foreground/40" />,
    product: <Package className="w-12 h-12 text-muted-foreground/40" />,
    search:  <Search className="w-12 h-12 text-muted-foreground/40" />,
    error:   <AlertCircle className="w-12 h-12 text-muted-foreground/40" />,
    loading: <Clock className="w-12 h-12 text-muted-foreground/40" />,
    default: <BarChart3 className="w-12 h-12 text-muted-foreground/40" />,
  };

  const sizeStyles = {
    small:  { padding: 'py-8 px-4',  titleSize: 'text-sm',   descSize: 'text-xs' },
    medium: { padding: 'py-12 px-6', titleSize: 'text-base', descSize: 'text-sm' },
    large:  { padding: 'py-16 px-8', titleSize: 'text-lg',   descSize: 'text-sm' },
  };

  const current = sizeStyles[size] || sizeStyles.medium;

  return (
    <div className={`flex flex-col items-center justify-center ${current.padding} bg-muted/50 rounded-2xl border border-border`}>
      <div className="mb-4 p-4 rounded-2xl bg-muted">
        {customIcon || icons[type] || icons.default}
      </div>
      <h3 className={`${current.titleSize} font-semibold text-foreground mb-1.5 text-center tracking-tight`}>
        {title}
      </h3>
      <p className={`${current.descSize} text-muted-foreground text-center mb-5 max-w-xs leading-relaxed`}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-gradient-accent text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-accent transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
