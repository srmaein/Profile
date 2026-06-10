/* ============================================================
   PORTFOLIO — A.K.M Sadman Rahman Maein · 21-44479-1 · AIUB
   script.js — Full Feature Build
   ============================================================ */

'use strict';

/* ═══════════════════════════════════════════════
   1. PRELOADER
   ═══════════════════════════════════════════════ */
const preloader = document.getElementById('preloader');
window.addEventListener('load', () => {
  setTimeout(() => preloader.classList.add('hidden'), 1900);
});

/* ═══════════════════════════════════════════════
   2. SCROLL PROGRESS BAR + PARALLAX
   ═══════════════════════════════════════════════ */
const progressBar = document.getElementById('scrollProgress');
const heroBg      = document.querySelector('.hero-bg');

window.addEventListener('scroll', () => {
  const doc    = document.documentElement;
  const scroll = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  if (progressBar) progressBar.style.width = (scroll / height * 100) + '%';
  if (heroBg && scroll < window.innerHeight) {
    heroBg.style.transform = `translateY(${scroll * 0.28}px)`;
  }
}, { passive: true });

/* ═══════════════════════════════════════════════
   3. CUSTOM CURSOR
   ═══════════════════════════════════════════════ */
const cursorRing = document.getElementById('cursorRing');
const cursorDot  = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

if (cursorRing && cursorDot) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
    cursorDot.classList.add('visible');
    cursorRing.classList.add('visible');
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  const hoverSel = 'a,button,.filter-btn,.project-card,.social-btn,.tl-item,.tech-tag,.belief-card,.tilt-card';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });
  document.addEventListener('mouseleave', () => {
    cursorDot.classList.remove('visible');
    cursorRing.classList.remove('visible');
  });
}

/* ═══════════════════════════════════════════════
   4. THEME TOGGLE
   ═══════════════════════════════════════════════ */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcon(next);
  });
}
function updateThemeIcon(theme) {
  if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

/* ═══════════════════════════════════════════════
   5. HAMBURGER / MOBILE NAV
   ═══════════════════════════════════════════════ */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function closeMenu() {
  hamburger?.classList.remove('open');
  navLinks?.classList.remove('open');
  navOverlay?.classList.remove('show');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  navOverlay.classList.toggle('show', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
navOverlay?.addEventListener('click', closeMenu);
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));

/* ═══════════════════════════════════════════════
   6. STICKY NAVBAR
   ═══════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ═══════════════════════════════════════════════
   7. ACTIVE NAV LINK ON SCROLL
   ═══════════════════════════════════════════════ */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');

function updateActiveLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ═══════════════════════════════════════════════
   8. TYPING ANIMATION
   ═══════════════════════════════════════════════ */
const phrases = [
  'intelligent AI systems.',
  'scalable web applications.',
  'ML-powered solutions.',
  'real-time data pipelines.',
  'full-stack SaaS products.',
  'clean, fast APIs.',
  'the future, one commit at a time.',
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;
const typingEl = document.getElementById('typingText');

function typeLoop() {
  if (!typingEl) return;
  const phrase = phrases[phraseIdx];
  if (!isDeleting) {
    charIdx++;
    typingEl.textContent = phrase.slice(0, charIdx);
    if (charIdx === phrase.length) {
      isDeleting = true;
      return setTimeout(typeLoop, 2200);
    }
    setTimeout(typeLoop, 65);
  } else {
    charIdx--;
    typingEl.textContent = phrase.slice(0, charIdx);
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      return setTimeout(typeLoop, 450);
    }
    setTimeout(typeLoop, 32);
  }
}
setTimeout(typeLoop, 2200);

/* ═══════════════════════════════════════════════
   9. PARTICLE CANVAS
   ═══════════════════════════════════════════════ */
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.vx    = (Math.random() - 0.5) * 0.35;
      this.vy    = (Math.random() - 0.5) * 0.35;
      this.r     = Math.random() * 1.4 + 0.4;
      this.alpha = Math.random() * 0.45 + 0.08;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,201,255,${this.alpha})`;
      ctx.fill();
    }
  }

  particles = Array.from({ length: 75 }, () => new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,201,255,${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  (function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
  })();
}

/* ═══════════════════════════════════════════════
   10. SCROLL REVEAL + STAGGER
   ═══════════════════════════════════════════════ */
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target._staggerDelay || 0;
      setTimeout(() => entry.target.classList.add('in-view'), delay);
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => {
  const siblings = [...el.parentElement.querySelectorAll(':scope > [data-animate]')];
  if (siblings.length > 1) el._staggerDelay = siblings.indexOf(el) * 90;
  scrollObserver.observe(el);
});

/* ═══════════════════════════════════════════════
   11. SKILL BAR ANIMATION
   ═══════════════════════════════════════════════ */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach((bar, i) => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 120);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll('.skill-block').forEach(b => barObserver.observe(b));

/* ═══════════════════════════════════════════════
   12. COUNTER ANIMATION (hero stats)
   ═══════════════════════════════════════════════ */
function animateCounter(el, target) {
  let val = 0;
  const step  = target / 50;
  const timer = setInterval(() => {
    val += step;
    if (val >= target) { el.textContent = target + '+'; clearInterval(timer); }
    else                { el.textContent = Math.floor(val) + '+'; }
  }, 24);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      statsObs.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObs.observe(statsEl);

/* ═══════════════════════════════════════════════
   13. CARD TILT EFFECT
   ═══════════════════════════════════════════════ */
function applyTilt(card) {
  const MAX = 8;
  card.addEventListener('mousemove', e => {
    const rect    = card.getBoundingClientRect();
    const cx      = rect.width  / 2;
    const cy      = rect.height / 2;
    const rotateY = ((e.clientX - rect.left - cx) / cx) * MAX;
    const rotateX = -((e.clientY - rect.top  - cy) / cy) * MAX;
    card.style.transform    = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.transition   = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.5s ease, box-shadow 0.3s, border-color 0.3s';
  });
}
document.querySelectorAll('.tilt-card').forEach(applyTilt);

/* ═══════════════════════════════════════════════
   14. BUTTON RIPPLE
   ═══════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  Object.assign(ripple.style, {
    width:  size + 'px',
    height: size + 'px',
    left:   (e.clientX - rect.left - size / 2) + 'px',
    top:    (e.clientY - rect.top  - size / 2) + 'px',
  });
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/* ═══════════════════════════════════════════════
   15. BACK TO TOP
   ═══════════════════════════════════════════════ */
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop?.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ═══════════════════════════════════════════════
   16. SMOOTH SCROLL
   ═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════
   17. CONTACT FORM
   ═══════════════════════════════════════════════ */
const contactForm  = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const submitBtn    = document.getElementById('submitBtn');

contactForm?.addEventListener('submit', async e => {
  e.preventDefault();
  formFeedback.textContent = '';
  formFeedback.className   = 'form-feedback';

  const name    = document.getElementById('name')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const subject = document.getElementById('subject')?.value.trim();
  const message = document.getElementById('message')?.value.trim();

  if (!name || !email || !subject || !message) {
    formFeedback.textContent = 'Please fill in all fields.';
    formFeedback.classList.add('error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formFeedback.textContent = 'Please enter a valid email address.';
    formFeedback.classList.add('error');
    return;
  }

  const original      = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled  = true;

  /* ── Swap this await for a real Formspree / EmailJS call ── */
  await new Promise(r => setTimeout(r, 1500));
  /* ── end placeholder ── */

  submitBtn.innerHTML = original;
  submitBtn.disabled  = false;
  contactForm.reset();
  formFeedback.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.';
  formFeedback.classList.add('success');
  setTimeout(() => {
    formFeedback.textContent = '';
    formFeedback.className   = 'form-feedback';
  }, 7000);
});

/* ═══════════════════════════════════════════════
   18. PROJECT MODAL
   ═══════════════════════════════════════════════ */
const projectModal = document.getElementById('projectModal');
const modalClose   = document.getElementById('modalClose');
const modalBody    = document.getElementById('modalBody');

function openModal(project) {
  if (!projectModal || !modalBody) return;

  const catClass = getCatClass(project.category || 'other');
  const catLabel = (project.category || 'other').charAt(0).toUpperCase() + (project.category || 'other').slice(1);
  const tags     = Array.isArray(project.tags) ? project.tags : [];

  const contentHTML = typeof ProjectsAPI !== 'undefined'
    ? ProjectsAPI.githubContentHtml(project, { lazy: true })
    : '';

  let actionsHTML = '';
  const gh = project.github_url || project.github;
  if (gh) actionsHTML += `<a href="${gh}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fab fa-github"></i> View on GitHub</a>`;
  if (project.live) actionsHTML += `<a href="${project.live}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fas fa-external-link-alt"></i> Live Demo</a>`;

  const tagsHTML = tags.map(t => `<span class="modal-tag">${t}</span>`).join('');

  modalBody.innerHTML = `
    ${contentHTML}
    <div class="modal-content">
      <span class="modal-cat-badge ${catClass}">${catLabel}</span>
      <h2 class="modal-title">${project.title}</h2>
      <p class="modal-desc">${project.description || 'No description provided.'}</p>
      ${tagsHTML ? `<div class="modal-tags">${tagsHTML}</div>` : ''}
      ${actionsHTML ? `<div class="modal-actions">${actionsHTML}</div>` : ''}
    </div>`;

  projectModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  projectModal.classList.remove('open');
  document.body.style.overflow = '';
  /* Stop any playing video */
  const iframe = projectModal.querySelector('iframe');
  if (iframe) { const src = iframe.src; iframe.src = ''; iframe.src = src.replace('autoplay=1', 'autoplay=0'); }
  const video = projectModal.querySelector('video');
  if (video) video.pause();
}

modalClose?.addEventListener('click', closeModal);
projectModal?.addEventListener('click', e => { if (e.target === projectModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ═══════════════════════════════════════════════
   19. PROJECT SYSTEM — Load from JSON + Render
   ═══════════════════════════════════════════════ */
let allProjects   = [];
let activeFilter  = 'all';
let searchQuery   = '';

const projectsGrid    = document.getElementById('projectsGrid');
const projectsLoading = document.getElementById('projectsLoading');
const projectsEmpty   = document.getElementById('projectsEmpty');
const projectSearch   = document.getElementById('projectSearch');
const filterBtns      = document.querySelectorAll('.filter-btn');

/* ── Helpers ── */
function getCatClass(cat) {
  const map = { web:'cat-web', ai:'cat-ai', mobile:'cat-mobile', other:'cat-other' };
  return map[cat] || 'cat-other';
}

function buildCard(project) {
  const cat      = project.category || 'other';
  const catClass = getCatClass(cat);
  const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
  const tags     = Array.isArray(project.tags) ? project.tags.slice(0, 4) : [];

  const thumbHTML = project.image
    ? `<img src="${project.image}" alt="${project.title}" loading="lazy">`
    : `<div class="card-thumb-placeholder"><i class="fas fa-code"></i></div>`;

  const hasSource = project.github_url || project.github || project.video_url;
  const playOverlay = hasSource
    ? `<div class="card-play-overlay"><i class="fab fa-github"></i></div>`
    : '';

  const tagsHTML = tags.map(t => `<span class="card-tag">${t}</span>`).join('');

  let linksHTML = '';
  const ghLink = project.github_url || project.github;
  if (ghLink) linksHTML += `<a href="${ghLink}" target="_blank" rel="noopener" class="card-link primary-link" onclick="event.stopPropagation()"><i class="fab fa-github"></i> GitHub</a>`;
  if (project.live) linksHTML += `<a href="${project.live}" target="_blank" rel="noopener" class="card-link" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live</a>`;

  const card = document.createElement('div');
  card.className  = 'project-card tilt-card';
  card.dataset.id  = project.id;
  card.dataset.cat = cat;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Open ${project.title} details`);

  card.innerHTML = `
    <div class="card-thumb">
      ${thumbHTML}
      ${playOverlay}
      <span class="card-cat-badge ${catClass}">${catLabel}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${project.title}</h3>
      <p class="card-desc">${(project.description || '').slice(0, 120)}${(project.description || '').length > 120 ? '...' : ''}</p>
      ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}
      ${linksHTML ? `<div class="card-links">${linksHTML}</div>` : ''}
    </div>`;

  /* Open modal on click or Enter */
  const triggerModal = () => openModal(project);
  card.addEventListener('click', triggerModal);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerModal(); } });

  /* Apply tilt */
  applyTilt(card);

  return card;
}

function renderProjects() {
  if (!projectsGrid) return;

  const filtered = allProjects.filter(p => {
    const matchCat    = activeFilter === 'all' || p.category === activeFilter;
    const matchSearch = !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery) ||
      p.description?.toLowerCase().includes(searchQuery) ||
      (p.tags || []).some(t => t.toLowerCase().includes(searchQuery));
    return matchCat && matchSearch;
  });

  /* Remove existing cards (keep loading/empty placeholders) */
  projectsGrid.querySelectorAll('.project-card').forEach(c => c.remove());

  if (filtered.length === 0) {
    projectsEmpty.style.display = 'block';
    return;
  }
  projectsEmpty.style.display = 'none';

  filtered.forEach((p, i) => {
    const card = buildCard(p);
    card.style.animationDelay = `${i * 0.06}s`;
    projectsGrid.appendChild(card);
  });
}

async function loadProjects() {
  let loaded = null;
  if (typeof ProjectsAPI !== 'undefined') {
    loaded = await ProjectsAPI.loadProjects();
  }

  if (loaded && loaded.length > 0) {
    allProjects = loaded;
  } else {
    console.info('Using built-in sample projects (Supabase empty or unavailable).');
    allProjects = FALLBACK_PROJECTS;
  }

  if (projectsLoading) projectsLoading.style.display = 'none';
  renderProjects();

  const projStat = document.querySelector('.stat-num[data-target]');
  if (projStat && allProjects.length > 0) {
    projStat.dataset.target = allProjects.length;
  }
}

/* ── Filter buttons ── */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderProjects();
  });
});

/* ── Search input ── */
let searchTimer;
projectSearch?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = projectSearch.value.trim().toLowerCase();
    renderProjects();
  }, 280);
});

/* ── Footer quick-filter links ── */
document.querySelectorAll('.footer-links-col a[data-filter]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById('projects');
    if (target) window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    const filterValue = a.dataset.filter;
    filterBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filterValue);
    });
    activeFilter = filterValue;
    renderProjects();
  });
});

/* ═══════════════════════════════════════════════
   20. FALLBACK PROJECTS (if JSON fails to load)
   ═══════════════════════════════════════════════ */
const FALLBACK_PROJECTS = [
  {
    id: "hospital-management-system",
    title: "Hospital Management System",
    description: "Full-Stack SaaS hospital management system with multi-tenancy architecture, role-based access control for Doctor, Staff, Patient, and Super Admin, and an integrated Medical AI Chatbot powered by LLaMA 3 via LM Studio.",
    category: "web",
    tags: ["Next.js", "Nest.js", "PostgreSQL", "Docker", "JWT", "AI Chatbot", "Swagger", "SaaS"],
    github_url: "",
    github: "",
    live: "",
    image: "",
    featured: true,
    date: "2024-12-01"
  },
  {
    id: "online-learning-platform",
    title: "Online Learning Platform",
    description: "Full-stack web-based learning platform with role-based features for Student, Teacher, and Admin. Students can enrol in courses, complete lessons, take quizzes, and view results. Built as a university project.",
    category: "web",
    tags: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "Full-Stack"],
    github_url: "",
    github: "",
    live: "",
    image: "",
    featured: true,
    date: "2024-06-01"
  },
  {
    id: "finance-dashboard",
    title: "Finance Statistics Dashboard",
    description: "Interactive finance dashboard developed during internship at FiroTech. Features custom-built charts for real-time financial statistics visualisation with a responsive frontend.",
    category: "web",
    tags: ["HTML", "CSS", "JavaScript", "Charts.js", "Finance"],
    github_url: "",
    github: "",
    live: "",
    image: "",
    featured: false,
    date: "2025-10-01"
  },
  {
    id: "android-testing-analysis",
    title: "Android App Testing Analysis",
    description: "Thesis research project analysing Android application testing techniques for best performance compliance with Google Play Store rules and guidelines. Covers unit testing, smoke testing, and UI automation.",
    category: "mobile",
    tags: ["Android", "Testing", "SQA", "Google Play", "Thesis"],
    github_url: "",
    github: "",
    live: "",
    image: "",
    featured: false,
    date: "2025-01-01"
  },
  {
    id: "ai-chatbot-integration",
    title: "Medical AI Chatbot",
    description: "AI-powered chatbot integrated into the Hospital Management System using LLaMA 3 running locally via LM Studio. Provides intelligent responses for patient queries, appointment guidance, and medication information.",
    category: "ai",
    tags: ["LLaMA 3", "LM Studio", "AI Agents", "NLP", "Healthcare"],
    github_url: "",
    github: "",
    live: "",
    image: "",
    featured: true,
    date: "2024-11-01"
  }
];

/* ═══════════════════════════════════════════════
   21. INITIALISE
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  updateActiveLink();
});

/* ═══════════════════════════════════════════════
   22. VISITOR TRACKING
   ═══════════════════════════════════════════════ */
(function trackVisit() {
  // Fire-and-forget: log this page visit to Supabase if configured
  window.addEventListener('load', async () => {
    try {
      const client = window.SupabaseApp?.getClient?.();
      if (!client) return;
      await client.from('visitor_logs').insert({
        page:       window.location.pathname + window.location.search,
        referrer:   document.referrer || '',
        user_agent: navigator.userAgent || '',
        visited_at: new Date().toISOString(),
      });
    } catch { /* silently ignore */ }
  });
})();
