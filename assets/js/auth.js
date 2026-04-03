/* ===== INTERNTRACK — Auth Module ===== */
/* Requires: config/config.js, assets/js/api.js loaded before this file */

const SESSION_KEY = 'interntrack_session';

const auth = {
  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },

  saveSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  /**
   * Detect role from the active login tab.
   * Falls back to 'student' if no tab is active.
   */
  detectRole() {
    const activeTab = document.querySelector('.login-tab.active');
    if (!activeTab) return 'student';
    const text = activeTab.textContent.trim().toLowerCase();
    if (text.includes('coordinator') || text.includes('employee') || text.includes('faculty')) {
      return 'coordinator';
    }
    return 'student';
  },

  /**
   * Generate 2-letter avatar initials from a name.
   * e.g. "Juan dela Cruz" → "JC"
   */
  generateAvatar(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  /**
   * Login — calls the correct backend endpoint based on role.
   * The backend expects { email, password } and returns an AuthResponse DTO.
   */
  async login(email, password) {
    const role = this.detectRole();

    const result = role === 'coordinator'
      ? await api.loginCoordinator(email, password)
      : await api.loginStudent(email, password);

    if (result.success && result.data) {
      const data = result.data;
      // Fill avatar from backend or generate from name
      if (!data.avatar) {
        data.avatar = this.generateAvatar(data.name);
      }
      const session = { ...data, role };
      this.saveSession(session);
    }

    return result;
  },

  /**
   * Register — calls the correct backend endpoint based on role.
   */
  async register(name, email, password, role) {
    const result = role === 'coordinator'
      ? await api.registerCoordinator(name, email, password)
      : await api.registerStudent(name, email, password);

    return result;
  },

  /**
   * Update profile — calls the correct endpoint based on current session role.
   * Refreshes the session with the updated data from the backend.
   */
  async updateProfile(profileData) {
    const session = this.getSession();
    if (!session || !session.id) return { success: false, message: 'Not authenticated' };

    const result = session.role === 'coordinator'
      ? await api.updateCoordinatorProfile(session.id, profileData)
      : await api.updateStudentProfile(session.id, profileData);

    if (result.success && result.data) {
      const data = result.data;
      if (!data.avatar) {
        data.avatar = this.generateAvatar(data.name);
      }
      const updated = { ...data, role: session.role };
      this.saveSession(updated);
    }

    return result;
  },

  logout() {
    this.clearSession();
  },

  isAuthenticated() {
    return this.getSession() !== null;
  },
};
