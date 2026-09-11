import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { matchService, proposalService } from '../../services/api';

const PlannerDashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      matchService.getPlannerLeads(user.id).then(setLeads);
      proposalService.getPlannerProposals(user.id).then(setProposals);
    }
  }, [user]);

  const newLeads = leads.filter(l => l.status === 'new');
  const activeEvents = proposals.filter(p => p.status === 'accepted');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Planner Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-purple-50 border border-purple-100">
          <h2 className="text-lg font-semibold text-purple-900 mb-1">New Leads</h2>
          <p className="text-3xl font-bold text-purple-700">{newLeads.length}</p>
          <Link to="/planner/leads" className="text-sm text-purple-600 hover:underline mt-2 inline-block">View all leads</Link>
        </div>
        
        <div className="card bg-amber-50 border border-amber-100">
          <h2 className="text-lg font-semibold text-amber-900 mb-1">Pending Proposals</h2>
          <p className="text-3xl font-bold text-amber-700">{proposals.filter(p => p.status === 'sent').length}</p>
          <Link to="/planner/proposals" className="text-sm text-amber-600 hover:underline mt-2 inline-block">Manage proposals</Link>
        </div>
        
        <div className="card bg-green-50 border border-green-100">
          <h2 className="text-lg font-semibold text-green-900 mb-1">Active Events</h2>
          <p className="text-3xl font-bold text-green-700">{activeEvents.length}</p>
          <Link to="/planner/events" className="text-sm text-green-600 hover:underline mt-2 inline-block">Go to Event Workspaces</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Today's Priorities</h2>
          <div className="text-slate-500 text-center py-8">No urgent priorities today.</div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Needs Attention</h2>
          <div className="text-slate-500 text-center py-8">All clear.</div>
        </div>
      </div>
    </div>
  );
};

export default PlannerDashboard;
