import {useEffect, useState, type SubmitEvent} from 'react';
import {
    Box, Heading, Table, Badge, Button, Spinner, Center,
    Dialog, Field, Input, NativeSelect, Portal, Stack, HStack
} from '@chakra-ui/react';
import {getAllCards, createCard, blockCard, activateCard, deleteCard} from '../../api/cards';
import {getUsers} from '../../api/users';
import {toaster} from '../../components/ui/toaster';
import type {CardResponse, CardStatus, Page, User} from '../../types/api';
import {Pagination} from '../../components/Pagination';

const statusMap: Record<CardStatus, { label: string; color: string }> = {
    ACTIVE: {label: 'Активна', color: 'green'},
    BLOCKED: {label: 'Заблокирована', color: 'red'},
    EXPIRED: {label: 'Истекла', color: 'gray'},
};

export function AllCardsPage() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<Page<CardResponse> | null>(null);
    const [loading, setLoading] = useState(true);

    // Модалка создания карты
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [createLoading, setCreateLoading] = useState(false);

    const [userId, setUserId] = useState('');
    const [holderName, setHolderName] = useState('');
    const [expMonth, setExpMonth] = useState('12');
    const [expYear, setExpYear] = useState('2030');

    const loadCards = () => {
        setLoading(true);
        getAllCards(page, 10)
            .then(setData)
            .catch((e) => toaster.create({title: 'Ошибка', description: e.message, type: 'error'}))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCards();
    }, [page]);

    useEffect(() => {
        if (isOpen && users.length === 0) {
            getUsers(0, 100).then((res) => {
                setUsers(res.content);
                if (res.content.length > 0) setUserId(String(res.content[0].id));
            });
        }
    }, [isOpen]);

    async function handleCreate(e: SubmitEvent) {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await createCard({
                cardHolderName: holderName,
                expiryMonth: Number(expMonth),
                expiryYear: Number(expYear),
                userId: Number(userId),
            });
            toaster.create({title: 'Успех', description: 'Карта создана', type: 'success'});
            setIsOpen(false);
            setHolderName('');
            setPage(0);
            loadCards();
        } catch (err: any) {
            toaster.create({title: 'Ошибка', description: err.message, type: 'error'});
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleToggleStatus(card: CardResponse) {
        try {
            if (card.status === 'ACTIVE') {
                await blockCard(card.id);
                toaster.create({title: 'Карта заблокирована', type: 'success'});
            } else {
                await activateCard(card.id);
                toaster.create({title: 'Карта активирована', type: 'success'});
            }
            loadCards();
        } catch (err: any) {
            toaster.create({title: 'Ошибка', description: err.message, type: 'error'});
        }
    }

    async function handleDeleteCard(card: CardResponse) {
        if (!window.confirm(`Удалить карту ${card.maskedNumber}?`)) return;
        try {
            await deleteCard(card.id);
            toaster.create({title: 'Карта удалена', type: 'success'});
            loadCards();
        } catch (err: any) {
            toaster.create({title: 'Ошибка', description: err.message, type: 'error'});
        }
    }

    if (loading) return <Center h="50vh"><Spinner size="xl"/></Center>;

    return (
        <Box>
            <Stack direction="row" justify="space-between" align="center" mb={6}>
                <Heading size="lg">Все карты</Heading>
                <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                    <Dialog.Trigger asChild>
                        <Button colorPalette="blue">Создать карту</Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop/>
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <form onSubmit={handleCreate}>
                                    <Dialog.Header>
                                        <Dialog.Title>Новая карта</Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                        <Stack gap={4}>
                                            <Field.Root>
                                                <Field.Label>Пользователь</Field.Label>
                                                <NativeSelect.Root>
                                                    <NativeSelect.Field value={userId}
                                                                        onChange={(e) => setUserId(e.target.value)}>
                                                        {users.map(u => <option key={u.id}
                                                                                value={u.id}>{u.username} ({u.role})</option>)}
                                                    </NativeSelect.Field>
                                                    <NativeSelect.Indicator/>
                                                </NativeSelect.Root>
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Имя владельца</Field.Label>
                                                <Input value={holderName}
                                                       onChange={(e) => setHolderName(e.target.value)}
                                                       placeholder="IVAN IVANOV" required/>
                                            </Field.Root>
                                            <Stack direction="row" gap={4}>
                                                <Field.Root>
                                                    <Field.Label>Месяц (1-12)</Field.Label>
                                                    <Input type="number" min="1" max="12" value={expMonth}
                                                           onChange={(e) => setExpMonth(e.target.value)} required/>
                                                </Field.Root>
                                                <Field.Root>
                                                    <Field.Label>Год</Field.Label>
                                                    <Input type="number" min="2024" value={expYear}
                                                           onChange={(e) => setExpYear(e.target.value)} required/>
                                                </Field.Root>
                                            </Stack>
                                        </Stack>
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                        <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
                                        <Button type="submit" colorPalette="blue"
                                                loading={createLoading}>Создать</Button>
                                    </Dialog.Footer>
                                </form>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </Stack>

            <Box bg="white" borderRadius="md" boxShadow="sm" overflow="hidden">
                <Table.Root variant="line">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Номер</Table.ColumnHeader>
                            <Table.ColumnHeader>Владелец</Table.ColumnHeader>
                            <Table.ColumnHeader>Статус</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Баланс</Table.ColumnHeader>
                            <Table.ColumnHeader>Действия</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {!data || data.content.length === 0 ? (
                            <Table.Row><Table.Cell colSpan={5} textAlign="center" py={8}>Нет
                                карт</Table.Cell></Table.Row>
                        ) : (
                            data.content.map((card) => {
                                const st = statusMap[card.status];
                                return (
                                    <Table.Row key={card.id}>
                                        <Table.Cell fontWeight="mono">{card.maskedNumber}</Table.Cell>
                                        <Table.Cell>{card.cardHolderName}</Table.Cell>
                                        <Table.Cell><Badge colorPalette={st.color}>{st.label}</Badge></Table.Cell>
                                        <Table.Cell textAlign="end">{card.balance.toFixed(2)} ₽</Table.Cell>
                                        <Table.Cell>
                                            <HStack gap={2}>
                                                {card.status === 'ACTIVE' ? (
                                                    <Button size="xs" colorPalette="red" variant="outline"
                                                            onClick={() => handleToggleStatus(card)}>
                                                        Блокировать
                                                    </Button>
                                                ) : (
                                                    <Button size="xs" colorPalette="green" variant="outline"
                                                            onClick={() => handleToggleStatus(card)}>
                                                        Активировать
                                                    </Button>
                                                )}
                                                <Button size="xs" colorPalette="gray" variant="outline"
                                                        onClick={() => handleDeleteCard(card)}>
                                                    Удалить
                                                </Button>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>
            {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage}/>}
        </Box>
    );
}