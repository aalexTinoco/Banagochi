/**
 * Credit Card Types
 */

export type CardType = 'banortemujer' | 'banorteclasica' | 'banorteoro';

export interface CreditCard {
  _id: string;
  user?: string; // Backend usa 'user' en lugar de 'userId'
  userId?: string; // Para compatibilidad
  cardNumber?: string; // Opcional, ya que el backend puede no devolverlo
  last4?: string; // Los últimos 4 dígitos de la tarjeta
  holderName: string;
  expiry: string;
  type: CardType;
  linked?: boolean; // Backend agrega este campo
  maxCredit: number;
  creditUsed: number;
  cutoffDay: number;
  status: 'active' | 'blocked' | 'cancelled';
  createdAt: string;
  updatedAt?: string; // Opcional
  __v?: number; // Campo de versión de MongoDB
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
