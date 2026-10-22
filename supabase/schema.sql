-- =========================================================================
-- RIZX STUDIO PORTFOLIO - SUPABASE DATABASE SCHEMA & SEED DATA
-- Jalankan query ini di Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =========================================================================

-- 1. Tabel Flagship Showcase (Stage 3 YouTube Video & Copywriting)
CREATE TABLE IF NOT EXISTS public.flagship_showcase (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT NOT NULL DEFAULT 'From Visual Craft to Technology',
  category TEXT NOT NULL DEFAULT 'VISUAL CRAFT | DIGITAL | AI',
  description TEXT DEFAULT 'A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology — pushing the boundaries of creative digital experiences.',
  youtube_url TEXT DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  video_id TEXT DEFAULT 'dQw4w9WgXcQ',
  is_video_enabled BOOLEAN DEFAULT true,
  image_url TEXT DEFAULT '/assets/antigravity/hero-large.jpg',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Client Brand Descriptions (Stage 4 Client Folders)
CREATE TABLE IF NOT EXISTS public.client_descriptions (
  client_id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  category TEXT,
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.flagship_showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_descriptions ENABLE ROW LEVEL SECURITY;

-- Policy agar Public View dapat membaca data tanpa login
DROP POLICY IF EXISTS "Public can view flagship showcase" ON public.flagship_showcase;
CREATE POLICY "Public can view flagship showcase" 
ON public.flagship_showcase FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view client descriptions" ON public.client_descriptions;
CREATE POLICY "Public can view client descriptions" 
ON public.client_descriptions FOR SELECT USING (true);

-- Policy agar Admin Dashboard dapat mengupdate data
DROP POLICY IF EXISTS "Allow update flagship showcase" ON public.flagship_showcase;
CREATE POLICY "Allow update flagship showcase" 
ON public.flagship_showcase FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow update client descriptions" ON public.client_descriptions;
CREATE POLICY "Allow update client descriptions" 
ON public.client_descriptions FOR ALL USING (true);

-- =========================================================================
-- SEED DATA AWAL (Initial Data)
-- =========================================================================

-- Insert Flagship Showcase default
INSERT INTO public.flagship_showcase (id, title, category, description, youtube_url, video_id, is_video_enabled, image_url)
VALUES (
  'default',
  'From Visual Craft to Technology',
  'VISUAL CRAFT | DIGITAL | AI',
  'A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology — pushing the boundaries of creative digital experiences.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  true,
  '/assets/antigravity/hero-large.jpg'
)
ON CONFLICT (id) DO NOTHING;

-- Insert 8 Client Folders Initial Descriptions
INSERT INTO public.client_descriptions (client_id, client_name, category, description)
VALUES 
(
  'client-kia',
  'KIA Dufour',
  'Digital Campaign — KIA Dufour',
  'KIA Dufour is an authorized automotive dealership network in France representing Kia''s forward-thinking electric vehicle line-up. Our collaboration focuses on producing high-end digital advertising campaigns, 3D/AI concept automotive visualizations, and promotional marketing collateral for models including the EV2, Sportage, and PBV concepts.'
),
(
  'client-hyashop',
  'Hyashop',
  'Digital Campaign — HYASHOP',
  'HYASHOP is a premier curated fashion and footwear retail brand catering to contemporary streetwear and luxury sneaker enthusiasts. We delivered a series of digital campaigns, visual brand identities, and commercial e-commerce advertising graphics emphasizing premium aesthetics and youth street culture.'
),
(
  'client-burger-king',
  'Burger King',
  'Digital Campaign — Burger King',
  'Burger King is a world-renowned global fast-food brand recognized for bold flavor and playful marketing. We crafted dynamic back-to-school promotional campaign graphics and character-driven digital ad assets featuring the ''Where''s Charlie?'' collection across multiple social and digital display formats.'
),
(
  'client-permifast',
  'Permifast',
  'Digital Campaign — Permifast',
  'Permifast is a French driver education platform simplifying access to driving licenses and road safety certifications. We designed engaging digital giveaway promotional campaigns, promotional banners, and targeted social media ad creatives driving user registration.'
),
(
  'client-xeilos',
  'Xeilos',
  'Brand Visuals & Ads — Xeilos',
  'Xeilos is a high-growth crypto and algorithmic trading intelligence brand. We provided comprehensive digital marketing visuals, Trading Summit advertising assets, and high-impact futuristic brand graphics tailored to financial tech audiences.'
),
(
  'client-adl-finance',
  'ADL - Finance',
  'Digital Campaign — ADL Finance',
  'ADL Finance is a modern financial consultancy and wealth management firm. We crafted digital advertising campaigns, investment service promotions, and professional social media collateral designed to build trust and elevate institutional authority.'
),
(
  'client-eduf',
  'EDUF - Education',
  'Digital Campaign — EDUF',
  'EDUF is an international education agency and student mobility consultancy. We developed inspirational digital advertising campaigns, study abroad visual guides, and student enrollment creative assets highlighting academic excellence.'
),
(
  'client-withings',
  'Withings - Health Tech',
  'Digital Campaign — Withings',
  'Withings is a pioneer in connected health technology and medical-grade smart devices. We produced clean, minimalist digital advertising campaigns and product showcase visuals highlighting health monitoring innovations and smart lifestyle integration.'
)
ON CONFLICT (client_id) DO NOTHING;
