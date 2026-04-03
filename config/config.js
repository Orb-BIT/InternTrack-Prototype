/* ===== INTERNTRACK — API Configuration ===== */

const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',

  ENDPOINTS: {
    STUDENT_LOGIN: '/students/login',
    STUDENT_REGISTER: '/students/register',
    STUDENT_PROFILE: '/students/{id}/profile',
    COORDINATOR_LOGIN: '/coordinators/login',
    COORDINATOR_REGISTER: '/coordinators/register',
    COORDINATOR_PROFILE: '/coordinators/{id}/profile',
    ATTENDANCE_SUBMIT: '/attendance',
    ATTENDANCE_BY_STUDENT: '/attendance/{studentId}',
  },
};
