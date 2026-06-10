# A.K.M Sadman Rahman Maein — Portfolio

[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blue?logo=github)](https://pages.github.com/)
[![CMS](https://img.shields.io/badge/CMS-Decap%20CMS-orange)](https://decapcms.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A fully responsive, dark-themed developer portfolio with a **GitHub-connected CMS admin panel** for zero-code project management. Built with vanilla HTML/CSS/JS — no build step, no Node.js, deployable to GitHub Pages in minutes.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Dynamic Project Loading** | Projects auto-loaded from `data/projects.json` |
| **Project Modal** | Click any card → YouTube embed / MP4 video + links |
| **CMS Admin Panel** | Add/edit/delete projects via `/admin/` — no coding required |
| **Dark / Light Mode** | Persisted in `localStorage` |
| **Particle Canvas** | Interactive animated background |
| **Custom Cursor** | Magnetic lag-ring + dot cursor |
| **Scroll Animations** | Staggered IntersectionObserver reveals |
| **Skill Bars** | Animated progress bars on scroll |
| **Timeline** | Work experience + education + certifications |
| **Search + Filter** | Real-time project search and category filter |
| **Contact Form** | Client-side validated (Formspree-ready) |
| **Mobile Responsive** | Full hamburger nav, stacked grids |
| **GitHub Pages Ready** | Zero backend, static hosting |

---

## 📁 File Structure

```
portfolio/
├── index.html                 # Main portfolio page
├── style.css                  # All styles (dark/light theme)
├── script.js                  # All JavaScript + project loader
│
├── data/
│   ├── projects.json          # ← ADD PROJECTS HERE
│   └── settings.json          # Site meta (name, email, etc.)
│
├── admin/
│   ├── index.html             # Decap CMS panel
│   └── config.yml             # CMS config (update repo name!)
│
└── assets/
    ├── images/
    │   ├── profile.jpg         # Hero profile photo
    │   ├── profile1.jpg        # About section photo
    │   └── projects/           # Project thumbnails (CMS uploads here)
    └── resume.pdf              # Downloadable CV
```

---

## 🚀 Quick Deploy to GitHub Pages

### Step 1 — Create Repository
```bash
git init
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. Click **Save**
5. Your portfolio is live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Step 3 — Add Your Files
Copy these into `assets/images/`:
- `profile.jpg` — Your hero avatar (recommended: square, min 300×300px)
- `profile1.jpg` — About section photo
- `resume.pdf` → `assets/resume.pdf`

---

## 🛠️ CMS Admin Setup (Decap CMS + GitHub OAuth)

The admin panel at `/admin/` lets you **add, edit, and delete projects** without touching any code.

### 1. Update `admin/config.yml`
```yaml
backend:
  repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME   # ← Change this
  branch: main
```

### 2. Create GitHub OAuth App
1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Portfolio CMS
   - **Homepage URL**: `https://YOUR_USERNAME.github.io`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Set Up Netlify OAuth Proxy (free)
1. Go to [netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually** → drag any file
2. Go to **Site settings** → **Identity** → **Enable Identity**
3. Under **External providers** → **Add provider** → **GitHub**
   - Paste your OAuth Client ID and Client Secret
4. Under **Registration preferences** → **Invite only**
5. Go to **Identity** tab → **Invite users** → invite your email

### 4. Access the CMS
Visit `https://YOUR_USERNAME.github.io/YOUR_REPO/admin/` and log in with GitHub.

> **Every save in the CMS commits to your GitHub repo → GitHub Pages auto-deploys.**

---

## ➕ Adding Projects

### Via CMS Admin (recommended)
1. Open `/admin/`
2. Click **Projects** → **Edit** → **Add Projects item**
3. Fill in title, description, category, tags, video URL, GitHub URL, etc.
4. Click **Publish** → committed to GitHub → live in ~2 minutes

### Via JSON (manual)
Edit `data/projects.json` and add an object to the `projects` array:

```json
{
  "id": "my-new-project",
  "title": "My New Project",
  "description": "A detailed description of the project.",
  "category": "web",
  "tags": ["React", "Node.js", "MongoDB"],
  "video": "https://youtu.be/YOUR_VIDEO_ID",
  "github": "https://github.com/username/repo",
  "live": "https://myproject.vercel.app",
  "image": "assets/images/projects/my-project.jpg",
  "download": "",
  "featured": true,
  "date": "2025-01-01"
}
```

**Category options:** `web` | `ai` | `mobile` | `other`

---

## 🎨 Customisation

### Colours (`style.css` → `:root`)
```css
--c-accent:  #00c9ff;   /* Primary accent (electric blue) */
--c-accent2: #8b5cf6;   /* Secondary accent (violet) */
--c-bg:      #060b18;   /* Page background */
```

### Typing Phrases (`script.js` → `phrases` array)
```js
const phrases = [
  'intelligent AI systems.',
  'scalable web applications.',
  // add more...
];
```

### Hero Stats
Update `data-target` attributes in `index.html`:
```html
<span class="stat-num" data-target="5">0+</span>  <!-- Projects -->
<span class="stat-num" data-target="3">0+</span>  <!-- Years -->
```

### Contact Form (real email)
Replace the `await new Promise(...)` placeholder in `script.js` with [Formspree](https://formspree.io/):
```js
const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify({ name, email, subject, message })
});
```

---

## 🧪 Local Development

No build step required:

```bash
# Option 1: Python
python -m http.server 3000

# Option 2: Node.js
npx serve .

# Option 3: VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

For CMS local testing:
```bash
npx decap-server   # runs on localhost:8081
```
Then uncomment `local_backend: true` in `admin/config.yml`.

---

## 📦 Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript (ES2020+)** — No frameworks, no build tools
- **Decap CMS** — Git-based headless CMS (CDN loaded)
- **Font Awesome 6** — Icons (CDN)
- **Google Fonts** — Syne + DM Sans + JetBrains Mono

---

## 📄 License

MIT © 2025 A.K.M Sadman Rahman Maein

---

## 📬 Contact

- **Email**: smeainrahman@gmail.com
- **LinkedIn**: [sadmanrahmanmaein](https://www.linkedin.com/in/sadmanrahmanmaein/)
- **Phone**: +880 1754-393923
1. Install packages
Run this command to install the required dependencies.
Details:
npm install @supabase/supabase-js @supabase/ssr
Code:
File: Code
```
npm install @supabase/supabase-js @supabase/ssr
```

2. Add files
Add env variables, create Supabase client helpers, and set up middleware to keep sessions refreshed.
Code:
File: .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://aevhleoefuwhesnroqde.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_PgBhUaDaXm92jc0y5BabAw_f4MvD1CT
```

File: page.tsx
```
1import { createClient } from '@/utils/supabase/server'
2import { cookies } from 'next/headers'
3
4export default async function Page() {
5  const cookieStore = await cookies()
6  const supabase = createClient(cookieStore)
7
8  const { data: todos } = await supabase.from('todos').select()
9
10  return (
11    <ul>
12      {todos?.map((todo) => (
13        <li key={todo.id}>{todo.name}</li>
14      ))}
15    </ul>
16  )
17}
```

File: utils/supabase/server.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { cookies } from "next/headers";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
6
7export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
8  return createServerClient(
9    supabaseUrl!,
10    supabaseKey!,
11    {
12      cookies: {
13        getAll() {
14          return cookieStore.getAll()
15        },
16        setAll(cookiesToSet) {
17          try {
18            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
19          } catch {
20            // The `setAll` method was called from a Server Component.
21            // This can be ignored if you have middleware refreshing
22            // user sessions.
23          }
24        },
25      },
26    },
27  );
28};
```

File: utils/supabase/client.ts
```
1import { createBrowserClient } from "@supabase/ssr";
2
3const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
4const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
5
6export const createClient = () =>
7  createBrowserClient(
8    supabaseUrl!,
9    supabaseKey!,
10  );
```

File: utils/supabase/middleware.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { type NextRequest, NextResponse } from "next/server";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
6
7export const createClient = (request: NextRequest) => {
8  // Create an unmodified response
9  let supabaseResponse = NextResponse.next({
10    request: {
11      headers: request.headers,
12    },
13  });
14
15  const supabase = createServerClient(
16    supabaseUrl!,
17    supabaseKey!,
18    {
19      cookies: {
20        getAll() {
21          return request.cookies.getAll()
22        },
23        setAll(cookiesToSet) {
24          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
25          supabaseResponse = NextResponse.next({
26            request,
27          })
28          cookiesToSet.forEach(({ name, value, options }) =>
29            supabaseResponse.cookies.set(name, value, options)
30          )
31        },
32      },
33    },
34  );
35
36  return supabaseResponse
37};
```

3. Install Agent Skills (Optional)
Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.
Details:
npx skills add supabase/agent-skills
Code:
File: Code
```
npx skills add supabase/agent-skills
```