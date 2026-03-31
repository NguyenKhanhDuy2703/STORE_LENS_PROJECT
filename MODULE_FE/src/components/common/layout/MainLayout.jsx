import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlobalFilter } from './GlobalFilter';

export const MainLayout = () => {
  const location = useLocation();
  
  // Logic: Chỉ hiện GlobalFilter ở trang Dashboard (Tổng quan)
  const showGlobalFilter = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. HEADER: Cực kỳ quan trọng 
        Phải đảm bảo component <Header /> bên trong nó có class z-[100] hoặc cao nhất
      */}
      <Header />

      <div className="flex flex-col flex-1">
        
        {/* 2. BREADCRUMBS: z-40 (Thấp hơn Header z-50+)
          sticky top-16 để nó dính ngay dưới Header (64px)
        */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-2 sticky top-16 z-40 shadow-sm">
          <div className="mx-auto w-full max-w-[1760px]">
             <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                <span className="hover:text-teal-600 cursor-pointer transition-colors">SpaceLens</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-600">
                  {location.pathname === '/' ? 'Tổng quan' : 'Phân tích'}
                </span>
             </div>
          </div>
        </div>

        {/* 3. GLOBAL FILTER: z-30 (Thấp hơn Breadcrumbs z-40)
          sticky top-[108px] (16px Header + 44px Breadcrumbs + khoảng đệm)
        */}
        {showGlobalFilter && (
          <div className="sticky top-[108px] z-30 px-6 mt-4">
            <div className="mx-auto w-full max-w-[1760px] lg:px-4 2xl:px-8">
              <GlobalFilter />
            </div>
          </div>
        )}

        {/* 4. NỘI DUNG CHÍNH: z-0 */}
        <main className={`mx-auto w-full max-w-[1760px] px-6 pb-12 flex-grow lg:px-10 2xl:px-14 ${!showGlobalFilter ? 'mt-6' : 'mt-2'}`}>
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};