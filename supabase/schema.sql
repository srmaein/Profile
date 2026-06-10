-- ============================================================
-- Portfolio CMS — Supabase Schema v2
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Admin allowlist ───
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.admin_allowlist (email) VALUES ('smeainrahman@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- ─── Categories ───
CREATE TABLE IF NOT EXISTS public.categories (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0
);

INSERT INTO public.categories (id, label, sort_order) VALUES
  ('web',    'Web',     1),
  ('ai',     'AI / ML', 2),
  ('mobile', 'Mobile',  3),
  ('saas',   'SaaS',    4),
  ('other',  'Other',   5)
ON CONFLICT (id) DO NOTHING;

-- ─── is_admin() helper ───
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    EXISTS (
      SELECT 1 FROM public.admin_allowlist
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
    ),
    false
  );
$$;

-- ─── Projects ───
CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT         NOT NULL,
  slug          TEXT         NOT NULL UNIQUE,
  description   TEXT,
  thumbnail_url TEXT,
  video_url     TEXT,
  github_url    TEXT,
  live_url      TEXT,
  download_url  TEXT,
  category      TEXT         NOT NULL DEFAULT 'other',
  tags          TEXT[]       NOT NULL DEFAULT '{}',
  featured      BOOLEAN      NOT NULL DEFAULT false,
  published     BOOLEAN      NOT NULL DEFAULT false,  -- acts as "enabled"
  date          DATE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Ensure columns exist for existing tables (v2 upgrade)
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS live_url TEXT,
  ADD COLUMN IF NOT EXISTS download_url TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS date DATE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects (published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_category  ON public.projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_slug      ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured  ON public.projects (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_created   ON public.projects (created_at DESC);

-- Auto updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Slugify helper
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce(input,'')), '[^a-z0-9]+', '-', 'g'));
$$;

-- ─── Visitor logs (for analytics) ───
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  page       TEXT,
  referrer   TEXT,
  user_agent TEXT,
  country    TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_visited ON public.visitor_logs (visited_at DESC);

-- ─── RLS ───
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_logs  ENABLE ROW LEVEL SECURITY;

-- Categories: public read
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- Admin allowlist: admins only
DROP POLICY IF EXISTS "allowlist_admin_read" ON public.admin_allowlist;
CREATE POLICY "allowlist_admin_read" ON public.admin_allowlist FOR SELECT TO authenticated USING (public.is_admin());

-- Projects: public read enabled only
DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT TO anon, authenticated USING (published = true);

-- Projects: admins read all (including disabled)
DROP POLICY IF EXISTS "projects_admin_read" ON public.projects;
CREATE POLICY "projects_admin_read" ON public.projects
  FOR SELECT TO authenticated USING (public.is_admin());

-- Projects: admins write
DROP POLICY IF EXISTS "projects_admin_insert" ON public.projects;
CREATE POLICY "projects_admin_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "projects_admin_update" ON public.projects;
CREATE POLICY "projects_admin_update" ON public.projects FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "projects_admin_delete" ON public.projects;
CREATE POLICY "projects_admin_delete" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

-- Visitor logs: public insert, admin read
DROP POLICY IF EXISTS "visitor_logs_public_insert" ON public.visitor_logs;
CREATE POLICY "visitor_logs_public_insert" ON public.visitor_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "visitor_logs_admin_read" ON public.visitor_logs;
CREATE POLICY "visitor_logs_admin_read" ON public.visitor_logs FOR SELECT TO authenticated USING (public.is_admin());

-- ─── Storage buckets ───
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('thumbnails', 'thumbnails', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('videos',     'videos',     true, 209715200, ARRAY['video/mp4','video/webm','video/ogg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS
DROP POLICY IF EXISTS "thumbnails_public_read" ON storage.objects;
CREATE POLICY "thumbnails_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "videos_public_read" ON storage.objects;
CREATE POLICY "videos_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "thumbnails_admin_write" ON storage.objects;
CREATE POLICY "thumbnails_admin_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "thumbnails_admin_update" ON storage.objects;
CREATE POLICY "thumbnails_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "thumbnails_admin_delete" ON storage.objects;
CREATE POLICY "thumbnails_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "videos_admin_write" ON storage.objects;
CREATE POLICY "videos_admin_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND public.is_admin());

DROP POLICY IF EXISTS "videos_admin_update" ON storage.objects;
CREATE POLICY "videos_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND public.is_admin());

DROP POLICY IF EXISTS "videos_admin_delete" ON storage.objects;
CREATE POLICY "videos_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND public.is_admin());
