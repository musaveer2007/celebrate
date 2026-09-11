import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="font-bold text-3xl" style={{ color: 'var(--color-primary)' }}>
            Celebrate
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
