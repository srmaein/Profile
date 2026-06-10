/**
 * Supabase client — browser-only, GitHub Pages compatible.
 * Fixed: removed incorrect placeholder-check that blocked real credentials.
 */
'use strict';

(function (global) {
  const cfg = global.SUPABASE_CONFIG || {};

  const url     = cfg.url     || cfg.SUPABASE_URL     || '';
  const anonKey = cfg.anonKey || cfg.SUPABASE_ANON_KEY || '';

  function isConfigured() {
    return Boolean(url && anonKey && url.includes('supabase.co'));
  }

  function getClient() {
    if (!global.supabase?.createClient) {
      console.warn('Supabase JS library not loaded.');
      return null;
    }
    if (!isConfigured()) {
      console.warn('Supabase not configured. Fill js/supabase-config.js');
      return null;
    }
    if (!global._supabaseClient) {
      global._supabaseClient = global.supabase.createClient(url, anonKey, {
        auth: {
          persistSession:     true,
          autoRefreshToken:   true,
          detectSessionInUrl: true,
        },
      });
    }
    return global._supabaseClient;
  }

  function siteBase() {
    return (cfg.siteBase || '').replace(/\/$/, '');
  }

  global.SupabaseApp = {
    isConfigured,
    getClient,
    siteBase,
    get url()     { return url; },
    get anonKey() { return anonKey; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
