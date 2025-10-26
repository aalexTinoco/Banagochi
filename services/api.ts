/**
 * Main API Client
 * 
 * This is the main entry point for all API interactions.
 * Import this file to access all services and types.
 * 
 * @example
 * ```typescript
 * import { API, AuthService, ProjectService } from '@/services/api';
 * 
 * // Login
 * const response = await AuthService.login({
 *   email: 'user@example.com',
 *   password: 'password',
 *   deviceId: 'device-123',
 *   deviceName: 'iPhone 14'
 * });
 * 
 * // Get projects
 * const projects = await ProjectService.getAllProjects({
 *   status: 'VOTING',
 *   colonia: 'Centro'
 * });
 * ```
 */

// Export all services
/**
 * Unified API object for convenience
 */
import { AsideService } from './modules/aside.service';
import { AuthService } from './modules/auth.service';
import { CardService } from './modules/card.service';
import { MenuService } from './modules/menu.service';
import { ProjectService } from './modules/project.service';
import { TransactionService } from './modules/transaction.service';
import { UserService } from './modules/user.service';
import { StorageService } from './utils/storage';

export {
  AsideService, AuthService, CardService,
  MenuService,
  ProjectsService, TransactionService, UserService
} from './modules';

// Export all types
export type * from './types';

// Export configuration
export { API_CONFIG, API_ENDPOINTS } from './config/api.config';

// Export HTTP client for custom requests if needed
export { HttpClient, HttpError } from './utils/http-client';

// Export storage service
export { StorageService } from './utils/storage';

export const API = {
  auth: AuthService,
  users: UserService,
  cards: CardService,
  menus: MenuService,
  projects: ProjectService,
  asides: AsideService,
  transactions: TransactionService,
  storage: StorageService,
};

/**
 * Default export for convenience
 */
export default API;
