/**
 * Types and Interfaces for Banagochi API
 * Centralized type definitions for the mobile app
 */

// ============================================
// AUTH & USER TYPES
// ============================================

export interface IRole {
  type: 'admin' | 'user' | 'moderator';
}

export interface IDevice {
  deviceId: string;
  deviceName?: string;
  token: string;
  lastLogin: Date;
}

export interface IBanorteAccount {
  number: string;
  alias?: string;
  linked: boolean;
  balance: number;
}

export interface IImpactSummary {
  totalContributed: number;
  completedProjects: number;
  balanceContributed?: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: IRole[];
  devices: IDevice[];
  colony?: string;
  domicilio?: string;
  banorteAccount?: IBanorteAccount;
  savedProjects?: string[];
  votedProjects?: string[];
  proposedProjects?: string[];
  impactSummary?: IImpactSummary;
  creationDate: Date;
  deleteDate?: Date;
  status: boolean;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 'VOTING' | 'FUNDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type FeedItemType = 'MILESTONE' | 'ESCROW_PAYMENT' | 'UPDATE' | 'COMPLETED';

export interface IFeedItem {
  type: FeedItemType;
  timestamp: Date;
  text: string;
  imageUrl?: string;
}

export interface IVotingStats {
  votesNeeded: number;
  votesFor: number;
  voters: string[];
}

export interface ISupplierInfo {
  name: string;
  account: string;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  colonia: string;
  proposerId: string | IUser;
  status: ProjectStatus;
  votingStats: IVotingStats;
  fundingGoal: number;
  currentAmount: number;
  fundingDeadline?: Date;
  supplierInfo: ISupplierInfo;
  feed: IFeedItem[];
  creationDate: Date;
  updatedDate?: Date;
  deleteDate?: Date;
  active: boolean;
}

// ============================================
// ASIDE (APARTADO) TYPES
// ============================================

export type AsideFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type AsideStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface IAside {
  _id: string;
  userId: string | IUser;
  projectId: string | IProject;
  amountPerCycle: number;
  frequency: AsideFrequency;
  status: AsideStatus;
  totalContributed: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAsideSummary {
  total: number;
  active: number;
  paused: number;
  cancelled: number;
  totalContributed: number;
  monthlyCommitment: number;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionSource = 'PAYROLL_DEDUCTION' | 'ONE_TIME';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface ITransaction {
  _id: string;
  userId: string | IUser;
  projectId: string | IProject;
  amount: number;
  source: TransactionSource;
  apartadoId?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ITransactionSummary {
  total: number;
  totalAmount: number;
  byStatus: {
    completed: number;
    pending: number;
    failed: number;
  };
  bySource: {
    oneTime: number;
    payroll: number;
  };
}

// ============================================
// CREDIT CARD TYPES
// ============================================

export type CardType = 'banortemujer' | 'banorteclasica' | 'banorteoro';
export type CardStatus = 'active' | 'inactive' | 'blocked';

export interface ICreditCard {
  _id: string;
  userId: string | IUser;
  cardNumber: string;
  holderName: string;
  expiry: string;
  type: CardType;
  maxCredit: number;
  creditUsed: number;
  cutoffDay: number;
  status: CardStatus;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================
// MENU TYPES
// ============================================

export interface IMenu {
  _id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  roles: IRole[];
  status: boolean;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: IRole[];
  colony?: string;
  domicilio?: string;
  selfie?: File | Blob;
  ine?: File | Blob;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
  deviceName?: string;
  selfie?: File | Blob;
  ine?: File | Blob;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  coverImage?: string;
  colonia: string;
  proposerId: string;
  fundingGoal: number;
  votingStats: {
    votesNeeded: number;
  };
  supplierInfo: ISupplierInfo;
  fundingDeadline?: Date;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  status?: ProjectStatus;
  fundingGoal?: number;
  fundingDeadline?: Date;
}

export interface CreateAsideRequest {
  userId: string;
  projectId: string;
  amountPerCycle: number;
  frequency: AsideFrequency;
}

export interface CreateTransactionRequest {
  userId: string;
  projectId: string;
  amount: number;
}

export interface AddVoteRequest {
  voterId: string;
}

export interface AddFundingRequest {
  amount: number;
}

export interface AddFeedItemRequest {
  type: FeedItemType;
  text: string;
  imageUrl?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: IRole[];
  status?: boolean;
  colony?: string;
  domicilio?: string;
  impactSummary?: IImpactSummary;
}

export interface UpdateBanorteAccountRequest {
  number?: string;
  alias?: string;
  linked?: boolean;
  balance?: number;
}

export interface CreateCreditCardRequest {
  userId: string;
  cardNumber: string;
  holderName: string;
  expiry: string;
  type: CardType;
  maxCredit: number;
  cutoffDay: number;
}

export interface UpdateCreditCardRequest {
  maxCredit?: number;
  creditUsed?: number;
  cutoffDay?: number;
  status?: CardStatus;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  isNewDevice?: boolean;
  biometricVerification?: any;
  user: {
    id: string;
    name: string;
    email: string;
    role: IRole[];
  };
}

export interface ProjectsResponse {
  success: boolean;
  count: number;
  data: IProject[];
}

export interface AsideResponse {
  message: string;
  aside: IAside;
}

export interface AsidesResponse {
  message: string;
  summary: IAsideSummary;
  asides: IAside[];
}

export interface TransactionResponse {
  message: string;
  transaction: ITransaction;
}

export interface TransactionsResponse {
  message: string;
  summary: ITransactionSummary;
  transactions: ITransaction[];
}

export interface ImpactDashboard {
  message: string;
  dashboard: {
    totalContributed: number;
    projectsSupported: number;
    activeAsides: number;
    monthlyCommitment: number;
    byCategory: { [key: string]: number };
    recentTransactions: ITransaction[];
  };
}

export interface PayrollProcessResult {
  message: string;
  results: {
    processed: number;
    failed: number;
    total: number;
  };
}

export interface CreditCardResponse {
  message?: string;
  card?: ICreditCard;
  cards?: ICreditCard[];
  _id?: string;
}

// ============================================
// FILTERS & QUERY PARAMS
// ============================================

export interface ProjectFilters {
  status?: ProjectStatus;
  colonia?: string;
  active?: boolean;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  projectId?: string;
  source?: TransactionSource;
}

export interface AsideFilters {
  status?: AsideStatus;
}
