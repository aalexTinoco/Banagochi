/**
 * API Configuration
 * Base URLs and environment settings
 */

// Environment configuration
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

// Current environment (change this based on your environment)
export const CURRENT_ENV = ENV.DEVELOPMENT;

// API Base URLs
export const API_CONFIG = {
  USERS_SERVICE: {
    development: 'http://localhost:3000',
    production: 'https://api.banagochi.com/users', // Replace with actual production URL
  },
  OPERATIONAL_SERVICE: {
    development: 'http://localhost:4001',
    production: 'https://api.banagochi.com/operational', // Replace with actual production URL
  },
};

// Get base URLs based on current environment
export const getBaseUrl = (service: 'USERS_SERVICE' | 'OPERATIONAL_SERVICE'): string => {
  return API_CONFIG[service][CURRENT_ENV];
};

// API endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/users/register',
    LOGOUT_DEVICE: '/api/users/:id/logout-device',
    LOGOUT_ALL: '/api/users/:id/logout-all',
    GET_TOKEN_TIME: '/api/auth/gettime',
    UPDATE_TOKEN: '/api/auth/update',
    FORGOT_PASSWORD: '/api/auth/forgot',
    RESET_PASSWORD: '/api/auth/reset',
  },
  
  // Users
  USERS: {
    GET_ALL: '/api/users/getall',
    GET_BY_ID: '/api/users/get/:id',
    UPDATE: '/api/users/update/:id',
    DELETE: '/api/users/delete/:id',
    GET_ADMINS: '/api/users/getadmins',
    GET_DEVICES: '/api/users/:id/devices',
  },
  
  // Menu
  MENU: {
    CREATE: '/api/menu/createNewCategory',
    GET_BY_ROLE: '/api/menu/getMenuByRole',
    DELETE: '/api/menu/deleteMenu/:id',
  },
  
  // Credit Cards
  CARDS: {
    CREATE: '/api/cards',
    GET_USER_CARDS: '/api/cards/user/:userId',
    GET_BY_ID: '/api/cards/:cardId',
    UPDATE: '/api/cards/:cardId',
    DELETE: '/api/cards/:cardId',
  },
  
  // Projects
  PROJECTS: {
    CREATE: '/api/projects',
    GET_ALL: '/api/projects',
    GET_BY_ID: '/api/projects/:id',
    UPDATE: '/api/projects/:id',
    DELETE: '/api/projects/:id',
    PERMANENT_DELETE: '/api/projects/:id/permanent',
    ADD_VOTE: '/api/projects/:id/vote',
    ADD_FUNDING: '/api/projects/:id/funding',
    ADD_FEED: '/api/projects/:id/feed',
    BY_COLONIA: '/api/projects/colonia/:colonia',
    BY_STATUS: '/api/projects/status/:status',
    BY_PROPOSER: '/api/projects/proposer/:proposerId',
  },
  
  // Asides (Apartados)
  ASIDES: {
    CREATE: '/api/asides',
    GET_USER_ASIDES: '/api/asides/user/:userId',
    GET_BY_ID: '/api/asides/:asideId',
    GET_PROJECT_ASIDES: '/api/asides/project/:projectId',
    PAUSE: '/api/asides/:asideId/pause',
    REACTIVATE: '/api/asides/:asideId/reactivate',
    CANCEL: '/api/asides/:asideId/cancel',
    UPDATE_AMOUNT: '/api/asides/:asideId/amount',
  },
  
  // Transactions
  TRANSACTIONS: {
    CREATE_ONE_TIME: '/api/transactions/one-time',
    PROCESS_PAYROLL: '/api/transactions/process-payroll',
    GET_USER_TRANSACTIONS: '/api/transactions/user/:userId',
    GET_PROJECT_TRANSACTIONS: '/api/transactions/project/:projectId',
    GET_IMPACT_DASHBOARD: '/api/transactions/user/:userId/dashboard',
  },
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000;

// Storage keys for local storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'banagochi_auth_token',
  USER_ID: 'banagochi_user_id',
  USER_DATA: 'banagochi_user_data',
  DEVICE_ID: 'banagochi_device_id',
};
