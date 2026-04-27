import { useState, useEffect } from 'react';
import { Users, UserPlus, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Tổng hội viên"
            value={totalMembers}
            icon={<Users size={24} />}
            trend="Khách đang hoạt động"
          />
          <StatsCard
            title="Khách mới trong tháng"
            value={newMembersThisMonth}
            icon={<UserPlus size={24} />}
            trend="Tháng 4/2026"
          />
          <StatsCard
            title="Tỷ lệ vắng mặt"
            value={`${absenteeismRate}%`}
            icon={<AlertCircle size={24} />}
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
