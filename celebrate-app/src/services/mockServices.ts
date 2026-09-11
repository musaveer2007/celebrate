import type { Event, Match, Proposal, Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

const getMockData = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setMockData = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// Initialize demo data if empty
const initDemoData = () => {
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      { id: 'client1', role: 'client', first_name: 'Sarah', last_name: 'Client', email: 'demo@client.com' },
      { id: 'planner1', role: 'planner', first_name: 'Alex', last_name: 'Planner', email: 'demo@planner.com', business_name: 'Alex Events', description: 'Premium wedding planner', service_area: 'New York' },
      { id: 'pro1', role: 'professional', first_name: 'John', last_name: 'Pro', email: 'demo@pro.com', business_name: 'John Photography', category: 'Photographer' }
    ];
    setMockData('users', defaultUsers);
    setMockData('profiles', defaultUsers);
    setMockData('events', []);
    setMockData('matches', []);
    setMockData('proposals', []);
    setMockData('tasks', []);
  }
};
initDemoData();

export const mockAuthService = {
  async signIn(email: string) {
    const users = getMockData('users');
    const user = users.find((u: any) => u.email === email);
    if (!user) throw new Error('User not found. Use demo@client.com or register.');
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { user };
  },
  async signUp(userData: any) {
    const users = getMockData('users');
    const newUser = { id: uuidv4(), ...userData };
    users.push(newUser);
    setMockData('users', users);
    
    const profiles = getMockData('profiles');
    profiles.push(newUser);
    setMockData('profiles', profiles);
    
    return { user: newUser };
  },
  async getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  },
  async signOut() {
    localStorage.removeItem('currentUser');
  }
};

export const mockEventService = {
  async getClientEvents(clientId: string) {
    const events = getMockData('events');
    return events.filter((e: Event) => e.client_id === clientId);
  },
  async getEvent(eventId: string) {
    const events = getMockData('events');
    return events.find((e: Event) => e.id === eventId);
  },
  async createEvent(event: Partial<Event>) {
    const events = getMockData('events');
    const newEvent = { ...event, id: uuidv4(), status: 'posted', created_at: new Date().toISOString() };
    events.push(newEvent);
    setMockData('events', events);
    return newEvent;
  },
  async updateEventStatus(eventId: string, status: string) {
    const events = getMockData('events');
    const index = events.findIndex((e: Event) => e.id === eventId);
    if (index > -1) {
      events[index].status = status;
      setMockData('events', events);
      return events[index];
    }
    throw new Error('Event not found');
  }
};

export const mockMatchService = {
  async triggerMatching(eventId: string) {
    const planners = getMockData('profiles').filter((p: any) => p.role === 'planner');
    const matches = getMockData('matches');
    
    planners.forEach((p: any) => {
      matches.push({
        id: uuidv4(),
        event_id: eventId,
        planner_id: p.id,
        match_score: Math.floor(Math.random() * 20) + 80,
        status: 'new'
      });
    });
    setMockData('matches', matches);
    await mockEventService.updateEventStatus(eventId, 'matching');
  },
  async getPlannerLeads(plannerId: string) {
    const matches = getMockData('matches').filter((m: Match) => m.planner_id === plannerId);
    const events = getMockData('events');
    return matches.map((m: any) => ({ ...m, events: events.find((e: any) => e.id === m.event_id) }));
  },
  async getEventMatches(eventId: string) {
    const matches = getMockData('matches').filter((m: Match) => m.event_id === eventId);
    const profiles = getMockData('profiles');
    return matches.map((m: any) => ({ ...m, planner_profiles: profiles.find((p: any) => p.id === m.planner_id) }));
  }
};

export const mockProposalService = {
  async createProposal(proposal: Partial<Proposal>) {
    const proposals = getMockData('proposals');
    const newProposal = { ...proposal, id: uuidv4(), status: 'sent', created_at: new Date().toISOString() };
    proposals.push(newProposal);
    setMockData('proposals', proposals);
    
    const matches = getMockData('matches');
    const match = matches.find((m: any) => m.event_id === proposal.event_id && m.planner_id === proposal.planner_id);
    if (match) {
      match.status = 'proposal_sent';
      setMockData('matches', matches);
    }
    
    return newProposal;
  },
  async getEventProposals(eventId: string) {
    const proposals = getMockData('proposals').filter((p: Proposal) => p.event_id === eventId);
    const profiles = getMockData('profiles');
    return proposals.map((p: any) => ({ ...p, planner_profiles: profiles.find((prof: any) => prof.id === p.planner_id) }));
  },
  async updateProposalStatus(proposalId: string, status: string) {
    const proposals = getMockData('proposals');
    const proposal = proposals.find((p: Proposal) => p.id === proposalId);
    if (proposal) {
      proposal.status = status;
      setMockData('proposals', proposals);
      return proposal;
    }
    throw new Error('Proposal not found');
  },
  async getPlannerProposals(plannerId: string) {
    const proposals = getMockData('proposals').filter((p: Proposal) => p.planner_id === plannerId);
    return proposals;
  }
};

export const mockTaskService = {
  async getEventTasks(eventId: string) {
    return getMockData('tasks').filter((t: Task) => t.event_id === eventId);
  },
  async createTask(task: Partial<Task>) {
    const tasks = getMockData('tasks');
    const newTask = { ...task, id: uuidv4(), status: 'to_do' };
    tasks.push(newTask);
    setMockData('tasks', tasks);
    return newTask;
  },
  async updateTaskStatus(taskId: string, status: string) {
    const tasks = getMockData('tasks');
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task) {
      task.status = status;
      setMockData('tasks', tasks);
      return task;
    }
    throw new Error('Task not found');
  }
};
