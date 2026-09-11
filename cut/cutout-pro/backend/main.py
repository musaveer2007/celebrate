from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import io
import numpy as np
from PIL import Image
from utils import load_model, predict_mask, apply_mask_to_image

app = FastAPI(title="Cutout Pro Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally to keep it in memory
predictor = load_model()

@app.post("/api/extract")
async def extract_object(
    file: UploadFile = File(...),
    x: float = Form(...),
    y: float = Form(...)
):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Apply EXIF rotation if present
        from PIL import ImageOps
        image = ImageOps.exif_transpose(image)
        
        image = image.convert("RGB")
        image_np = np.array(image)

        # Coordinates
        input_point = np.array([[int(x), int(y)]])
        input_label = np.array([1]) # 1 indicates a positive point
        print(f"Extraction point: {x}, {y}, image shape: {image_np.shape}")

        # Generate mask
        mask = predict_mask(predictor, image_np, input_point, input_label)
        print(f"Mask generated. Sum: {mask.sum()}, shape: {mask.shape}")
        
        # Apply mask
        result_img = apply_mask_to_image(image_np, mask)
        
        # Convert to PNG
        img_byte_arr = io.BytesIO()
        result_img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        return Response(content=img_byte_arr, media_type="image/png")
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
