-- ModotecApp Schema

CREATE TABLE IF NOT EXISTS technicians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instruments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_type TEXT DEFAULT 'pdf',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queries_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_name TEXT,
  instrument_id UUID REFERENCES instruments(id) ON DELETE SET NULL,
  instrument_name TEXT,
  brand_name TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrument_id UUID REFERENCES instruments(id) ON DELETE SET NULL,
  instrument_name TEXT,
  brand_name TEXT,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  technician_name TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: allow all for now (configure per your security needs)
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_technicians" ON technicians FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_brands" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_instruments" ON instruments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_queries" ON queries_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_knowledge" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);
