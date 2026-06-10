/**
 * Portfolio CMS Admin — Login Page Script
 * Handles authentication and redirects to dashboard.html on success.
 */
'use strict';

/* ═══════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════ */
function $(id) { return document.getElementById(id); }

function toast(msg, type = 'info', duration = 3500) {
  const root = $('toastRoot');
  const el = document.createElement('div');
  const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i><span class="toast-msg">${msg}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 280);
  }, duration);
}

/* ═══════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════ */
let sb = null;

async function initAuth() {
  if (!SupabaseApp.isConfigured()) {
    showLoginError('Supabase not configured. Check js/supabase-config.js');
    return;
  }

  sb = SupabaseApp.getClient();
  if (!sb) {
    showLoginError('Failed to initialise Supabase client.');
    return;
  }

  // Pre-fill from config
  const cfg = window.SUPABASE_CONFIG || {};
  if (cfg.DEFAULT_ADMIN_EMAIL) $('loginEmail').value = cfg.DEFAULT_ADMIN_EMAIL;
  if (cfg.DEFAULT_ADMIN_PASSWORD) $('loginPassword').value = cfg.DEFAULT_ADMIN_PASSWORD;

  // Check existing session — redirect if already logged in
  $('loadingOverlay').hidden = false;
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      // Already authenticated — redirect to dashboard
      window.location.replace('dashboard.html');
      return;
    } else if (cfg.AUTO_LOGIN && cfg.DEFAULT_ADMIN_EMAIL && cfg.DEFAULT_ADMIN_PASSWORD) {
      // Auto-login if configured
      await performLogin(cfg.DEFAULT_ADMIN_EMAIL, cfg.DEFAULT_ADMIN_PASSWORD);
      return;
    }
  } catch (err) {
    console.warn('Session check failed:', err);
  }
  $('loadingOverlay').hidden = true;
}

async function performLogin(email, password) {
  const btn = $('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (!data.session) throw new Error('No session returned');

    toast('Login successful! Redirecting...', 'success');

    // Small delay so user sees the success toast
    setTimeout(() => {
      window.location.replace('dashboard.html');
    }, 600);

  } catch (err) {
    showLoginError(err.message || 'Sign in failed. Check your credentials.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
}

function showLoginError(msg) {
  const el = $('loginError');
  el.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  el.hidden = false;
}

/* ═══════════════════════════════════════════════
   EVENT WIRING
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Login Button ──
  $('loginBtn')?.addEventListener('click', () => {
    const email = $('loginEmail').value;
    const pass  = $('loginPassword').value;
    if (!email || !pass) {
      showLoginError('Please enter email and password.');
      return;
    }
    $('loginError').hidden = true;
    performLogin(email, pass);
  });

  // ── Enter key in password field ──
  $('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') $('loginBtn').click();
  });

  // ── Enter key in email field ──
  $('loginEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') $('loginPassword').focus();
  });

  // ── Password visibility toggle ──
  $('pwToggle')?.addEventListener('click', () => {
    const inp = $('loginPassword');
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    $('pwToggle').querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
  });

  // ── Init ──
  initAuth();
});
