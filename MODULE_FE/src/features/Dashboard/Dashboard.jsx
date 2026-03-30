import React from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import AreaDetails from './components/AreaDetails';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-100">
      <Header />
      
      <main className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Charts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          <AreaDetails />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;