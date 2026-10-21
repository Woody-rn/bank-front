import {api} from './client';
import type {CardRequest, CardResponse, CardStatus, Page} from '../types/api';

// ===== USER =====
export function getMyCards(
    page = 0,
    size = 10,
    status?: CardStatus,
): Promise<Page<CardResponse>> {
    const params = new URLSearchParams({page: String(page), size: String(size)});
    if (status) params.set('status', status);
    return api.get(`/api/user/cards?${params.toString()}`);
}

export function getMyCard(id: number): Promise<CardResponse> {
    return api.get(`/api/user/cards/${id}`);
}

export function requestBlock(id: number): Promise<void> {
    return api.post(`/api/user/cards/${id}/block-request`, {});
}

// ===== ADMIN =====
export function getAllCards(page = 0, size = 10): Promise<Page<CardResponse>> {
    const params = new URLSearchParams({page: String(page), size: String(size)});
    return api.get(`/api/admin/cards?${params.toString()}`);
}

export function createCard(data: CardRequest): Promise<CardResponse> {
    return api.post('/api/admin/cards', data);
}

export function blockCard(id: number): Promise<CardResponse> {
    return api.put(`/api/admin/cards/${id}/block`);
}

export function activateCard(id: number): Promise<CardResponse> {
    return api.put(`/api/admin/cards/${id}/activate`);
}

export function deleteCard(id: number): Promise<void> {
    return api.delete(`/api/admin/cards/${id}`);
}