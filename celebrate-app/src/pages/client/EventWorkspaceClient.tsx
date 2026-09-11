import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, taskService } from '../../services/api';

const EventWorkspaceClient = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (eventId) {
      eventService.getEvent(eventId).then(setEvent);
      taskService.getEventTasks(eventId).then(setTasks);
    }
  }, [eventId]);

  if (!event) return <div>Loading workspace...</div>;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-slate-500">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
        </div>
        <div className="text-right">
           <div className="text-sm font-medium text-slate-500 mb-1">Overall Progress</div>
           <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{progress}%</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <div className="px-4 py-2 font-medium text-primary border-b-2 border-primary">Overview</div>
        <div className="px-4 py-2 font-medium text-slate-500">Messages</div>
        <div className="px-4 py-2 font-medium text-slate-500">Documents</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-y-auto">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Event Health</h2>
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
                <span className="font-medium text-green-900">Timeline</span>
                <span className="badge badge-success">On Track</span>
              </div>
              <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
                <span className="font-medium text-green-900">Budget</span>
                <span className="badge badge-success">Good</span>
              </div>
              <div className="flex-1 bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center justify-between">
                <span className="font-medium text-amber-900">Vendors</span>
                <span className="badge badge-warning">Action Needed</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Progress (Tasks)</h2>
            {tasks.length === 0 ? (
              <p className="text-slate-500">Your planner hasn't added any tasks yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {tasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className={task.status === 'completed' ? 'line-through text-slate-400' : 'font-medium'}>
                      {task.title}
                    </span>
                    <span className="text-xs uppercase font-medium text-slate-500">
                      {task.status.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="card bg-primary text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            <h3 className="font-bold mb-2 text-white">Your Planner</h3>
            <p className="opacity-90">Message your planner to discuss details, or upload reference documents.</p>
            <button className="btn bg-white text-black mt-4 w-full border-none">Message Planner</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventWorkspaceClient;
