/**
 * Projects API — Supabase fetch, normalize, display helpers.
 * Supports: id, title, description, category, tags, video, github,
 *           live, image, download, featured, enabled, date
 */
'use strict';

(function (global) {
  const TABLE    = 'projects';
  const PAGE_SIZE = 50;

  /** Normalize any DB row (handles both old & new field names) */
  function normalizeProject(row) {
    if (!row) return null;
    const github = row.github_url || row.github || '';
    const image  = row.thumbnail_url || row.image || '';
    return {
      id:          row.id,
      uuid:        row.id,
      title:       row.title || '',
      slug:        row.slug  || '',
      description: row.description || '',
      category:    row.category || 'other',
      tags:        Array.isArray(row.tags)
                     ? row.tags
                     : (typeof row.tags === 'string' && row.tags
                         ? JSON.parse(row.tags)
                         : []),
      image,
      thumbnail_url: image,
      github,
      github_url:  github,
      live:        row.live_url || row.live || '',
      live_url:    row.live_url || row.live || '',
      download:    row.download_url || row.download || '',
      video:       row.video_url || row.video || '',
      video_url:   row.video_url || row.video || '',
      featured:    Boolean(row.featured),
      enabled:     row.published !== false && row.enabled !== false,
      date:        row.date || row.created_at || '',
      created_at:  row.created_at || '',
      updated_at:  row.updated_at || '',
    };
  }

  /* ── Escaping ── */
  function escapeAttr(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── GitHub helpers ── */
  function parseGithubRepo(url) {
    if (!url) return null;
    const m = String(url).match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    if (!m) return null;
    return { owner: m[1], repo: m[2].replace(/\.git$/, ''), url: url.split('?')[0] };
  }

  function isGithubRawVideo(url) {
    return /raw\.githubusercontent\.com/i.test(url||'') && /\.(mp4|webm|ogg)(\?|#|$)/i.test(url||'');
  }

  function hasGithubSource(project) {
    return Boolean(project.github_url || project.github);
  }

  /**
   * Build the video/preview HTML shown in project modals.
   * Priority: raw GitHub video > thumbnail image > GitHub card > placeholder
   */
  function githubContentHtml(project, opts = {}) {
    const { lazy = true } = opts;
    const gh = (project.github_url || project.github || '').trim();

    if (gh && isGithubRawVideo(gh)) {
      return `<div class="modal-video-wrap video-embed">
        <video src="${escapeAttr(gh)}" controls playsinline preload="metadata"></video>
      </div>`;
    }

    if (project.video_url && /\.(mp4|webm|ogg)/i.test(project.video_url)) {
      return `<div class="modal-video-wrap video-embed">
        <video src="${escapeAttr(project.video_url)}" controls playsinline preload="metadata"></video>
      </div>`;
    }

    if (project.image || project.thumbnail_url) {
      const imgUrl = project.image || project.thumbnail_url;
      return `<div class="modal-video-wrap" style="background:none">
        <img src="${escapeAttr(imgUrl)}" alt="${escapeAttr(project.title)}" loading="${lazy?'lazy':'eager'}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">
      </div>`;
    }

    if (gh) {
      const repo  = parseGithubRepo(gh);
      const label = repo ? `${repo.owner}/${repo.repo}` : 'GitHub';
      return `<div class="github-preview-wrap">
        <a href="${escapeAttr(gh)}" target="_blank" rel="noopener noreferrer" class="github-preview-card">
          <div class="github-preview-icon"><i class="fab fa-github"></i></div>
          <div class="github-preview-text">
            <span class="github-preview-label">${escapeAttr(label)}</span>
            <span class="github-preview-hint">Open repository on GitHub</span>
          </div>
          <i class="fas fa-external-link-alt github-preview-arrow"></i>
        </a>
      </div>`;
    }

    return `<div class="modal-video-wrap">
      <div class="modal-video-placeholder"><i class="fas fa-code"></i><span>No preview available</span></div>
    </div>`;
  }

  /* ── Fetch from Supabase ── */
  async function fetchPublished(opts = {}) {
    const client = global.SupabaseApp?.getClient?.();
    if (!client) return null;

    // Use 'published' field (maps to enabled)
    let q = client
      .from(TABLE)
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (opts.category && opts.category !== 'all') q = q.eq('category', opts.category);
    if (opts.search) {
      const s = `%${opts.search}%`;
      q = q.or(`title.ilike.${s},description.ilike.${s}`);
    }
    if (opts.limit)  q = q.limit(opts.limit);
    if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit || PAGE_SIZE) - 1);

    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(normalizeProject);
  }

  async function fetchBySlug(slug) {
    const client = global.SupabaseApp?.getClient?.();
    if (!client || !slug) return null;
    const { data, error } = await client
      .from(TABLE).select('*').eq('slug', slug).eq('published', true).maybeSingle();
    if (error) throw error;
    return normalizeProject(data);
  }

  async function fetchJsonFallback(path) {
    const base = global.SupabaseApp?.siteBase?.() || '';
    const res  = await fetch(`${base}/${path.replace(/^\//, '')}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.projects || []);
    return rows.map(p => normalizeProject({
      ...p,
      thumbnail_url: p.thumbnail_url || p.image,
      github_url:    p.github_url || p.github || '',
      published:     p.published !== false && p.enabled !== false,
    }));
  }

  /** Main entry point used by the public site */
  async function loadProjects(opts = {}) {
    if (global.SupabaseApp?.isConfigured?.()) {
      try {
        const list = await fetchPublished(opts);
        if (list && list.length > 0) return list;
      } catch (err) {
        console.warn('Supabase fetch failed, trying JSON fallback.', err);
      }
    }
    for (const path of ['data/projects.json', 'projects.json']) {
      try {
        const list = await fetchJsonFallback(path);
        if (list && list.length > 0) return list;
      } catch {}
    }
    return null;
  }

  global.ProjectsAPI = {
    normalizeProject,
    fetchPublished,
    fetchBySlug,
    loadProjects,
    githubContentHtml,
    parseGithubRepo,
    isGithubRawVideo,
    hasGithubSource,
    PAGE_SIZE,
  };
})(typeof window !== 'undefined' ? window : globalThis);
