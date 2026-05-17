-- Schema para o Sistema Imobiliário ImobiPremium

-- 1. Tabela de Propriedades
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  market_value DECIMAL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  parking_spots INTEGER DEFAULT 0,
  area DECIMAL DEFAULT 0,
  type TEXT CHECK (type IN ('house', 'apartment', 'land', 'commercial')),
  category TEXT CHECK (category IN ('venda', 'aluguel', 'permuta', 'empreendimento')) DEFAULT 'venda',
  status TEXT CHECK (status IN ('available', 'sold', 'rented')) DEFAULT 'available',
  featured BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso
-- Permitir leitura para todos (público)
CREATE POLICY "Allow public read access" ON properties FOR SELECT USING (true);

-- Permitir escrita/edição apenas para autenticados (corretores)
CREATE POLICY "Allow auth write access" ON properties FOR ALL USING (auth.role() = 'authenticated');

-- 4. Bucket de Imagens
-- No painel do Supabase, crie um bucket chamado 'property-images'
-- Torne o bucket público para que as imagens sejam acessíveis
