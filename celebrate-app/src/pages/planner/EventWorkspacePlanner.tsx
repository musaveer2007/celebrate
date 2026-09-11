import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, taskService } from '../../services/api';

const EventWorkspacePlanner = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    if (eventId) {
      // In mock service we don't have getEvent exposed directly or we do, 
      // let's assume we can fetch it or just show basic workspace.
      eventService.getEvent(eventId).then(setEvent);
      loadTasks();
    }
  }, [eventId]);

  const loadTasks = async () => {
    if (eventId) {
      const data = await taskService.getEventTasks(eventId);
      setTasks(data);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !eventId) return;
    await taskService.createTask({
      event_id: eventId,
      title: newTaskTitle,
      status: 'to_do'
    });
    setNewTaskTitle('');
    loadTasks();
  };

  const handleUpdateTask = async (taskId: string, status: string) => {
    await taskService.updateTaskStatus(taskId, status);
    loadTasks();
  };

  if (!event) return <div>Loading workspace...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{event.title} Workspace</h1>
          <p className="text-slate-500">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
        </div>
        <div className="flex gap-2">
           <span className="badge badge-success">ACTIVE</span>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <div className="px-4 py-2 font-medium text-primary border-b-2 border-primary">Tasks</div>
        <div className="px-4 py-2 font-medium text-slate-500">Timeline</div>
        <div className="px-4 py-2 font-medium text-slate-500">Vendors</div>
        <div className="px-4 py-2 font-medium text-slate-500">Finance</div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Task columns */}
        <div className="w-1/3 flex flex-col bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-slate-700">To Do</h3>
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {tasks.filter(t => t.status === 'to_do').map(task => (
              <div key={task.id} className="card p-4">
                <p className="font-medium">{task.title}</p>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => handleUpdateTask(task.id, 'in_progress')} className="text-xs text-primary font-medium hover:underline">Start</button>
                </div>
              </div>
            ))}
            
            <form onSubmit={handleAddTask} className="mt-2">
              <input 
                type="text" 
                className="w-full text-sm p-2 border border-slate-200 rounded" 
                placeholder="+ Add task..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
            </form>
          </div>
        </div>

        <div className="w-1/3 flex flex-col bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-slate-700">In Progress</h3>
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {tasks.filter(t => t.status === 'in_progress').map(task => (
              <div key={task.id} className="card p-4 border-l-4 border-primary">
                <p className="font-medium">{task.title}</p>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => handleUpdateTask(task.id, 'completed')} className="text-xs text-success font-medium hover:underline">Complete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/3 flex flex-col bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-slate-700">Completed</h3>
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {tasks.filter(t => t.status === 'completed').map(task => (
              <div key={task.id} className="card p-4 opacity-60">
                <p className="font-medium line-through text-slate-500">{task.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventWorkspacePlanner;
