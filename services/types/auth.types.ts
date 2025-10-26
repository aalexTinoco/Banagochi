/**
 * Authentication Types
 */

export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
  deviceName: string;
}

// Image type for React Native (expo-image-picker format)
export interface ImagePickerAsset {
  uri: string;
  type?: string;
  name?: string;
  width?: number;
  height?: number;
}

export interface LoginWithBiometricRequest extends LoginRequest {
  selfie: File | Blob | ImagePickerAsset | any;
  ine: File | Blob | ImagePickerAsset | any;
}

export interface LoginResponse {
  success?: boolean; // Optional because backend doesn't always send it
  token: string;
  user: User;
  message?: string;
  isNewDevice?: boolean;
  biometricVerification?: {
    verified: boolean;
    score: number;
    cosine_similarity: number;
    model: string;
    timestamp: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole[];
  colony?: string;
  domicilio?: string;
  impactSummary?: ImpactSummary;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  type: 'user' | 'admin';
}

export interface ImpactSummary {
  totalContributed: number;
  completedProjects: number;
  balanceContributed: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface TokenTimeResponse {
  success: boolean;
  timeRemaining: number;
  expiresAt: string;
}

export interface Device {
  deviceId: string;
  deviceName: string;
  lastLogin: string;
  active: boolean;
}
