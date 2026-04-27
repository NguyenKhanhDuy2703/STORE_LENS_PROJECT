import { Link } from 'react-router-dom';

/**
 * Footer Component - The Info Bar
 * Minimal and clean footer with copyright and quick links
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-muted-foreground text-sm">
            © 2026 <span className="font-semibold gradient-text">SpaceLens</span> — C2SE.11 Team
          </div>

          {/* System Version */}
          <div className="flex items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-accent/20 bg-accent/5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
                Edge AI &amp; OpenVINO · v2.0.1
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 text-sm">
            <a href="/privacy" className="text-muted-foreground hover:text-accent transition-colors duration-200">
              Chính sách bảo mật
            </a>
            <span className="text-border">•</span>
            <a href="/docs" className="text-muted-foreground hover:text-accent transition-colors duration-200">
              Tài liệu kỹ thuật
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
