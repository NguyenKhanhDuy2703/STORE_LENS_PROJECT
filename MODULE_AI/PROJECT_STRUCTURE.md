MODULE_AI/
├── config/                     # Specialized Sub-configurations
│   ├── app_config.yaml         # Default settings (FPS, Resolution, Thresholds)
│   ├── zone_config.json        # ROI definitions (Polygon coordinates)
│   └── logging.yaml            # Logger formatting and rotation rules
│
├── models/                     # AI Model Weights (Edge Optimized)
│   ├── yolov8n_openvino/       # YOLOv8 Nano (OpenVINO IR format: .xml, .bin)
│   └── deepsort/               # Re-ID feature extractor weights (ckpt.t7)
│
├── src/                        # Source Code
│   ├── core/                   # Layer 1: AI Perception (The "Eyes")
│   │   ├── __init__.py
│   │   ├── detector.py         # Wrapper for YOLOv8 (OpenVINO inference)
│   │   └── tracker.py          # Wrapper for DeepSORT (Tracking & ID assignment)
│   │
│   ├── managers/               # Layer 2: State Management (The "Memory")
│   │   ├── __init__.py
│   │   ├── zone_manager.py     # Handles Point-in-Polygon checks & Zone loading
│   │   └── state_manager.py    # In-memory store for object states (entry times, last seen)
│   │
│   ├── analytics/              # Layer 3: Business Logic (The "Brain")
│   │   ├── __init__.py
│   │   ├── trajectory.py       # Batches coordinates for smooth path visualization
│   │   ├── heatmap.py          # Accumulates density matrices (640x640 grid)
│   │   └── event_processor.py  # Logic for Dwell Time, Interaction & Conversion Events
│   │
│   ├── communication/          # Layer 4: Data Transmission (Output)
│   │   ├── __init__.py
│   │   └── redis_publisher.py  # Publishes processed data to Redis Channels
│   │
│   └── utils/                  # Shared Utilities
│       ├── logger.py           # Centralized logging instance
│       ├── visualizer.py       # Debugging tools (Draws boxes/zones on frames)
│       └── geometry.py         # Math helpers (IoU, distance calculation)
│
├── docker/                     # Deployment
│   └── Dockerfile              # Container definition for Edge Device
│
├── .env                        # Secrets (Redis Host, RTSP Credentials - DO NOT COMMIT)
├── config.py                   # Global Configuration Loader (The "Switchboard")
├── main.py                     # Entry Point (Pipeline Orchestration)
└── requirements.txt            # Python Dependencies