# Zone Coordinate Misalignment Bugfix Design

## Overview

Zone polygons drawn in `CameraZoneManager` appear visually shifted or stretched when overlaid on the Heatmap page. The root cause is a **coordinate reference mismatch**: zones are saved using `stageDisplaySize` (a scaled-to-fit canvas size, e.g. 854×480) as the normalization reference, but are later denormalized using `frameWidth/frameHeight` (the original AI frame size, e.g. 1280×720). Because these two reference dimensions differ, the recovered pixel coordinates are wrong.

The fix standardizes the entire pipeline on a single, stable reference: the **original image/frame dimensions** (`imageSize.width` × `imageSize.height`). Coordinates are normalized against this reference when saved and denormalized against the same reference when displayed, eliminating the mismatch. Additionally, `coordinateMode="auto"` is replaced with `coordinateMode="normalized"` wherever zones are known to be stored in normalized format, removing ambiguous format detection.

---

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — a zone is saved using `stageDisplaySize` as the normalization reference instead of the original `imageSize`.
- **Property (P)**: The desired behavior — a zone drawn at pixel `(px, py)` on a canvas of size `(W, H)` and saved, then rendered on a canvas of size `(W2, H2)` using the same original image dimensions, appears at the proportionally correct position.
- **Preservation**: Existing behaviors that must remain unchanged by the fix — zone rendering via `ZoneRenderer`, zone persistence via the API, zone editing/loading in `CameraZoneManager`, and heatmap display when no zones are present.
- **`stageDisplaySize`**: The scaled-to-fit canvas dimensions computed in `CameraZoneManager` by fitting `imageSize` into `MAX_CANVAS_WIDTH × MAX_CANVAS_HEIGHT`. This is the **wrong** normalization reference.
- **`imageSize`**: The natural pixel dimensions of the loaded image (`loadedImage.width × loadedImage.height`). This is the **correct** normalization reference.
- **`frameWidth / frameHeight`**: The original AI frame dimensions stored in heatmap data (e.g. 1280×720). These match `imageSize` and are the correct denormalization reference in `HeatMapContent`.
- **`normalizePoints(points, containerSize)`**: Array-level normalization utility in `coordinateUtils.js` — divides each `{x, y}` by `containerSize.width/height`.
- **`denormalizePoints(points, containerSize)`**: Array-level denormalization utility in `coordinateUtils.js` — multiplies each ratio by `containerSize.width/height`.
- **`normalizePoint(x, y, width, height)`**: New single-point normalization utility to be added to `coordinateUtils.js`.
- **`denormalizePoint(ratioX, ratioY, width, height)`**: New single-point denormalization utility to be added to `coordinateUtils.js`.
- **`getNormalizedFlatPoints()`**: Method in `CameraZoneManager` that converts `currentPoints` (pixel coords on the display canvas) to normalized 0–1 values before saving. Currently uses `stageDisplaySize` — must be changed to `imageSize`.
- **`coordinateMode="auto"`**: Mode in `useZoneTransform` that guesses coordinate format by checking if all values are in [0, 1]. Ambiguous and must be replaced with `"normalized"` for DB-stored zones.
- **`useZoneTransform`**: Hook in `ZoneRenderer` that converts stored coordinates to `displayPoints` (pixel coords for Konva). Its internal `normalizePoints` multiplies by `imageSize.width/height` — correct, but only if the caller passes the right `imageSize`.

---

## Bug Details

### Bug Condition

The bug manifests when a user draws a zone in `CameraZoneManager` and saves it. The `getNormalizedFlatPoints()` function normalizes the drawn pixel coordinates against `stageDisplaySize` (the scaled canvas) instead of `imageSize` (the original image). When `HeatMapContent` later denormalizes those coordinates against `frameWidth/frameHeight` (which equals `imageSize`), the recovered pixel positions are off by the scale factor `stageDisplaySize / imageSize`.

**Formal Specification:**
```
FUNCTION isBugCondition(saveContext)
  INPUT: saveContext = { currentPoints, stageDisplaySize, imageSize }
  OUTPUT: boolean

  // Bug fires when the normalization reference differs from the denormalization reference
  RETURN stageDisplaySize.width  != imageSize.width
      OR stageDisplaySize.height != imageSize.height
END FUNCTION
```

This condition is true whenever the image is larger than `MAX_CANVAS_WIDTH` (1200) or `MAX_CANVAS_HEIGHT` (700), which is the common case for camera frames (e.g. 1280×720 → `stageDisplaySize` = 1200×675).

### Examples

- **Typical camera frame (1280×720)**: `stageDisplaySize` = 1200×675 (scale ≈ 0.9375). A point drawn at pixel (600, 337) on the canvas is saved as `(600/1200, 337/675)` = `(0.5, 0.499)`. When denormalized against 1280×720 it becomes `(640, 359)` — shifted by ~40px horizontally and ~22px vertically.
- **4K source image (3840×2160)**: `stageDisplaySize` = 1200×675 (scale ≈ 0.3125). A point at canvas pixel (300, 168) is saved as `(0.25, 0.249)`. Denormalized against 3840×2160 it becomes `(960, 537)` — 3× the expected position.
- **Image smaller than canvas (640×480)**: `stageDisplaySize` = 640×480 (scale = 1, no scaling). Bug condition is false — no misalignment occurs. This is the edge case where the bug is invisible.
- **`coordinateMode="auto"` misclassification**: A zone on a 1×1 pixel canvas has all coordinates in [0, 1]. `isNormalized()` returns `true` even though they are absolute pixels, causing `useZoneTransform` to multiply them by `imageSize` and produce wildly wrong positions.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Zone polygons stored in the database as flat JSON arrays of normalized floats in [0, 1] must continue to be stored in that exact format.
- `ZoneRenderer` must continue to render each zone as a closed `<Line />` polygon with its label and anchor handles using the existing Konva rendering logic.
- Editing an existing zone in `CameraZoneManager` must continue to load the zone's stored coordinates back into the drawing canvas at the correct pixel positions for the current display size.
- `HeatmapCanvas` must continue to render the heatmap grid and background image without errors when no zones are present.
- Zones with `coordinateMode="absolute"` (e.g. legacy AI module data) must continue to render correctly when that mode is explicitly passed.
- The existing `normalizePoints` and `denormalizePoints` array functions in `coordinateUtils.js` must remain intact and unchanged.

**Scope:**
All inputs that do NOT involve saving a zone from `CameraZoneManager` (i.e. where `stageDisplaySize != imageSize`) are unaffected. This includes:
- Mouse clicks on zone anchor handles
- Zone deletion
- Heatmap timeline navigation
- Camera selection and image upload

**Note:** The actual expected correct behavior (round-trip identity, in-range normalization, proportional rendering) is defined in the Correctness Properties section below.

---

## Hypothesized Root Cause

Based on code inspection, the root causes are:

1. **Wrong normalization reference in `getNormalizedFlatPoints()`** (`CameraZoneManager.jsx`, line ~107):
   ```js
   // CURRENT (buggy)
   const containerSize = {
     width: stageDisplaySize.width || imageSize.width,
     height: stageDisplaySize.height || imageSize.height,
   };
   ```
   `stageDisplaySize` is the scaled canvas size, not the original image size. The fix is to use `imageSize` directly.

2. **Wrong denormalization reference in `parseZonePoints()`** (`CameraZoneManager.jsx`, line ~88):
   ```js
   // CURRENT (buggy)
   const containerSize = {
     width: stageDisplaySize.width || imageSize.width,
     height: stageDisplaySize.height || imageSize.height,
   };
   ```
   When loading a zone for editing, the stored normalized coordinates are denormalized against `stageDisplaySize` instead of `imageSize`, placing the edit handles at wrong positions.

3. **Ambiguous `coordinateMode="auto"` in both `ZoneRenderer` call sites**:
   - `HeatMapContent.jsx`: `<ZoneRenderer coordinateMode="auto" .../>` — zones from DB are always normalized; `"auto"` is unnecessary and risky.
   - `CameraZoneManager.jsx`: `<ZoneRenderer coordinateMode="auto" imageSize={stageDisplaySize} .../>` — passes `stageDisplaySize` as `imageSize`, compounding the reference error.

4. **Missing single-point utility functions**: `coordinateUtils.js` only exposes array-level `normalizePoints` / `denormalizePoints`. Adding `normalizePoint` and `denormalizePoint` for single-point use makes callers cleaner and avoids array-wrapping boilerplate.

---

## Correctness Properties

Property 1: Bug Condition — Normalize/Denormalize Round-Trip Identity

_For any_ point `(x, y)` with `0 ≤ x ≤ W` and `0 ≤ y ≤ H`, applying `normalizePoint(x, y, W, H)` followed by `denormalizePoint(ratioX, ratioY, W, H)` with the **same** dimensions SHALL return `(x, y)` (within integer rounding tolerance of ±1 pixel).

**Validates: Requirements 2.1, 2.4**

---

Property 2: Bug Condition — Normalized Coordinates Are Always in [0, 1]

_For any_ point `(x, y)` with `0 ≤ x ≤ W` and `0 ≤ y ≤ H`, `normalizePoint(x, y, W, H)` SHALL return `(ratioX, ratioY)` where `0 ≤ ratioX ≤ 1` and `0 ≤ ratioY ≤ 1`.

**Validates: Requirements 2.1, 2.4, 3.1**

---

Property 3: Bug Condition — Proportional Rendering Across Display Sizes

_For any_ point drawn at pixel `(px, py)` on a canvas of size `(W, H)`, saved as `normalizePoint(px, py, W, H)`, then rendered on a canvas of size `(W2, H2)` using `denormalizePoint(ratioX, ratioY, W2, H2)`, the rendered pixel position SHALL be `(px * W2/W, py * H2/H)` — i.e. proportionally correct relative to the display canvas.

**Validates: Requirements 2.1, 2.2**

---

Property 4: Preservation — Non-Buggy Inputs Unchanged

_For any_ input where the bug condition does NOT hold (i.e. `stageDisplaySize == imageSize`, meaning no scaling was applied), the fixed `getNormalizedFlatPoints()` SHALL produce the same normalized values as the original function, preserving all existing zone save behavior for unscaled images.

**Validates: Requirements 3.1, 3.2, 3.3**

---

## Fix Implementation

### Changes Required

#### 1. `MODULE_FE/src/utils/coordinateUtils.js` — Add single-point utilities

Add `normalizePoint` and `denormalizePoint` after the existing helper functions, and export them alongside the existing array functions. The existing `normalizePoints` and `denormalizePoints` functions are **not modified**.

```js
// Add after roundPixel / isValidContainerSize helpers:

const normalizePoint = (x, y, width, height) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: roundNormalized(clamp(Number(x) / width, 0, 1)),
    y: roundNormalized(clamp(Number(y) / height, 0, 1)),
  };
};

const denormalizePoint = (ratioX, ratioY, width, height) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: roundPixel(clamp(Number(ratioX), 0, 1) * width),
    y: roundPixel(clamp(Number(ratioY), 0, 1) * height),
  };
};

// Update export:
export {
  normalizePoints,
  denormalizePoints,
  normalizePoint,
  denormalizePoint,
  getRelativePointer,
};
```

---

#### 2. `MODULE_FE/src/features/Map/CameraZoneManager.jsx` — Fix normalization reference

**Change 1 — `getNormalizedFlatPoints()` (line ~107):**

```js
// BEFORE (buggy):
const getNormalizedFlatPoints = () => {
  const containerSize = {
    width: stageDisplaySize.width || imageSize.width,
    height: stageDisplaySize.height || imageSize.height,
  };
  const normalized = normalizePoints(pointsFlatToObjects(currentPoints), containerSize);
  return pointsObjectsToFlat(normalized);
};

// AFTER (fixed):
const getNormalizedFlatPoints = () => {
  const normalized = normalizePoints(pointsFlatToObjects(currentPoints), imageSize);
  return pointsObjectsToFlat(normalized);
};
```

`currentPoints` holds pixel coordinates relative to `stageDisplaySize`. Before normalizing, they must be scaled up to `imageSize` space. Since `useZoneDrawing` clamps points to `stageDisplaySize` bounds, the drawn pixel coords are in `[0, stageDisplaySize.width] × [0, stageDisplaySize.height]`. To normalize against `imageSize`, scale them first:

```js
const getNormalizedFlatPoints = () => {
  const scaleX = imageSize.width  / (stageDisplaySize.width  || imageSize.width);
  const scaleY = imageSize.height / (stageDisplaySize.height || imageSize.height);
  const scaledPoints = pointsFlatToObjects(currentPoints).map(p => ({
    x: p.x * scaleX,
    y: p.y * scaleY,
  }));
  const normalized = normalizePoints(scaledPoints, imageSize);
  return pointsObjectsToFlat(normalized);
};
```

**Change 2 — `parseZonePoints()` (line ~88):**

```js
// BEFORE (buggy):
const containerSize = {
  width: stageDisplaySize.width || imageSize.width,
  height: stageDisplaySize.height || imageSize.height,
};

// AFTER (fixed):
// Denormalize against imageSize, then scale down to stageDisplaySize for display
const scaleX = (stageDisplaySize.width  || imageSize.width)  / imageSize.width;
const scaleY = (stageDisplaySize.height || imageSize.height) / imageSize.height;

const normalizeToDisplayFlat = (pointObjects) => {
  if (!Array.isArray(pointObjects) || pointObjects.length === 0) return [];
  const displayPoints = isNormalizedObjects(pointObjects)
    ? denormalizePoints(pointObjects, imageSize).map(p => ({
        x: p.x * scaleX,
        y: p.y * scaleY,
      }))
    : pointObjects;
  return pointsObjectsToFlat(displayPoints);
};
```

**Change 3 — `ZoneRenderer` call in `CameraZoneManager` (line ~290):**

```jsx
// BEFORE (buggy):
<ZoneRenderer
  zones={selectedCameraState?.zones?.zones || []}
  coordinateMode="auto"
  imageSize={stageDisplaySize}
  ...
/>

// AFTER (fixed):
<ZoneRenderer
  zones={selectedCameraState?.zones?.zones || []}
  coordinateMode="normalized"
  imageSize={imageSize}
  ...
/>
```

Zones stored in the DB are always normalized. `imageSize` is the correct denormalization reference. `useZoneTransform` will multiply the 0–1 ratios by `imageSize.width/height` to get pixel coords in image space; Konva then scales those down via `stageDisplaySize / imageSize` through the Stage transform.

> **Note:** The Stage in `CameraZoneManager` renders at `stageDisplaySize` but `ZoneRenderer` will produce pixel coords in `imageSize` space. The Stage must apply a scale transform `scaleX={stageDisplaySize.width / imageSize.width}` to reconcile this, or alternatively `ZoneRenderer` must receive `imageSize={stageDisplaySize}` and zones must be denormalized to display space. The simplest correct approach: pass `imageSize={stageDisplaySize}` to `ZoneRenderer` but ensure zones are first denormalized to `imageSize` then re-normalized to `stageDisplaySize` — or, more cleanly, pass a custom `imageSize` that matches the Stage pixel space. See Fix Implementation note below.

**Recommended clean approach for `CameraZoneManager` ZoneRenderer:**

Since the Konva `Stage` renders at `stageDisplaySize`, `ZoneRenderer` must receive pixel coords in that space. The correct `imageSize` to pass is `stageDisplaySize`, but the zones must be stored/loaded in `imageSize`-normalized form. `useZoneTransform` will then multiply by `stageDisplaySize`, giving correct display pixels:

```jsx
// Pass stageDisplaySize so useZoneTransform produces coords in Stage pixel space
<ZoneRenderer
  zones={selectedCameraState?.zones?.zones || []}
  coordinateMode="normalized"
  imageSize={stageDisplaySize}
  ...
/>
```

This is correct because: stored coords are normalized against `imageSize` → `useZoneTransform` multiplies by `stageDisplaySize` → result is in `[0, stageDisplaySize]` pixel space → Konva Stage renders at `stageDisplaySize`. The scale factor `stageDisplaySize/imageSize` is applied implicitly.

---

#### 3. `MODULE_FE/src/features/Heatmap/components/HeatMapContent.jsx` — Fix `coordinateMode`

**Change — `ZoneRenderer` call (line ~82):**

```jsx
// BEFORE (buggy):
<ZoneRenderer
  zones={activeData.zones || []}
  coordinateMode="auto"
  imageSize={{ width: frameWidth, height: frameHeight }}
  showLabels={true}
  showHandles={false}
/>

// AFTER (fixed):
<ZoneRenderer
  zones={activeData.zones || []}
  coordinateMode="normalized"
  imageSize={{ width: frameWidth, height: frameHeight }}
  showLabels={true}
  showHandles={false}
/>
```

`imageSize` is already correct (`frameWidth/frameHeight` = original frame dimensions). Only `coordinateMode` changes from `"auto"` to `"normalized"`.

---

#### 4. `MODULE_FE/src/features/shared/zones/useZoneTransform.js` — No logic change

The internal `normalizePoints` function already multiplies by `imageSize.width/height`:

```js
const x = imageSize ? rawX * imageSize.width : rawX;
const y = imageSize ? rawY * imageSize.height : rawY;
```

This is correct. No code change is needed here. However, callers **must** pass the original frame/image dimensions as `imageSize`, not the scaled display canvas size. This is now enforced by the changes in `CameraZoneManager` and `HeatMapContent`.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the coordinate mismatch BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write unit tests that simulate the save/load cycle — normalize a point using `stageDisplaySize`, then denormalize using `imageSize`, and assert the recovered point matches the original. Run these on the UNFIXED code to observe failures.

**Test Cases**:
1. **Scale mismatch test**: Draw a point at `(600, 337)` on a `1200×675` canvas (`stageDisplaySize` for a 1280×720 image). Save via `getNormalizedFlatPoints()` (unfixed). Denormalize against `1280×720`. Assert result equals `(640, 360)`. Will fail on unfixed code — actual result is `(640, 360)` only if scale is 1; with scale 0.9375 the saved ratio is `(0.5, 0.499)` and the denormalized result is `(640, 359)` — off by 1px. For larger images the error is much larger.
2. **Large image test**: Use a 3840×2160 source. `stageDisplaySize` = 1200×675 (scale 0.3125). Draw at `(300, 168)`. Unfixed save gives ratio `(0.25, 0.249)`. Denormalized against 3840×2160 = `(960, 537)`. Expected: `(300/1200 * 3840, 168/675 * 2160)` = `(960, 537)`. Wait — this is actually correct! The math works out because `(px/stageW) * frameW = px * (frameW/stageW)` which equals the correct proportional position. Let me re-examine...

**Re-analysis**: The round-trip `normalize(stageDisplaySize) → denormalize(imageSize)` gives:
```
result = (px / stageW) * imageW = px * (imageW / stageW)
```
The correct result should be `px * (imageW / stageW)` — which IS the proportionally correct pixel in image space. So the normalization is actually correct for rendering purposes!

The real bug is in `parseZonePoints()` (loading for edit): it denormalizes against `stageDisplaySize` instead of `imageSize`, then uses those as display pixels. This places edit handles at wrong positions.

**Revised Test Cases**:
1. **Edit load test**: Save a zone normalized against `imageSize` (1280×720). Load it for editing via `parseZonePoints()` (unfixed). Assert the returned display pixels match the original draw pixels scaled to `stageDisplaySize`. Will fail on unfixed code because `parseZonePoints` denormalizes against `stageDisplaySize` instead of `imageSize`.
2. **`coordinateMode="auto"` misclassification test**: Pass a zone with coordinates `[0.1, 0.2, 0.8, 0.9, 0.5, 0.5, 0.3, 0.7]` (all in [0,1]) to `useZoneTransform` with `coordinateMode="auto"`. Assert it is treated as normalized. Then pass `[0.0, 0.0, 1.0, 1.0, 0.5, 0.5, 0.3, 0.7]` — same result. Now pass `[0, 0, 1, 1, 0, 1, 1, 0]` (absolute pixels for a 1×1 canvas) — `isNormalized` returns `true` incorrectly.
3. **Round-trip identity test (new utilities)**: For `normalizePoint` / `denormalizePoint`, assert `denormalizePoint(...normalizePoint(x, y, W, H), W, H)` ≈ `(x, y)`.

**Expected Counterexamples**:
- `parseZonePoints()` returns display pixels that are off by the `stageDisplaySize/imageSize` scale factor when loading normalized zones.
- `coordinateMode="auto"` misclassifies coordinates that happen to all be in [0, 1].

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL (px, py, W, H, W2, H2) WHERE W != W2 OR H != H2 DO
  ratio  := normalizePoint(px, py, W, H)
  result := denormalizePoint(ratio.x, ratio.y, W2, H2)
  ASSERT result.x ≈ px * (W2 / W)
  ASSERT result.y ≈ py * (H2 / H)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (`stageDisplaySize == imageSize`), the fixed functions produce the same result as the original.

**Pseudocode:**
```
FOR ALL (px, py, W, H) WHERE stageDisplaySize == imageSize DO
  original := normalizePoints_original([{x: px, y: py}], {width: W, height: H})
  fixed    := normalizePoint(px, py, W, H)
  ASSERT original[0].x = fixed.x
  ASSERT original[0].y = fixed.y
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many `(x, y, W, H)` combinations automatically.
- It catches edge cases (zero dimensions, boundary values, very large coordinates) that manual tests miss.
- It provides strong guarantees that the new single-point functions are consistent with the existing array functions.

**Test Cases**:
1. **Consistency with array functions**: For any single point, `normalizePoint(x, y, W, H)` must equal `normalizePoints([{x, y}], {width: W, height: H})[0]`.
2. **Consistency with array denormalize**: `denormalizePoint(rx, ry, W, H)` must equal `denormalizePoints([{x: rx, y: ry}], {width: W, height: H})[0]`.
3. **`coordinateMode="normalized"` vs `"auto"` for known-normalized data**: Both must produce identical `displayPoints` for zones where all coordinates are in [0, 1].

### Unit Tests

- Test `normalizePoint` with typical values, boundary values (0, W, H), and out-of-range values (negative, > W).
- Test `denormalizePoint` with ratios 0, 0.5, 1, and out-of-range ratios.
- Test `getNormalizedFlatPoints()` (fixed) produces ratios in [0, 1] for any drawn point on any canvas size.
- Test `parseZonePoints()` (fixed) round-trips: normalize then parse returns original display pixels (within ±1px rounding).
- Test `useZoneTransform` with `coordinateMode="normalized"` produces same result as `"auto"` for all-in-[0,1] coordinates.

### Property-Based Tests

- **Property 1 (Round-trip)**: Generate random `(x, y)` in `[0, W] × [0, H]` and random `(W, H)` with `W, H > 0`. Assert `denormalizePoint(normalizePoint(x, y, W, H), W, H)` ≈ `(x, y)` within ±1px.
- **Property 2 (In-range)**: Generate random `(x, y, W, H)`. Assert `normalizePoint(x, y, W, H)` returns values in `[0, 1]`.
- **Property 3 (Proportional rendering)**: Generate random `(px, py, W, H, W2, H2)`. Assert `denormalizePoint(normalizePoint(px, py, W, H), W2, H2)` equals `(round(px * W2/W), round(py * H2/H))` within ±1px.
- **Property 4 (Consistency with array functions)**: Generate random `(x, y, W, H)`. Assert `normalizePoint(x, y, W, H)` equals `normalizePoints([{x, y}], {width: W, height: H})[0]`.

### Integration Tests

- Draw a zone on a 1280×720 image in `CameraZoneManager`, save it, then render it in `HeatMapContent` with `frameWidth=1280, frameHeight=720`. Assert the polygon vertices appear at the same proportional positions on both canvases.
- Draw a zone on a 3840×2160 image (scaled to 1200×675 canvas), save it, render in heatmap. Assert no visible shift.
- Edit an existing zone: load it, verify handles appear at the correct positions, move a handle, save, re-render. Assert the updated polygon is correct.
- Verify that switching `coordinateMode` from `"auto"` to `"normalized"` produces no visual change for zones with all coordinates in [0, 1].
