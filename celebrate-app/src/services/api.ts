import * as realServices from './supabaseServices';
import * as mockServices from './mockServices';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

// Re-export either real or mock services based on env flag
export const authService = useMock ? mockServices.mockAuthService : mockServices.mockAuthService; // Keeping auth mocked for now
export const eventService = useMock ? mockServices.mockEventService : realServices.eventService;
export const matchService = useMock ? mockServices.mockMatchService : realServices.matchService;
export const proposalService = useMock ? mockServices.mockProposalService : realServices.proposalService;
export const taskService = useMock ? mockServices.mockTaskService : realServices.taskService;
