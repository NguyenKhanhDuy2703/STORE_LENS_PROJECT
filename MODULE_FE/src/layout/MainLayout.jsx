import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { GlobalFilter } from '../components/functionComponent/GlobalFilter';
import Loading from '../components/common/Loading';
import socket from '../services/socket';
import { addRealtimeAlert } from '../features/Notification/notification.slice';

export const MainLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const previousPathRef = useRef(location.pathname);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  const { locationId, userLocationId } = useSelector((state) => state.filter);
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  const dashboardLoading = useSelector((state) => {
    const dashboardState = state.dashboard || {};
    return Boolean(
      dashboardState.kpiMetricsLoading ||
      dashboardState.hourlyCustomerFlowLoading ||
      dashboardState.revenueLast7DaysLoading ||
      dashboardState.zoneAnalyticsLoading
    );
  });

  const heatmapLoading = useSelector((state) => Boolean(state.heatmap?.isLoading));
  const customerRuleLoading = useSelector((state) => Boolean(state.customerRules?.loading));
  const cameraZoneLoading = useSelector((state) => Boolean(state.cameraZones?.loading));
  const memberLoading = useSelector((state) => Boolean(state.memberSegmentation?.loading));

  const isRouteDataLoading = useMemo(() => {
    if (location.pathname === '/' || location.pathname.includes('/dashboard')) {
      return dashboardLoading;
    }

    if (location.pathname.includes('/heatmap')) {
      return heatmapLoading;
    }

    if (location.pathname.includes('/config/rules')) {
      return customerRuleLoading;
    }

    if (location.pathname.includes('/config/zones')) {
      return cameraZoneLoading;
    }

    if (location.pathname.includes('/management/customers')) {
      return memberLoading;
    }

    return false;
  }, [
    location.pathname,
    dashboardLoading,
    heatmapLoading,
    customerRuleLoading,
    cameraZoneLoading,
    memberLoading,
  ]);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      setIsRouteTransitioning(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isRouteTransitioning) {
      return;
    }

    if (isRouteDataLoading) {
      return;
    }

    const timer = setTimeout(() => {
      setIsRouteTransitioning(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [isRouteTransitioning, isRouteDataLoading]);

  const shouldShowRouteLoading = isRouteTransitioning || isRouteDataLoading;

  // Kết nối socket toàn cục tại layout — đảm bảo badge Thông báo cập nhật realtime
  // dù user đang ở bất kỳ trang nào (không chỉ trang /notification)
  useEffect(() => {
    if (!effectiveLocationId) return;

    const joinRoom = () => {
      socket.emit('join_location', effectiveLocationId);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
      socket.once('connect', joinRoom);
    }

    const handleNewAlert = (notification) => {
      dispatch(addRealtimeAlert(notification));
    };

    socket.on('new_alert', handleNewAlert);

    return () => {
      socket.off('new_alert', handleNewAlert);
      socket.off('connect', joinRoom);
    };
  }, [dispatch, effectiveLocationId]);

  const showGlobalFilter = location.pathname === '/' || 
                          location.pathname.includes('/dashboard') ||
                          location.pathname.includes('/management/assets') ||
                          location.pathname.includes('/dwell-time') ||
                          location.pathname.includes('/config/rules');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Loading isLoading={shouldShowRouteLoading} text="Đang tải dữ liệu trang..." />

      <Header />

      <div className="flex flex-col flex-1">
        {/* Breadcrumb bar */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-2 shadow-sm">
          <div className="mx-auto w-full max-w-[1760px]">
            <div className="label-mono flex items-center gap-2">
              <span className="hover:text-accent cursor-pointer transition-colors duration-200">SpaceLens</span>
              <span className="text-border">/</span>
              <span className="text-foreground/60">
                {location.pathname === '/' || location.pathname.includes('/dashboard') ? 'Tổng quan' : 'Phân tích'}
              </span>
            </div>
          </div>
        </div>

        {showGlobalFilter && <GlobalFilter />}

        <main className={`mx-auto w-full max-w-[1760px] px-4 pb-12 grow lg:px-6 2xl:px-8 ${!showGlobalFilter ? 'mt-6' : 'mt-4'}`}>
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};