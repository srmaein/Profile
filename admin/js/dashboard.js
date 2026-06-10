/**
 * Portfolio CMS Admin — Dashboard Script
 * Session-guarded dashboard with full CRUD, analytics, and image upload.
 * Redirects to index.html (login) if no valid session is found.
 */
'use strict';

/* ═══════════════════════════════════════════════
   GLOBALS
═══════════════════════════════════════════════ */
let sb = null;
let currentUser = null;
let allProjects = [];
let currentEditingId = null;
let currentTags = [];
let pendingImageFile = null;
let existingImageUrl = '';
let deleteTargetId = null;
let visitorStats = { total: 0, unique: 0, daily: 0, weekly: 0, monthly: 0 };

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

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const v = $(`view-${name}`);
  if (v) v.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === name);
  });
  $('topbarTitle').textContent = ({
    dashboard: 'Dashboard',
    projects:  'Projects',
    categories:'Categories',
    analytics: 'Analytics',
    editor:    currentEditingId ? 'Edit Project' : 'New Project',
  })[name] || name;

  // Close sidebar on mobile after nav
  closeSidebar();
}

/* ═══════════════════════════════════════════════
   AUTH GUARD
═══════════════════════════════════════════════ */
async function initAuth() {
  if (!SupabaseApp.isConfigured()) {
    toast('Supabase not configured. Redirecting to login...', 'error');
    setTimeout(() => window.location.replace('index.html'), 1500);
    return;
  }

  sb = SupabaseApp.getClient();
  if (!sb) {
    toast('Failed to initialise Supabase. Redirecting to login...', 'error');
    setTimeout(() => window.location.replace('index.html'), 1500);
    return;
  }

  // Check session — must be authenticated to use dashboard
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) {
      // No valid session — redirect to login
      window.location.replace('index.html');
      return;
    }
    currentUser = session.user;
  } catch (err) {
    console.error('Auth check failed:', err);
    window.location.replace('index.html');
    return;
  }

  // Listen for auth changes
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      window.location.replace('index.html');
    } else if (event === 'SIGNED_IN' && session?.user) {
      currentUser = session.user;
    }
  });

  // Auth passed — show dashboard
  enterDashboard();
}

function enterDashboard() {
  // Hide auth guard, show app shell
  const guard = $('authGuard');
  if (guard) guard.classList.add('hidden');
  $('appShell').hidden = false;

  const email = currentUser?.email || '';
  $('topbarEmail').textContent = email;

  loadAllProjects().then(() => {
    showView('dashboard');
    loadDashboardStats();
  });
}

async function logout() {
  await sb?.auth?.signOut();
  currentUser = null;
  allProjects = [];
  toast('Signed out successfully', 'info');
  setTimeout(() => {
    window.location.replace('index.html');
  }, 500);
}

/* ═══════════════════════════════════════════════
   SIDEBAR (MOBILE)
═══════════════════════════════════════════════ */
function openSidebar() {
  $('sidebar').classList.add('open');
  $('sidebarOverlay').classList.add('open');
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebarOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════════════
   PROJECTS — LOAD
═══════════════════════════════════════════════ */
async function loadAllProjects() {
  if (!sb) return;
  try {
    const { data, error } = await sb.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    allProjects = (data || []).map(normalizeRow);
    return allProjects;
  } catch (err) {
    toast('Could not load projects: ' + err.message, 'error');
    return [];
  }
}

function normalizeRow(row) {
  if (!row) return null;
  return {
    id:          row.id,
    title:       row.title || '',
    slug:        row.slug  || '',
    description: row.description || '',
    category:    row.category || 'other',
    tags:        Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : []),
    image:       row.thumbnail_url || row.image || '',
    github:      row.github_url || row.github || '',
    live:        row.live_url || row.live || '',
    download:    row.download_url || row.download || '',
    video:       row.video_url || row.video || '',
    featured:    Boolean(row.featured),
    enabled:     row.published !== false && row.enabled !== false,
    date:        row.date || row.created_at || '',
    created_at:  row.created_at || '',
    updated_at:  row.updated_at || '',
  };
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function loadDashboardStats() {
  const total     = allProjects.length;
  const enabled   = allProjects.filter(p => p.enabled).length;
  const disabled  = allProjects.filter(p => !p.enabled).length;
  const featured  = allProjects.filter(p => p.featured).length;
  const categories = [...new Set(allProjects.map(p => p.category).filter(Boolean))].length;

  $('statTotal').textContent     = total;
  $('statEnabled').textContent   = enabled;
  $('statDisabled').textContent  = disabled;
  $('statFeatured').textContent  = featured;
  $('statCategories').textContent = categories;
  $('statVisitors').textContent  = visitorStats.total || '—';

  // Recent projects (last 5)
  const recentList = $('recentProjectsList');
  const recent = [...allProjects].slice(0, 5);
  if (recent.length === 0) {
    recentList.innerHTML = '<div class="empty-msg">No projects yet</div>';
    return;
  }
  recentList.innerHTML = recent.map(p => `
    <div class="recent-row">
      ${p.image
        ? `<img src="${p.image}" alt="${esc(p.title)}" class="recent-row-thumb">`
        : `<div class="recent-row-thumb-placeholder"><i class="fas fa-code"></i></div>`
      }
      <div class="recent-row-body">
        <h4>${esc(p.title)}</h4>
        <div class="meta">
          <span class="badge badge-cat">${esc(p.category)}</span>
          ${p.enabled ? '<span class="badge badge-enabled">Enabled</span>' : '<span class="badge badge-disabled">Disabled</span>'}
          ${p.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
          &nbsp;·&nbsp; ${formatDate(p.date || p.created_at)}
        </div>
      </div>
      <button class="action-btn" onclick="openEditor('${p.id}')"><i class="fas fa-edit"></i></button>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════
   PROJECTS TABLE
═══════════════════════════════════════════════ */
function renderProjectsTable() {
  const search  = ($('adminSearch')?.value || '').toLowerCase();
  const catF    = $('adminFilterCat')?.value || '';
  const statusF = $('adminFilterStatus')?.value || '';

  const filtered = allProjects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search);
    const matchCat    = !catF || p.category === catF;
    const matchStatus = !statusF ||
      (statusF === 'enabled'  && p.enabled) ||
      (statusF === 'disabled' && !p.enabled) ||
      (statusF === 'featured' && p.featured);
    return matchSearch && matchCat && matchStatus;
  });

  const tbody = $('projectsTableBody');
  $('adminEmpty').hidden = filtered.length > 0;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-loading">No projects match your filters.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        ${p.image
          ? `<img src="${esc(p.image)}" alt="" class="table-thumb">`
          : `<div class="table-thumb-placeholder"><i class="fas fa-code"></i></div>`
        }
      </td>
      <td>
        <div class="table-title">
          ${esc(p.title)}
          <small>${esc(p.description?.slice(0, 60) || '')}${(p.description?.length || 0) > 60 ? '…' : ''}</small>
        </div>
      </td>
      <td><span class="badge badge-cat">${esc(p.category)}</span></td>
      <td>${p.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Yes</span>' : '<span style="color:var(--muted);font-size:.8rem">—</span>'}</td>
      <td>
        ${p.enabled
          ? '<span class="badge badge-enabled"><i class="fas fa-circle" style="font-size:.5rem"></i> Enabled</span>'
          : '<span class="badge badge-disabled"><i class="fas fa-circle" style="font-size:.5rem"></i> Disabled</span>'
        }
      </td>
      <td style="font-size:.82rem;color:var(--muted)">${formatDate(p.date || p.created_at)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewProject('${p.id}')" title="View on site"><i class="fas fa-eye"></i></button>
          <button class="action-btn" onclick="openEditor('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="action-btn ${p.enabled ? 'disable' : 'enable'}" onclick="toggleEnabled('${p.id}')" title="${p.enabled ? 'Disable' : 'Enable'}">
            <i class="fas fa-toggle-${p.enabled ? 'on' : 'off'}"></i>
          </button>
          <button class="action-btn danger" onclick="promptDelete('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Populate category filter
  const catSel = $('adminFilterCat');
  const cats = [...new Set(allProjects.map(p => p.category).filter(Boolean))];
  const existing = [...catSel.options].map(o => o.value);
  cats.forEach(c => {
    if (!existing.includes(c)) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      catSel.appendChild(opt);
    }
  });
}

function viewProject(id) {
  const base = (window.SUPABASE_CONFIG?.siteBase || '').replace(/\/$/, '');
  window.open(`${base || '..'}/#projects`, '_blank');
}

/* ═══════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════ */
function renderCategories() {
  const grid = $('categoriesGrid');
  const catMap = {};
  allProjects.forEach(p => {
    const c = p.category || 'other';
    catMap[c] = (catMap[c] || 0) + 1;
  });

  const icons = { web: 'fa-globe', ai: 'fa-robot', mobile: 'fa-mobile-alt', saas: 'fa-cloud', other: 'fa-code' };
  const colors = { web: '#00c9ff', ai: '#8b5cf6', mobile: '#10b981', saas: '#f59e0b', other: '#7e8fa8' };

  const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    grid.innerHTML = '<p class="empty-msg">No categories yet. Add some projects first.</p>';
    return;
  }

  grid.innerHTML = entries.map(([cat, count]) => `
    <div class="category-card" onclick="filterByCategory('${cat}')">
      <div class="category-card-icon" style="color:${colors[cat] || colors.other}">
        <i class="fas ${icons[cat] || icons.other}"></i>
      </div>
      <h3>${cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
      <p class="count"><strong>${count}</strong> project${count !== 1 ? 's' : ''}</p>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  showView('projects');
  $('adminFilterCat').value = cat;
  renderProjectsTable();
}

/* ═══════════════════════════════════════════════
   PROJECT EDITOR
═══════════════════════════════════════════════ */
function openEditor(id = null) {
  currentEditingId = id;
  currentTags = [];
  pendingImageFile = null;
  existingImageUrl = '';

  resetForm();

  if (id) {
    const p = allProjects.find(x => x.id === id);
    if (!p) return;
    $('editorHeading').textContent = 'Edit Project';
    $('saveBtnText').textContent   = 'Save Changes';
    $('deleteProjectBtn').hidden   = false;

    $('projectId').value    = p.id;
    $('fTitle').value       = p.title;
    $('fDescription').value = p.description || '';
    $('fGithub').value      = p.github || '';
    $('fLive').value        = p.live || '';
    $('fDownload').value    = p.download || '';
    $('fVideo').value       = p.video || '';
    $('fEnabled').checked   = p.enabled;
    $('fFeatured').checked  = p.featured;

    // Date
    if (p.date) {
      const d = p.date.split('T')[0];
      $('fDate').value = d;
    }

    // Category
    setCategoryValue(p.category);

    // Tags
    currentTags = [...(p.tags || [])];
    renderTags();
    syncTagChips();

    // Image
    if (p.image) {
      existingImageUrl = p.image;
      showImagePreview(p.image);
    }
  } else {
    $('editorHeading').textContent = 'New Project';
    $('saveBtnText').textContent   = 'Publish Project';
    $('deleteProjectBtn').hidden   = true;
    // Default date = today
    $('fDate').value = new Date().toISOString().split('T')[0];
  }

  showView('editor');
}

function setCategoryValue(val) {
  const presets = ['web', 'ai', 'mobile', 'saas', 'other'];
  if (presets.includes(val)) {
    $('fCategorySelect').value = val;
    $('fCategoryCustom').value = '';
  } else {
    $('fCategorySelect').value = '';
    $('fCategoryCustom').value = val || '';
  }
  updateCategoryHidden();
}

function updateCategoryHidden() {
  const sel = $('fCategorySelect').value;
  const custom = $('fCategoryCustom').value.trim();
  $('fCategory').value = sel || custom;
}

function resetForm() {
  $('projectForm').reset();
  $('projectId').value = '';
  currentTags = [];
  renderTags();
  hideImagePreview();
  $('imageOverlay').hidden = true;
  pendingImageFile = null;
  existingImageUrl = '';
}

/* ── Image Upload ── */
function showImagePreview(url) {
  const img = $('imagePreview');
  const ph  = $('imagePlaceholder');
  img.src = url;
  img.hidden = false;
  ph.hidden = true;
  $('imageOverlay').hidden = false;
}

function hideImagePreview() {
  $('imagePreview').hidden = true;
  $('imagePlaceholder').hidden = false;
  $('imageOverlay').hidden = true;
  $('imagePreview').src = '';
}

function handleImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = e => showImagePreview(e.target.result);
  reader.readAsDataURL(file);
}

async function uploadImageToSupabase(file, projectTitle) {
  if (!sb || !file) return '';
  try {
    const ext  = file.name.split('.').pop() || 'jpg';
    const name = `${slugify(projectTitle || 'project')}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from('thumbnails').upload(name, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = sb.storage.from('thumbnails').getPublicUrl(name);
    return data.publicUrl || '';
  } catch (err) {
    toast('Image upload failed: ' + err.message, 'error');
    return '';
  }
}

async function deleteImageFromSupabase(url) {
  if (!sb || !url) return;
  try {
    // Extract file path from URL
    const match = url.match(/\/thumbnails\/([^?]+)/);
    if (match) await sb.storage.from('thumbnails').remove([match[1]]);
  } catch {}
}

/* ── Tags ── */
function addTag(tag) {
  const t = tag.trim();
  if (!t || currentTags.includes(t)) return;
  currentTags.push(t);
  renderTags();
  syncTagChips();
  $('fTags').value = JSON.stringify(currentTags);
}

function removeTag(tag) {
  currentTags = currentTags.filter(t => t !== tag);
  renderTags();
  syncTagChips();
  $('fTags').value = JSON.stringify(currentTags);
}

function renderTags() {
  const container = $('tagsContainer');
  // Remove existing tag items (keep input)
  container.querySelectorAll('.tag-item').forEach(el => el.remove());
  const input = $('tagsInput');

  currentTags.forEach(tag => {
    const el = document.createElement('span');
    el.className = 'tag-item';
    el.innerHTML = `${esc(tag)}<button type="button" class="tag-remove" onclick="removeTag('${esc(tag)}')" aria-label="Remove ${esc(tag)}"><i class="fas fa-times"></i></button>`;
    container.insertBefore(el, input);
  });

  $('fTags').value = JSON.stringify(currentTags);
}

function syncTagChips() {
  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.classList.toggle('active', currentTags.includes(chip.dataset.tag));
  });
}

/* ── Save Project ── */
async function saveProject(e) {
  e.preventDefault();

  const title = $('fTitle').value.trim();
  if (!title) { toast('Title is required', 'error'); return; }

  updateCategoryHidden();
  const category = $('fCategory').value || 'other';

  const saveBtn = $('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    // Upload image if a new one was selected
    let imageUrl = existingImageUrl;
    if (pendingImageFile) {
      imageUrl = await uploadImageToSupabase(pendingImageFile, title);
    }

    // Parse date
    const dateVal = $('fDate').value;

    const payload = {
      title,
      slug:          slugify(title),
      description:   $('fDescription').value.trim(),
      category,
      tags:          currentTags,
      github_url:    $('fGithub').value.trim(),
      live_url:      $('fLive').value.trim(),
      download_url:  $('fDownload').value.trim(),
      video_url:     $('fVideo').value.trim(),
      thumbnail_url: imageUrl,
      featured:      $('fFeatured').checked,
      published:     $('fEnabled').checked,
      updated_at:    new Date().toISOString(),
    };

    let error;
    if (currentEditingId) {
      ({ error } = await sb.from('projects').update(payload).eq('id', currentEditingId));
    } else {
      payload.created_at = new Date().toISOString();
      ({ error } = await sb.from('projects').insert(payload));
    }

    if (error) throw error;

    toast(currentEditingId ? 'Project updated!' : 'Project published!', 'success');
    await loadAllProjects();
    showView('projects');
    renderProjectsTable();
    loadDashboardStats();
  } catch (err) {
    toast('Save failed: ' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fas fa-rocket"></i> <span id="saveBtnText">${currentEditingId ? 'Save Changes' : 'Publish Project'}</span>`;
  }
}

/* ── Toggle Enabled ── */
async function toggleEnabled(id) {
  const p = allProjects.find(x => x.id === id);
  if (!p) return;
  const newState = !p.enabled;
  try {
    const { error } = await sb.from('projects').update({ published: newState, enabled: newState }).eq('id', id);
    if (error) throw error;
    toast(`Project ${newState ? 'enabled' : 'disabled'}`, 'success');
    await loadAllProjects();
    renderProjectsTable();
    loadDashboardStats();
  } catch (err) {
    toast('Failed: ' + err.message, 'error');
  }
}

/* ── Delete ── */
function promptDelete(id) {
  const p = allProjects.find(x => x.id === id);
  if (!p) return;
  deleteTargetId = id;
  $('deleteProjectName').textContent = p.title;
  $('deleteModal').hidden = false;
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const p = allProjects.find(x => x.id === deleteTargetId);
  try {
    // Delete image first
    if (p?.image) await deleteImageFromSupabase(p.image);
    const { error } = await sb.from('projects').delete().eq('id', deleteTargetId);
    if (error) throw error;
    toast('Project deleted', 'success');
    $('deleteModal').hidden = true;
    deleteTargetId = null;
    await loadAllProjects();
    renderProjectsTable();
    loadDashboardStats();
    // If we were in editor, go back to projects list
    if (document.querySelector('#view-editor.active')) showView('projects');
  } catch (err) {
    toast('Delete failed: ' + err.message, 'error');
  }
}

/* ═══════════════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════════════ */
function loadAnalytics() {
  // Attempt to load from Supabase visitor_logs if exists, else show demo data
  $('statTotalVisitors').textContent   = visitorStats.total   || '—';
  $('statUniqueVisitors').textContent  = visitorStats.unique  || '—';
  $('statDailyVisitors').textContent   = visitorStats.daily   || '—';
  $('statWeeklyVisitors').textContent  = visitorStats.weekly  || '—';
  $('statMonthlyVisitors').textContent = visitorStats.monthly || '—';

  renderTrafficChart();
  renderMostViewed();
}

function renderTrafficChart() {
  const canvas = $('trafficChart');
  if (!canvas) return;

  // Generate 30-day mock data (replace with real Supabase data when available)
  const days = [];
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }));
    data.push(Math.floor(Math.random() * 40 + 5));
  }

  if (window._trafficChart) window._trafficChart.destroy();
  window._trafficChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Visitors',
        data,
        borderColor: '#00c9ff',
        backgroundColor: 'rgba(0,201,255,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7e8fa8', font: { size: 10 }, maxTicksLimit: 8 } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7e8fa8', font: { size: 10 } }, beginAtZero: true },
      },
    }
  });
}

function renderMostViewed() {
  const list = $('mostViewedList');
  const top5 = [...allProjects].slice(0, 5);
  if (top5.length === 0) {
    list.innerHTML = '<div class="empty-msg">No projects to display</div>';
    return;
  }
  list.innerHTML = top5.map((p, i) => `
    <div class="most-viewed-item">
      <span class="most-viewed-rank">#${i+1}</span>
      <span class="most-viewed-title">${esc(p.title)}</span>
      <span class="most-viewed-views">— views</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ═══════════════════════════════════════════════
   EVENT WIRING
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Logout ──
  $('logoutBtn')?.addEventListener('click', logout);

  // ── Sidebar nav ──
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const view = item.dataset.view;
      showView(view);
      if (view === 'projects')   { loadAllProjects().then(renderProjectsTable); }
      if (view === 'categories') renderCategories();
      if (view === 'analytics')  loadAnalytics();
    });
  });

  // ── Mobile sidebar ──
  $('sidebarToggle')?.addEventListener('click', openSidebar);
  $('sidebarOverlay')?.addEventListener('click', closeSidebar);

  // ── New Project buttons ──
  $('newProjectBtn')?.addEventListener('click', () => openEditor(null));
  $('dashNewProjectBtn')?.addEventListener('click', () => openEditor(null));

  // ── Back to projects ──
  $('backToProjects')?.addEventListener('click', () => {
    showView('projects');
    renderProjectsTable();
  });

  // ── Cancel in editor ──
  $('cancelBtn')?.addEventListener('click', () => {
    showView('projects');
    renderProjectsTable();
  });

  // ── Project form submit ──
  $('projectForm')?.addEventListener('submit', saveProject);

  // ── Delete project (from editor) ──
  $('deleteProjectBtn')?.addEventListener('click', () => {
    if (currentEditingId) promptDelete(currentEditingId);
  });

  // ── Delete modal actions ──
  $('deleteConfirmBtn')?.addEventListener('click', confirmDelete);
  $('deleteCancelBtn')?.addEventListener('click', () => {
    $('deleteModal').hidden = true;
    deleteTargetId = null;
  });
  $('deleteModal')?.addEventListener('click', e => {
    if (e.target === $('deleteModal')) {
      $('deleteModal').hidden = true;
      deleteTargetId = null;
    }
  });

  // ── Category sync ──
  $('fCategorySelect')?.addEventListener('change', () => {
    if ($('fCategorySelect').value) $('fCategoryCustom').value = '';
    updateCategoryHidden();
  });
  $('fCategoryCustom')?.addEventListener('input', () => {
    if ($('fCategoryCustom').value.trim()) $('fCategorySelect').value = '';
    updateCategoryHidden();
  });

  // ── Tags ──
  $('tagsInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag($('tagsInput').value);
      $('tagsInput').value = '';
    }
    if (e.key === 'Backspace' && !$('tagsInput').value && currentTags.length > 0) {
      removeTag(currentTags[currentTags.length - 1]);
    }
  });

  $('tagsContainer')?.addEventListener('click', () => $('tagsInput').focus());

  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      if (currentTags.includes(tag)) removeTag(tag);
      else addTag(tag);
    });
  });

  // ── Image Upload ──
  const zone = $('imageUploadZone');
  zone?.addEventListener('click', e => {
    if (e.target.closest('.image-overlay')) return;
    $('imageFile').click();
  });

  $('imageFile')?.addEventListener('change', e => {
    if (e.target.files[0]) handleImageFile(e.target.files[0]);
  });

  // Drag & drop
  zone?.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone?.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  });

  $('replaceImageBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    $('imageFile').click();
  });

  $('removeImageBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    pendingImageFile = null;
    existingImageUrl = '';
    hideImagePreview();
  });

  // ── Search/filter in projects table ──
  $('adminSearch')?.addEventListener('input', () => renderProjectsTable());
  $('adminFilterCat')?.addEventListener('change', () => renderProjectsTable());
  $('adminFilterStatus')?.addEventListener('change', () => renderProjectsTable());

  // ── Init ──
  initAuth();
});
