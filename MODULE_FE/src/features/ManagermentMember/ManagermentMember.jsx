import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, UserPlus, AlertCircle, Plus, Search } from "lucide-react";
import Swal from "sweetalert2";

import { fetchMemberSummary, fetchMemberDetail, saveMemberThunk, deleteMemberThunk } from "./member.thunk";
import { clearDetail } from "./member.slice";

import StatsCard from "./components/StatsCard";
import { MemberTable } from "./components/MemberTable";
import { MemberDetailPanel } from "./components/MemberDetailPanel";
import { MemberForm } from "./components/MemberForm";

export default function ManagermentMember() {
    const dispatch = useDispatch();
    const { metrics, list, detail, loading, detailLoading, saving, error } = useSelector((s) => s.member);
    const { locationId, userLocationId } = useSelector((s) => s.filter);
    const effectiveLocationId = locationId !== "loc_all" ? locationId : userLocationId;

    const [selectedCode, setSelectedCode] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [search, setSearch] = useState("");

    // Load danh sách khi vào trang hoặc đổi location
    useEffect(() => {
        if (!effectiveLocationId) return;
        dispatch(fetchMemberSummary({ locationId: effectiveLocationId }));
    }, [dispatch, effectiveLocationId]);

    // Search với debounce đơn giản
    useEffect(() => {
        if (!effectiveLocationId) return;
        const timer = setTimeout(() => {
            dispatch(fetchMemberSummary({ locationId: effectiveLocationId, search }));
        }, 400);
        return () => clearTimeout(timer);
    }, [search, dispatch, effectiveLocationId]);

    const handleSelectMember = (member) => {
        setSelectedCode(member.code);
        dispatch(fetchMemberDetail({ locationId: effectiveLocationId, memberCode: member.code }));
    };

    const handleCloseDetail = () => {
        setSelectedCode(null);
        dispatch(clearDetail());
    };

    const handleOpenAdd = () => {
        setEditingMember(null);
        setShowForm(true);
    };

    const handleOpenEdit = (member) => {
        setEditingMember(member);
        setShowForm(true);
    };

    const handleSave = async (formData) => {
        const result = await dispatch(saveMemberThunk({ locationId: effectiveLocationId, memberData: formData }));
        if (saveMemberThunk.fulfilled.match(result)) {
            setShowForm(false);
            setEditingMember(null);
            dispatch(fetchMemberSummary({ locationId: effectiveLocationId, search }));
            Swal.fire({ icon: "success", title: "Đã lưu", timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Lỗi", text: result.payload || "Không thể lưu hội viên." });
        }
    };

    const handleDelete = (memberCode) => {
        Swal.fire({
            title: "Xóa hội viên?",
            text: "Hành động này không thể hoàn tác.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            const res = await dispatch(deleteMemberThunk({ locationId: effectiveLocationId, memberCode }));
            if (deleteMemberThunk.fulfilled.match(res)) {
                if (selectedCode === memberCode) handleCloseDetail();
                Swal.fire({ icon: "success", title: "Đã xóa", timer: 1200, showConfirmButton: false });
            } else {
                Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể xóa hội viên." });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        title="Tổng hội viên"
                        value={metrics.totalMembers}
                        icon={<Users size={22} />}
                        trend="Tất cả hội viên"
                    />
                    <StatsCard
                        title="Mới trong tháng"
                        value={metrics.newMembersThisMonth}
                        icon={<UserPlus size={22} />}
                        trend="Tháng này"
                    />
                    <StatsCard
                        title="Tỷ lệ vắng mặt"
                        value={`${metrics.absenteeismRate}%`}
                        icon={<AlertCircle size={22} />}
                        trend="Vắng trên 7 ngày"
                    />
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, mã, số điện thoại..."
                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:border-teal-400 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
                    >
                        <Plus size={15} />
                        Thêm hội viên
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <MemberTable
                        members={list}
                        selectedCode={selectedCode}
                        onSelectMember={handleSelectMember}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Detail panel */}
            {selectedCode && (
                <MemberDetailPanel
                    detail={detail}
                    loading={detailLoading}
                    onClose={handleCloseDetail}
                />
            )}

            {/* Form modal */}
            {showForm && (
                <MemberForm
                    editingMember={editingMember}
                    saving={saving}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditingMember(null); }}
                />
            )}
        </div>
    );
}
