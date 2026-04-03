import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Dữ liệu giả
import { ANALYTICS_MOCK, INITIAL_CUSTOMERS } from './mockData';

// Components nội bộ (Đã đổi tên đồng nhất)
import { CustomerCard } from './components/CustomerCard';
import { CustomerStats } from './components/CustomerStats';
import { CustomerFilter } from './components/CustomerFilter';
import { CustomerTable } from './components/CustomerTable';
import { DetailModal, EditModal, DeleteConfirmModal } from './components/CustomerModals';
import { CreateUserModal } from './components/CreateUserModal';

export const ManagerUser = () => {
  const [users, setUsers] = useState(INITIAL_CUSTOMERS);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [modal, setModal] = useState({ type: null, data: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const canCreateUser = true;

  const filteredData = useMemo(() => {
    return users.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || item.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleUpdate = (updated) => {
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setModal({ type: null, data: null });
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((item) => item.id !== id));
    setModal({ type: null, data: null });
  };

  const handleCreateUser = async (payload) => {
    console.log('User Created', payload);
    const nextId = `USER-${String(users.length + 1).padStart(3, '0')}`;
    setUsers((prev) => [
      {
        id: nextId,
        name: payload.fullName,
        accountName: payload.accountName,
        email: payload.email,
        role: payload.role,
        assignedStore: payload.assignedStore.toUpperCase(),
        status: 'Hoạt động',
        avatar: `https://i.pravatar.cc/150?u=${payload.accountName}`,
      },
      ...prev,
    ]);
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Thống kê */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-slate-900 mb-1">Quản lý truy cập hệ thống</h1>
        <p className="text-sm text-slate-600 leading-relaxed">Quản lý danh sách tài khoản nhân sự, vai trò và quyền truy cập vào trang quản trị SpaceLens.</p>
      </div>

      {/* Thống kê */}
      <CustomerCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium tracking-tight text-slate-900">Thống kê tài khoản</h2>
          <ChevronDown size={16} className="text-slate-300 opacity-0" />
        </div>
        <CustomerStats stats={ANALYTICS_MOCK.kpi} />
      </CustomerCard>

      {/* Bộ lọc */}
      <CustomerFilter 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedRole} setSelectedCategory={setSelectedRole}
        canCreateUser={canCreateUser}
        onOpenCreate={() => setIsCreateModalOpen(true)}
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
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={false}
      />
    </div>
  );
};

export default ManagerUser;