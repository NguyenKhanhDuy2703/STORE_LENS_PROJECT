import { useState, useEffect } from 'react';
import StatsCard from './components/StatsCard';
import { MemberTable } from './components/MemberTable';
import { MemberDetailPanel } from './components/MemberDetailPanel';

export default function ManagermentMember() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]); 

  const mockMembers = [
    {
      id: '1',
      name: 'Nguyễn Văn An',
      code: 'KH001',
      phone: '0901234567',
      birthday: '15/03/1990',
      sessionsThisMonth: 12,
      totalSessions: 20,
      status: 'active',
      note: 'Tập đều đặn',
      lastVisit: '18/04/2026',
    },
    {
      id: '2',
      name: 'Trần Thị Bình',
      code: 'KH002',
      phone: '0912345678',
      birthday: '22/07/1995',
      sessionsThisMonth: 8,
      totalSessions: 20,
      status: 'inactive',
      note: 'Bận công việc',
      lastVisit: '14/04/2026',
    },
    {
      id: '3',
      name: 'Lê Minh Cường',
      code: 'KH003',
      phone: '0923456789',
      birthday: '10/11/1988',
      sessionsThisMonth: 2,
      totalSessions: 20,
      status: 'inactive',
      note: 'Về quê',
      lastVisit: '05/04/2026',
    },
    {
      id: '4',
      name: 'Phạm Thu Dung',
      code: 'KH004',
      phone: '0934567890',
      birthday: '18/05/1992',
      sessionsThisMonth: 15,
      totalSessions: 20,
      status: 'active',
      note: 'Tập buổi sáng',
      lastVisit: '18/04/2026',
    },
    {
      id: '5',
      name: 'Hoàng Văn Em',
      code: 'KH005',
      phone: '0945678901',
      birthday: '30/09/1985',
      sessionsThisMonth: 6,
      totalSessions: 20,
      status: 'active',
      note: 'Lười',
      lastVisit: '13/04/2026',
    },
    {
      id: '6',
      name: 'Võ Thị Phượng',
      code: 'KH006',
      phone: '0956789012',
      birthday: '25/12/1993',
      sessionsThisMonth: 18,
      totalSessions: 20,
      status: 'active',
      note: 'VIP member',
      lastVisit: '18/04/2026',
    },
  ];


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // const response = await supabase.from('members').select('*');
        // if (response.data) setMembers(response.data);
        
        setMembers(mockMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  const totalMembers = members.length;
  const newMembersThisMonth = 2; 
  const absentMembers = members.filter((m) => m.status === 'inactive').length;
  const absenteeismRate = totalMembers > 0 ? ((absentMembers / totalMembers) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý hội viên</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và chăm sóc hội viên hiệu quả</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Tổng hội viên"
            value={totalMembers}
            icon={<IconUsers />}
            trend="Khách đang hoạt động"
          />
          <StatsCard
            title="Khách mới trong tháng"
            value={newMembersThisMonth}
            icon={<IconUserPlus />}
            trend="Tháng 4/2026"
          />
          <StatsCard
            title="Tỷ lệ vắng mặt"
            value={`${absenteeismRate}%`}
            icon={<IconAlert />}
            trend="Vắng trên 7 ngày"
          />
        </div>

        <MemberTable
          members={members}
          onSelectMember={setSelectedMember}
          selectedMemberId={selectedMember?.id}
        />
      </div>

      {selectedMember && (
        <MemberDetailPanel 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </div>
  );
}

const IconUsers = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconUserPlus = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path  strokeLinecap="round"  strokeLinejoin="round"  strokeWidth={2}  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"  />
  </svg>
);
const IconAlert = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path  strokeLinecap="round"  strokeLinejoin="round"  strokeWidth={2}  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"  />
  </svg>
);