/**
 * Menu Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type { CreateMenuRequest, MenuResponse } from '../types';

export class MenuService {
  private static baseUrl = API_CONFIG.USERS_BASE_URL;

  /**
   * Create new menu
   */
  static async createMenu(data: CreateMenuRequest): Promise<MenuResponse> {
    return HttpClient.post<MenuResponse>(
      `${this.baseUrl}${API_ENDPOINTS.MENU.CREATE}`,
      data
    );
  }

  /**
   * Get menus by role
   */
  static async getMenusByRole(role: 'user' | 'admin'): Promise<MenuResponse> {
    return HttpClient.get<MenuResponse>(
      `${this.baseUrl}${API_ENDPOINTS.MENU.GET_BY_ROLE}?role=${role}`
    );
  }

  /**
   * Delete menu (soft delete)
   */
  static async deleteMenu(menuId: string): Promise<any> {
    return HttpClient.patch(
      `${this.baseUrl}${API_ENDPOINTS.MENU.DELETE(menuId)}`
    );
  }
}
