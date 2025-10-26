/**
 * HTTP Client Utility
 */

import { API_CONFIG } from '../config/api.config';

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

export class HttpClient {
  private static authToken: string | null = null;

  static setAuthToken(token: string | null) {
    this.authToken = token;
  }

  static getAuthToken(): string | null {
    return this.authToken;
  }

  private static async fetchWithTimeout(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const { timeout = API_CONFIG.TIMEOUT, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private static async fetchWithRetry(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const {
      retry = API_CONFIG.RETRY_ATTEMPTS,
      retryDelay = API_CONFIG.RETRY_DELAY,
      ...fetchConfig
    } = config;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, fetchConfig);
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // Retry on server errors (5xx) or network errors
        if (response.ok || attempt === retry) {
          return response;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      } catch (error: any) {
        lastError = error;
        if (attempt === retry) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    throw lastError || new Error('Request failed');
  }

  static async request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Debug logging
    console.log('🌐 HTTP Request:', {
      method: config.method || 'GET',
      url,
      hasAuth: !!this.authToken,
    });

    const response = await this.fetchWithRetry(url, {
      ...config,
      headers,
    });

    console.log('📡 HTTP Response:', {
      status: response.status,
      statusText: response.statusText,
      url,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorData,
      });
      throw new HttpError(response.status, response.statusText, errorData);
    }

    return response.json();
  }

  static async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  static async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  static async uploadFormData<T = any>(
    url: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(config?.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Don't set Content-Type for FormData - browser will set it with boundary
    delete headers['Content-Type'];

    // Debug logging
    console.log('📤 Upload Request:', {
      url,
      hasAuth: !!this.authToken,
    });

    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('📥 Upload Response:', {
      status: response.status,
      statusText: response.statusText,
      url,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Upload Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorData,
      });
      throw new HttpError(response.status, response.statusText, errorData);
    }

    return response.json();
  }
}
