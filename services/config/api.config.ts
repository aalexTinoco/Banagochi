/**
 * API Configuration
 */

// Cambiar a true para usar localhost en desarrollo
const USE_LOCALHOST = false;

export const API_CONFIG = {
  USERS_BASE_URL: USE_LOCALHOST 
    ? 'http://localhost:4000' 
    : 'https://user-microservice-production-8438.up.railway.app',
  OPERATIONAL_BASE_URL: USE_LOCALHOST 
    ? 'http://localhost:4001' 
    : 'https://banagochi-back-production.up.railway.app',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

console.log('🔧 API Config:', {
  users: API_CONFIG.USERS_BASE_URL,
  operational: API_CONFIG.OPERATIONAL_BASE_URL,
  mode: USE_LOCALHOST ? 'LOCALHOST' : 'PRODUCTION',
});

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    GET_TIME: '/api/auth/gettime',
    UPDATE_TOKEN: '/api/auth/update',
    FORGOT_PASSWORD: '/api/auth/forgot',
    RESET_PASSWORD: '/api/auth/reset',
  },
  
  // Users
  USERS: {
    REGISTER: '/api/users/register',
    GET_ALL: '/api/users/getall',
    GET_BY_ID: (id: string) => `/api/users/get/${id}`,
    UPDATE: (id: string) => `/api/users/update/${id}`,
    DELETE: (id: string) => `/api/users/delete/${id}`,
    GET_ADMINS: '/api/users/getadmins',
    GET_DEVICES: (id: string) => `/api/users/${id}/devices`,
    LOGOUT_DEVICE: (id: string) => `/api/users/${id}/logout-device`,
    LOGOUT_ALL: (id: string) => `/api/users/${id}/logout-all`,
  },
  
  // Credit Cards
  CARDS: {
    CREATE: '/api/cards',
    GET_USER_CARDS: (userId: string) => `/api/cards/user/${userId}`,
    GET_BY_ID: (id: string) => `/api/cards/${id}`,
    UPDATE: (id: string) => `/api/cards/${id}`,
    DELETE: (id: string) => `/api/cards/${id}`,
  },
  
  // Menu
  MENU: {
    CREATE: '/api/menu/createNewCategory',
    GET_BY_ROLE: '/api/menu/getMenuByRole',
    DELETE: (id: string) => `/api/menu/deleteMenu/${id}`,
  },
  
  // Projects
  PROJECTS: {
    CREATE: '/api/projects',
    GET_ALL: '/api/projects',
    GET_BY_ID: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
    DELETE_PERMANENT: (id: string) => `/api/projects/${id}/permanent`,
    ADD_VOTE: (id: string) => `/api/projects/${id}/vote`,
    ADD_FUNDING: (id: string) => `/api/projects/${id}/funding`,
    ADD_FEED: (id: string) => `/api/projects/${id}/feed`,
    GET_BY_COLONIA: (colonia: string) => `/api/projects/colonia/${colonia}`,
    GET_BY_STATUS: (status: string) => `/api/projects/status/${status}`,
    GET_BY_PROPOSER: (userId: string) => `/api/projects/proposer/${userId}`,
  },
  
  // Asides (Apartados)
  ASIDES: {
    CREATE: '/api/asides',
    GET_USER_ASIDES: (userId: string) => `/api/asides/user/${userId}`,
    GET_BY_ID: (id: string) => `/api/asides/${id}`,
    GET_PROJECT_ASIDES: (projectId: string) => `/api/asides/project/${projectId}`,
    PAUSE: (id: string) => `/api/asides/${id}/pause`,
    REACTIVATE: (id: string) => `/api/asides/${id}/reactivate`,
    CANCEL: (id: string) => `/api/asides/${id}/cancel`,
    UPDATE_AMOUNT: (id: string) => `/api/asides/${id}/amount`,
  },
  
  // Transactions
  TRANSACTIONS: {
    CREATE_ONE_TIME: '/api/transactions/one-time',
    PROCESS_PAYROLL: '/api/transactions/process-payroll',
    GET_USER_TRANSACTIONS: (userId: string) => `/api/transactions/user/${userId}`,
    GET_PROJECT_TRANSACTIONS: (projectId: string) => `/api/transactions/project/${projectId}`,
    GET_USER_DASHBOARD: (userId: string) => `/api/transactions/user/${userId}/dashboard`,
  },
};
