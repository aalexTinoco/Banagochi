/**
 * Payroll Aside (Apartado) Types
 */

export type AsideFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type AsideStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface Aside {
  _id: string;
  userId: string;
  projectId: string;
  amountPerCycle: number;
  frequency: AsideFrequency;
  status: AsideStatus;
  totalContributed: number;
  cyclesCompleted: number;
  nextDeduction: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAsideRequest {
  userId: string;
  projectId: string;
  amountPerCycle: number;
  frequency: AsideFrequency;
}

export interface UpdateAsideAmountRequest {
  amountPerCycle: number;
}

export interface AsideResponse {
  success: boolean;
  aside?: Aside;
  asides?: Aside[];
  summary?: AsideSummary;
  message?: string;
}

export interface AsideSummary {
  totalAsides: number;
  totalMonthlyCommitment: number;
  totalContributed: number;
}
