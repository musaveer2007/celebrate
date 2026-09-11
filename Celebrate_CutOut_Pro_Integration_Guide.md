# Celebrate & Cut Out Pro Integration Documentation

This document outlines the architecture, data flow, and technical implementation details of integrating the **Cut Out Pro** AI object extraction feature into the **Celebrate** platform. It is designed to help developers maintain, troubleshoot, and extend the feature in the future.

---

## 1. System Architecture Overview

The asset extraction pipeline relies on three main components working synchronously:

1. **Frontend (Celebrate App - React/Vite)**
   - Captures user interactions (long-press) on an image.
   - Maps screen coordinates to the image's natural dimensions.
   - Handles API calls, uploads the final result to Supabase, and updates the UI.
2. **AI Backend (Cut Out Pro - Python/FastAPI)**
   - Pre-loads Meta's Segment Anything Model (SAM) into RAM to ensure low-latency inference.
   - Receives the raw image and precise click coordinates.
   - Uses AI to predict the object mask, crops out the background, adds an alpha transparency channel, and returns a raw PNG image blob.
3. **Database & Storage (Supabase)**
   - **Storage Bucket (`planner-assets`)**: Stores the extracted transparent PNGs.
   - **Database Table (`assets`)**: Stores the metadata (URL, name, tags, category, planner ID) to be loaded into the AI Design Canvas.

---

## 2. Step-by-Step Data Flow

### A. Interaction & Coordinate Mapping
When a planner uploads an image in the `AssetCropper.jsx` component, it is drawn onto an HTML5 `<canvas>`.
Because the image is often scaled down to fit the screen, the exact pixel the user clicks (UI coordinates) will not match the true pixel on the image (Natural coordinates). 

* **File**: `celebrate-app/src/components/ai-canvas/AssetCropper.jsx`
* **Function**: `getNaturalCoordinates(clientX, clientY)`
* **Logic**: We divide the canvas's natural dimensions (`canvas.width`) by its rendered DOM dimensions (`rect.width`) to find the scale factor, then multiply the user's click coordinates by that scale factor.

### B. Triggering the AI Extraction
When the user long-presses (500ms) on an object:
1. A `FormData` object is created containing the raw image file and the calculated `x` and `y` natural coordinates.
2. The frontend sends a `POST` request to `http://localhost:8000/api/extract`.

### C. Backend AI Processing
The FastAPI server receives the request and processes it:
* **File**: `cut/cutout-pro/backend/main.py`
* **Logic**:
  1. Opens the image as a NumPy array (RGB).
  2. Passes the image and coordinates to the `predict_mask` function (using the PyTorch `sam_vit_b_01ec64.pth` model).
  3. The model returns a boolean mask of the object.
  4. The background is removed, an alpha channel is added, and the result is cropped to its tightest bounding box.
  5. The image is serialized as a PNG byte array and returned directly to the frontend (`media_type="image/png"`).

### D. Saving to Supabase
Once the frontend receives the PNG blob, the user sees a preview and can add metadata (Name, Category, Tags). When they click **"Save Asset"**:
* **File**: `celebrate-app/src/services/supabaseServices.ts`
* **Logic**:
  1. **Storage**: The `uploadAssetFile(blob, fileName)` function uploads the Blob to the `planner-assets` Supabase bucket and retrieves the public URL.
  2. **Database**: The `createAsset(assetData)` function takes that public URL and saves a new row in the `assets` table.

---

## 3. Maintenance & Troubleshooting Guide

If you need to make changes in the future, refer to this guide:

### Modifying the Frontend UI / Canvas
* **File**: `celebrate-app/src/components/ai-canvas/AssetCropper.jsx`
* **What to change here**: Adjusting the 500ms long-press delay (`pressTimer`), modifying the loading animations, adding new metadata fields for the assets, or changing the layout of the crop workspace.

### Modifying the Storage/Database Logic
* **File**: `celebrate-app/src/services/supabaseServices.ts`
* **What to change here**: If you rename the Supabase bucket (currently `planner-assets`), change the file path structure (currently `extracted/{timestamp}-{filename}`), or need to add new columns to the `assets` table insertion.

### Modifying the AI Model & Inference
* **File**: `cut/cutout-pro/backend/main.py` and `utils.py`
* **What to change here**: 
  - **Port**: Currently runs on `8000`. Modify `uvicorn.run(...)` if you need to change this.
  - **CORS**: If deploying to production, update `allow_origins=["*"]` to explicitly list your Next.js/Vite production domain.
  - **Model Precision**: If you want to use a smaller/faster model (like MobileSAM) or adjust the boundary padding around the extracted object.

### Common Issues
1. **"Failed to fetch" on extraction**: Ensure the Python backend is running via `start_server.ps1`.
2. **Extraction is highly inaccurate**: This usually means the coordinate scaling is off. Verify that the CSS styling on the `<canvas>` isn't forcing an aspect ratio distortion. The CSS must allow the canvas to scale proportionally.
3. **Images failing to save**: Ensure the Supabase `planner-assets` bucket exists and has correct RLS (Row Level Security) policies allowing authenticated users (or anonymous users for local dev) to `INSERT` files.
