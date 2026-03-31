import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

// Dữ liệu giả
import { INITIAL_CUSTOMERS, ANALYTICS_MOCK } from './mockData';

// Components nội bộ (Đã đổi tên đồng nhất)
import { CustomerCard } from './components/CustomerCard';
import { CustomerStats } from './components/CustomerStats';
import { CustomerAnalytics } from './components/CustomerAnalytics';
import { CustomerFilter } from './components/CustomerFilter';
import { CustomerTable } from './components/CustomerTable';
import { DetailModal, EditModal, DeleteConfirmModal } from './components/CustomerModals';

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAnalyticsCollapsed, setIsAnalyticsCollapsed] = useState(false);
  const [modal, setModal] = useState({ type: null, data: null });

  const filteredData = useMemo(() => {
    return customers.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.status === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [customers, searchTerm, selectedCategory]);

  const handleUpdate = (updated) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    setModal({ type: null, data: null });
  };

  const handleDelete = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setModal({ type: null, data: null });
  };

  return (
    <div className="space-y-6">
      {/* Thống kê & Phân tích */}
      <CustomerCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Phân tích khách hàng</h2>
          <button onClick={() => setIsAnalyticsCollapsed(!isAnalyticsCollapsed)} className="flex items-center gap-2 px-3 py-1 border rounded-lg text-sm">
            <span>{isAnalyticsCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
            <ChevronDown size={16} className={isAnalyticsCollapsed ? '' : 'rotate-180'} />
          </button>
        </div>
        {!isAnalyticsCollapsed && (
          <>
            <CustomerStats stats={ANALYTICS_MOCK.kpi} />
            <CustomerAnalytics analytics={ANALYTICS_MOCK} />
          </>
        )}
      </CustomerCard>

      {/* Bộ lọc */}
      <CustomerFilter 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
      />

      {/* Bảng dữ liệu */}
      <CustomerCard className="overflow-hidden">
        <CustomerTable 
          data={filteredData} 
          onOpenDetail={(d) => setModal({ type: 'detail', data: d })}
          onOpenEdit={(d) => setModal({ type: 'edit', data: d })}
          onConfirmDelete={(d) => setModal({ type: 'delete', data: d })}
        />
      </CustomerCard>

      {/* Lớp Modals */}
      <DetailModal isOpen={modal.type === 'detail'} data={modal.data} onClose={() => setModal({ type: null, data: null })} />
      <EditModal isOpen={modal.type === 'edit'} data={modal.data} onClose={() => setModal({ type: null, data: null })} onSave={handleUpdate} />
      <DeleteConfirmModal isOpen={modal.type === 'delete'} data={modal.data} onClose={() => setModal({ type: null, data: null })} onConfirm={() => handleDelete(modal.data?.id)} />
    </div>
  );
};