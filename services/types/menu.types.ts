/**
 * Menu Types
 */

export interface Menu {
  _id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  roles: Array<{ type: 'user' | 'admin' }>;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuRequest {
  title: string;
  description: string;
  path: string;
  icon: string;
  roles: Array<{ type: 'user' | 'admin' }>;
  status?: boolean;
}

export interface MenuResponse {
  success: boolean;
  menu?: Menu;
  menus?: Menu[];
  message?: string;
}
