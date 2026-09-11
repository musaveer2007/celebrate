import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { eventService, matchService } from '../../services/api';
import type { Event } from '../../types';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      eventService.getClientEvents(user.id).then(setEvents);
    }
  }, [user]);

  const handleTriggerMatching = async (eventId: string) => {
    await matchService.triggerMatching(eventId);
    // Refresh events
    const updatedEvents = await eventService.getClientEvents(user.id);
    setEvents(updatedEvents);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link to="/client/events/new" className="btn btn-primary">Create New Event</Link>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No events yet</h2>
          <p className="text-slate-500 mb-4">Start planning your next celebration by creating an event.</p>
          <Link to="/client/events/new" className="btn btn-primary">Get Started</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <span className={`badge ${event.status === 'posted' ? 'badge-neutral' : 'badge-primary'}`}>
                    {event.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-600 mb-1">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-slate-500 text-sm mb-4">{event.location}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                {event.status === 'posted' && (
                  <button 
                    onClick={() => handleTriggerMatching(event.id)}
                    className="btn btn-purple w-full"
                  >
                    Find Planners (Trigger Match)
                  </button>
                )}
                {event.status === 'matching' && (
                  <button className="btn btn-secondary w-full" disabled>
                    Matching in progress...
                  </button>
                )}
                {(event.status === 'planner_selected' || event.status === 'booked') && (
                  <Link to={`/client/events/${event.id}`} className="btn btn-primary w-full">
                    Open Workspace
                  </Link>
                )}
                <Link to="/client/proposals" className="btn btn-secondary w-full">
                  View Proposals
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
