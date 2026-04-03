/* ===== INTERNTRACK — Centralized API Handler ===== */
/* Requires: config/config.js loaded before this file */

const api = {
  async request(endpoint, options = {}) {
    const url = API_CONFIG.BASE_URL + endpoint;
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
    };
    const config = { ...defaults, ...options };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, status: response.status, message: data.error || data.message || 'Request failed' };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  },

  // --- Student endpoints ---

  loginStudent(email, password) {
    return this.request(API_CONFIG.ENDPOINTS.STUDENT_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  registerStudent(name, email, password) {
    return this.request(API_CONFIG.ENDPOINTS.STUDENT_REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  updateStudentProfile(id, profileData) {
    const endpoint = API_CONFIG.ENDPOINTS.STUDENT_PROFILE.replace('{id}', id);
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // --- Coordinator endpoints ---

  loginCoordinator(email, password) {
    return this.request(API_CONFIG.ENDPOINTS.COORDINATOR_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  registerCoordinator(name, email, password) {
    return this.request(API_CONFIG.ENDPOINTS.COORDINATOR_REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  updateCoordinatorProfile(id, profileData) {
    const endpoint = API_CONFIG.ENDPOINTS.COORDINATOR_PROFILE.replace('{id}', id);
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // --- Attendance endpoints ---

  submitAttendance(payload) {
    return this.request(API_CONFIG.ENDPOINTS.ATTENDANCE_SUBMIT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAttendanceByStudent(studentId) {
    const endpoint = API_CONFIG.ENDPOINTS.ATTENDANCE_BY_STUDENT.replace('{studentId}', studentId);
    return this.request(endpoint, { method: 'GET' });
  },
};
