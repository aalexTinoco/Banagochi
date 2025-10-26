/**
 * Credit Card Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  CreateCardRequest,
  UpdateCardRequest,
  CardResponse,
} from '../types';

export class CardService {
  private static baseUrl = API_CONFIG.USERS_BASE_URL;

  /**
   * Create new credit card
   */
  static async createCard(data: CreateCardRequest): Promise<CardResponse> {
    return HttpClient.post<CardResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CARDS.CREATE}`,
      data
    );
  }

  /**
   * Get all cards for a user
   */
  static async getUserCards(userId: string): Promise<CardResponse> {
    return HttpClient.get<CardResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CARDS.GET_USER_CARDS(userId)}`
    );
  }

  /**
   * Get card by ID
   */
  static async getCardById(cardId: string): Promise<CardResponse> {
    return HttpClient.get<CardResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CARDS.GET_BY_ID(cardId)}`
    );
  }

  /**
   * Update card
   */
  static async updateCard(
    cardId: string,
    data: UpdateCardRequest
  ): Promise<CardResponse> {
    return HttpClient.patch<CardResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CARDS.UPDATE(cardId)}`,
      data
    );
  }

  /**
   * Delete card
   */
  static async deleteCard(cardId: string): Promise<any> {
    return HttpClient.delete(
      `${this.baseUrl}${API_ENDPOINTS.CARDS.DELETE(cardId)}`
    );
  }
}
