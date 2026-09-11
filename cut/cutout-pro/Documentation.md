# Magic Cutout Pro - Comprehensive Documentation

## 1. Project Overview
**Magic Cutout Pro** is an AI-powered web application that allows users to seamlessly extract objects from images. By simply uploading an image and long-pressing on any object within it, the application intelligently identifies the object's boundaries, isolates it from the background, and provides a clean, transparent PNG cutout that can be downloaded.

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS (with `tailwindcss-animate` for smooth UI transitions)
- **Language:** TypeScript
- **Core Components:** HTML5 `<canvas>` for rendering and precise coordinate tracking.

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **AI/ML Model:** Meta's Segment Anything Model (SAM) - specifically the `vit_b` (Vision Transformer Base) checkpoint.
- **Image Processing:** OpenCV (`cv2`) for morphological operations (edge smoothing, noise reduction) and Pillow (PIL) for image handling.
- **Computation:** PyTorch and NumPy.

---

## 3. Architecture & Data Flow

The project is divided into two distinct services communicating via REST API:
1. **Frontend Development Server** running locally on port `3000`.
2. **Backend API Server** running locally on port `8000`.

### Step-by-Step Application Workflow:
1. **Image Upload:** The user uploads an image (JPG, PNG, or WEBP) on the frontend. The image is rendered onto an HTML5 `<canvas>`.
2. **User Interaction:** The user performs a "long-press" (click/tap and hold for 500ms) on a specific object they want to extract.
3. **Coordinate Calculation:** The frontend captures the click coordinates, scales them to match the *natural, original resolution* of the uploaded image (since the UI scales the image down to fit the screen), and prepares an API request.
4. **API Request (`POST /api/extract`):** The frontend sends a `multipart/form-data` request containing:
   - The original image file.
   - The calculated `x` and `y` target coordinates.
5. **Backend Processing:**
   - **Initialization:** FastAPI receives the request. The SAM predictor (which is loaded into system memory on server start for low latency) is invoked.
   - **Inference:** The image is converted into an RGB NumPy array. The `x` and `y` coordinates are fed into the `SamPredictor` as a positive point prompt (`input_label = [1]`).
   - **Mask Generation:** SAM evaluates the point and generates multiple possible object masks. The backend automatically selects the mask with the highest confidence score.
6. **Post-Processing (OpenCV):**
   - The raw boolean mask is converted into an Alpha channel (0 to 255).
   - **Morphological Close:** Fills small holes *inside* the extracted object's mask.
   - **Morphological Open:** Removes small noise artifacts *outside* the object.
   - **Gaussian Blur:** Softens the edges of the mask to prevent jagged, pixelated borders (anti-aliasing).
7. **Cropping & Returning:** The finalized alpha mask is applied to the original image. The backend crops the image to the bounding box of the object (with a 20px padding) and returns it as a binary PNG stream.
8. **Frontend Rendering:** The frontend receives the transparent PNG cutout and overlays it dynamically on the screen exactly where the user clicked. The user can then interact with it to download the result.

---

## 4. Detailed Component Breakdown

### `frontend/src/components/ImageExtractor.tsx`
This is the core client-side React component.
- **State Management:** Manages the uploaded `image` file, the `previewUrl`, an array of `extractedObjects`, and loading/interaction states.
- **Canvas Rendering:** Uses a `useEffect` hook to draw the uploaded image to the canvas, matching the image's natural dimensions while staying responsive via CSS classes.
- **Long-Press Logic:** Uses `onPointerDown`, `onPointerUp`, and `onPointerMove` to implement a custom 500ms timer. If the user moves their cursor too much during the press, the timer is canceled to differentiate between a drag and a long-press.
- **Coordinate Transformation:** The `getNaturalCoordinates` function translates the user's click coordinates on the *scaled* screen canvas back to the *actual* pixel coordinates of the raw image file.

### `backend/utils.py`
This file contains the core AI inference and image manipulation functions.
- **`download_checkpoint()`:** Ensures the SAM weights (`sam_vit_b_01ec64.pth`) are present before loading. Includes resume capabilities for interrupted downloads.
- **`load_model()`:** Initializes the SAM registry, assigns it to the optimal hardware device (CUDA if a GPU is available, otherwise CPU), and returns the Predictor object.
- **`predict_mask()`:** Takes the image and coordinates, feeds them to the predictor, and asks SAM to predict the mask, returning the highest-scoring option.
- **`apply_mask_to_image()`:** The image manipulation function. It applies the OpenCV morphological operations to refine the mask, merges it as an alpha channel into the original RGB array, calculates a bounding box based on the active pixels, crops the result, and returns a PIL Image.

### `backend/main.py`
This is the FastAPI entry point.
- **CORS Middleware:** Configured to allow cross-origin requests from the Next.js frontend.
- **Global Model Loading:** The SAM model is loaded globally (`predictor = load_model()`) before the API starts accepting requests, ensuring the model isn't reloaded on every single API call (which would be extremely slow).
- **`/api/extract` Endpoint:** Handles the incoming file and coordinate forms, parses the bytes into a PIL image, handles EXIF rotation (to ensure mobile photos maintain correct orientation), passes data to `utils.py`, and returns the final PNG Response.

---

## 5. Setup and Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- Git

### Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - **Windows:** `.\venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
   *(Note: This includes downloading the Segment Anything package directly from Meta's GitHub repository).*
5. Start the server: `python main.py` (or run the `start_server.ps1` script).
   *(On the very first run, the backend will automatically download the ~375MB SAM `vit_b` checkpoint model file).*

### Frontend Setup
1. Open a separate terminal and navigate to the `frontend` directory.
2. Install Node dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:3000` in your browser.

---

## 6. Directory Structure

```text
cutout-pro/
├── backend/
│   ├── main.py               # FastAPI application entry point, routing, and HTTP handling
│   ├── utils.py              # SAM model loading, inference logic, and OpenCV post-processing
│   ├── requirements.txt      # Python dependencies
│   ├── start_server.ps1      # Startup script for Windows PowerShell
│   └── sam_vit_b_01ec64.pth  # The SAM model weights (downloaded automatically)
│
├── frontend/
│   ├── package.json          # Node dependencies and scripts
│   ├── tailwind.config.ts    # TailwindCSS configuration
│   └── src/
│       ├── app/
│       │   ├── globals.css   # Global styles
│       │   ├── layout.tsx    # Next.js root layout
│       │   └── page.tsx      # Main application page
│       └── components/
│           └── ImageExtractor.tsx # Core React component handling canvas, interactions, and API calls
```
