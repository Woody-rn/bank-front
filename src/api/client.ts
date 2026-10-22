import type { ErrorResponse } from '../types/api';

const TOKEN_KEY = 'bank_token';
const USER_KEY = 'bank_user';

// Если переменная задана (прод) — используем её. Если нет (dev) — пустая строка, чтобы работал Vite Proxy.
const API_BASE = import.meta.env.VITE_API_URL || '';

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

    // Вот здесь мы подставляем API_BASE. Если он пустой (dev), запрос пойдет на /api/...
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        clearAuth();
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new ApiError(401, 'Сессия истекла, войдите заново');
    }

    if (!res.ok) {
        let message = `Ошибка ${res.status}`;
        try {
            const body = (await res.json()) as ErrorResponse;
            if (body?.message) message = body.message;
        } catch {
            // ignore
        }
        throw new ApiError(res.status, message);
    }

    const text = await res.text();
    if (!text) return undefined as T;

    try {
        return JSON.parse(text) as T;
    } catch {
        return text as unknown as T;
    }
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