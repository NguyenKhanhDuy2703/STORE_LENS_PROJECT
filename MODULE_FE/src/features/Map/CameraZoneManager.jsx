import { useState, useRef, useEffect, useMemo } from "react";
import { Camera, HelpCircle, Upload, Trash2, X, Layers, Save } from "lucide-react";
import { Stage, Layer, Image as KonvaImage, Line as KonvaLine } from "react-konva";
import useImage from "use-image";
import { processImageUpload } from "./map.helpers";
import Swal from "sweetalert2";
import { fetchListZone, fetchCreateAndUpdateZone, fetchDeleteZone } from "./ManagerCamera.thunk";
import { useDispatch, useSelector } from "react-redux";
import { addZone, deleteZone as deleteZoneAction, editZone } from "./cameraZonesSlice";
import ZoneRenderer from "../shared/zones/ZoneRenderer";
import ZonesList from "./components/ZonesList";
import ZoneForm from "./components/ZoneForm";
import { DrawingPoints as ToolDrawZone } from "./components/ToolDrawZone";
import { useZoneDrawing } from "../shared/zones/useZoneDrawing";
import { denormalizePoints, getRelativePointer, normalizePoints } from "../../utils/coordinateUtils";
import { getCameraWithZonesByLocationId } from "../../services/camera.api";
import { uploadZoneImage } from "../../services/zone.api";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_CANVAS_WIDTH = 1200;
const MAX_CANVAS_HEIGHT = 620;

const pointsFlatToObjects = (flatPoints = []) => {
  if (!Array.isArray(flatPoints)) return [];
  const points = [];
  for (let index = 0; index < flatPoints.length; index += 2) {
    points.push({
      x: Number(flatPoints[index] ?? 0),
      y: Number(flatPoints[index + 1] ?? 0),
    });
  }
  return points;
};

const pointsObjectsToFlat = (points = []) => {
  if (!Array.isArray(points)) return [];
  return points.flatMap((point) => [Number(point?.x ?? 0), Number(point?.y ?? 0)]);
};

const isNormalizedObjects = (points = []) => {
  if (!Array.isArray(points) || points.length === 0) return false;
  return points.every((point) => point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1);
};

const CameraZoneManager = () => {
  const [cameraOptions, setCameraOptions] = useState([]);
  const [selectedCameraCode, setSelectedCameraCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(MAX_CANVAS_WIDTH);

  const selectedCamera = cameraOptions.find((cam) => cam.cameraCode === selectedCameraCode);
  const cameraZonesState = useSelector((state) => state.cameraZones);
  const { locationId, userLocationId } = useSelector((state) => state.filter);
  const selectedCameraState = cameraZonesState?.selectedCamera;
  const stateBackgroundImage = selectedCameraState?.zones?.backgroundImage || "";
  const previewImageUrl = imageUrl || stateBackgroundImage;
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [loadedImage] = useImage(previewImageUrl, "anonymous");
  const [draftZone, setDraftZone] = useState({ zoneId: null, zoneName: "", categoryName: "", color: "#3B82F6" });
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [stageScale] = useState(1);
  const [stageCenter] = useState({ x: 0, y: 0 });

  const stageDisplaySize = useMemo(() => {
    if (!imageSize.width || !imageSize.height) {
      return { width: 0, height: 0 };
    }

    const ratio = Math.min(
      containerWidth / imageSize.width,
      MAX_CANVAS_HEIGHT / imageSize.height,
      1,
    );

    return {
      width: Math.round(imageSize.width * ratio),
      height: Math.round(imageSize.height * ratio),
    };
  }, [imageSize, containerWidth]);

  const {
    currentPoints,
    addPointFromStage,
    resetPoints,
    removeLastPoint,
    setCurrentPoints,
  } = useZoneDrawing({ imageSize: stageDisplaySize, stageScale, stageCenter });

  const isEditing = Boolean(editingZoneId);

  const parseZonePoints = (coordinates) => {
    if (!coordinates) return [];

    const scaleX = (stageDisplaySize.width || imageSize.width) / (imageSize.width || 1);
    const scaleY = (stageDisplaySize.height || imageSize.height) / (imageSize.height || 1);

    const toDisplayFlat = (pointObjects) => {
      if (!Array.isArray(pointObjects) || pointObjects.length === 0) return [];
      const pts = isNormalizedObjects(pointObjects)
        ? denormalizePoints(pointObjects, imageSize).map((p) => ({ x: p.x * scaleX, y: p.y * scaleY }))
        : pointObjects;
      return pointsObjectsToFlat(pts);
    };

    if (typeof coordinates === "string") {
      try {
        const parsed = JSON.parse(coordinates);
        if (!Array.isArray(parsed)) return [];
        const pointObjects = Array.isArray(parsed[0])
          ? parsed.map((p) => ({ x: Number(p[0] ?? 0), y: Number(p[1] ?? 0) }))
          : pointsFlatToObjects(parsed);
        return toDisplayFlat(pointObjects);
      } catch {
        return [];
      }
    }

    if (Array.isArray(coordinates)) {
      if (coordinates.length > 0 && typeof coordinates[0] === "object") {
        const pointObjects = coordinates.map((p) =>
          Array.isArray(p)
            ? { x: Number(p[0] ?? 0), y: Number(p[1] ?? 0) }
            : { x: Number(p.x ?? 0), y: Number(p.y ?? 0) }
        );
        return toDisplayFlat(pointObjects);
      }
      return toDisplayFlat(pointsFlatToObjects(coordinates));
    }

    return [];
  };

  const getNormalizedFlatPoints = () => {
    const scaleX = imageSize.width / (stageDisplaySize.width || imageSize.width);
    const scaleY = imageSize.height / (stageDisplaySize.height || imageSize.height);
    const scaledPoints = pointsFlatToObjects(currentPoints).map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));
    const normalized = normalizePoints(scaledPoints, imageSize);
    return normalized.map((p) => [p.x, p.y]);
  };

  const handleCancelDrawing = () => {
    resetPoints();
    setEditingZoneId(null);
    setDraftZone({ zoneId: null, zoneName: "", categoryName: "", color: "#3B82F6" });
  };

  const handleStartEdit = (zone) => {
    const points = parseZonePoints(zone.coordinates || zone.polygon_coordinates || []);
    setCurrentPoints(points);
    setEditingZoneId(zone.zoneId ?? zone.zone_id ?? null);
    setDraftZone({
      zoneId: zone.zoneId ?? zone.zone_id ?? null,
      zoneName: zone.zoneName ?? zone.zone_name ?? "",
      categoryName: zone.categoryName ?? zone.category_name ?? "",
      color: zone.color ?? "#3B82F6",
    });
  };

  const handleUpdateZone = async () => {
    if (!editingZoneId) return;
    if (!effectiveLocationId) return;

    const apiPayload = {
      locationId: effectiveLocationId,
      cameraCode: selectedCameraCode,
      listZones: [
        {
          zoneName: draftZone.zoneName,
          zoneId: editingZoneId,
          coordinates: JSON.stringify(getNormalizedFlatPoints()),
          categoryName: draftZone.categoryName,
        },
      ],
      imgUrl: uploadedImageUrl || null,
    };

    try {
      await dispatch(fetchCreateAndUpdateZone(apiPayload)).unwrap();
      const updatedZone = {
        cameraCode: selectedCameraCode,
        camera_id: selectedCameraCode,
        location_id: effectiveLocationId,
        zoneId: editingZoneId,
        zone_name: draftZone.zoneName,
        categoryName: draftZone.categoryName,
        category_name: draftZone.categoryName,
        color: draftZone.color,
        coordinates: getNormalizedFlatPoints(),
        polygon_coordinates: getNormalizedFlatPoints(),
      };
      dispatch(editZone({ cameraCode: selectedCameraCode, zoneData: updatedZone }));
      handleCancelDrawing();
    } catch (error) {
      console.error("Failed to update zone:", error);
      Swal.fire({
        title: "Lỗi cập nhật zone",
        text: error || "Không thể cập nhật zone trên server.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    }
  };


  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchCameraOptions = async () => {
      if (!effectiveLocationId) {
        if (isMounted) {
          setCameraOptions([]);
          setSelectedCameraCode("");
        }
        return;
      }

      try {
        const cameras = await getCameraWithZonesByLocationId(effectiveLocationId);
        const options = (Array.isArray(cameras) ? cameras : [])
          .filter((camera) => camera?.camera_code)
          .map((camera) => ({
            cameraCode: camera.camera_code,
            cameraName: camera.camera_name || camera.camera_code,
          }));

        if (!isMounted) return;

        setCameraOptions(options);

        if (options.length === 0) {
          setSelectedCameraCode("");
          return;
        }

        setSelectedCameraCode((prevSelectedCameraCode) => {
          const hasCurrentSelection = options.some((camera) => camera.cameraCode === prevSelectedCameraCode);
          return hasCurrentSelection ? prevSelectedCameraCode : options[0].cameraCode;
        });
      } catch (error) {
        if (!isMounted) return;
        setCameraOptions([]);
        setSelectedCameraCode("");
        console.error("Failed to load camera list:", error);
      }
    };

    fetchCameraOptions();

    return () => {
      isMounted = false;
    };
  }, [effectiveLocationId]);

  useEffect(() => {
    if (selectedCameraCode && effectiveLocationId) {
      setImageUrl("");
      setUploadedImageUrl("");
      dispatch(fetchListZone({ locationId: effectiveLocationId, cameraCode: selectedCameraCode }));
    }
  }, [dispatch, selectedCameraCode, effectiveLocationId]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (loadedImage) {
      setImageSize({ width: loadedImage.width, height: loadedImage.height });
    }
  }, [loadedImage]);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleUploadImg = async (e) => {
    const file = e.target.files?.[0];
    const { url, error } = processImageUpload(file, MAX_IMAGE_SIZE_BYTES);

    if (error) {
      Swal.fire({
        title: "Lỗi upload",
        text: error,
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setImageUrl(url);
    try {
      const cloudUrl = await uploadZoneImage(file);
      setUploadedImageUrl(cloudUrl);
    } catch {
      Swal.fire({
        title: "Lỗi upload",
        text: "Không thể tải ảnh lên server.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
      setImageUrl("");
    }
  };

  const handleSaveImage = async () => {
    if (!uploadedImageUrl || !effectiveLocationId) return;
    try {
      await dispatch(fetchCreateAndUpdateZone({
        locationId: effectiveLocationId,
        cameraCode: selectedCameraCode,
        listZones: [],
        imgUrl: uploadedImageUrl,
      })).unwrap();
      setImageUrl("");
      setUploadedImageUrl("");
      dispatch(fetchListZone({ locationId: effectiveLocationId, cameraCode: selectedCameraCode }));
    } catch (error) {
      Swal.fire({
        title: "Lỗi lưu ảnh",
        text: error || "Không thể lưu ảnh nền.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    }
  };

  const handleStageClick = (e) => {
    if (currentPoints.length >= 8) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = getRelativePointer(e.evt, stage.container());
    if (!pointer) return;
    addPointFromStage({ stageX: pointer.x, stageY: pointer.y });
  };

  const handleSaveZone = async () => {
    if (!effectiveLocationId) return;

    const zoneId = `ZONE_${selectedCameraCode}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const apiPayload = {
      locationId: effectiveLocationId,
      cameraCode: selectedCameraCode,
      listZones: [
        {
          zoneName: draftZone.zoneName,
          zoneId,
          coordinates: JSON.stringify(getNormalizedFlatPoints()),
          categoryName: draftZone.categoryName,
        },
      ],
      imgUrl: uploadedImageUrl || null,
    };

    try {
      await dispatch(fetchCreateAndUpdateZone(apiPayload)).unwrap();
      const localZone = {
        cameraCode: selectedCameraCode,
        camera_id: selectedCameraCode,
        location_id: effectiveLocationId,
        zoneId,
        zone_name: draftZone.zoneName,
        categoryName: draftZone.categoryName,
        category_name: draftZone.categoryName,
        color: draftZone.color,
        coordinates: getNormalizedFlatPoints(),
        polygon_coordinates: getNormalizedFlatPoints(),
      };
      dispatch(addZone(localZone));
      resetPoints();
      setDraftZone({ zoneName: "", categoryName: "", color: "#3B82F6" });
    } catch (error) {
      console.error("Failed to save zone:", error);
      Swal.fire({
        title: "Lỗi lưu zone",
        text: error || "Không thể lưu zone vào server.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    }
  };
  return (
    <div className="w-full py-3">
      <div className="w-full grid grid-cols-12 gap-3 md:gap-4">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-4">
              <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-semibold">Thanh bên Camera</div>
              <div className="mt-1 text-lg font-semibold text-foreground">Danh sách camera</div>
            </div>
            <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1 lg:max-h-[74vh]">
              {cameraOptions.map((camera) => (
                <button
                  key={camera.cameraCode}
                  onClick={() => setSelectedCameraCode(camera.cameraCode)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                    selectedCameraCode === camera.cameraCode
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "border-border bg-background text-foreground hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{camera.cameraName}</div>
                  </div>
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors ${
                    selectedCameraCode === camera.cameraCode ? "bg-white/20 text-white" : "bg-muted text-emerald-600 dark:text-emerald-400"
                  }`}>
                    <Camera size={16} />
                  </div>
                </button>
              ))}
              {cameraOptions.length === 0 && (
                <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Chưa có camera cho cơ sở này.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 md:p-5 lg:p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">
                  {selectedCamera?.cameraName || "Chọn camera"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Khu vực thiết lập vùng phân tích (Zones)</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  <HelpCircle size={16} /> Hướng dẫn
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 hover:shadow-emerald-500/25 transition-all duration-200 active:scale-95"
                >
                  <Upload size={16} /> {imageUrl ? "Thay đổi ảnh" : "Thêm ảnh nền"}
                </button>
                {uploadedImageUrl && (
                  <button
                    onClick={handleSaveImage}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-all duration-200 active:scale-95"
                  >
                    <Save size={16} /> Lưu ảnh nền
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadImg}
                  className="hidden"
                  accept="image/*"
                />
                {(currentPoints.length > 0 || isEditing) && (
                  <>
                    <button
                      onClick={removeLastPoint}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all duration-200"
                    >
                      <Trash2 size={16} className="text-amber-500" /> Xóa điểm cuối
                    </button>
                    <button
                      onClick={handleCancelDrawing}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20 dark:hover:bg-rose-500/20 transition-all duration-200"
                    >
                      <X size={16} /> Hủy vẽ
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-12 gap-3 lg:gap-4">
              <div className="col-span-12 xl:col-span-9 space-y-4">
                <div ref={canvasContainerRef} className="relative flex h-[620px] xl:h-[700px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted overflow-hidden">
                  {previewImageUrl && imageSize.width > 0 && imageSize.height > 0 ? (
                    <Stage width={stageDisplaySize.width} height={stageDisplaySize.height} className="bg-card" onClick={handleStageClick}>
                      <Layer>
                        <KonvaImage image={loadedImage} width={stageDisplaySize.width} height={stageDisplaySize.height} />
                        
                        {/* Lưới định vị (Grid lines) */}
                        {Array.from({ length: Math.floor(stageDisplaySize.width / 50) }).map((_, i) => (
                          <KonvaLine
                            key={`v-${i}`}
                            points={[i * 50, 0, i * 50, stageDisplaySize.height]}
                            stroke="rgba(255, 255, 255, 0.35)"
                            strokeWidth={1.5}
                            dash={[5, 5]}
                          />
                        ))}
                        {Array.from({ length: Math.floor(stageDisplaySize.height / 50) }).map((_, i) => (
                          <KonvaLine
                            key={`h-${i}`}
                            points={[0, i * 50, stageDisplaySize.width, i * 50]}
                            stroke="rgba(255, 255, 255, 0.35)"
                            strokeWidth={1.5}
                            dash={[5, 5]}
                          />
                        ))}

                        <ZoneRenderer
                          zones={selectedCameraState?.zones?.zones || []}
                          coordinateMode="auto"
                          imageSize={stageDisplaySize}
                          showLabels={true}
                          showHandles={false}
                          isEditing={false}
                        />
                        {currentPoints.length > 0 && (
                          <ToolDrawZone points={currentPoints} scale={stageScale} />
                        )}
                      </Layer>
                    </Stage>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                      <div className="relative mb-6">
                        <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-pulse blur-xl"></div>
                        <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Camera size={40} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-foreground">Không gian Canvas Trống</div>
                      <div className="mt-2 text-sm max-w-xs">
                        Vui lòng thêm ảnh nền Camera để kích hoạt công cụ vẽ Zone
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  {(isEditing || currentPoints.length >= 8) ? (
                    <ZoneForm
                      zone={draftZone}
                      isEditing={isEditing}
                      onChange={setDraftZone}
                      onSave={handleSaveZone}
                      onEdit={handleUpdateZone}
                      onCancel={handleCancelDrawing}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-500/5 p-5 text-sm text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg shrink-0">
                        <Layers size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Nhấn trực tiếp vào ảnh để vẽ 4 điểm cho Zone. Bảng thiết lập sẽ xuất hiện khi đủ 4 điểm.
                    </div>
                  )}
                  {currentPoints.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={removeLastPoint}
                        className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:border-foreground/20 transition-all duration-200 flex justify-center items-center gap-2"
                      >
                        <Trash2 size={16} className="text-amber-500" /> Xóa điểm cuối
                      </button>
                      <button
                        onClick={handleCancelDrawing}
                        className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20 dark:hover:bg-rose-500/20 transition-all duration-200 flex justify-center items-center gap-2"
                      >
                        <X size={16} /> Hủy vẽ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Zone List */}
              <div className="col-span-12 xl:col-span-3">
                <div className="flex h-[380px] xl:h-[700px] flex-col rounded-2xl border border-border bg-card p-4">
                  <h2 className="text-sm font-semibold text-foreground">Danh sách vùng</h2>
                  <div className="mt-4 flex-1 overflow-y-auto">
                    <ZonesList
                      zones={selectedCameraState?.zones?.zones || []}
                      onEdit={handleStartEdit}
                      onDelete={async (zoneId) => {
                        try {
                          if (!effectiveLocationId) return;
                          await dispatch(fetchDeleteZone({ locationId: effectiveLocationId, cameraCode: selectedCameraCode, zoneId })).unwrap();
                          dispatch(deleteZoneAction({ cameraCode: selectedCameraCode, zoneId }));
                        } catch (error) {
                          console.error("Failed to delete zone:", error);
                          Swal.fire({
                            title: "Lỗi xóa zone",
                            text: error || "Không thể xoá zone khỏi server.",
                            icon: "error",
                            confirmButtonColor: "#7c3aed",
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CameraZoneManager;