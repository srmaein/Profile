/**
 * Supabase credentials for static hosting (anon key is public; security is via RLS).
 * GitHub Pages: https://srmaein.github.io/Profile/
 */
window.SUPABASE_CONFIG = {
  SUPABASE_URL: 'https://aevhleoefuwhesnroqde.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_PgBhUaDaXm92jc0y5BabAw_f4MvD1CT',
  siteBase: '/Profile/',

  // Must match a user in Supabase → Authentication (create once in the dashboard).
  DEFAULT_ADMIN_EMAIL: 'smeainrahman@gmail.com',
  DEFAULT_ADMIN_PASSWORD: 'PortfolioAdmin2024!',
  AUTO_LOGIN: true,
};