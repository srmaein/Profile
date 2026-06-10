# Supabase CMS Setup

Portfolio CMS for GitHub Pages (static hosting, no backend server).

## 1. What you need from Supabase (no connection string)

This site is **static** (GitHub Pages). You do **not** need:

- PostgreSQL connection string (`postgresql://...`)
- `service_role` / secret API key
- Database password

You **only** need two values from **Supabase Dashboard → Project Settings → API**:

| Config field | Supabase dashboard name |
|--------------|-------------------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` public key or **publishable** key |

Put them in **`js/supabase-config.js`** (copy from `js/supabase-config.example.js`):

```js
window.SUPABASE_CONFIG = {
  SUPABASE_URL: 'https://xxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbG...',
  siteBase: '',  // e.g. '/repo-name/' for GitHub Pages project sites
};
```

`.env.example` also documents `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` if you later use Vite.

## 2. Run SQL schema

1. Supabase Dashboard → **SQL Editor**
2. Paste and run `supabase/schema.sql`
3. Add your admin email:

```sql
INSERT INTO public.admin_allowlist (email) VALUES ('your-email@gmail.com');
```

4. If upgrading from an older schema with `youtube_url`:

```sql
ALTER TABLE public.projects DROP COLUMN IF EXISTS youtube_url;
```

## 3. Storage buckets

The SQL creates `thumbnails` and `videos` buckets. Verify in **Storage**:

- `thumbnails` — public, images (admin upload only)
- `videos` — public, optional MP4/WebM uploads

## 4. Auth & default admin login

Default credentials (pre-filled on `/admin`, optional auto sign-in):

| Field | Default value |
|-------|----------------|
| Email | `smeainrahman@gmail.com` |
| Password | `PortfolioAdmin2024!` |

Configure in `js/supabase-config.js`:

```js
DEFAULT_ADMIN_EMAIL: 'smeainrahman@gmail.com',
DEFAULT_ADMIN_PASSWORD: 'PortfolioAdmin2024!',
AUTO_LOGIN: true,  // sign in on page load when configured
```

**You must create the same user in Supabase once** (the website cannot create passwords by itself):

1. **Authentication** → **Providers** → enable **Email**
2. **Authentication** → **Users** → **Add user** → email `smeainrahman@gmail.com`, password **`PortfolioAdmin2024!`**
3. Turn on **Auto Confirm User** (avoids “email not confirmed” errors)
4. In **SQL Editor**, ensure your email is on the allowlist:

```sql
INSERT INTO public.admin_allowlist (email) VALUES ('smeainrahman@gmail.com')
ON CONFLICT (email) DO NOTHING;
```

Change the email in SQL + `supabase-config.js` if you use a different account.

Only emails in `admin_allowlist` can write via RLS.

## 5. Admin workflow (`/admin`)

1. **Sign in** with Supabase email/password
2. **Upload thumbnail** — auto-cropped to 16:9 (1280×720)
3. **Title**
4. **GitHub link** — e.g. `https://github.com/username/repo`
5. **Description**
6. **Publish**

Optional fields are under **More options** (category, tags, live demo, video file).

## 6. How GitHub links appear on the public site

| Link type | Public behavior |
|-----------|-----------------|
| `github.com/owner/repo` | **Preview card** in project modal (owner/repo label + “Open repository on GitHub”). Card shows GitHub icon overlay; primary button links to the repo. |
| `raw.githubusercontent.com/.../file.mp4` | **HTML5 video** in modal (controls, no autoplay). |
| Other GitHub URLs | Generic GitHub link card. |

GitHub does not allow embedding repository pages in iframes, so repos use a styled link card—not a broken iframe.

## 7. Project JSON shape

```json
{
  "id": "uuid",
  "title": "",
  "slug": "",
  "description": "",
  "thumbnail_url": "",
  "video_url": "",
  "github_url": "",
  "category": "web",
  "tags": [],
  "seo_title": "",
  "seo_description": "",
  "created_at": "",
  "published": true
}
```

## 8. GitHub Pages deploy

- Use relative paths (`admin/`, `js/...`) — already configured
- Set `siteBase` in config if the site is served from `username.github.io/repo-name/`
- Push `js/supabase-config.js` only locally or via GitHub Actions secrets (do not commit real keys)

## 9. Test checklist

1. Run SQL + add admin email + create auth user
2. Fill `js/supabase-config.js`
3. Open `admin/` → sign in
4. Create project: thumbnail + title + GitHub URL + description → **Publish**
5. Open homepage → new project card appears with GitHub link
6. Click card → modal shows GitHub preview card
