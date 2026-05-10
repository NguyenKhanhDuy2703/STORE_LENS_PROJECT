import React from 'react';

const CameraZoneFilter = ({
  selectedCamera,
  selectedZone,
  setSelectedZone,
  cameraOptions,
  availableZoneOptions,
  zonesLoading,
  handleSelectCamera,
}) => {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="camera-filter" className="text-sm font-semibold text-muted-foreground">
            Camera
          </label>
          <select
            id="camera-filter"
            value={selectedCamera}
            onChange={(event) => handleSelectCamera(event.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all_cameras">Tất cả Camera</option>
            {cameraOptions.map((camera) => (
              <option key={camera.code} value={camera.code}>
                {camera.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="zone-filter" className="text-sm font-semibold text-muted-foreground">
            Khu vực (Zone)
          </label>
          <select
            id="zone-filter"
            value={selectedZone}
            onChange={(event) => setSelectedZone(event.target.value)}
            disabled={zonesLoading}
            className="h-11 px-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all_zones">Tất cả Khu vực</option>
            {availableZoneOptions.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CameraZoneFilter;
