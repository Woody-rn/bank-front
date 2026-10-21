import {useEffect, useState, type ChangeEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box, Heading, Table, Badge, Button, NativeSelect, Spinner,
    Center, Text, Stack,
} from '@chakra-ui/react';
import {getMyCards} from '../../api/cards';
import type {CardResponse, CardStatus, Page} from '../../types/api';
import {Pagination} from '../../components/Pagination';

const statusMap: Record<CardStatus, { label: string; color: string }> = {
    ACTIVE: {label: 'Активна', color: 'green'},
    BLOCKED: {label: 'Заблокирована', color: 'red'},
    EXPIRED: {label: 'Истекла', color: 'gray'},
};

export function MyCardsPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState<CardStatus | ''>('');
    const [data, setData] = useState<Page<CardResponse> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getMyCards(page, 10, status || undefined)
            .then(setData)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [page, status]);

    function handleStatusChange(e: ChangeEvent<HTMLSelectElement>) {
        setStatus(e.target.value as CardStatus | '');
        setPage(0);
    }

    if (loading) return <Center h="50vh"><Spinner size="xl"/></Center>;
    if (error) return <Text color="red.500">{error}</Text>;

    return (
        <Box>
            <Heading mb={6} size="lg">Мои карты</Heading>

            <Stack mb={4} direction="row" align="center">
                <Text fontSize="sm" fontWeight="bold">Фильтр по статусу:</Text>
                <NativeSelect.Root size="sm" w="200px">
                    <NativeSelect.Field value={status} onChange={handleStatusChange}>
                        <option value="">Все</option>
                        <option value="ACTIVE">Активные</option>
                        <option value="BLOCKED">Заблокированные</option>
                        <option value="EXPIRED">Истекшие</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator/>
                </NativeSelect.Root>
            </Stack>

            <Box bg="white" borderRadius="md" boxShadow="sm" overflow="hidden">
                <Table.Root variant="line">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Номер</Table.ColumnHeader>
                            <Table.ColumnHeader>Владелец</Table.ColumnHeader>
                            <Table.ColumnHeader>Срок</Table.ColumnHeader>
                            <Table.ColumnHeader>Статус</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Баланс</Table.ColumnHeader>
                            <Table.ColumnHeader>Действия</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {/* Если данных нет или список пуст — показываем заглушку внутри таблицы */}
                        {!data || data.content.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={6} textAlign="center" py={8} color="gray.500">
                                    {data?.empty ? 'Карт с таким статусом не найдено' : 'У вас пока нет карт'}
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            data.content.map((card) => {
                                const st = statusMap[card.status];
                                return (
                                    <Table.Row key={card.id}>
                                        <Table.Cell fontWeight="mono">{card.maskedNumber}</Table.Cell>
                                        <Table.Cell>{card.cardHolderName}</Table.Cell>
                                        <Table.Cell>{card.expiryDate}</Table.Cell>
                                        <Table.Cell>
                                            <Badge colorPalette={st.color}>{st.label}</Badge>
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">{card.balance.toFixed(2)} ₽</Table.Cell>
                                        <Table.Cell>
                                            <Button size="xs" variant="outline"
                                                    onClick={() => navigate(`/user/cards/${card.id}`)}>
                                                Подробнее
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Пагинация рендерится только если данные есть */}
            {data && (
                <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage}/>
            )}
        </Box>
    );
}