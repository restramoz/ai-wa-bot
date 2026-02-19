-- Supabase Database Schema for WhatsApp AI Marketing Agent

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- LEADS TABLE (Data Calon Pembeli)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  occupation VARCHAR(100),
  budget VARCHAR(50),
  need VARCHAR(200),
  timeline VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new',
  -- status: new, contacted, interested, survey, booking, closed, lost
  source VARCHAR(50) DEFAULT 'whatsapp_bot',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_contact TIMESTAMP WITH TIME ZONE
);

-- Index for faster phone lookup
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- ─────────────────────────────────────────────
-- CONVERSATIONS TABLE (Riwayat Chat)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'ai')),
  message TEXT NOT NULL,
  intent VARCHAR(50),
  -- intent: general, price_inquiry, asset_request, closing, data_collection
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for faster conversation lookup
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_intent ON conversations(intent);

-- ─────────────────────────────────────────────
-- BOOKINGS TABLE (Tracking Booking Fee)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  unit_type VARCHAR(20),
  kavling VARCHAR(10),
  booking_fee DECIMAL(15, 2),
  payment_method VARCHAR(50),
  payment_proof VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  -- status: pending, verified, cancelled, completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_bookings_lead_id ON bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ─────────────────────────────────────────────
-- AUTO UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (Optional - Enable if needed)
-- ─────────────────────────────────────────────
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- SAMPLE DATA (For Testing)
-- ─────────────────────────────────────────────
-- INSERT INTO leads (phone, name, occupation, budget, status)
-- VALUES ('628123456789', 'Test User', 'Wiraswasta', '300000000', 'new');