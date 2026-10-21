// ===== Enums =====
export type Role = 'ADMIN' | 'USER';
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
export type BlockRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ===== Auth =====
export interface LoginRequest {
    username: string;
    password: string;
}

export interface JwtResponse {
    token: string;
    username: string;
    role: Role;
}

// ===== User =====
export interface User {
    id: number;
    username: string;
    email: string;
    role: Role;
    enabled: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
    role: Role;
}

// ===== Card =====
export interface CardResponse {
    id: number;
    maskedNumber: string;
    cardHolderName: string;
    expiryDate: string;
    status: CardStatus;
    balance: number;
    createdAt: string;
}

export interface CardRequest {
    cardHolderName: string;
    expiryMonth: number;
    expiryYear: number;
    userId?: number;
}

// ===== Transfer =====
export interface TransferRequest {
    fromCardId: number;
    toCardId: number;
    amount: number;
    description?: string;
}

export interface TransferResponse {
    id: number;
    fromMaskedNumber: string;
    toMaskedNumber: string;
    amount: number;
    description: string | null;
    createdAt: string;
}

// ===== Block request =====
export interface BlockRequest {
    id: number;
    cardId: number;
    cardHolderName: string;
    userId: number;
    username: string;
    status: BlockRequestStatus;
    createdAt: string;
}

// ===== Pagination (Spring Page) =====
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

// ===== Error =====
export interface ErrorResponse {
    status: number;
    message: string;
    timestamp: string;
}