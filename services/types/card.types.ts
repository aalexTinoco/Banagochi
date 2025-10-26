/**
 * Credit Card Types
 */

export type CardType = 'banortemujer' | 'banorteclasica' | 'banorteoro';

export interface CreditCard {
  _id: string;
  userId: string;
  cardNumber: string;
  holderName: string;
  expiry: string;
  type: CardType;
  maxCredit: number;
  creditUsed: number;
  cutoffDay: number;
  status: 'active' | 'blocked' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  userId: string;
  cardNumber: string;
  holderName: string;
  expiry: string;
  type: CardType;
  maxCredit: number;
  cutoffDay: number;
}

export interface UpdateCardRequest {
  maxCredit?: number;
  cutoffDay?: number;
  creditUsed?: number;
  status?: 'active' | 'blocked' | 'cancelled';
}

export interface CardResponse {
  success: boolean;
  card?: CreditCard;
  cards?: CreditCard[];
  message?: string;
}
