import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = ({ role }: { role: string }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = {
    client: [
      { to: '/client', label: 'Dashboard' },
      { to: '/client/events', label: 'My Events' },
      { to: '/client/proposals', label: 'Proposals' },
      { to: '/client/messages', label: 'Messages' },
    ],
    planner: [
      { to: '/planner', label: 'Dashboard' },
      { to: '/planner/leads', label: 'Leads' },
      { to: '/planner/events', label: 'Events' },
      { to: '/planner/proposals', label: 'Proposals' },
      { to: '/planner/ai-canvas', label: 'AI Canvas' },
      { to: '/planner/vendors', label: 'Vendors' },
      { to: '/planner/tasks', label: 'Tasks' },
      { to: '/planner/messages', label: 'Messages' },
    ],
    professional: [
      { to: '/professional', label: 'Dashboard' },
      { to: '/professional/opportunities', label: 'Opportunities' },
      { to: '/professional/applications', label: 'Applications' },
      { to: '/professional/projects', label: 'Projects' },
      { to: '/professional/messages', label: 'Messages' },
    ],
    admin: [
      { to: '/admin', label: 'Admin Dashboard' },
    ]
  };

  const links = navLinks[role as keyof typeof navLinks] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link to={`/${role}`} className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>
            Celebrate
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="block p-2 rounded hover:bg-slate-100 text-slate-700 font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="text-sm text-slate-500 mb-2 truncate">{user?.email}</div>
          <button onClick={handleSignOut} className="btn btn-secondary w-full">Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-end">
           <div className="badge badge-primary uppercase">{role}</div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
