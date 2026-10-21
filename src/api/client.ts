import type { ErrorResponse } from '../types/api';

const TOKEN_KEY = 'bank_token';
const USER_KEY = 'bank_user';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export interface StoredUser {
    username: string;
    role: 'ADMIN' | 'USER';
}

export function getStoredUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export function setStoredUser(user: StoredUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(path, { ...options, headers });

    if (res.status === 401) {
        // токен истёк или невалиден — чистим и кидаем ошибку наверх
        clearAuth();
        throw new ApiError(401, 'Сессия истекла, войдите заново');
    }

    if (!res.ok) {
        let message = `Ошибка ${res.status}`;
        try {
            const body = (await res.json()) as ErrorResponse;
            if (body?.message) message = body.message;
        } catch {
            // тело не JSON — оставляем дефолтное сообщение
        }
        throw new ApiError(res.status, message);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: 'PUT',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};