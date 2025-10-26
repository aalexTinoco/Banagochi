/**
 * Banagochi API Service
 * Centralized API calls for the mobile app
 */

import {
  // Types
  IUser,
  IProject,
  IAside,
  ITransaction,
  IMenu,
  ICreditCard,
  
  // Request Types
  RegisterRequest,
  LoginRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateAsideRequest,
  CreateTransactionRequest,
  AddVoteRequest,
  AddFundingRequest,
  AddFeedItemRequest,
  UpdateUserRequest,
  UpdateBanorteAccountRequest,
  CreateCreditCardRequest,
  UpdateCreditCardRequest,
  
  // Response Types
  ApiResponse,
  AuthResponse,
  ProjectsResponse,
  AsideResponse,
  AsidesResponse,
  TransactionResponse,
  TransactionsResponse,
  ImpactDashboard,
  PayrollProcessResult,
  CreditCardResponse,
  
  // Filters
  ProjectFilters,
  TransactionFilters,
  AsideFilters,
} from './types';

import { getBaseUrl, ENDPOINTS, REQUEST_TIMEOUT, STORAGE_KEYS } from './config';

/**
 * HTTP Client utility
 */
class HttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  async postFormData<T>(endpoint: string, formData: FormData, headers?: HeadersInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          ...headers,
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formData,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }
}

/**
 * Authentication Token Manager
 */
class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;

  private constructor() {
    this.loadToken();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  getAuthHeaders(): HeadersInit {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

/**
 * API Service Class
 */
class BanagochiAPI {
  private usersClient: HttpClient;
  private operationalClient: HttpClient;
  private authManager: AuthManager;

  constructor() {
    this.usersClient = new HttpClient(getBaseUrl('USERS_SERVICE'));
    this.operationalClient = new HttpClient(getBaseUrl('OPERATIONAL_SERVICE'));
    this.authManager = AuthManager.getInstance();
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('role', JSON.stringify(data.role));
    
    if (data.colony) formData.append('colony', data.colony);
    if (data.domicilio) formData.append('domicilio', data.domicilio);
    if (data.selfie) formData.append('selfie', data.selfie);
    if (data.ine) formData.append('ine', data.ine);

    const response = await this.usersClient.postFormData<any>(
      ENDPOINTS.AUTH.REGISTER,
      formData
    );

    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('deviceId', data.deviceId);
    
    if (data.deviceName) formData.append('deviceName', data.deviceName);
    if (data.selfie) formData.append('selfie', data.selfie);
    if (data.ine) formData.append('ine', data.ine);

    const response = await this.usersClient.postFormData<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      formData
    );

    // Store token
    if (response.token) {
      this.authManager.setToken(response.token);
      if (typeof window !== 'undefined' && response.user) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, response.user.id);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
    }

    return response;
  }

  /**
   * Get token remaining time
   */
  async getTokenTime(userId: string): Promise<any> {
    return this.usersClient.post(ENDPOINTS.AUTH.GET_TOKEN_TIME, { userId });
  }

  /**
   * Update/refresh token
   */
  async updateToken(userId: string): Promise<any> {
    return this.usersClient.get(`${ENDPOINTS.AUTH.UPDATE_TOKEN}?userId=${userId}`);
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<any> {
    return this.usersClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<any> {
    return this.usersClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }

  /**
   * Logout from specific device
   */
  async logoutDevice(userId: string, deviceId: string): Promise<any> {
    const endpoint = ENDPOINTS.AUTH.LOGOUT_DEVICE.replace(':id', userId);
    return this.usersClient.post(endpoint, { deviceId }, this.authManager.getAuthHeaders());
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<any> {
    const endpoint = ENDPOINTS.AUTH.LOGOUT_ALL.replace(':id', userId);
    const response = await this.usersClient.post(endpoint, {}, this.authManager.getAuthHeaders());
    
    // Clear local storage
    this.authManager.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }

    return response;
  }

  // ============================================
  // USERS
  // ============================================

  /**
   * Get all users
   */
  async getAllUsers(): Promise<{ message: string; users: IUser[] }> {
    return this.usersClient.get(ENDPOINTS.USERS.GET_ALL, this.authManager.getAuthHeaders());
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ message: string; user: IUser }> {
    const endpoint = ENDPOINTS.USERS.GET_BY_ID.replace(':id', userId);
    return this.usersClient.get(endpoint, this.authManager.getAuthHeaders());
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<any> {
    const endpoint = ENDPOINTS.USERS.UPDATE.replace(':id', userId);
    return this.usersClient.put(endpoint, data, this.authManager.getAuthHeaders());
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<any> {
    const endpoint = ENDPOINTS.USERS.DELETE.replace(':id', userId);
    return this.usersClient.delete(endpoint, this.authManager.getAuthHeaders());
  }

  /**
   * Get admin users
   */
  async getAdmins(): Promise<IUser[]> {
    return this.usersClient.get(ENDPOINTS.USERS.GET_ADMINS, this.authManager.getAuthHeaders());
  }

  /**
   * Get user devices
   */
  async getUserDevices(userId: string): Promise<any> {
    const endpoint = ENDPOINTS.USERS.GET_DEVICES.replace(':id', userId);
    return this.usersClient.get(endpoint, this.authManager.getAuthHeaders());
  }

  // ============================================
  // MENU
  // ============================================

  /**
   * Create new menu
   */
  async createMenu(data: any): Promise<IMenu> {
    return this.usersClient.post(ENDPOINTS.MENU.CREATE, data, this.authManager.getAuthHeaders());
  }

  /**
   * Get menus by role
   */
  async getMenusByRole(role: string): Promise<IMenu[]> {
    return this.usersClient.get(
      `${ENDPOINTS.MENU.GET_BY_ROLE}?role=${role}`,
      this.authManager.getAuthHeaders()
    );
  }

  /**
   * Delete menu (soft delete)
   */
  async deleteMenu(menuId: string): Promise<any> {
    const endpoint = ENDPOINTS.MENU.DELETE.replace(':id', menuId);
    return this.usersClient.patch(endpoint, {}, this.authManager.getAuthHeaders());
  }

  // ============================================
  // CREDIT CARDS
  // ============================================

  /**
   * Create a new credit card
   */
  async createCreditCard(data: CreateCreditCardRequest): Promise<CreditCardResponse> {
    return this.usersClient.post(
      ENDPOINTS.CARDS.CREATE,
      data,
      {
        ...this.authManager.getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    );
  }

  /**
   * Get user credit cards
   */
  async getUserCreditCards(userId: string): Promise<CreditCardResponse> {
    const endpoint = ENDPOINTS.CARDS.GET_USER_CARDS.replace(':userId', userId);
    return this.usersClient.get(endpoint, this.authManager.getAuthHeaders());
  }

  /**
   * Get credit card by ID
   */
  async getCreditCardById(cardId: string): Promise<CreditCardResponse> {
    const endpoint = ENDPOINTS.CARDS.GET_BY_ID.replace(':cardId', cardId);
    return this.usersClient.get(endpoint, this.authManager.getAuthHeaders());
  }

  /**
   * Update credit card
   */
  async updateCreditCard(cardId: string, data: UpdateCreditCardRequest): Promise<CreditCardResponse> {
    const endpoint = ENDPOINTS.CARDS.UPDATE.replace(':cardId', cardId);
    return this.usersClient.patch(
      endpoint,
      data,
      {
        ...this.authManager.getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    );
  }

  /**
   * Delete credit card
   */
  async deleteCreditCard(cardId: string): Promise<any> {
    const endpoint = ENDPOINTS.CARDS.DELETE.replace(':cardId', cardId);
    return this.usersClient.delete(endpoint, this.authManager.getAuthHeaders());
  }

  // ============================================
  // PROJECTS
  // ============================================

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectRequest): Promise<ApiResponse<IProject>> {
    return this.operationalClient.post(ENDPOINTS.PROJECTS.CREATE, data);
  }

  /**
   * Get all projects
   */
  async getAllProjects(filters?: ProjectFilters): Promise<ProjectsResponse> {
    let endpoint = ENDPOINTS.PROJECTS.GET_ALL;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.colonia) params.append('colonia', filters.colonia);
      if (filters.active !== undefined) params.append('active', String(filters.active));
      
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    return this.operationalClient.get(endpoint);
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<ApiResponse<IProject>> {
    const endpoint = ENDPOINTS.PROJECTS.GET_BY_ID.replace(':id', projectId);
    return this.operationalClient.get(endpoint);
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<ApiResponse<IProject>> {
    const endpoint = ENDPOINTS.PROJECTS.UPDATE.replace(':id', projectId);
    return this.operationalClient.put(endpoint, data);
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId: string): Promise<ApiResponse<IProject>> {
    const endpoint = ENDPOINTS.PROJECTS.DELETE.replace(':id', projectId);
    return this.operationalClient.delete(endpoint);
  }

  /**
   * Permanently delete project
   */
  async permanentDeleteProject(projectId: string): Promise<ApiResponse<boolean>> {
    const endpoint = ENDPOINTS.PROJECTS.PERMANENT_DELETE.replace(':id', projectId);
    return this.operationalClient.delete(endpoint);
  }

  /**
   * Add vote to project
   */
  async addVote(projectId: string, voterId: string): Promise<ApiResponse<IProject>> {
    const endpoint = ENDPOINTS.PROJECTS.ADD_VOTE.replace(':id', projectId);
    return this.operationalClient.post(endpoint, { voterId });
  }

  /**
   * Add funding to project
   */
  async addFunding(projectId: string, amount: number): Promise<ApiResponse<IProject>> {
    const endpoint = ENDPOINTS.PROJECTS.ADD_FUNDING.replace(':id', projectId);
    return this.operationalClient.post(endpoint, { amount });
  }

  /**
   * Add feed item to project
   */
  async addFeedItem(projectId: string, data: AddFeedItemRequest): Promise<ApiResponse<IProject>> {
    const endpoint = ENDPOINTS.PROJECTS.ADD_FEED.replace(':id', projectId);
    return this.operationalClient.post(endpoint, data);
  }

  /**
   * Get projects by colonia
   */
  async getProjectsByColonia(colonia: string): Promise<ProjectsResponse> {
    const endpoint = ENDPOINTS.PROJECTS.BY_COLONIA.replace(':colonia', colonia);
    return this.operationalClient.get(endpoint);
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: string): Promise<ProjectsResponse> {
    const endpoint = ENDPOINTS.PROJECTS.BY_STATUS.replace(':status', status);
    return this.operationalClient.get(endpoint);
  }

  /**
   * Get projects by proposer
   */
  async getProjectsByProposer(proposerId: string): Promise<ProjectsResponse> {
    const endpoint = ENDPOINTS.PROJECTS.BY_PROPOSER.replace(':proposerId', proposerId);
    return this.operationalClient.get(endpoint);
  }

  // ============================================
  // ASIDES (APARTADOS)
  // ============================================

  /**
   * Create a payroll aside
   */
  async createAside(data: CreateAsideRequest): Promise<AsideResponse> {
    return this.operationalClient.post(ENDPOINTS.ASIDES.CREATE, data);
  }

  /**
   * Get user asides
   */
  async getUserAsides(userId: string, filters?: AsideFilters): Promise<AsidesResponse> {
    let endpoint = ENDPOINTS.ASIDES.GET_USER_ASIDES.replace(':userId', userId);
    
    if (filters?.status) {
      endpoint += `?status=${filters.status}`;
    }

    return this.operationalClient.get(endpoint);
  }

  /**
   * Get aside by ID
   */
  async getAsideById(asideId: string): Promise<AsideResponse> {
    const endpoint = ENDPOINTS.ASIDES.GET_BY_ID.replace(':asideId', asideId);
    return this.operationalClient.get(endpoint);
  }

  /**
   * Get project asides
   */
  async getProjectAsides(projectId: string): Promise<AsidesResponse> {
    const endpoint = ENDPOINTS.ASIDES.GET_PROJECT_ASIDES.replace(':projectId', projectId);
    return this.operationalClient.get(endpoint);
  }

  /**
   * Pause aside
   */
  async pauseAside(asideId: string): Promise<AsideResponse> {
    const endpoint = ENDPOINTS.ASIDES.PAUSE.replace(':asideId', asideId);
    return this.operationalClient.patch(endpoint);
  }

  /**
   * Reactivate aside
   */
  async reactivateAside(asideId: string): Promise<AsideResponse> {
    const endpoint = ENDPOINTS.ASIDES.REACTIVATE.replace(':asideId', asideId);
    return this.operationalClient.patch(endpoint);
  }

  /**
   * Cancel aside
   */
  async cancelAside(asideId: string): Promise<AsideResponse> {
    const endpoint = ENDPOINTS.ASIDES.CANCEL.replace(':asideId', asideId);
    return this.operationalClient.patch(endpoint);
  }

  /**
   * Update aside amount
   */
  async updateAsideAmount(asideId: string, amountPerCycle: number): Promise<AsideResponse> {
    const endpoint = ENDPOINTS.ASIDES.UPDATE_AMOUNT.replace(':asideId', asideId);
    return this.operationalClient.patch(endpoint, { amountPerCycle });
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  /**
   * Create one-time transaction
   */
  async createOneTimeTransaction(data: CreateTransactionRequest): Promise<TransactionResponse> {
    return this.operationalClient.post(ENDPOINTS.TRANSACTIONS.CREATE_ONE_TIME, data);
  }

  /**
   * Process payroll deductions (cron job)
   */
  async processPayrollDeductions(): Promise<PayrollProcessResult> {
    return this.operationalClient.post(ENDPOINTS.TRANSACTIONS.PROCESS_PAYROLL);
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string, filters?: TransactionFilters): Promise<TransactionsResponse> {
    let endpoint = ENDPOINTS.TRANSACTIONS.GET_USER_TRANSACTIONS.replace(':userId', userId);
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.source) params.append('source', filters.source);
      
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    return this.operationalClient.get(endpoint);
  }

  /**
   * Get project transactions
   */
  async getProjectTransactions(projectId: string): Promise<TransactionsResponse> {
    const endpoint = ENDPOINTS.TRANSACTIONS.GET_PROJECT_TRANSACTIONS.replace(':projectId', projectId);
    return this.operationalClient.get(endpoint);
  }

  /**
   * Get user impact dashboard
   */
  async getUserImpactDashboard(userId: string): Promise<ImpactDashboard> {
    const endpoint = ENDPOINTS.TRANSACTIONS.GET_IMPACT_DASHBOARD.replace(':userId', userId);
    return this.operationalClient.get(endpoint);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authManager.getToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authManager.getToken();
  }

  /**
   * Get stored user ID
   */
  getUserId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.USER_ID);
    }
    return null;
  }

  /**
   * Get stored user data
   */
  getStoredUserData(): any | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  /**
   * Clear all stored data
   */
  clearStorage(): void {
    this.authManager.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
    }
  }
}

// Export singleton instance
export const api = new BanagochiAPI();

// Export class for custom instances if needed
export default BanagochiAPI;
