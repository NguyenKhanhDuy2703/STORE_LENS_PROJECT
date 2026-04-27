const Loading = ({ isLoading, text = 'Đang tải...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinner với accent gradient */}
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 border-[3px] border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-transparent border-t-accent rounded-full animate-spin" />
        </div>

        <p className="text-white text-sm font-medium tracking-tight">{text}</p>

        {/* Pulsing dots với accent color */}
        <div className="flex gap-1.5 justify-center mt-3">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-accent-secondary rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
