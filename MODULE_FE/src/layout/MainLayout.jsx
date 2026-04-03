import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { GlobalFilter } from '../components/functionComponent/GlobalFilter';

export const MainLayout = () => {
  const location = useLocation();
  const showGlobalFilter = location.pathname === '/' || 
                          location.pathname.includes('/dwell-time') ||
                          location.pathname.includes('/config/rules');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
     
      <Header />

      <div className="flex flex-col flex-1">
  
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-2 shadow-sm">
          <div className="mx-auto w-full max-w-[1760px]">
             <div className="text-[11px] uppercase tracking-tight text-slate-400 font-medium">
                <span className="hover:text-teal-600 cursor-pointer transition-colors">SpaceLens</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-600">
                  {location.pathname === '/' ? 'Tổng quan' : 'Phân tích'}
                </span>
             </div>
          </div>
        </div>
        {showGlobalFilter && (
          <GlobalFilter />
        )}

        <main className={`mx-auto w-full max-w-[1760px] px-6 pb-12 flex-grow lg:px-10 2xl:px-14 ${!showGlobalFilter ? 'mt-6' : 'mt-4'}`}>
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};