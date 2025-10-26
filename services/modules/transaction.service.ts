/**
 * Transaction Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  CreateOneTimeTransactionRequest,
  TransactionResponse,
  TransactionFilters,
  UserDashboard,
} from '../types';

export class TransactionService {
  private static baseUrl = API_CONFIG.OPERATIONAL_BASE_URL;

  /**
   * Create one-time transaction
   */
  static async createOneTimeTransaction(
    data: CreateOneTimeTransactionRequest
  ): Promise<TransactionResponse> {
    return HttpClient.post<TransactionResponse>(
      `${this.baseUrl}${API_ENDPOINTS.TRANSACTIONS.CREATE_ONE_TIME}`,
      data
    );
  }

  /**
   * Process payroll deductions (admin/cron job)
   */
  static async processPayroll(): Promise<any> {
    return HttpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.TRANSACTIONS.PROCESS_PAYROLL}`
    );
  }

  /**
   * Get user transactions with optional filters
   */
  static async getUserTransactions(
    userId: string,
    filters?: TransactionFilters
  ): Promise<TransactionResponse> {
    let url = `${this.baseUrl}${API_ENDPOINTS.TRANSACTIONS.GET_USER_TRANSACTIONS(userId)}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.source) params.append('source', filters.source);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }

    return HttpClient.get<TransactionResponse>(url);
  }

  /**
   * Get project transactions
   */
  static async getProjectTransactions(projectId: string): Promise<TransactionResponse> {
    return HttpClient.get<TransactionResponse>(
      `${this.baseUrl}${API_ENDPOINTS.TRANSACTIONS.GET_PROJECT_TRANSACTIONS(projectId)}`
    );
  }

  /**
   * Get user impact dashboard
   */
  static async getUserDashboard(userId: string): Promise<{ dashboard: UserDashboard }> {
    return HttpClient.get(
      `${this.baseUrl}${API_ENDPOINTS.TRANSACTIONS.GET_USER_DASHBOARD(userId)}`
    );
  }
}
