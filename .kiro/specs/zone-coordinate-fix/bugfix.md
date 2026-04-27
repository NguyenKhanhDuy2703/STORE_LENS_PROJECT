# Bugfix Requirements Document

## Introduction

Zone polygons drawn in `CameraZoneManager` appear visually shifted or stretched when overlaid on the Heatmap page. The root cause is a coordinate reference mismatch: zones are saved using `stageDisplaySize` (a scaled-to-fit canvas size, e.g. 854×480) as the normalization reference, but are later denormalized using `frameWidth/frameHeight` (the original AI frame size, e.g. 1280×720). Because these two reference dimensions differ, the recovered pixel coordinates are wrong. Additionally, `coordinateMode="auto"` in `useZoneTransform` can misclassify coordinate format, and `stageDisplaySize` does not update on window resize, making the drawing reference unstable.

The fix standardizes the entire pipeline on a single, stable reference: the original image/frame dimensions (`imageSize.width` × `imageSize.height`). Coordinates are normalized against this reference when saved and denormalized against the same reference when displayed, eliminating the mismatch.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user draws a zone in `CameraZoneManager` and saves it, THEN the system normalizes the drawn pixel coordinates using `stageDisplaySize` (scaled canvas dimensions) instead of the original image dimensions, producing incorrect normalized values.

1.2 WHEN `HeatMapContent` renders saved zones, THEN the system denormalizes coordinates using `frameWidth/frameHeight` (original frame dimensions), which differs from the `stageDisplaySize` reference used during saving, causing the zone polygon to appear shifted or stretched relative to the background image.

1.3 WHEN `useZoneTransform` receives zones with `coordinateMode="auto"`, THEN the system guesses the coordinate format by checking whether all values are between 0 and 1, which can misclassify absolute pixel coordinates that happen to fall in that range (e.g. a small zone on a low-resolution frame), resulting in incorrect rendering.

1.4 WHEN the browser window is resized after `CameraZoneManager` loads, THEN `stageDisplaySize` does not update because it is derived from the initial `imageSize` without reacting to container size changes, causing newly drawn points to be recorded against a stale reference.

### Expected Behavior (Correct)

2.1 WHEN a user draws a zone in `CameraZoneManager` and saves it, THEN the system SHALL normalize the drawn pixel coordinates using the original image dimensions (`loadedImage.width` × `loadedImage.height`) as the reference, producing normalized values in the 0–1 range that are independent of display scale.

2.2 WHEN `HeatMapContent` (or any consumer) renders saved zones, THEN the system SHALL denormalize coordinates using the same original image/frame dimensions (`frameWidth` × `frameHeight`) as the reference, so the recovered pixel coordinates align exactly with the background image at any display scale.

2.3 WHEN `useZoneTransform` (or `ZoneRenderer`) processes zones, THEN the system SHALL use an explicit `coordinateMode="normalized"` (not `"auto"`) wherever zones are known to be stored in normalized format, eliminating ambiguous format detection.

2.4 WHEN `coordinateUtils.js` is used for coordinate conversion, THEN the system SHALL expose `normalizePoint(x, y, width, height)` and `denormalizePoint(ratioX, ratioY, width, height)` as single-point utility functions, clamped to 0–1, so that callers can convert individual points without constructing array wrappers.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a zone is drawn and saved with valid positive-integer image dimensions, THEN the system SHALL CONTINUE TO persist the zone's normalized coordinates as a flat JSON array of numbers in the 0–1 range via the existing API payload structure.

3.2 WHEN `ZoneRenderer` receives a list of zones with valid `displayPoints`, THEN the system SHALL CONTINUE TO render each zone as a closed `<Line />` polygon with its label and anchor handles using the existing Konva rendering logic.

3.3 WHEN a user edits an existing zone in `CameraZoneManager`, THEN the system SHALL CONTINUE TO load the zone's stored coordinates back into the drawing canvas at the correct pixel positions for the current display size.

3.4 WHEN `HeatmapCanvas` displays a heatmap frame that contains no zones, THEN the system SHALL CONTINUE TO render the heatmap grid and background image without errors.

3.5 WHEN `useZoneTransform` processes zones that already carry absolute pixel coordinates (e.g. legacy data from the AI module), THEN the system SHALL CONTINUE TO render them correctly when `coordinateMode="absolute"` is explicitly passed.
