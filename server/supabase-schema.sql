-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'reseller')),
  plan TEXT CHECK (plan IN ('free', 'basic', 'vip') OR plan IS NULL),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  access_plan TEXT NOT NULL CHECK (access_plan IN ('free', 'basic', 'vip', 'all')),
  image TEXT,
  stock INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  items JSONB NOT NULL,
  reseller_id UUID REFERENCES users(id),
  reseller_name TEXT NOT NULL,
  reseller_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total NUMERIC NOT NULL,
  message TEXT,
  reply TEXT,
  shipping JSONB,
  revenue NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan upgrade requests table
CREATE TABLE IF NOT EXISTS plan_upgrade_requests (
  id UUID PRIMARY KEY,
  reseller_id UUID REFERENCES users(id),
  reseller_name TEXT NOT NULL,
  reseller_email TEXT NOT NULL,
  current_plan TEXT NOT NULL CHECK (current_plan IN ('free', 'basic', 'vip')),
  requested_plan TEXT NOT NULL CHECK (requested_plan IN ('free', 'basic', 'vip')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to execute SQL (needed for our setup script)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 