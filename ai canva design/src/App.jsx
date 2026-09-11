import React, { useState } from 'react';
import Canvas from './components/Canvas';
import SidebarAssets from './components/SidebarAssets';
import SidebarAI from './components/SidebarAI';
import { initialVenue, assets } from './data/assets';
import { Download, Undo, Redo, Maximize2, Image as ImageIcon } from 'lucide-react';

function App() {
  const [overlays, setOverlays] = useState([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState(null);

  const handleAddAsset = (asset) => {
    const newOverlay = {
      ...asset,
      instanceId: `overlay_${Date.now()}`,
      x: 0, // default center position
      y: 0,
      scale: 1,
      rotation: 0
    };
    setOverlays([...overlays, newOverlay]);
    setSelectedOverlayId(newOverlay.instanceId);
  };

  const handleUpdateOverlay = (id, newProps) => {
    setOverlays(overlays.map(o => o.instanceId === id ? { ...o, ...newProps } : o));
  };

  const handleRemoveOverlay = (id) => {
    setOverlays(overlays.filter(o => o.instanceId !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // Mock AI generative function
  const handleAIAssist = (command) => {
    const cmd = command.toLowerCase();
    let newOverlays = [...overlays];
    let added = false;
    let response = "I've analyzed your request and adjusted the arrangement accordingly.";

    if (cmd.includes('clear') || cmd.includes('remove all')) {
      setOverlays([]);
      setSelectedOverlayId(null);
      return "I've cleared all decorations from the canvas.";
    }

    if (cmd.includes('symmetry') || cmd.includes('symmetrical')) {
      setOverlays(overlays.map(o => ({ ...o, x: 0 })));
      return "I've aligned the decorations to create perfect center symmetry.";
    }

    // AI Generation Logic based on keywords
    if (cmd.includes('wedding') || cmd.includes('stage') || cmd.includes('setup') || cmd.includes('perfect')) {
      newOverlays = [
        // Backdrop drape (perfectly centered)
        { ...assets.find(a => a.id === 'd1'), instanceId: `overlay_${Date.now()}_bg`, x: 0, y: -20, scale: 2.8, rotation: 0 },
        // Stage Golden Frame (framing the drapes)
        { ...assets.find(a => a.id === 's1'), instanceId: `overlay_${Date.now()}_frame`, x: 0, y: -20, scale: 3.0, rotation: 0 },
        // Chandelier (top center)
        { ...assets.find(a => a.id === 'l1'), instanceId: `overlay_${Date.now()}_light`, x: 0, y: -220, scale: 1.2, rotation: 0 },
        // Left Floral arrangement (perfectly symmetrical)
        { ...assets.find(a => a.id === 'f2'), instanceId: `overlay_${Date.now()}_fl_left`, x: -240, y: 50, scale: 1.4, rotation: 0 },
        // Right Floral arrangement (perfectly symmetrical)
        { ...assets.find(a => a.id === 'f2'), instanceId: `overlay_${Date.now()}_fl_right`, x: 240, y: 50, scale: 1.4, rotation: 0 },
        // Center Floral Arch
        { ...assets.find(a => a.id === 'f1'), instanceId: `overlay_${Date.now()}_fl_center`, x: 0, y: 20, scale: 1.8, rotation: 0 },
        // Left Premium Sofa
        { ...assets.find(a => a.id === 'fur1'), instanceId: `overlay_${Date.now()}_sofa_left`, x: -140, y: 160, scale: 1.0, rotation: 0 },
        // Right Premium Sofa
        { ...assets.find(a => a.id === 'fur1'), instanceId: `overlay_${Date.now()}_sofa_right`, x: 140, y: 160, scale: 1.0, rotation: 0 },
      ];
      added = true;
      response = "I have meticulously designed a perfectly symmetrical, mathematically aligned premium wedding stage. The drapes, floral arches, and lighting are flawlessly centered.";
    } else {
      if (cmd.includes('flower') || cmd.includes('floral') || cmd.includes('arch')) {
        newOverlays.push({ ...assets.find(a => a.id === 'f1'), instanceId: `overlay_${Date.now()}_f`, x: 0, y: 0, scale: 1.5, rotation: 0 });
        added = true;
        response = "I've added a beautiful floral arrangement, perfectly centered on the stage.";
      }
      if (cmd.includes('chandelier') || cmd.includes('light')) {
        newOverlays.push({ ...assets.find(a => a.id === 'l1'), instanceId: `overlay_${Date.now()}_l`, x: 0, y: -220, scale: 1.2, rotation: 0 });
        added = true;
        response = "I've hung a premium chandelier precisely from the center of the ceiling.";
      }
      if (cmd.includes('curtain') || cmd.includes('drape')) {
         newOverlays.push({ ...assets.find(a => a.id === 'd1'), instanceId: `overlay_${Date.now()}_d`, x: 0, y: -20, scale: 2.8, rotation: 0 });
         added = true;
         response = "I've arranged elegant silk curtains, aligned evenly for the backdrop.";
      }
    }

    if (added) {
      setOverlays(newOverlays);
      return response;
    }

    if (cmd.includes('scale') || cmd.includes('bigger')) {
      if (selectedOverlayId) {
        handleUpdateOverlay(selectedOverlayId, { scale: 1.5 });
        return "I've scaled up the selected decoration.";
      }
      return "Please select a decoration to scale.";
    }
    
    return "I can add floral arches, chandeliers, silk curtains, or create a full wedding stage setup. Try asking me to 'add a floral arch' or 'create a wedding setup'!";
  };

  return (
    <div className="app-container">
      <SidebarAssets onAddAsset={handleAddAsset} />
      
      <main className="canvas-area">
        <div className="top-bar">
          <button className="tool-button" data-tooltip="Change Venue">
            <ImageIcon size={20} />
          </button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
          <button className="tool-button" data-tooltip="Undo">
            <Undo size={20} />
          </button>
          <button className="tool-button" data-tooltip="Redo">
            <Redo size={20} />
          </button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
          <button className="tool-button" data-tooltip="Fullscreen">
            <Maximize2 size={20} />
          </button>
          <button className="tool-button active" data-tooltip="Export Proposal">
            <Download size={20} />
          </button>
        </div>

        <Canvas 
          venueImage={initialVenue}
          overlays={overlays}
          selectedOverlayId={selectedOverlayId}
          onSelectOverlay={setSelectedOverlayId}
          onUpdateOverlay={handleUpdateOverlay}
          onRemoveOverlay={handleRemoveOverlay}
        />
      </main>

      <SidebarAI onAssist={handleAIAssist} />
    </div>
  );
}

export default App;
