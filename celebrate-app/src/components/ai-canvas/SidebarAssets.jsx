import React, { useState } from 'react';
import { categories, assets } from './data/assets';
import { Library, LayoutGrid, Plus } from 'lucide-react';

function SidebarAssets({ onAddAsset, onOpenCropper, dynamicAssets = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const combinedAssets = [...assets, ...dynamicAssets];

  const filteredAssets = activeCategory === 'all' 
    ? combinedAssets 
    : combinedAssets.filter(a => a.category === activeCategory);

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <Library size={24} color="#6366f1" />
          Asset Library
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Select and arrange items. Do not create.
        </p>
        <button 
          className="btn btn-primary w-full mt-4" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
          onClick={onOpenCropper}
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      <div className="sidebar-content">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="asset-grid">
          {filteredAssets.map(asset => (
            <div 
              key={asset.id} 
              className="glass-card asset-item"
              onClick={() => onAddAsset(asset)}
            >
              <img src={asset.url} alt={asset.name} />
              <div className="asset-label">{asset.name || 'Unnamed Asset'}</div>
            </div>
          ))}
        </div>
        
        {filteredAssets.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
            <LayoutGrid size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>No assets in this category yet.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default SidebarAssets;
