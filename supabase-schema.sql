-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('builder', 'contractor')),
  company_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contractor-specific data
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  specializations TEXT[] NOT NULL,
  experience_years INTEGER,
  team_size INTEGER,
  service_locations TEXT[] NOT NULL,
  bio TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_projects INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects posted by builders
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  builder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  project_type TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  required_specializations TEXT[] NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  start_date DATE,
  duration_days INTEGER,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'bidding_closed', 'awarded', 'completed', 'cancelled')),
  document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  bidding_deadline TIMESTAMP NOT NULL
);

-- Bids submitted by contractors
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  quoted_price INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  proposal TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, contractor_id)
);

-- Reviews/Ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES profiles(id),
  contractor_id UUID REFERENCES contractors(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_city ON projects(city);
CREATE INDEX idx_projects_builder ON projects(builder_id);
CREATE INDEX idx_bids_project ON bids(project_id);
CREATE INDEX idx_bids_contractor ON bids(contractor_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_contractors_user ON contractors(user_id);
CREATE INDEX idx_contractors_locations ON contractors USING GIN(service_locations);
CREATE INDEX idx_contractors_specializations ON contractors USING GIN(specializations);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for contractors
CREATE POLICY "Contractor profiles are viewable by everyone" ON contractors
  FOR SELECT USING (true);

CREATE POLICY "Contractors can update own profile" ON contractors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Contractors can insert own profile" ON contractors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Open projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Builders can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = builder_id);

CREATE POLICY "Builders can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = builder_id);

CREATE POLICY "Builders can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = builder_id);

-- RLS Policies for bids
CREATE POLICY "Builders can view bids on their projects" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = bids.project_id
      AND projects.builder_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can view their own bids" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = bids.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can create bids" ON bids
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update their own bids" ON bids
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Builders can create reviews for contractors" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = builder_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update contractor rating
CREATE OR REPLACE FUNCTION update_contractor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contractors
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE contractor_id = NEW.contractor_id
  ),
  total_projects = (
    SELECT COUNT(*)
    FROM bids
    WHERE contractor_id = NEW.contractor_id AND status = 'accepted'
  )
  WHERE id = NEW.contractor_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update contractor rating when review is added
CREATE TRIGGER update_contractor_rating_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_contractor_rating();
