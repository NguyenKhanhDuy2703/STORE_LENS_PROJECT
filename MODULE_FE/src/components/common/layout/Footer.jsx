import { Link } from 'react-router-dom';

/**
 * Footer Component - The Info Bar
 * Minimal and clean footer with copyright and quick links
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-slate-500 text-sm">
            © 2026 <span className="font-semibold" style={{
            color: '#1E40AF'
          }}>SpaceLens</span> - C2SE.11 Team
          </div>

          {/* System Version */}
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-blue-700 text-xs font-medium">
                Vận hành bởi Edge AI &amp; OpenVINO | Phiên bản 2.0.1
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-4 text-sm">
            <Link to="/privacy" className="text-slate-500 hover:text-blue-700 transition-colors">
              Chính sách bảo mật
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/docs" className="text-slate-500 hover:text-blue-700 transition-colors">
              Tài liệu kỹ thuật
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
