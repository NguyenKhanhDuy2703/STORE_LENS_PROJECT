import { useState, useRef, useEffect, useMemo } from "react";
import { Camera, HelpCircle, Upload, Trash2, X } from "lucide-react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
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
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_CANVAS_WIDTH = 1200;
const MAX_CANVAS_HEIGHT = 700;

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
  const fileInputRef = useRef(null);

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
      MAX_CANVAS_WIDTH / imageSize.width,
      MAX_CANVAS_HEIGHT / imageSize.height,
      1,
    );

    return {
      width: Math.round(imageSize.width * ratio),
      height: Math.round(imageSize.height * ratio),
    };
  }, [imageSize]);

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
      imgUrl: null,
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

  const handleUploadImg = (e) => {
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
      imgUrl: null,
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
    <div className="min-h-screen w-full bg-gray-50 px-1 py-3 sm:px-2 lg:px-3">
      <div className="mx-auto w-full max-w-[1860px] grid grid-cols-12 gap-3 md:gap-4">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">Thanh bên Camera</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">Danh sách camera</div>
            </div>
            <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1 lg:max-h-[74vh]">
              {cameraOptions.map((camera) => (
                <button
                  key={camera.cameraCode}
                  onClick={() => setSelectedCameraCode(camera.cameraCode)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selectedCameraCode === camera.cameraCode
                      ? "border-purple-500 bg-purple-600 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-800 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{camera.cameraName}</div>
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-purple-600 shadow-sm">
                    <Camera size={16} />
                  </div>
                </button>
              ))}
              {cameraOptions.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  Chưa có camera cho cơ sở này.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5 lg:p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{selectedCamera?.cameraName || "Chọn camera"}</h1>
                <p className="mt-1 text-sm text-gray-500">Khu vực thiết lập vùng quản lý (Zones)</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <HelpCircle size={16} /> Hướng dẫn
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 transition"
                >
                  <Upload size={16} /> {imageUrl ? "Thay đổi ảnh" : "Thêm ảnh nền"}
                </button>
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
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Trash2 size={16} /> Xóa điểm cuối
                    </button>
                    <button
                      onClick={handleCancelDrawing}
                      className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      <X size={16} /> Hủy vẽ
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-12 gap-3 lg:gap-4">
              <div className="col-span-12 xl:col-span-9 space-y-4">
                <div className="relative flex h-[620px] xl:h-[700px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-slate-50 overflow-hidden">
                  {previewImageUrl && imageSize.width > 0 && imageSize.height > 0 ? (
                    <Stage width={stageDisplaySize.width} height={stageDisplaySize.height} className="bg-white" onClick={handleStageClick}>
                      <Layer>
                        <KonvaImage image={loadedImage} width={stageDisplaySize.width} height={stageDisplaySize.height} />
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
                    <div className="text-center text-slate-500">
                      <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                        <Camera size={40} />
                      </div>
                      <div className="font-medium uppercase tracking-wider">Bản đồ vùng Camera</div>
                      <div className="mt-2 text-xs">Vui lòng thêm ảnh nền để bắt đầu vẽ</div>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
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
                    <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50 p-4 text-sm text-purple-700">
                      Nhấn trực tiếp vào ảnh để vẽ 4 điểm cho zone. Sau khi đủ 4 điểm, form sẽ xuất hiện.
                    </div>
                  )}
                  {currentPoints.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={removeLastPoint}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Xóa điểm cuối
                      </button>
                      <button
                        onClick={handleCancelDrawing}
                        className="flex-1 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                      >
                        Hủy vẽ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Zone List */}
              <div className="col-span-12 xl:col-span-3">
                <div className="flex h-[380px] xl:h-[700px] flex-col rounded-2xl border border-gray-200 bg-white p-4">
                  <h2 className="text-sm font-semibold text-gray-900">Danh sách vùng</h2>
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