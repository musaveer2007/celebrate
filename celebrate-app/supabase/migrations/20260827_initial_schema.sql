-- Celebrate Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('client', 'planner', 'professional', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'posted', 'matching', 'waiting_for_proposals', 'proposals_received', 'planner_selected', 'booked', 'in_progress', 'completed', 'cancelled');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'shortlisted', 'accepted', 'declined', 'expired');
CREATE TYPE lead_status AS ENUM ('new', 'viewed', 'proposal_draft', 'proposal_sent', 'closed');
CREATE TYPE task_status AS ENUM ('to_do', 'in_progress', 'blocked', 'completed');
CREATE TYPE vendor_status AS ENUM ('discovered', 'contacted', 'quote_requested', 'quote_received', 'negotiating', 'approved', 'booked', 'confirmed', 'completed');
CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'shortlisted', 'selected', 'not_selected');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'needs_review');
CREATE TYPE dispute_status AS ENUM ('submitted', 'under_review', 'resolved', 'closed');

-- 2. USERS & PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client specific data
CREATE TABLE client_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  preferences JSONB
);

-- Planner specific data
CREATE TABLE planner_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL,
  description TEXT,
  experience_years INTEGER,
  service_area TEXT,
  verification_status verification_status DEFAULT 'pending',
  rating NUMERIC(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  services JSONB -- e.g., ["wedding", "corporate"]
);

-- Professional specific data
CREATE TABLE professional_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., Photographer, Caterer
  description TEXT,
  experience_years INTEGER,
  service_area TEXT,
  verification_status verification_status DEFAULT 'pending',
  rating NUMERIC(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  services JSONB,
  portfolio_urls JSONB
);

-- 3. EVENTS
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  date DATE,
  location TEXT,
  guest_count INTEGER,
  budget NUMERIC(10, 2),
  status event_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  style TEXT,
  services_required JSONB,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATCHING & LEADS
CREATE TABLE planner_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  planner_id UUID REFERENCES planner_profiles(id) NOT NULL,
  match_score NUMERIC(5, 2) NOT NULL,
  match_reasons JSONB,
  status lead_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, planner_id)
);

-- 5. PROPOSALS
CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  planner_id UUID REFERENCES planner_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_price NUMERIC(10, 2),
  status proposal_status DEFAULT 'draft',
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proposal_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL
);

-- AI Canvas for Proposals
CREATE TABLE ai_designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES planner_profiles(id) NOT NULL,
  prompt TEXT NOT NULL,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_renders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  design_id UUID REFERENCES ai_designs(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENT WORKSPACE (TASKS, VENDORS, TEAM)
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  assignee_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'to_do',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  status vendor_status DEFAULT 'discovered',
  expected_cost NUMERIC(10, 2),
  actual_cost NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROFESSIONAL MARKETPLACE
CREATE TABLE professional_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  planner_id UUID REFERENCES planner_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  budget_range JSONB,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE professional_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  opportunity_id UUID REFERENCES professional_opportunities(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES professional_profiles(id) NOT NULL,
  cover_letter TEXT,
  proposed_rate NUMERIC(10, 2),
  status application_status DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, professional_id)
);

CREATE TABLE professional_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES professional_profiles(id) NOT NULL,
  opportunity_id UUID REFERENCES professional_opportunities(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMUNICATIONS & DOCUMENTS
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read_by JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES profiles(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FINANCE
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES profiles(id) NOT NULL,
  payee_id UUID REFERENCES profiles(id) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Placeholders for real implementation)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- (RLS policies will be added via separate auth migrations or Supabase interface)
