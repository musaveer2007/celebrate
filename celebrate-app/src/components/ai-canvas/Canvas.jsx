import React, { useRef } from 'react';
import { motion } from 'framer-motion';

function Canvas({ venueImage, overlays, selectedOverlayId, onSelectOverlay, onUpdateOverlay, onRemoveOverlay }) {
  const constraintsRef = useRef(null);

  const handleCanvasClick = (e) => {
    // If click is directly on canvas wrapper (not an overlay), deselect
    if (e.target === constraintsRef.current || e.target.tagName === 'IMG' && e.target.className === 'venue-image') {
      onSelectOverlay(null);
    }
  };

  return (
    <div 
      className="canvas-wrapper" 
      ref={constraintsRef}
      onClick={handleCanvasClick}
    >
      <img src={venueImage} alt="Venue" className="venue-image" draggable="false" />
      
      {overlays.map((overlay) => {
        const isSelected = overlay.instanceId === selectedOverlayId;
        
        return (
          <motion.div
            key={overlay.instanceId}
            className={`overlay-item ${isSelected ? 'overlay-selected' : ''}`}
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            initial={{ x: overlay.x, y: overlay.y, scale: overlay.scale, rotate: overlay.rotation }}
            animate={{ x: overlay.x, y: overlay.y, scale: overlay.scale, rotate: overlay.rotation }}
            onDragEnd={(e, info) => {
              // Update position state after drag ends
              onUpdateOverlay(overlay.instanceId, { 
                x: overlay.x + info.offset.x, 
                y: overlay.y + info.offset.y 
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOverlay(overlay.instanceId);
            }}
            style={{ 
              position: 'absolute', 
              top: '50%', left: '50%',
              marginTop: '-75px', marginLeft: '-75px', // Center the 150x150 element
              width: 150, height: 150, 
              backgroundImage: `url(${overlay.url})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '12px',
              boxShadow: isSelected ? 'none' : '0 10px 30px rgba(0,0,0,0.5)',
              border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {isSelected && (
              <div 
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveOverlay(overlay.instanceId);
                }}
              >
                ✕
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default Canvas;
