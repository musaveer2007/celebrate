import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { eventService, proposalService } from '../../services/api';
import type { Event, Proposal } from '../../types';
import { useNavigate } from 'react-router-dom';

const ClientProposals = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user) {
      const userEvents = await eventService.getClientEvents(user.id);
      setEvents(userEvents);
      
      let allProposals: any[] = [];
      for (const ev of userEvents) {
        const evProposals = await proposalService.getEventProposals(ev.id);
        allProposals = [...allProposals, ...evProposals];
      }
      setProposals(allProposals);
      setLoading(false);
    }
  };

  const handleAccept = async (proposalId: string, eventId: string) => {
    await proposalService.updateProposalStatus(proposalId, 'accepted');
    await eventService.updateEventStatus(eventId, 'planner_selected');
    loadData();
    alert('Proposal Accepted! You have hired this planner.');
    navigate('/client');
  };

  if (loading) return <div>Loading proposals...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Proposals Received</h1>
      
      {proposals.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
          <p className="text-slate-500">Wait for planners to review your matched events and send proposals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map(proposal => {
            const event = events.find(e => e.id === proposal.event_id);
            return (
              <div key={proposal.id} className="card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{proposal.title}</h3>
                    <span className={`badge ${proposal.status === 'accepted' ? 'badge-success' : 'badge-warning'}`}>
                      {proposal.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">For Event: {event?.title}</p>
                  <p className="text-sm font-medium mb-4">Planner: {proposal.planner_profiles?.business_name}</p>
                  <p className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>${proposal.total_price}</p>
                  <p className="text-slate-600 mb-4 line-clamp-3">{proposal.description}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button className="btn btn-secondary w-full">View Visual Design</button>
                  {proposal.status !== 'accepted' && (
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => handleAccept(proposal.id, proposal.event_id)}
                    >
                      Accept & Hire
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProposals;
