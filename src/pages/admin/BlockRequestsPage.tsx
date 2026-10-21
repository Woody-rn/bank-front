import { useEffect, useState } from 'react';
import {
    Box, Heading, Table, Button, Spinner, Center, Text, HStack
} from '@chakra-ui/react';
import { getPendingRequests, approveRequest, rejectRequest } from '../../api/blockRequests';
import { toaster } from '../../components/ui/toaster';
import type { BlockRequest, Page } from '../../types/api';
import { Pagination } from '../../components/Pagination';

export function BlockRequestsPage() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<Page<BlockRequest> | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const loadData = () => {
        setLoading(true);
        getPendingRequests(page, 10)
            .then(setData)
            .catch((e) => toaster.create({ title: 'Ошибка', description: e.message, type: 'error' }))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, [page]);

    async function handleAction(id: number, action: 'approve' | 'reject') {
        setActionLoadingId(id);
        try {
            if (action === 'approve') {
                await approveRequest(id);
                toaster.create({ title: 'Заявка одобрена', description: 'Карта заблокирована', type: 'success' });
            } else {
                await rejectRequest(id);
                toaster.create({ title: 'Заявка отклонена', type: 'info' });
            }
            loadData(); // перезагружаем список
        } catch (err: any) {
            toaster.create({ title: 'Ошибка', description: err.message, type: 'error' });
        } finally {
            setActionLoadingId(null);
        }
    }

    if (loading) return <Center h="50vh"><Spinner size="xl" /></Center>;

    return (
        <Box>
            <Heading mb={6} size="lg">Заявки на блокировку</Heading>

            <Box bg="white" borderRadius="md" boxShadow="sm" overflow="hidden">
                <Table.Root variant="line">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Пользователь</Table.ColumnHeader>
                            <Table.ColumnHeader>Карта (ID)</Table.ColumnHeader>
                            <Table.ColumnHeader>Дата создания</Table.ColumnHeader>
                            <Table.ColumnHeader>Действия</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {!data || data.content.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={5} textAlign="center" py={8} color="gray.500">
                                    Нет активных заявок
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            data.content.map((req) => (
                                <Table.Row key={req.id}>
                                    <Table.Cell>{req.id}</Table.Cell>

                                    {/* Используем новые поля из DTO */}
                                    <Table.Cell fontWeight="bold">
                                        {req.username || `ID: ${req.userId}`}
                                    </Table.Cell>

                                    {/* Используем новые поля из DTO */}
                                    <Table.Cell>
                                        {req.cardHolderName || '—'}
                                        <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                                            (ID: {req.cardId})
                                        </Text>
                                    </Table.Cell>

                                    <Table.Cell>{new Date(req.createdAt).toLocaleString('ru-RU')}</Table.Cell>
                                    <Table.Cell>
                                        <HStack gap={2}>
                                            <Button
                                                size="xs"
                                                colorPalette="green"
                                                variant="outline"
                                                loading={actionLoadingId === req.id}
                                                onClick={() => handleAction(req.id, 'approve')}
                                            >
                                                Одобрить
                                            </Button>
                                            <Button
                                                size="xs"
                                                colorPalette="red"
                                                variant="outline"
                                                loading={actionLoadingId === req.id}
                                                onClick={() => handleAction(req.id, 'reject')}
                                            >
                                                Отклонить
                                            </Button>
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>

            {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
        </Box>
    );
}