/**
 * User Management Types
 */

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role: Array<{ type: 'user' | 'admin' }>;
  colony?: string;
  domicilio?: string;
  selfie: File | Blob;
  ine: File | Blob;
}

export interface UpdateUserRequest {
  name?: string;
  colony?: string;
  domicilio?: string;
  impactSummary?: {
    totalContributed?: number;
    completedProjects?: number;
    balanceContributed?: number;
  };
}

export interface UserResponse {
  success: boolean;
  user: any;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  users: any[];
  total: number;
}

export interface LogoutDeviceRequest {
  deviceId: string;
}
