/**
 * Portfolio CMS Admin — Change Password Script
 * Verifies old credentials via Supabase, then updates the password.
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
   PASSWORD STRENGTH
═══════════════════════════════════════════════ */
function evaluateStrength(password) {
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score; // 0-5
}

function updateStrengthIndicator(password) {
  const score = evaluateStrength(password);
  const fill  = $('strengthFill');
  const text  = $('strengthText');

  const levels = [
    { width: '0%',   color: 'transparent', label: '' },
    { width: '20%',  color: '#ef4444',     label: 'Weak' },
    { width: '40%',  color: '#f59e0b',     label: 'Fair' },
    { width: '60%',  color: '#f59e0b',     label: 'Good' },
    { width: '80%',  color: '#10b981',     label: 'Strong' },
    { width: '100%', color: '#00c9ff',     label: 'Excellent' },
  ];

  const level = levels[score] || levels[0];
  fill.style.width = level.width;
  fill.style.background = level.color;
  text.textContent = level.label;
  text.style.color = level.color;
}

/* ═══════════════════════════════════════════════
   PASSWORD MATCH
═══════════════════════════════════════════════ */
function checkMatch() {
  const newPw      = $('cpNewPassword').value;
  const confirmPw  = $('cpConfirmPassword').value;
  const match      = $('matchIndicator');
  const mismatch   = $('mismatchIndicator');

  if (!confirmPw) {
    match.hidden = true;
    mismatch.hidden = true;
    return;
  }

  if (newPw === confirmPw) {
    match.hidden = false;
    mismatch.hidden = true;
  } else {
    match.hidden = true;
    mismatch.hidden = false;
  }
}

/* ═══════════════════════════════════════════════
   CHANGE PASSWORD
═══════════════════════════════════════════════ */
let sb = null;

async function initSupabase() {
  if (!SupabaseApp.isConfigured()) {
    showError('Supabase not configured. Check js/supabase-config.js');
    return;
  }
  sb = SupabaseApp.getClient();
  if (!sb) {
    showError('Failed to initialise Supabase client.');
    return;
  }

  // Pre-fill email if config has a default
  const cfg = window.SUPABASE_CONFIG || {};
  if (cfg.DEFAULT_ADMIN_EMAIL) {
    $('cpEmail').value = cfg.DEFAULT_ADMIN_EMAIL;
  }

  // If user is already logged in, pre-fill email from session
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user?.email) {
      $('cpEmail').value = session.user.email;
    }
  } catch {}
}

async function handleChangePassword(e) {
  e.preventDefault();

  const email      = $('cpEmail').value.trim();
  const oldPass    = $('cpOldPassword').value;
  const newPass    = $('cpNewPassword').value;
  const confirmPass = $('cpConfirmPassword').value;

  // Validate inputs
  hideMessages();

  if (!email) {
    showError('Please enter your email address.');
    return;
  }
  if (!oldPass) {
    showError('Please enter your current password.');
    return;
  }
  if (!newPass) {
    showError('Please enter a new password.');
    return;
  }
  if (newPass.length < 6) {
    showError('New password must be at least 6 characters.');
    return;
  }
  if (newPass !== confirmPass) {
    showError('New password and confirmation do not match.');
    return;
  }
  if (oldPass === newPass) {
    showError('New password must be different from the current password.');
    return;
  }

  const btn = $('changePasswordBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

  try {
    // Step 1: Verify old credentials by signing in
    const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
      email,
      password: oldPass,
    });

    if (signInError) {
      throw new Error('Current password is incorrect. Please try again.');
    }

    if (!signInData.session) {
      throw new Error('Authentication failed. No session returned.');
    }

    // Step 2: Update the password
    const { error: updateError } = await sb.auth.updateUser({
      password: newPass,
    });

    if (updateError) {
      throw updateError;
    }

    // Step 3: Sign out so user has to log in with new password
    await sb.auth.signOut();

    // Show success
    showSuccess('Password updated successfully! Redirecting to sign in...');
    toast('Password changed!', 'success');

    // Reset form
    $('changePasswordForm').reset();
    updateStrengthIndicator('');
    $('matchIndicator').hidden = true;
    $('mismatchIndicator').hidden = true;

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.replace('index.html');
    }, 2000);

  } catch (err) {
    showError(err.message || 'Failed to update password. Please try again.');
    toast(err.message || 'Update failed', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Update Password';
  }
}

/* ═══════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════ */
function showError(msg) {
  const el = $('cpError');
  el.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  el.hidden = false;
  $('cpSuccess').hidden = true;
}

function showSuccess(msg) {
  const el = $('cpSuccess');
  el.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  el.hidden = false;
  $('cpError').hidden = true;
}

function hideMessages() {
  $('cpError').hidden = true;
  $('cpSuccess').hidden = true;
}

/* ═══════════════════════════════════════════════
   EVENT WIRING
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Form submit ──
  $('changePasswordForm')?.addEventListener('submit', handleChangePassword);

  // ── Password strength indicator ──
  $('cpNewPassword')?.addEventListener('input', () => {
    updateStrengthIndicator($('cpNewPassword').value);
    checkMatch();
  });

  // ── Confirm password match check ──
  $('cpConfirmPassword')?.addEventListener('input', checkMatch);

  // ── Password visibility toggles ──
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const inp = $(targetId);
      if (!inp) return;
      const isText = inp.type === 'text';
      inp.type = isText ? 'password' : 'text';
      btn.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });

  // ── Init Supabase ──
  initSupabase();
});
