import {api, setToken, setStoredUser} from './client';
import type {JwtResponse, LoginRequest} from '../types/api';

export async function login(data: LoginRequest): Promise<JwtResponse> {
    const res = await api.post<JwtResponse>('/api/auth/login', data);
    setToken(res.token);
    setStoredUser({username: res.username, role: res.role});
    return res;
}