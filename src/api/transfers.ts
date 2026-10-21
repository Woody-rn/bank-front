import { api } from './client';
import type { Page, TransferRequest, TransferResponse } from '../types/api';

export function transfer(data: TransferRequest): Promise<TransferResponse> {
    return api.post('/api/user/transfers', data);
}

export function getTransferHistory(
    cardId: number,
    page = 0,
    size = 10,
): Promise<Page<TransferResponse>> {
    const params = new URLSearchParams({
        cardId: String(cardId),
        page: String(page),
        size: String(size),
    });
    return api.get(`/api/user/transfers?${params.toString()}`);
}