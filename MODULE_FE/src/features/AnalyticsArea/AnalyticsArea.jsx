import { useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  UserCheck,
  Clock,
  Target,
  Loader,
} from "lucide-react";
import { GlobalFilter } from "@/components/functionComponent/GlobalFilter";

import StatCard from "./components/StatCard";
import AreaTrafficChart from "./components/AreaTrafficChart";
import CameraZoneFilter from "./components/CameraZoneFilter";
import AnalyticsTable from "./components/AnalyticsTable";
import {
  fetchAreaPerformanceDetails,
  fetchAreaHourlyTraffic,
  fetchAreaKPIs,
  fetchCameraAndZoneInfo,
} from "./areaAnalysis.thunk";
import socket from "../../services/socket";
import { updateRealtimePeople } from "../Dashboard/dashboard.slice";

const AnalyticsArea = () => {
  const dispatch = useDispatch();
  const [selectedCamera, setSelectedCamera] = useState("all_cameras");
  const [selectedZone, setSelectedZone] = useState("all_zones");

  // Redux state
  const { performanceDetails, hourlyTraffic, areaKPIs, cameras, zones, loading, errors } =
    useSelector((state) => state.areaAnalysis);
  const { locationId } = useSelector((state) => state.filter);
  // Lấy current_visitors từ dashboard slice — được socket cập nhật realtime
  const realtimeCurrentVisitors = useSelector((state) => state.dashboard?.kpiMetrics?.current_visitors ?? null);

  // Socket.IO — join room và lắng nghe realtime_people_count
  useEffect(() => {
    if (!locationId) return;

    if (!socket.connected) socket.connect();
    socket.emit("join_location", locationId);

    const handleRealtimeUpdate = (data) => {
      dispatch(updateRealtimePeople({
        people_current: data.people_current,
        zone_counts: data.zone_counts,
      }));
    };

    socket.on("realtime_people_count", handleRealtimeUpdate);

    return () => {
      socket.off("realtime_people_count", handleRealtimeUpdate);
    };
  }, [dispatch, locationId]);
  
  useEffect(() => {
    if (!locationId) return;

    setSelectedCamera("all_cameras");
    setSelectedZone("all_zones");

    dispatch(fetchCameraAndZoneInfo({ locationId }));
  }, [locationId, dispatch]);

  const availableZoneOptions = useMemo(() => {
    const zoneList = Array.isArray(zones) ? zones : [];

    if (selectedCamera === "all_cameras") {
      return zoneList;
    }

    return zoneList.filter((zone) => zone.cameraCode === selectedCamera);
  }, [zones, selectedCamera]);

  useEffect(() => {
    if (selectedZone === "all_zones") {
      return;
    }

    const hasSelectedZone = availableZoneOptions.some((zone) => zone.id === selectedZone);
    if (!hasSelectedZone) {
      setSelectedZone("all_zones");
    }
  }, [availableZoneOptions, selectedZone]);

  useEffect(() => {
    if (!locationId) return;

    const zoneId = selectedZone === "all_zones" ? undefined : selectedZone;

    dispatch(fetchAreaHourlyTraffic({ locationId, type: "today", zoneId }));
    dispatch(fetchAreaKPIs({ locationId, type: "today", zoneId }));
  }, [locationId, selectedZone, dispatch]);

  useEffect(() => {
    if (!locationId) return;

    const cameraId = selectedCamera === "all_cameras" ? undefined : selectedCamera;

    dispatch(fetchAreaPerformanceDetails({ locationId, type: "today", cameraId }));
  }, [locationId, selectedCamera, dispatch]);

  const handleSelectCamera = (cameraCode) => {
    setSelectedCamera(cameraCode);
    setSelectedZone("all_zones");
  };

  // Transform hourly traffic for chart
  const chartData = useMemo(() => {
    const source = Array.isArray(hourlyTraffic)
      ? hourlyTraffic
      : hourlyTraffic?.hourly;

    if (!Array.isArray(source) || source.length === 0) {
      return [];
    }

    return source.map((item) => ({
      time: item.hour || item.time || "",
      value: item.count || item.value || 0,
    }));
  }, [hourlyTraffic]);

  // Get KPI values for stat cards
  const kpiStats = useMemo(() => {
    if (!areaKPIs) {
      return {
        totalTraffic: "0",
        currentCustomers: "0",
        avgDwellTime: "0:00m",
        performanceRate: "0%",
      };
    }
    
    return {
      totalTraffic: (areaKPIs.total_visitors || 0).toLocaleString("vi-VN"),
      currentCustomers: (realtimeCurrentVisitors ?? areaKPIs.current_people ?? 0).toLocaleString("vi-VN"),
      avgDwellTime: `${Math.floor((areaKPIs.avg_dwell_time || 0) / 60)}:${String(
        Math.floor((areaKPIs.avg_dwell_time || 0) % 60),
      ).padStart(2, "0")}m`,
      performanceRate: `${(areaKPIs.conversion_rate || 0).toFixed(1)}%`,
    };
  }, [areaKPIs, realtimeCurrentVisitors]);

  // Calculate max dwell time for progress bar scaling
  const maxDwellTime = useMemo(() => {
    const rows = Array.isArray(performanceDetails) ? performanceDetails : [];
    return Math.max(...rows.map((item) => item.avgDwellMinutes), 1);
  }, [performanceDetails]);

  const isLoading =
    loading.performanceDetails || loading.hourlyTraffic || loading.kpis;
  const hasError =
    errors.performanceDetails || errors.hourlyTraffic || errors.kpis;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <GlobalFilter />
      <main className="p-6 md:p-8 max-w-[1760px] mx-auto space-y-6">
        <CameraZoneFilter
          selectedCamera={selectedCamera}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          cameraOptions={Array.isArray(cameras) ? cameras : []}
          availableZoneOptions={availableZoneOptions}
          zonesLoading={loading.cameras}
          handleSelectCamera={handleSelectCamera}
        />

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng lưu lượng ngày"
            value={kpiStats.totalTraffic}
            trend="+12%"
            isUp
            icon={<Users className="text-teal-600" />}
            bgColor="bg-teal-50"
          />
          <StatCard
            title="Số khách hiện tại"
            value={kpiStats.currentCustomers}
            trend="-2%"
            isUp={false}
            icon={<UserCheck className="text-teal-600" />}
            bgColor="bg-teal-50"
          />
          <StatCard
            title="Thời gian dừng TB"
            value={kpiStats.avgDwellTime}
            trend="-2%"
            isUp={false}
            icon={<Clock className="text-orange-500" />}
            bgColor="bg-orange-50"
          />
          <StatCard
            title="Hiệu suất khu vực"
            value={kpiStats.performanceRate}
            trend="+5.4%"
            isUp
            icon={<Target className="text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-3">
            <Loader size={20} className="text-teal-600 animate-spin" />
            <span className="text-base text-slate-600">
              Đang tải dữ liệu...
            </span>
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-700 text-sm">
            Có lỗi khi tải dữ liệu. Vui lòng thử lại.
          </div>
        )}

        {!isLoading && (
          <>
          
            <AreaTrafficChart data={chartData} />

            <AnalyticsTable
              performanceDetails={performanceDetails}
              maxDwellTime={maxDwellTime}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default AnalyticsArea;
