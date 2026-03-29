import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetMembers, fetchGetSegments } from './member.thunk';
import SegmentationOverview from './components/segmentation-overview';
import ClusterProfiles from './components/cluster-profiles';
import MemberListInsights from './components/member-list-insights';
import GenAIInsights from './components/genai-insights';

const MemberSegmentation = () => {
    const dispatch = useDispatch();
    const { members = [], segments = [], loading = false } = useSelector((state) => state.memberSegmentation ?? {});

    useEffect(() => {
        // Vẫn gọi dispatch để Demo luồng xử lý của AI
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
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800"></h1>
            
            {loading && (
                <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="font-medium text-sm">AI đang xử lý dữ liệu không gian...</span>
                </div>
            )}

            <SegmentationOverview data={overviewData} />
            <ClusterProfiles segments={segments} />
            
            <GenAIInsights />
            <MemberListInsights members={members} />
        </div>
    );
};

export default MemberSegmentation;