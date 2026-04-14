import { createSlice, current } from "@reduxjs/toolkit";
import { fetchCreateAndUpdateZone, fetchDeleteZone, fetchListZone } from "./ManagerCamera.thunk";
const cameraZonesSlice = createSlice({
  name: "cameraZones",
  initialState: {
    zones: [],
    selectedCamera: null,
    loading: false,
    error: null,
  },
  reducers : {
    setSlectedCamera(state, action) {
      state.selectedCamera = action.payload;
    },
    addZone(state, action) {
      const newZone = action.payload;
      const cameraCode = newZone.cameraCode || state.selectedCamera?.cam?.cameraCode;
      if (!cameraCode) {
        return;
      }

      let cameraEntry = state.zones.find((z) => z.cameraCode === cameraCode);
      if (!cameraEntry) {
        cameraEntry = {
          cameraCode,
          backgroundImage: state.selectedCamera?.zones?.backgroundImage || "",
          zones: [],
        };
        state.zones.push(cameraEntry);
      }

      cameraEntry.zones = cameraEntry.zones || [];
      cameraEntry.zones.push(newZone);

      if (!state.selectedCamera) {
        state.selectedCamera = {
          cam: { cameraCode },
          zones: {
            cameraCode,
            backgroundImage: cameraEntry.backgroundImage,
            zones: [],
          },
        };
      }

      if (state.selectedCamera.cam?.cameraCode === cameraCode) {
        state.selectedCamera.zones = state.selectedCamera.zones || {
          cameraCode,
          backgroundImage: cameraEntry.backgroundImage,
          zones: [],
        };
        state.selectedCamera.zones.zones = state.selectedCamera.zones.zones || [];
        state.selectedCamera.zones.zones.push(newZone);
      }
    },
    deleteZone(state, action) {
      const { cameraCode, zoneId } = action.payload;
      const checkZone = state.zones.find((z) => z.cameraCode === cameraCode);
      if (!checkZone) {
        return;
      }

      const tempZones = (checkZone.zones || []).filter((z) => {
        return (z.zoneId ?? z.zone_id) !== zoneId;
      });

      checkZone.zones = tempZones;

      if (state.selectedCamera?.cam?.cameraCode === cameraCode) {
        state.selectedCamera.zones = {
          ...state.selectedCamera.zones,
          zones: tempZones,
        };
      }
    }, 
    editZone(state, action) {
      const { cameraCode, zoneData } = action.payload;
      const zoneIdToMatch = zoneData.zoneId ?? zoneData.zone_id;
      const checkZone = state.zones.find((z) => z.cameraCode === cameraCode);
      if (checkZone) {
        const zoneIndex = checkZone.zones.findIndex((z) => (z.zoneId ?? z.zone_id) === zoneIdToMatch);
        if (zoneIndex !== -1) {
          checkZone.zones[zoneIndex] = zoneData;
        }
      } else {
        throw new Error("Camera not found for editing zone");
      }
      if (state.selectedCamera?.cam?.cameraCode === cameraCode) {
        const selectedZoneIndex = state.selectedCamera.zones?.zones?.findIndex((z) => (z.zoneId ?? z.zone_id) === zoneIdToMatch);
        if (selectedZoneIndex !== -1) {
          state.selectedCamera.zones.zones[selectedZoneIndex] = zoneData;
        }
      }
    },
    addBackgroundImage(state, action) {
      const { cameraCode, backgroundImage } = action.payload;
      const checkZone = state.zones.find( (z) => z.cameraCode === cameraCode );
      if (checkZone) {
        checkZone.backgroundImage = backgroundImage;
      }else {
        throw new Error("Camera not found for adding background image");
      }
      state.selectedCamera.zones.backgroundImage = backgroundImage;
      console.log("State after adding background image: ", current(state));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListZone.fulfilled, (state, action) => {
        const { snapshot_url, zones: fetchedZones } = action.payload;
        const cameraCode = fetchedZones?.[0]?.camera_id || null;

        state.zones = [
          {
            cameraCode,
            backgroundImage: snapshot_url,
            zones: fetchedZones,
          },
        ];

        state.selectedCamera = {
          cam: { cameraCode },
          zones: {
            cameraCode,
            backgroundImage: snapshot_url,
            zones: fetchedZones,
          },
        };

        state.loading = false;
        state.error = null;
      })
      .addCase(fetchListZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCreateAndUpdateZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreateAndUpdateZone.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCreateAndUpdateZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeleteZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteZone.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { cameraCode, zoneId } = action.meta.arg || {};
        if (cameraCode && zoneId) {
          const cameraEntry = state.zones.find((z) => z.cameraCode === cameraCode);
          if (cameraEntry) {
            cameraEntry.zones = (cameraEntry.zones || []).filter((z) => (z.zoneId ?? z.zone_id) !== zoneId);
          }
          if (state.selectedCamera?.cam?.cameraCode === cameraCode) {
            state.selectedCamera.zones = {
              ...state.selectedCamera.zones,
              zones: (state.selectedCamera.zones?.zones || []).filter((z) => (z.zoneId ?? z.zone_id) !== zoneId),
            };
          }
        }
      })
      .addCase(fetchDeleteZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }

});
export const { setSlectedCamera, addZone, deleteZone, editZone, addBackgroundImage } = cameraZonesSlice.actions;
export default cameraZonesSlice.reducer;
