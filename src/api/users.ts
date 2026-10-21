import { api } from './client';
import type { CreateUserRequest, Page, User } from '../types/api';

export function getUsers(page = 0, size = 10): Promise<Page<User>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return api.get(`/api/admin/users?${params.toString()}`);
}

export function getUser(id: number): Promise<User> {
    return api.get(`/api/admin/users/${id}`);
}

export function createUser(data: CreateUserRequest): Promise<User> {
    return api.post('/api/admin/users', data);
}

export function deleteUser(id: number): Promise<void> {
    return api.delete(`/api/admin/users/${id}`);
}