# Portfolio CMS — Setup Guide

## Quick Start (5 minutes)

### 1. Configure Supabase Credentials

Edit **`js/supabase-config.js`** and update with your real Supabase project details:

```js
window.SUPABASE_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',   // ← Replace
  SUPABASE_ANON_KEY: 'your-anon-key-here',             // ← Replace
  siteBase: '/Profile/',                               // ← Set to your GitHub Pages base path
  DEFAULT_ADMIN_EMAIL:    'your@email.com',            // ← Your Supabase Auth email
  DEFAULT_ADMIN_PASSWORD: 'YourPassword123!',          // ← Your Supabase Auth password
  AUTO_LOGIN: true,                                    // Set false to always show login form
};
```

### 2. Run the Database Schema

1. Go to your Supabase dashboard → **SQL Editor**
2. Copy and paste the contents of **`supabase/schema.sql`**
3. Click **Run**

This creates:
- `projects` table (all required fields including `featured`, `published`, `download_url`, `date`)
- `visitor_logs` table (for analytics)
- `admin_allowlist` table
- Row Level Security policies
- Storage buckets (`thumbnails`, `videos`)

### 3. Create Admin User in Supabase Auth

1. Supabase Dashboard → **Authentication → Users → Invite User**
2. Enter your admin email (must match `DEFAULT_ADMIN_EMAIL`)
3. Set the password (must match `DEFAULT_ADMIN_PASSWORD`)

---

## Admin Dashboard

Access at: `your-site.com/admin/`

### Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview cards: Total/Enabled/Disabled/Featured projects, categories, visitors |
| **Projects Table** | Full table with image, title, category, featured badge, status, date, actions |
| **New Project** | Full form with image upload, tags, category, all links, toggles |
| **Edit Project** | Edit any field, replace/remove image |
| **Enable/Disable** | Toggle project visibility with one click (reflects on public site instantly) |
| **Delete** | Confirmation modal, also removes image from Storage |
| **Categories** | Visual grid showing all categories with project counts |
| **Analytics** | Visitor stats, traffic chart, most viewed projects |
| **Mobile Sidebar** | Full responsive sidebar with hamburger menu |

### Project Fields

| Field | Type | Notes |
|-------|------|-------|
| `title` | text | Required |
| `description` | text | Shown on card and modal |
| `category` | text | Dropdown + custom input |
| `tags` | array | Click chips or type + Enter |
| `image` | file | Uploaded to Supabase Storage `thumbnails` bucket |
| `github` | url | GitHub repo link |
| `live` | url | Live demo link |
| `download` | url | Download link |
| `video` | url | Video URL (raw GitHub or direct) |
| `featured` | bool | Highlighted on homepage |
| `enabled` | bool | Show/hide on public site |
| `date` | date | Project date |

---

## Fix Summary

### 1. Admin Login Fix
- **Root cause**: `isConfigured()` had a check that rejected real credentials matching the example placeholder URL/key
- **Fix**: Removed incorrect placeholder-comparison logic; now checks only that URL includes `supabase.co`

### 2. Supabase Schema
- Added missing fields: `featured`, `download_url`, `date`
- Added `visitor_logs` table for analytics
- Updated RLS policies for all new tables

### 3. Projects API
- Handles both old (`github`, `image`, `live`) and new (`github_url`, `thumbnail_url`, `live_url`) field names
- Correct `enabled` field mapping (`published` column in DB)

### 4. Responsive Design
- No horizontal scrolling on any viewport
- Proper breakpoints: 480px, 600px, 768px, 900px, 1024px
- Mobile navigation with hamburger menu
- Responsive project cards, modals, and forms

### 5. Admin Dashboard — New Features
- Sidebar navigation (Dashboard, Projects, Categories, Analytics)
- Full projects table with all required columns + actions
- Create/Edit project form with image upload (drag & drop)
- Enable/Disable toggle per project
- Delete with confirmation
- Category overview grid
- Analytics with traffic chart + visitor stats

---

## Deployment (GitHub Pages + Vercel)

### GitHub Pages
```
siteBase: '/repo-name/'
```

### Vercel
```
siteBase: '/'
```

---

## Troubleshooting

**Login not working:**
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `js/supabase-config.js`
- Verify the user exists in Supabase Auth with matching email/password
- Check browser console for specific error messages

**Projects not loading:**
- Run `supabase/schema.sql` to create tables
- Check RLS policies are enabled
- Verify anon key has read access

**Image upload failing:**
- Create `thumbnails` bucket in Supabase Storage (public)
- Run the storage policies in `schema.sql`

**Changes not reflecting on public site:**
- Only `published = true` (Enabled) projects appear publicly
- Toggle the project to "Enabled" in the admin dashboard
