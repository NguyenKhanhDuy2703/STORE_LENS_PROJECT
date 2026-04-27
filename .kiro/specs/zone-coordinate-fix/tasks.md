# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Normalize/Denormalize Round-Trip Identity
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the coordinate reference mismatch
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — a point normalized against `stageDisplaySize` then denormalized against `imageSize` (where the two differ) should round-trip back to the original pixel, but on unfixed code it does not
  - Set up test framework: install `vitest` and `fast-check` as dev dependencies in `MODULE_FE` (`npm install --save-dev vitest fast-check`)
  - Create test file `MODULE_FE/src/utils/coordinateUtils.test.js`
  - Write a property-based test using `fast-check` that generates random `(x, y)` in `[0, W] × [0, H]` and random `(W, H)` with `W, H > 0`
  - The test asserts: `denormalizePoint(normalizePoint(x, y, W, H), W, H)` returns `(x, y)` within ±1px rounding tolerance
  - On unfixed code `normalizePoint` / `denormalizePoint` do not exist yet — the test will fail with "not a function" or equivalent, confirming the bug condition
  - Run test on UNFIXED code: `npx vitest run src/utils/coordinateUtils.test.js`
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g., `normalizePoint is not a function` or round-trip mismatch for `stageDisplaySize ≠ imageSize`)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 2.1, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Inputs Unchanged (Consistency with Existing Array Functions)
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `normalizePoints([{x: 100, y: 50}], {width: 200, height: 100})` returns `[{x: 0.5, y: 0.5}]` on unfixed code
  - Observe: `denormalizePoints([{x: 0.5, y: 0.5}], {width: 200, height: 100})` returns `[{x: 100, y: 50}]` on unfixed code
  - Write property-based test (Property 4 from design): for any `(x, y, W, H)` with `W, H > 0`, the new `normalizePoint(x, y, W, H)` must equal `normalizePoints([{x, y}], {width: W, height: H})[0]`
  - Write property-based test: `denormalizePoint(rx, ry, W, H)` must equal `denormalizePoints([{x: rx, y: ry}], {width: W, height: H})[0]`
  - These tests use only the existing `normalizePoints` / `denormalizePoints` array functions (which are unchanged) as the oracle
  - Run tests on UNFIXED code — they will fail because `normalizePoint` / `denormalizePoint` do not exist yet; record that baseline
  - **EXPECTED OUTCOME after noting baseline**: Once the new functions are added (task 3), these tests PASS, confirming no regression in the array-level functions
  - Mark task complete when tests are written and the baseline (failure on unfixed code) is documented
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix zone coordinate misalignment

  - [x] 3.1 Add `normalizePoint` and `denormalizePoint` single-point utilities to `coordinateUtils.js`
    - Add `normalizePoint(x, y, width, height)` after the existing `isValidContainerSize` helper
    - Returns `{ x: roundNormalized(clamp(Number(x) / width, 0, 1)), y: roundNormalized(clamp(Number(y) / height, 0, 1)) }`
    - Returns `{ x: 0, y: 0 }` when `width` or `height` is not a finite positive number
    - Add `denormalizePoint(ratioX, ratioY, width, height)` immediately after
    - Returns `{ x: roundPixel(clamp(Number(ratioX), 0, 1) * width), y: roundPixel(clamp(Number(ratioY), 0, 1) * height) }`
    - Returns `{ x: 0, y: 0 }` when `width` or `height` is not a finite positive number
    - Export both new functions alongside the existing exports in `coordinateUtils.js`
    - The existing `normalizePoints`, `denormalizePoints`, and `getRelativePointer` functions are NOT modified
    - _Bug_Condition: isBugCondition where `stageDisplaySize.width != imageSize.width || stageDisplaySize.height != imageSize.height`_
    - _Expected_Behavior: `denormalizePoint(normalizePoint(x, y, W, H), W, H)` ≈ `(x, y)` within ±1px; all outputs clamped to [0, 1] for normalize and [0, W/H] for denormalize_
    - _Preservation: existing `normalizePoints` and `denormalizePoints` array functions remain intact and unchanged_
    - _Requirements: 2.4, 3.1_

  - [x] 3.2 Fix `getNormalizedFlatPoints()` in `CameraZoneManager.jsx`
    - Replace the current `containerSize` object (which uses `stageDisplaySize`) with a scale-then-normalize approach
    - Compute `scaleX = imageSize.width / (stageDisplaySize.width || imageSize.width)` and `scaleY = imageSize.height / (stageDisplaySize.height || imageSize.height)`
    - Scale `currentPoints` from `stageDisplaySize` space to `imageSize` space before calling `normalizePoints`
    - Call `normalizePoints(scaledPoints, imageSize)` so the normalization reference is always `imageSize`
    - This ensures saved normalized values are independent of display scale
    - _Bug_Condition: `stageDisplaySize != imageSize` (common for camera frames ≥ 1200px wide)_
    - _Expected_Behavior: normalized ratios are in [0, 1] and round-trip back to original pixel positions when denormalized against `imageSize`_
    - _Preservation: API payload structure (flat JSON array of floats) is unchanged_
    - _Requirements: 2.1, 3.1_

  - [x] 3.3 Fix `parseZonePoints()` in `CameraZoneManager.jsx`
    - Replace the current `containerSize` (which uses `stageDisplaySize`) with a two-step approach
    - Step 1: denormalize stored normalized coordinates against `imageSize` to get pixel coords in image space
    - Step 2: scale those pixel coords down to `stageDisplaySize` for display on the Konva Stage
    - Compute `scaleX = (stageDisplaySize.width || imageSize.width) / imageSize.width` and `scaleY = (stageDisplaySize.height || imageSize.height) / imageSize.height`
    - Apply scale after `denormalizePoints(pointObjects, imageSize)` so edit handles appear at correct positions
    - _Bug_Condition: `stageDisplaySize != imageSize` causes edit handles to appear at wrong pixel positions_
    - _Expected_Behavior: loaded display pixels match original draw pixels scaled proportionally to `stageDisplaySize`_
    - _Preservation: zone editing workflow (load → move handle → save) continues to work correctly_
    - _Requirements: 2.2, 3.3_

  - [x] 3.4 Fix `ZoneRenderer` call in `CameraZoneManager.jsx`
    - Change `coordinateMode="auto"` to `coordinateMode="normalized"` in the `ZoneRenderer` JSX
    - Keep `imageSize={stageDisplaySize}` so `useZoneTransform` produces pixel coords in Stage pixel space
    - This eliminates the ambiguous `isNormalized()` heuristic for zones known to be stored in normalized format
    - _Bug_Condition: `coordinateMode="auto"` can misclassify coordinates that happen to all be in [0, 1]_
    - _Expected_Behavior: zones are always treated as normalized; `useZoneTransform` multiplies by `stageDisplaySize` to produce correct Konva pixel coords_
    - _Preservation: `ZoneRenderer` rendering logic (closed `<Line />` polygon, labels, anchor handles) is unchanged_
    - _Requirements: 2.3, 3.2_

  - [x] 3.5 Fix `ZoneRenderer` call in `HeatMapContent.jsx`
    - Change `coordinateMode="auto"` to `coordinateMode="normalized"` in the `ZoneRenderer` JSX
    - Keep `imageSize={{ width: frameWidth, height: frameHeight }}` unchanged — it is already the correct reference
    - _Bug_Condition: `coordinateMode="auto"` is ambiguous for zones from the database_
    - _Expected_Behavior: zones are always treated as normalized; `useZoneTransform` multiplies by `frameWidth/frameHeight` to produce correct Konva pixel coords_
    - _Preservation: heatmap rendering (grid, background image, timeline) is unchanged; zones with `coordinateMode="absolute"` still work when that mode is explicitly passed_
    - _Requirements: 2.2, 2.3, 3.2, 3.4_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Normalize/Denormalize Round-Trip Identity
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior: `denormalizePoint(normalizePoint(x, y, W, H), W, H)` ≈ `(x, y)` within ±1px
    - Run: `npx vitest run src/utils/coordinateUtils.test.js`
    - **EXPECTED OUTCOME**: Test PASSES (confirms `normalizePoint` / `denormalizePoint` are correctly implemented and the round-trip identity holds)
    - _Requirements: 2.1, 2.4_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Inputs Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run: `npx vitest run src/utils/coordinateUtils.test.js`
    - **EXPECTED OUTCOME**: Tests PASS (confirms `normalizePoint` is consistent with `normalizePoints` array function, and `denormalizePoint` is consistent with `denormalizePoints` array function — no regressions)
    - Confirm all preservation properties pass after the fix

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite: `npx vitest run`
  - Verify Property 1 (round-trip identity) passes
  - Verify Property 2 (in-range normalization) passes — all `normalizePoint` outputs are in [0, 1]
  - Verify Property 3 (proportional rendering) passes — `denormalizePoint(normalizePoint(px, py, W, H), W2, H2)` ≈ `(px * W2/W, py * H2/H)` within ±1px
  - Verify Property 4 (consistency with array functions) passes — `normalizePoint` and `denormalizePoint` agree with the existing array-level functions for single-point inputs
  - Confirm no TypeScript/ESLint errors in modified files: `coordinateUtils.js`, `CameraZoneManager.jsx`, `HeatMapContent.jsx`
  - Ask the user if any questions arise
