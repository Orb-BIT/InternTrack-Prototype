/* ===== INTERNTRACK - Role-Based Prototype Script ===== */

const SESSION_KEY = 'interntrack_session';
const DEFAULT_PASSWORD = 'interntrack123';

const ROLE_RULES = {
  student: {
    home: 'dashboard.html',
    allowedPages: ['dashboard.html', 'attendance.html', 'logbook.html', 'documents.html', 'evaluations.html', 'settings.html'],
    nav: [
      { section: 'Main', href: 'dashboard.html', icon: 'fa-tachometer-alt', text: 'Dashboard' },
      { section: 'Tools', href: 'attendance.html', icon: 'fa-calendar-check', text: 'Attendance' },
      { section: 'Tools', href: 'logbook.html', icon: 'fa-book-open', text: 'Logbook' },
      { section: 'Tools', href: 'documents.html', icon: 'fa-file-alt', text: 'Documents' },
      { section: 'Tools', href: 'evaluations.html', icon: 'fa-star', text: 'Evaluations' },
      { section: 'Account', href: 'settings.html', icon: 'fa-cog', text: 'Settings' }
    ]
  },
  coordinator: {
    home: 'monitoring.html',
    allowedPages: ['records.html', 'monitoring.html', 'settings.html', 'announcements.html', 'reports.html', 'logbook-review.html', 'doc-approvals.html'],
    nav: [
      { section: 'Workspace', href: 'monitoring.html', icon: 'fa-chart-line', text: 'Coordinator Hub' },
      { section: 'Workspace', href: 'records.html', icon: 'fa-folder-open', text: 'Intern Roster' },
      { section: 'Manage', href: 'logbook-review.html', icon: 'fa-book-open', text: 'Logbook Review' },
      { section: 'Manage', href: 'doc-approvals.html', icon: 'fa-file-circle-check', text: 'Doc Approvals' },
      { section: 'Manage', href: 'announcements.html', icon: 'fa-bullhorn', text: 'Announcements' },
      { section: 'Manage', href: 'reports.html', icon: 'fa-chart-bar', text: 'Reports & Analytics' },
      { section: 'Account', href: 'settings.html', icon: 'fa-cog', text: 'Settings' }
    ]
  }
};

const DEMO_USERS = {
  student: {
    id: '2021-00123',
    password: DEFAULT_PASSWORD,
    role: 'student',
    name: 'Juan dela Cruz',
    email: 'juan.delacruz@uc.edu.ph',
    subtitle: 'BSInfoTech 4-A · 2021-00123',
    program: 'BS Information Technology',
    company: 'TechCorp PH',
    contact: '0917 123 4567',
    avatar: 'JS',
    roleLabel: 'Student Account',
    term: 'AY 2024–2025, Sem 2',
    coordinator: 'Maria Santos'
  },
  coordinator: {
    id: 'EMP-1001',
    password: DEFAULT_PASSWORD,
    role: 'coordinator',
    name: 'Maria Santos',
    email: 'maria.santos@uc.edu.ph',
    subtitle: 'Practicum Supervisor · EMP-1001',
    program: 'Internship Coordination Office',
    company: 'University of Cabuyao',
    contact: '0998 765 4321',
    avatar: 'PS',
    roleLabel: 'Practicum Supervisor',
    term: 'AY 2024–2025, Sem 2',
    coordinator: 'Academic Affairs'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  protectRoute();
  applyRoleTheme();
  renderRoleSidebar();
  initSidebarState();
  applyUserProfile();
  initLogoutLinks();
  initLoginForm();
  initForgotPasswordLink();
  initStatCards();
  initProgressBars();
}

function getCurrentPage() {
  const page = window.location.pathname.split('/').pop();
  return page || 'index.html';
}

function isLoginPage() {
  const page = getCurrentPage();
  return page === 'index.html' || page === '';
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function detectRoleFromId(userId) {
  const id = String(userId || '').trim().toUpperCase();
  if (/^20\d{2}-\d{5}$/.test(id)) return 'student';
  if (/^(EMP|COORD|FAC|ADMIN)-[A-Z0-9]+$/.test(id)) return 'coordinator';
  return null;
}

function resolveUser(userId, password) {
  const id = String(userId || '').trim().toUpperCase();
  const pw = String(password || '').trim();

  const exact = Object.values(DEMO_USERS).find(
    (user) => user.id.toUpperCase() === id && user.password === pw
  );
  if (exact) return exact;

  const role = detectRoleFromId(id);
  if (!role || pw !== DEFAULT_PASSWORD) return null;

  if (role === 'student') {
    return {
      ...DEMO_USERS.student,
      id,
      subtitle: `BSInfoTech 4-A · ${id}`
    };
  }

  return {
    ...DEMO_USERS.coordinator,
    id,
    subtitle: `Practicum Supervisor · ${id}`
  };
}

function protectRoute() {
  const page = getCurrentPage();
  const session = getSession();

  if (isLoginPage()) return;

  if (!session || !ROLE_RULES[session.role]) {
    clearSession();
    window.location.href = 'index.html';
    return;
  }

  const allowed = ROLE_RULES[session.role].allowedPages;
  if (!allowed.includes(page)) {
    window.location.href = ROLE_RULES[session.role].home;
  }
}

function applyRoleTheme() {
  const session = getSession();
  if (!session || isLoginPage()) return;
  document.body.classList.add(`role-${session.role}`);
}

function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm || loginForm.dataset.roleInit === 'true') return;

  loginForm.dataset.roleInit = 'true';
  loginForm.addEventListener('submit', handleLogin);
}

function initForgotPasswordLink() {
  const forgotLink = document.querySelector('.forgot-link');
  if (!forgotLink || forgotLink.dataset.toastInit === 'true') return;

  forgotLink.dataset.toastInit = 'true';
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(
      'Forgot password? Please contact your coordinator or system administrator to reset your account.',
      'theme'
    );
  });
}

function togglePassword(fieldId = 'password', iconId = 'eyeIcon') {
  const input = document.getElementById(fieldId);
  const icon = document.getElementById(iconId);
  if (!input) return;

  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';

  if (icon) {
    icon.classList.toggle('fa-eye-slash', !isHidden);
    icon.classList.toggle('fa-eye', isHidden);
  }
}

function handleLogin(e) {
  if (e) e.preventDefault();

  const loginForm = document.getElementById('loginForm');
  const idInput = document.getElementById('studentNumber');
  const pwInput = document.getElementById('password');
  const err = document.getElementById('loginError');
  const btn = (loginForm || document).querySelector('.btn-login');

  if (!idInput || !pwInput || !btn) return false;
  if (btn.dataset.busy === 'true') return false;

  const userId = idInput.value.trim();
  const password = pwInput.value.trim();

  if (err) {
    err.classList.add('d-none');
    err.textContent = 'Invalid credentials.';
  }

  btn.dataset.busy = 'true';
  btn.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Signing in...';
  btn.disabled = true;

  setTimeout(() => {
    const user = resolveUser(userId, password);

    if (!user) {
      if (err) {
        err.textContent = 'Use a valid Student Number or Employee ID with password interntrack123.';
        err.classList.remove('d-none');
      }
      resetLoginButton(btn);
      return;
    }

    saveSession(user);
    window.location.href = ROLE_RULES[user.role].home;
  }, 500);

  return false;
}

function resetLoginButton(btn) {
  btn.dataset.busy = 'false';
  btn.innerHTML = '<i class="fa fa-right-to-bracket me-2"></i>SIGN IN';
  btn.disabled = false;
}

function renderRoleSidebar() {
  const session = getSession();
  const nav = document.querySelector('.sidebar-nav');
  if (!session || !nav || !ROLE_RULES[session.role]) return;

  const current = getCurrentPage();
  const items = ROLE_RULES[session.role].nav;
  let html = '';
  let lastSection = '';

  items.forEach((item) => {
    if (item.section !== lastSection) {
      html += `<div class="nav-section-label">${item.section}</div>`;
      lastSection = item.section;
    }

    const active = item.href === current ? ' active' : '';
    html += `<a href="${item.href}" class="sidebar-link${active}"><i class="fa ${item.icon}"></i> ${item.text}</a>`;
  });

  html += '<div class="nav-section-label">Session</div>';
  html += '<a href="index.html" class="sidebar-link logout-link"><i class="fa fa-sign-out-alt"></i> Logout</a>';
  nav.innerHTML = html;
}

function applyUserProfile() {
  const user = getSession();
  if (!user) return;

  document.querySelectorAll('.topbar-avatar, .settings-avatar, [data-role-avatar]').forEach((avatar) => {
    avatar.textContent = user.avatar;
  });

  document.querySelectorAll('[data-role-name]').forEach((el) => {
    el.textContent = user.name;
  });

  document.querySelectorAll('[data-role-subtitle]').forEach((el) => {
    el.textContent = user.subtitle;
  });

  document.querySelectorAll('[data-role-company]').forEach((el) => {
    el.textContent = user.company;
  });

  document.querySelectorAll('[data-role-label]').forEach((el) => {
    el.textContent = user.roleLabel;
  });

  document.querySelectorAll('[data-role-id]').forEach((el) => {
    el.textContent = user.id;
  });

  const dashboardTitle = document.querySelector('.dashboard-hero-title');
  if (dashboardTitle) {
    dashboardTitle.textContent = `Welcome back, ${user.name}`;
  }

  const dashboardMeta = document.querySelector('.dashboard-hero-meta');
  if (dashboardMeta && user.role === 'student') {
    dashboardMeta.innerHTML = `BSInfoTech 4-A &nbsp;|&nbsp; Student No. ${user.id} &nbsp;|&nbsp; ${user.company}`;
  }

  const profileName = document.querySelector('.settings-profile-head h5, .settings-identity h5');
  if (profileName) profileName.textContent = user.name;

  const profileSub = document.querySelector('.settings-profile-head p, .settings-identity p');
  if (profileSub) profileSub.textContent = user.subtitle;

  const rolePill = document.querySelector('.settings-role-pill');
  if (rolePill) rolePill.textContent = user.roleLabel;

  const settingsMeta = document.querySelectorAll('.settings-meta-item strong');
  if (settingsMeta.length >= 1) settingsMeta[0].textContent = user.company;
  if (settingsMeta.length >= 2) settingsMeta[1].textContent = user.role === 'student' ? user.coordinator : 'Placement Management Office';
  if (settingsMeta.length >= 3) settingsMeta[2].textContent = user.term;

  const metaLabels = document.querySelectorAll('.settings-meta-label');
  if (user.role === 'coordinator') {
    if (metaLabels.length >= 1) metaLabels[0].textContent = 'Office';
    if (metaLabels.length >= 2) metaLabels[1].textContent = 'Department';
    if (metaLabels.length >= 3) metaLabels[2].textContent = 'Academic Term';
  }

  const settingsInputs = document.querySelectorAll('.account-settings-panel .form-control, .settings-section-card .form-control');
  if (settingsInputs.length >= 4) {
    settingsInputs[0].value = user.name;
    settingsInputs[1].value = user.email;
    settingsInputs[2].value = user.program;
    settingsInputs[3].value = user.contact;
  }

  if (user.role === 'coordinator') {
    applyCoordinatorSettingsCopy();
  }
}

function applyCoordinatorSettingsCopy() {
  const introBlocks = document.querySelectorAll('.settings-section-intro');
  if (introBlocks[0]) introBlocks[0].textContent = 'Manage your coordinator profile, contact details, and workspace defaults used across roster reviews and monitoring.';
  if (introBlocks[1]) introBlocks[1].textContent = 'Choose which operational alerts you want to receive for validations, escalations, and site supervision.';
  if (introBlocks[2]) introBlocks[2].textContent = 'Update your password and strengthen account protection for coordinator access.';

  const statCards = document.querySelectorAll('.settings-stat-card strong');
  if (statCards.length >= 4) {
    statCards[0].textContent = 'Coordinator';
    statCards[1].textContent = 'Protected';
    statCards[2].textContent = '3 Enabled';
    statCards[3].textContent = 'This Week';
  }

  const statLabels = document.querySelectorAll('.settings-stat-card span');
  if (statLabels.length >= 4) {
    statLabels[0].textContent = 'Workspace Role';
    statLabels[1].textContent = 'Security Status';
    statLabels[2].textContent = 'Notifications';
    statLabels[3].textContent = 'Last Review';
  }

  const note = document.querySelector('.settings-summary-note span');
  if (note) {
    note.textContent = 'Your coordinator profile powers placement reviews, monitoring follow-ups, and student escalation workflows.';
  }

  const toggles = document.querySelectorAll('.settings-toggle-card');
  if (toggles[0]) toggles[0].querySelector('strong').textContent = 'Document validation reminders';
  if (toggles[0]) toggles[0].querySelector('p').textContent = 'Receive alerts when placement requirements need coordinator review.';
  if (toggles[1]) toggles[1].querySelector('strong').textContent = 'Student escalation alerts';
  if (toggles[1]) toggles[1].querySelector('p').textContent = 'Get notified when attendance, journals, or compliance drop below threshold.';
  if (toggles[2]) toggles[2].querySelector('strong').textContent = 'Company visit reminders';
  if (toggles[2]) toggles[2].querySelector('p').textContent = 'Stay ahead of upcoming supervisor calls, site visits, and follow-ups.';

  const coordOnly = document.querySelectorAll('.role-coordinator-only');
  coordOnly.forEach((el) => el.classList.remove('d-none'));
}

function initSidebarState() {
  const links = document.querySelectorAll('.sidebar-link');
  const current = getCurrentPage();

  links.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });

  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  const closeSidebar = () => document.body.classList.remove('sidebar-open');
  const openSidebar = () => {
    if (window.innerWidth <= 991) {
      document.body.classList.add('sidebar-open');
    }
  };

  if (toggle.dataset.sidebarInit !== 'true') {
    toggle.dataset.sidebarInit = 'true';
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth > 991) return;
      document.body.classList.toggle('sidebar-open');
    });
  }

  if (overlay.dataset.sidebarInit !== 'true') {
    overlay.dataset.sidebarInit = 'true';
    overlay.addEventListener('click', closeSidebar);
  }

  document.querySelectorAll('.sidebar-link').forEach((link) => {
    if (link.dataset.sidebarCloseInit === 'true') return;
    link.dataset.sidebarCloseInit = 'true';
    link.addEventListener('click', () => {
      if (window.innerWidth <= 991) closeSidebar();
    });
  });

  if (!document.body.dataset.sidebarEscapeInit) {
    document.body.dataset.sidebarEscapeInit = 'true';
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) closeSidebar();
    });
  }

  openSidebar();
}

function initLogoutLinks() {
  document.querySelectorAll('.logout-link, .sidebar-link').forEach((link) => {
    const text = (link.textContent || '').toLowerCase();
    const href = (link.getAttribute('href') || '').toLowerCase();

    if (!text.includes('logout') && !href.includes('index')) return;
    if (link.dataset.logoutInit === 'true') return;

    link.dataset.logoutInit = 'true';
    link.addEventListener('click', (e) => {
      if (!text.includes('logout') && !href.includes('index')) return;
      e.preventDefault();

      showLogoutConfirm(() => {
        clearSession();
        window.location.href = 'index.html';
      });
    });
  });
}

function attachModalButtonEffects(btn) {
  if (!btn) return;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-1px)';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
  });

  btn.addEventListener('mousedown', () => {
    btn.style.transform = 'translateY(0) scale(0.98)';
  });

  btn.addEventListener('mouseup', () => {
    btn.style.transform = 'translateY(-1px) scale(1)';
  });
}

function showLogoutConfirm(onConfirm) {
  let overlay = document.getElementById('logoutConfirmOverlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'logoutConfirmOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity .28s ease, background .28s ease, visibility .28s ease;
      padding: 1rem;
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      width: 100%;
      max-width: 380px;
      background: linear-gradient(135deg, #ffffff 0%, #f7fbf8 100%);
      border: 1px solid rgba(10, 92, 46, 0.14);
      border-radius: 18px;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
      padding: 1.4rem 1.25rem 1.15rem;
      text-align: center;
      transform: translateY(14px) scale(0.96);
      opacity: 0;
      transition: transform .3s cubic-bezier(0.22, 1, 0.36, 1), opacity .3s ease;
      font-family: inherit;
    `;

    modal.innerHTML = `
      <div style="
        width: 56px;
        height: 56px;
        margin: 0 auto 0.9rem;
        border-radius: 50%;
        background: rgba(10, 92, 46, 0.10);
        color: #0a5c2e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      ">
        <i class="fa fa-sign-out-alt"></i>
      </div>

      <div style="
        font-size: 1.02rem;
        font-weight: 700;
        color: #163020;
        margin-bottom: 0.45rem;
      ">
        Log out of your account?
      </div>

      <div style="
        font-size: 0.88rem;
        line-height: 1.5;
        color: #557564;
        margin-bottom: 1.15rem;
      ">
        Are you sure you want to log out?
      </div>

      <div style="
        display: flex;
        gap: 0.75rem;
        justify-content: center;
      ">
        <button type="button" id="logoutCancelBtn" style="
          min-width: 120px;
          border: 1px solid #d7e6db;
          background: #ffffff;
          color: #2f4f3e;
          border-radius: 12px;
          padding: 0.72rem 1rem;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        ">
          Cancel
        </button>

        <button type="button" id="logoutConfirmBtn" style="
          min-width: 120px;
          border: none;
          background: linear-gradient(135deg, #0a5c2e 0%, #1a7a3f 100%);
          color: #ffffff;
          border-radius: 12px;
          padding: 0.72rem 1rem;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(10, 92, 46, 0.22);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        ">
          Log Out
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeLogoutConfirm();
    });

    const cancelBtn = modal.querySelector('#logoutCancelBtn');
    cancelBtn.addEventListener('click', closeLogoutConfirm);
    attachModalButtonEffects(cancelBtn);

    const firstConfirmBtn = modal.querySelector('#logoutConfirmBtn');
    attachModalButtonEffects(firstConfirmBtn);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLogoutConfirm();
    });
  }

  const modal = overlay.firstElementChild;
  const oldConfirmBtn = overlay.querySelector('#logoutConfirmBtn');
  const newConfirmBtn = oldConfirmBtn.cloneNode(true);
  oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn);

  attachModalButtonEffects(newConfirmBtn);
  newConfirmBtn.addEventListener('click', () => {
    closeLogoutConfirm();
    setTimeout(() => {
      if (typeof onConfirm === 'function') onConfirm();
    }, 180);
  });

  overlay.style.visibility = 'visible';
  overlay.style.pointerEvents = 'auto';

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    overlay.style.background = 'rgba(0, 0, 0, 0.32)';
    if (modal) {
      modal.style.opacity = '1';
      modal.style.transform = 'translateY(0) scale(1)';
    }
  });
}

function closeLogoutConfirm() {
  const overlay = document.getElementById('logoutConfirmOverlay');
  if (!overlay) return;

  const modal = overlay.firstElementChild;

  overlay.style.opacity = '0';
  overlay.style.background = 'rgba(0, 0, 0, 0.22)';
  overlay.style.pointerEvents = 'none';

  if (modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(12px) scale(0.97)';
  }

  setTimeout(() => {
    overlay.style.visibility = 'hidden';
  }, 280);
}

function initStatCards() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';

    setTimeout(() => {
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 70);
  });
}

function initProgressBars() {
  const fills = document.querySelectorAll('.progress-fill');
  if (!fills.length) return;

  fills.forEach((fill) => {
    const target = fill.getAttribute('data-width') || '0';
    fill.style.width = '0';

    setTimeout(() => {
      fill.style.width = `${target}%`;
    }, 350);
  });
}

function filterTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  if (!input || !rows.length) return;

  const value = input.value.toLowerCase();
  rows.forEach((row) => {
    row.style.display = row.textContent.toLowerCase().includes(value) ? '' : 'none';
  });
}

function submitJournal(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;

  btn.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i>Submitting...';
  btn.disabled = true;

  setTimeout(() => {
    showToast('Entry submitted successfully.', 'success');
    form.reset();
    btn.innerHTML = '<i class="fa fa-paper-plane me-1"></i>Submit';
    btn.disabled = false;
  }, 800);
}

function showJournalForm() {
  const form = document.getElementById('journalForm');
  if (!form) return;
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });
}

function hideJournalForm() {
  const form = document.getElementById('journalForm');
  if (!form) return;
  form.style.display = 'none';
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      top: 1.2rem;
      right: 1.2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
    theme: 'fa-key'
  };
  const colors = {
    success: '#1a7a3f',
    error: '#c0392b',
    info: '#1a73e8',
    theme: '#0a5c2e'
  };

  toast.style.cssText = `
    background: ${colors[type] || colors.success};
    color: #fff;
    padding: .75rem 1rem;
    border-radius: 10px;
    font-size: .84rem;
    font-weight: 600;
    box-shadow: 0 6px 20px rgba(0,0,0,.18);
    max-width: 300px;
    opacity: 0;
    transform: translateX(20px);
    transition: opacity .25s ease, transform .25s ease;
  `;

  toast.innerHTML = `<i class="fa ${icons[type] || icons.success} me-2"></i>${message}`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function initHoursChart() {
  const canvas = document.getElementById('hoursChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'];
  const hours = [18, 22, 20, 25, 24, 28, 26, 30];
  const target = [20, 20, 20, 20, 20, 20, 20, 20];

  const w = canvas.width;
  const h = canvas.height;
  const pad = { top: 30, right: 20, bottom: 40, left: 50 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const maxVal = 35;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = '#e8f5ee';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = pad.top + (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#7da488';
    ctx.font = '10px Raleway';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), pad.left - 6, y + 4);
  }

  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  target.forEach((v, i) => {
    const x = pad.left + (chartW / (weeks.length - 1)) * i;
    const y = pad.top + chartH - (v / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.setLineDash([]);

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, 'rgba(26,122,63,.22)');
  grad.addColorStop(1, 'rgba(26,122,63,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();

  hours.forEach((v, i) => {
    const x = pad.left + (chartW / (weeks.length - 1)) * i;
    const y = pad.top + chartH - (v / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#1a7a3f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  hours.forEach((v, i) => {
    const x = pad.left + (chartW / (weeks.length - 1)) * i;
    const y = pad.top + chartH - (v / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  hours.forEach((v, i) => {
    const x = pad.left + (chartW / (weeks.length - 1)) * i;
    const y = pad.top + chartH - (v / maxVal) * chartH;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a7a3f';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1a2e1f';
    ctx.font = '10px Raleway';
    ctx.textAlign = 'center';
    ctx.fillText(weeks[i], x, pad.top + chartH + 18);
  });
}

window.addEventListener('load', initHoursChart);