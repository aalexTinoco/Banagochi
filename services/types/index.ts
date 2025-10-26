/**
 * Central export for all types
 */

export * from './auth.types';
export * from './user.types';
export * from './card.types';
export * from './projects.types';
export * from './aside.types';
export * from './transaction.types';
export * from './menu.types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
