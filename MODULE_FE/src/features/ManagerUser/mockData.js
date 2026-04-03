export const INITIAL_CUSTOMERS = [
  { 
    id: 'USER-001', 
    name: 'Nguyễn Minh Anh', 
    accountName: 'minhanh.admin',
    email: 'anh.nguyen@spacelens.vn',
    role: 'admin',
    assignedStore: 'STORE001',
    status: 'Hoạt động', 
    lastLogin: '03/04/2026 14:30',
    avatar: 'https://i.pravatar.cc/150?u=11' 
  },
  { 
    id: 'USER-002', 
    name: 'Trần Quốc Bảo', 
    accountName: 'quocbao.manager',
    email: 'bao.tran@spacelens.vn',
    role: 'manager',
    assignedStore: 'STORE001',
    status: 'Hoạt động', 
    lastLogin: '03/04/2026 10:15',
    avatar: 'https://i.pravatar.cc/150?u=12' 
  },
  { 
    id: 'USER-003', 
    name: 'Lê Thu Hà', 
    accountName: 'thuha.staff',
    email: 'ha.le@spacelens.vn',
    role: 'staff',
    assignedStore: 'STORE001',
    status: 'Hoạt động', 
    lastLogin: '02/04/2026 16:45',
    avatar: 'https://i.pravatar.cc/150?u=13' 
  },
  { 
    id: 'USER-004', 
    name: 'Phạm Gia Huy', 
    accountName: 'giahuy.staff',
    email: 'huy.pham@spacelens.vn',
    role: 'staff',
    assignedStore: 'STORE002',
    status: 'Hoạt động', 
    lastLogin: '01/04/2026 09:20',
    avatar: 'https://i.pravatar.cc/150?u=14' 
  },
  { 
    id: 'USER-005', 
    name: 'Võ Thanh Tùng', 
    accountName: 'thanhtung.manager',
    email: 'tung.vo@spacelens.vn',
    role: 'manager',
    assignedStore: 'STORE002',
    status: 'Tạm dừng', 
    lastLogin: '15/03/2026 13:05',
    avatar: 'https://i.pravatar.cc/150?u=15' 
  },
];

export const ANALYTICS_MOCK = {
  kpi: { 
    totalUsers: 5, 
    activeUsers: 4,
    adminUsers: 1,
    managerUsers: 2,
    staffUsers: 2
  },
  usersByRole: [
    { name: 'Admin', count: 1, color: '#7C3AED' },      // Purple
    { name: 'Manager', count: 2, color: '#3B82F6' },    // Blue
    { name: 'Staff', count: 2, color: '#64748B' },      // Slate
  ]
};