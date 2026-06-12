-- PhotoFlow AI Schema definition

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS pf_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    plan TEXT DEFAULT 'free', -- 'free' or 'pro'
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 1073741824, -- Default 1GB in bytes
    custom_watermark_url TEXT,
    wave_merchant_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS pf_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS pf_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    client_id UUID REFERENCES pf_clients ON DELETE SET NULL,
    name TEXT NOT NULL,
    date DATE,
    description TEXT,
    project_type TEXT, -- 'Mariage', 'Baptême', 'Anniversaire', 'Corporate', 'Portrait', 'Événement', 'Immobilier', 'Mode', 'Sportif', 'Paysage'
    auto_retouch TEXT DEFAULT 'none', -- 'none', 'auto', 'face', 'skin', 'hdr'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Photos Table
CREATE TABLE IF NOT EXISTS pf_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES pf_projects ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_url TEXT NOT NULL,
    processed_url TEXT,
    size_bytes BIGINT NOT NULL,
    format TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb, -- ISO, Shutter, Aperture, Width, Height, Camera model
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Galleries Table
CREATE TABLE IF NOT EXISTS pf_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES pf_projects ON DELETE CASCADE UNIQUE,
    url_slug TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    is_protected BOOLEAN DEFAULT false,
    apply_watermark BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 6. Invoices/Estimates Table
CREATE TABLE IF NOT EXISTS pf_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    client_id UUID REFERENCES pf_clients ON DELETE SET NULL,
    project_id UUID REFERENCES pf_projects ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    amount_fcfa INTEGER NOT NULL,
    type TEXT DEFAULT 'invoice', -- 'invoice' or 'estimate' (devis)
    status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'paid'
    due_date DATE,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE pf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON pf_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON pf_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Clients Policies
CREATE POLICY "Users can manage their own clients" ON pf_clients
    USING (auth.uid() = user_id);

-- Projects Policies
CREATE POLICY "Users can manage their own projects" ON pf_projects
    USING (auth.uid() = user_id);

-- Photos Policies
CREATE POLICY "Users can manage photos of their projects" ON pf_photos
    USING (
        EXISTS (
            SELECT 1 FROM pf_projects
            WHERE pf_projects.id = pf_photos.project_id
            AND pf_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view photos in public galleries" ON pf_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pf_galleries
            WHERE pf_galleries.project_id = pf_photos.project_id
        )
    );

-- Galleries Policies
CREATE POLICY "Users can manage their own galleries" ON pf_galleries
    USING (
        EXISTS (
            SELECT 1 FROM pf_projects
            WHERE pf_projects.id = pf_galleries.project_id
            AND pf_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view galleries" ON pf_galleries
    FOR SELECT USING (true);

-- Invoices Policies
CREATE POLICY "Users can manage their own invoices" ON pf_invoices
    USING (auth.uid() = user_id);

-- Create profile on user signup trigger function
CREATE OR REPLACE FUNCTION public.handle_new_pf_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.pf_profiles (id, full_name, plan, storage_used, storage_limit)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Photographe'),
    'free',
    0,
    1073741824 -- 1GB
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run handle_new_pf_user on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_pf
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_pf_user();
