/**
 * Transaction Types
 */

export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionSource = 'ONE_TIME' | 'PAYROLL_DEDUCTION';

export interface Transaction {
  _id: string;
  userId: string;
  projectId: string;
  amount: number;
  status: TransactionStatus;
  source: TransactionSource;
  asideId?: string;
  metadata?: {
    payrollCycle?: string;
    receiptNumber?: string;
  };
  createdAt: string;
  processedAt?: string;
}

export interface CreateOneTimeTransactionRequest {
  userId: string;
  projectId: string;
  amount: number;
}

export interface TransactionResponse {
  success: boolean;
  transaction?: Transaction;
  transactions?: Transaction[];
  message?: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  projectId?: string;
  source?: TransactionSource;
}

export interface UserDashboard {
  totalContributed: number;
  activeProjects: number;
  completedProjects: number;
  monthlyCommitment: number;
  recentTransactions: Transaction[];
  projectBreakdown: Array<{
    projectId: string;
    projectTitle: string;
    totalContributed: number;
    transactionCount: number;
  }>;
}
