import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import AreaDetails from './components/AreaDetails';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100">
      <main className="p-6 md:p-8 space-y-6 max-w-[1760px] mx-auto">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Charts.Traffic />
          </div>
          <div className="lg:col-span-2">
            <Charts.Revenue />
          </div>
        </div>

        {/* Zone Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          <AreaDetails.TopZones />
          <AreaDetails.Performance />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;