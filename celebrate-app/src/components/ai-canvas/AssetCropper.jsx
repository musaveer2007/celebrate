import React, { useState, useRef, useEffect } from 'react';
import './AssetCropper.css';
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import { assetService } from '../../services/supabaseServices';

export default function AssetCropper({ plannerId, onBack, onAssetSaved }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedObjects, setExtractedObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pressTimer = useRef(null);
  const [pressPos, setPressPos] = useState(null);
  const [assetMetadata, setAssetMetadata] = useState({ name: '', category: 'decor', tags: '' });
  const [assetToSave, setAssetToSave] = useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedObjects([]);
    }
  };

  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = previewUrl;
    }
  }, [previewUrl]);

  const getNaturalCoordinates = (clientX, clientY) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      naturalX: x * scaleX,
      naturalY: y * scaleY
    };
  };

  const handlePointerDown = (e) => {
    if (!previewUrl || isLoading) return;
    const coords = getNaturalCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    setPressPos({ x: e.clientX, y: e.clientY });
    pressTimer.current = setTimeout(() => {
      extractObject(coords.naturalX, coords.naturalY, e.clientX, e.clientY);
    }, 500); 
  };

  const handlePointerUp = () => {
    clearPressTimer();
  };

  const handlePointerMove = (e) => {
    if (pressPos) {
      const dist = Math.sqrt(
        Math.pow(e.clientX - pressPos.x, 2) + Math.pow(e.clientY - pressPos.y, 2)
      );
      if (dist > 10) {
        clearPressTimer();
      }
    }
  };

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setPressPos(null);
  };

  const extractObject = async (x, y, displayX, displayY) => {
    if (!image) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('x', x.toString());
      formData.append('y', y.toString());

      const res = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to extract object");

      const blob = await res.blob();
      const extractedUrl = URL.createObjectURL(blob);
      
      const newObj = {
        id: Math.random().toString(36).substring(7),
        url: extractedUrl,
        blob: blob, // Store blob for uploading
        x: displayX,
        y: displayY
      };
      
      setExtractedObjects(prev => [...prev, newObj]);
      setAssetToSave(newObj);

    } catch (err) {
      console.error(err);
      alert("Error extracting object.");
    } finally {
      setIsLoading(false);
      clearPressTimer();
    }
  };

  const saveAsset = async () => {
    if (!assetToSave || !plannerId) return;
    try {
      let finalUrl = assetToSave.url;
      
      // If we have a blob (from the new extraction backend), upload it to Supabase first
      if (assetToSave.blob) {
        finalUrl = await assetService.uploadAssetFile(
          assetToSave.blob, 
          `extracted-${Date.now()}.png`
        );
      }

      await assetService.createAsset({
        url: finalUrl,
        planner_id: plannerId,
        category: assetMetadata.category,
        name: assetMetadata.name,
        tags: assetMetadata.tags ? JSON.parse(`[${assetMetadata.tags.split(',').map(s=>`"${s.trim()}"`).join(',')}]`) : null
      });
      alert('Asset saved successfully!');
      if (onAssetSaved) {
        onAssetSaved({
          ...assetToSave,
          name: assetMetadata.name,
          category: assetMetadata.category
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save asset.');
    }
  };

  const handleCancel = () => {
    if (extractedObjects.length > 0) {
      if(window.confirm('Discard this asset?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="asset-cropper-container">
      <div className="cropper-header">
        <button className="btn btn-secondary" onClick={handleCancel}>
          <ArrowLeft size={16} /> Back to Asset Library
        </button>
        <div className="header-titles">
          <h2>Create Asset</h2>
          <p>Crop an object from your image to use in the AI Design Canvas.</p>
        </div>
        <div></div> {/* spacer */}
      </div>

      <div className="cropper-content">
        {!previewUrl ? (
          <div className="upload-area">
            <label className="upload-label">
              <div className="upload-icon-container">
                <Download size={32} />
              </div>
              <h3 className="upload-title">Drop Asset Here</h3>
              <p className="upload-subtitle">Upload Source Image</p>
              <input type="file" className="file-input-hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="workspace-area">
            <div className="canvas-section">
              <div className="control-bar">
                <span className="status-badge"><span className="status-dot"></span> Engine Ready</span>
                <button className="btn btn-secondary text-sm" onClick={() => { setPreviewUrl(null); setImage(null); setExtractedObjects([]); setAssetToSave(null); }}>Start New Project</button>
              </div>

              <div 
                className="main-image-container"
                ref={containerRef}
              >
                <canvas
                  ref={canvasRef}
                  className={`cropper-canvas ${isLoading ? 'loading' : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerMove={handlePointerMove}
                  onPointerCancel={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
                
                {isLoading && pressPos && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <div className="laser-line"></div>
                  </div>
                )}

                {!isLoading && (
                  <div className="tooltip-hint">
                    <span className="tooltip-dot"></span>
                    Press and hold target to extract
                  </div>
                )}
              </div>
            </div>

            {assetToSave && (
              <div className="results-panel">
                <h3>Asset Details</h3>
                
                <div className="preview-card">
                  <img src={assetToSave.url} alt="Extracted Preview" className="extracted-preview" />
                </div>

                <div className="metadata-form">
                  <div className="form-group">
                    <label className="form-label">Asset Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Gold Chiavari Chair" value={assetMetadata.name} onChange={e => setAssetMetadata({...assetMetadata, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={assetMetadata.category} onChange={e => setAssetMetadata({...assetMetadata, category: e.target.value})}>
                      <option value="floral">Floral</option>
                      <option value="furniture">Furniture</option>
                      <option value="lighting">Lighting</option>
                      <option value="drapes">Drapes</option>
                      <option value="stage">Stage Props</option>
                      <option value="decor">Other Decor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (optional)</label>
                    <input type="text" className="form-input" placeholder="gold, chair, wedding" value={assetMetadata.tags} onChange={e => setAssetMetadata({...assetMetadata, tags: e.target.value})} />
                  </div>
                  <button className="btn btn-primary w-full mt-4" onClick={saveAsset}>Save Asset</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
