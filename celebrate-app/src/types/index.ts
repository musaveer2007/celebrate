

// Types
export type Role = 'client' | 'planner' | 'professional' | 'admin';

export interface Profile {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
  email: string;
}

export interface PlannerProfile extends Profile {
  business_name: string;
  description: string;
  service_area: string;
}

export interface Event {
  id: string;
  client_id: string;
  title: string;
  event_type: string;
  date: string;
  location: string;
  budget: number;
  status: string;
  guest_count?: number;
}

export interface Match {
  id: string;
  event_id: string;
  planner_id: string;
  match_score: number;
  status: string;
}

export interface Proposal {
  id: string;
  event_id: string;
  planner_id: string;
  title: string;
  description?: string;
  total_price: number;
  status: string;
  design_url?: string;
}

export interface Task {
  id: string;
  event_id: string;
  title: string;
  status: string;
  assignee_id?: string;
}

export interface ProfessionalOpportunity {
  id: string;
  event_id: string;
  planner_id: string;
  title: string;
  category: string;
  status: string;
}
