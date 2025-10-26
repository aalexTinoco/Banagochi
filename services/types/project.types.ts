/**
 * Project Types
 */

export type ProjectStatus = 'VOTING' | 'FUNDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface Project {
  _id: string;
  title: string;
  description: string;
  proposerId: string;
  colonia: string;
  fundingGoal: number;
  currentAmount: number;
  status: ProjectStatus;
  active: boolean;
  supplierInfo: {
    account: string;
    name: string;
  };
  votingStats: {
    votes: number;
    votesNeeded: number;
    voters: string[];
  };
  fundingStats?: {
    contributors: number;
    averageContribution: number;
  };
  feedItems?: FeedItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  _id: string;
  type: 'MILESTONE' | 'ESCROW_PAYMENT' | 'UPDATE' | 'COMPLETED';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  proposerId: string;
  colonia: string;
  fundingGoal: number;
  currentAmount?: number;
  status?: ProjectStatus;
  active?: boolean;
  supplierInfo: {
    account: string;
    name: string;
  };
  votingStats: {
    votesNeeded: number;
  };
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  fundingGoal?: number;
}

export interface AddVoteRequest {
  voterId: string;
}

export interface AddFundingRequest {
  amount: number;
}

export interface AddFeedItemRequest {
  type: 'MILESTONE' | 'ESCROW_PAYMENT' | 'UPDATE' | 'COMPLETED';
  text: string;
  imageUrl?: string;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project;
  projects?: Project[];
  message?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  colonia?: string;
  active?: boolean;
}
