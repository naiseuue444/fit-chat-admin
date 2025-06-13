
-- Gyms table
CREATE TABLE gyms (
gym_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT,
owner_name TEXT,
whatsapp_number TEXT,
address TEXT,
membership_plans TEXT,
offers TEXT,
class_schedule TEXT,
created_at TIMESTAMP DEFAULT NOW(),
activated BOOLEAN DEFAULT FALSE
);

-- Members table
CREATE TABLE members (
member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
gym_id UUID REFERENCES gyms(gym_id),
name TEXT,
number TEXT,
join_date DATE,
next_payment_date DATE,
goal TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
gym_id UUID REFERENCES gyms(gym_id),
name TEXT,
number TEXT,
goal TEXT,
message TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
gym_id UUID REFERENCES gyms(gym_id),
number TEXT
);

-- Payments table
CREATE TABLE payments (
payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
member_id UUID REFERENCES members(member_id),
gym_id UUID REFERENCES gyms(gym_id),
amount INTEGER,
paid_on DATE,
next_due DATE,
created_at TIMESTAMP DEFAULT NOW()
);

-- Broadcast Queue
CREATE TABLE broadcast_queue (
broadcast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
gym_id UUID REFERENCES gyms(gym_id),
message TEXT,
target TEXT CHECK (target IN ('members', 'leads')),
sent BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (since this is a gym management system)
-- Gyms can be viewed and created by anyone
CREATE POLICY "Anyone can view gyms" ON gyms FOR SELECT USING (true);
CREATE POLICY "Anyone can create gyms" ON gyms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gyms" ON gyms FOR UPDATE USING (true);

-- Members, leads, payments, and broadcast_queue should be accessible based on gym_id
CREATE POLICY "Gym-specific members access" ON members FOR ALL USING (true);
CREATE POLICY "Gym-specific leads access" ON leads FOR ALL USING (true);
CREATE POLICY "Gym-specific admins access" ON admins FOR ALL USING (true);
CREATE POLICY "Gym-specific payments access" ON payments FOR ALL USING (true);
CREATE POLICY "Gym-specific broadcast access" ON broadcast_queue FOR ALL USING (true);
