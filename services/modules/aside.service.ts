/**
 * Aside (Apartado) Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  CreateAsideRequest,
  UpdateAsideAmountRequest,
  AsideResponse,
  AsideStatus,
} from '../types';

export class AsideService {
  private static baseUrl = API_CONFIG.OPERATIONAL_BASE_URL;

  /**
   * Create new payroll aside
   */
  static async createAside(data: CreateAsideRequest): Promise<AsideResponse> {
    return HttpClient.post<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.CREATE}`,
      data
    );
  }

  /**
   * Get user asides with optional status filter
   */
  static async getUserAsides(
    userId: string,
    status?: AsideStatus
  ): Promise<AsideResponse> {
    let url = `${this.baseUrl}${API_ENDPOINTS.ASIDES.GET_USER_ASIDES(userId)}`;
    
    if (status) {
      url += `?status=${status}`;
    }

    return HttpClient.get<AsideResponse>(url);
  }

  /**
   * Get aside by ID
   */
  static async getAsideById(asideId: string): Promise<AsideResponse> {
    return HttpClient.get<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.GET_BY_ID(asideId)}`
    );
  }

  /**
   * Get project asides
   */
  static async getProjectAsides(projectId: string): Promise<AsideResponse> {
    return HttpClient.get<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.GET_PROJECT_ASIDES(projectId)}`
    );
  }

  /**
   * Pause aside
   */
  static async pauseAside(asideId: string): Promise<AsideResponse> {
    return HttpClient.patch<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.PAUSE(asideId)}`
    );
  }

  /**
   * Reactivate aside
   */
  static async reactivateAside(asideId: string): Promise<AsideResponse> {
    return HttpClient.patch<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.REACTIVATE(asideId)}`
    );
  }

  /**
   * Cancel aside
   */
  static async cancelAside(asideId: string): Promise<AsideResponse> {
    return HttpClient.patch<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.CANCEL(asideId)}`
    );
  }

  /**
   * Update aside amount
   */
  static async updateAsideAmount(
    asideId: string,
    data: UpdateAsideAmountRequest
  ): Promise<AsideResponse> {
    return HttpClient.patch<AsideResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ASIDES.UPDATE_AMOUNT(asideId)}`,
      data
    );
  }
}
