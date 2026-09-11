import { supabase } from '../lib/supabase';
import type { Event, Proposal, Task } from '../types';

export const eventService = {
  async getClientEvents(clientId: string) {
    const { data, error } = await supabase.from('events').select('*').eq('client_id', clientId);
    if (error) throw error;
    return data as Event[];
  },
  async createEvent(event: Partial<Event>) {
    const { data, error } = await supabase.from('events').insert([event]).select().single();
    if (error) throw error;
    return data as Event;
  },
  async getEvent(eventId: string) {
    const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (error) throw error;
    return data as Event;
  },
  async updateEventStatus(eventId: string, status: string) {
    const { data, error } = await supabase.from('events').update({ status }).eq('id', eventId).select().single();
    if (error) throw error;
    return data as Event;
  }
};

export const matchService = {
  async triggerMatching(eventId: string) {
    // In a real app, this might call an Edge Function or backend service
    // For now, we simulate finding all planners and creating matches
    const { data: planners } = await supabase.from('planner_profiles').select('id');
    if (!planners) return;
    
    const matches = planners.map(p => ({
      event_id: eventId,
      planner_id: p.id,
      match_score: Math.floor(Math.random() * 20) + 80, // 80-100
      status: 'new'
    }));
    
    await supabase.from('planner_matches').insert(matches);
    await eventService.updateEventStatus(eventId, 'matching');
  },
  async getPlannerLeads(plannerId: string) {
    const { data, error } = await supabase
      .from('planner_matches')
      .select('*, events(*)')
      .eq('planner_id', plannerId);
    if (error) throw error;
    return data;
  },
  async getEventMatches(eventId: string) {
    const { data, error } = await supabase
      .from('planner_matches')
      .select('*, planner_profiles(*)')
      .eq('event_id', eventId);
    if (error) throw error;
    return data || [];
  },
  async getPlannerProposals(plannerId: string) {
    const { data } = await supabase
      .from('proposals')
      .select('*, events(*)')
      .eq('planner_id', plannerId);
    return data || [];
  }
};

export const proposalService = {
  async createProposal(proposal: Partial<Proposal>) {
    const { data, error } = await supabase.from('proposals').insert([proposal]).select().single();
    if (error) throw error;
    return data as Proposal;
  },
  async getEventProposals(eventId: string) {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, planner_profiles(*)')
      .eq('event_id', eventId);
    if (error) throw error;
    return data;
  },
  async getPlannerProposals(plannerId: string) {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, events(*)')
      .eq('planner_id', plannerId);
    if (error) throw error;
    return data;
  },
  async updateProposalStatus(proposalId: string, status: string) {
    const { data, error } = await supabase.from('proposals').update({ status }).eq('id', proposalId).select().single();
    if (error) throw error;
    return data as Proposal;
  }
};

export const taskService = {
  async getEventTasks(eventId: string) {
    const { data, error } = await supabase.from('tasks').select('*').eq('event_id', eventId);
    if (error) throw error;
    return data as Task[];
  },
  async createTask(task: Partial<Task>) {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single();
    if (error) throw error;
    return data as Task;
  },
  async updateTaskStatus(taskId: string, status: string) {
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', taskId).select().single();
    if (error) throw error;
    return data as Task;
  }
};

export const assetService = {
  async getAssets(plannerId: string) {
    const { data, error } = await supabase.from('assets').select('*').eq('planner_id', plannerId);
    if (error) throw error;
    return data;
  },
  async createAsset(asset: any) {
    const { data, error } = await supabase.from('assets').insert([asset]).select().single();
    if (error) throw error;
    return data;
  },
  async uploadAssetFile(fileBlob: Blob, fileName: string) {
    const filePath = `extracted/${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage.from('planner-assets').upload(filePath, fileBlob, {
      contentType: 'image/png'
    });
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('planner-assets').getPublicUrl(filePath);
    return publicUrl;
  }
};
