import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('MAIN TSX START');

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('MAIN TSX RENDER COMPLETE');
} catch (error) {
  console.error('MAIN TSX RENDER ERROR:', error);
}
