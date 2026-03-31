export const INITIAL_CUSTOMERS = [
  { 
    id: 'GYM-001', 
    name: 'Nguyen Minh Anh', 
    membershipPackage: 'Premium 12 thang', 
    status: 'Đang hoạt động', 
    frequency: 5, 
    expiryDate: '15/8/2026', 
    riskWarning: false, 
    avatar: 'https://i.pravatar.cc/150?u=11' 
  },
  { 
    id: 'GYM-002', 
    name: 'Tran Quoc Bao', 
    membershipPackage: 'Basic 6 thang', 
    status: 'Hết hạn', 
    frequency: 1, 
    expiryDate: '28/12/2025', 
    riskWarning: true, 
    avatar: 'https://i.pravatar.cc/150?u=12' 
  },
  { 
    id: 'GYM-003', 
    name: 'Le Thu Ha', 
    membershipPackage: 'Standard 3 thang', 
    status: 'Bảo lưu', 
    frequency: 0, 
    expiryDate: '30/3/2026', 
    riskWarning: true, 
    avatar: 'https://i.pravatar.cc/150?u=13' 
  },
  { 
    id: 'GYM-004', 
    name: 'Pham Gia Huy', 
    membershipPackage: 'Premium 12 thang', 
    status: 'Đang hoạt động', 
    frequency: 4, 
    expiryDate: '10/10/2026', 
    riskWarning: false, 
    avatar: 'https://i.pravatar.cc/150?u=14' 
  },
];

export const ANALYTICS_MOCK = {
  kpi: { 
    totalMembers: 1250, totalMembersGrowth: 12, 
    returnRate: 65.5, returnRateGrowth: 5, 
    avgDwellMinutes: 45, avgDwellGrowthMinutes: 3 
  },
 segments: [
    { name: 'Khách thân thiết', percent: 40, count: 2, color: '#4F46E5' }, // Màu tím
    { name: 'Khách vãng lai', percent: 40, count: 2, color: '#10B981' },   // Màu xanh lá
    { name: 'Khách tiềm năng', percent: 20, count: 1, color: '#D97706' },  // Màu cam
  ],
  aiInsights: [
    { id: 1, title: 'Tối ưu giờ cao điểm', message: 'Nhóm khách "Tiềm năng" thường đến vào lúc 18h-20h. Hãy đẩy thêm PT hỗ trợ khung giờ này.' },
    { id: 2, title: 'Cảnh báo rời bỏ', message: 'Tỷ lệ khách "Hết hạn" tăng 5% ở chi nhánh Quận 7. Cần tung gói gia hạn ưu đãi.' }
  ]
  
};