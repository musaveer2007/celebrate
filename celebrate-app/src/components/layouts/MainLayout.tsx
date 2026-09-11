import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="flex justify-between items-center p-4 border-b border-slate-200">
        <div className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>Celebrate</div>
        <nav className="flex gap-4">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="p-4 text-center text-sm text-slate-500 border-t border-slate-200">
        © 2026 Celebrate. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
