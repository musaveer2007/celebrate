export const categories = [
  { id: 'all', name: 'All' },
  { id: 'floral', name: 'Floral' },
  { id: 'furniture', name: 'Furniture' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'drapes', name: 'Drapes' },
  { id: 'stage', name: 'Stage Props' }
];

// Placeholder assets - normally these would be real transparent PNGs
export const assets = [
  {
    id: 'f1',
    category: 'floral',
    name: 'Rose Arch',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=200&h=200', // Mock placeholder
    type: 'image'
  },
  {
    id: 'f2',
    category: 'floral',
    name: 'Standing Bouquet',
    url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=200&h=200',
    type: 'image'
  },
  {
    id: 'fur1',
    category: 'furniture',
    name: 'Premium Sofa',
    url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=200&h=200',
    type: 'image'
  },
  {
    id: 'l1',
    category: 'lighting',
    name: 'Chandelier',
    url: 'https://images.unsplash.com/photo-1543191879-742cb35a3a4e?auto=format&fit=crop&q=80&w=200&h=200',
    type: 'image'
  },
  {
    id: 'd1',
    category: 'drapes',
    name: 'Silk Curtains',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200&h=200',
    type: 'image'
  },
  {
    id: 's1',
    category: 'stage',
    name: 'Golden Frame',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200&h=200',
    type: 'image'
  }
];

export const initialVenue = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200&h=800'; // Empty hall
