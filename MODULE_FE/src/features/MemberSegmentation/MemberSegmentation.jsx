import{ useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetMembers, fetchGetSegments } from './member.thunk';
import SegmentationOverview from './components/SegmentationOverview';
import ClusterProfiles from './components/ClusterProfiles';
import MemberListInsights from './components/MemberListInsights';


const MemberSegmentation = () => {
    const dispatch = useDispatch();
    const { members = [], segments = [], loading = false } = useSelector((state) => state.memberSegmentation ?? {});

    useEffect(() => {
        dispatch(fetchGetMembers());
        dispatch(fetchGetSegments());
    }, [dispatch]);

    const overviewData = {
        total: members.length,
        active: members.filter((m) => (m.visits_per_month || 0) >= 10).length,
        growth: "+12%",
        segments: segments.length,
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-medium tracking-tight text-slate-900">Quản lý khách hàng</h1>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    Theo dõi phân khúc hội viên, tần suất ghé thăm và các chỉ số hành vi của khách hàng.
                </p>
            </div>
            
            {loading && (
                <div className="flex items-center gap-2 text-teal-600 animate-pulse">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    <span className="font-medium text-sm tracking-tight text-slate-600">AI đang xử lý dữ liệu không gian...</span>
                </div>
            )}

            <SegmentationOverview data={overviewData} />
            <ClusterProfiles segments={segments} />
            <MemberListInsights members={members} />
        </div>
    );
};

export default MemberSegmentation;