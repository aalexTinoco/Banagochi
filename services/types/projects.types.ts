/**
 * Projects Types
 */

export interface FeedItem {
  type: 'MILESTONE' | 'ESCROW_PAYMENT' | 'UPDATE' | 'COMPLETED';
  timestamp: string;
  text: string;
  imageUrl?: string;
}

export interface VotingStats {
  votesNeeded: number;
  votesFor: number;
  voters: string[]; // User IDs
}

export interface SupplierInfo {
  name: string;
  account: string; // CLABE del proveedor
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  colonia: string;
  proposerId: string;

  // Estado y gobernanza
  status: 'VOTING' | 'FUNDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  votingStats: VotingStats;

  // Fondeo
  fundingGoal: number;
  currentAmount: number;
  fundingDeadline?: string;

  // Escrow / Transparencia
  supplierInfo: SupplierInfo;

  // Feed de noticias
  feed: FeedItem[];

  creationDate: string;
  updatedDate?: string;
  deleteDate?: string;
  active: boolean;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  coverImage?: string;
  colonia: string;
  fundingGoal: number;
  fundingDeadline?: string;
  supplierInfo: SupplierInfo;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  fundingGoal?: number;
  fundingDeadline?: string;
  supplierInfo?: SupplierInfo;
}

export interface VoteRequest {
  userId: string;
}

export interface FundingRequest {
  userId: string;
  amount: number;
  cardId: string;
}

export interface AddFeedRequest {
  type: 'MILESTONE' | 'ESCROW_PAYMENT' | 'UPDATE' | 'COMPLETED';
  text: string;
  imageUrl?: string;
}

export interface ProjectsResponse {
  success: boolean;
  count?: number;
  data?: Project[];
  projects?: Project[]; // Backward compatibility
  message?: string;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project;
  project?: Project; // Backward compatibility
  message?: string;
}
