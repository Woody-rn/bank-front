import {api} from './client';
import type {BlockRequest, Page} from '../types/api';

export function getPendingRequests(page = 0, size = 10): Promise<Page<BlockRequest>> {
    const params = new URLSearchParams({page: String(page), size: String(size)});
    return api.get(`/api/admin/block-requests?${params.toString()}`);
}

export function approveRequest(id: number): Promise<BlockRequest> {
    return api.put(`/api/admin/block-requests/${id}/approve`);
}

export function rejectRequest(id: number): Promise<BlockRequest> {
    return api.put(`/api/admin/block-requests/${id}/reject`);
}