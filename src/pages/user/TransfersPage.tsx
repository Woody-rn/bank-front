import { useEffect, useState, type SubmitEvent } from 'react';
import {
    Box, Heading, Button, Input, Stack, Text, Card, NativeSelect,
    Table, Spinner, Center, Field, SimpleGrid
} from '@chakra-ui/react';
import { getMyCards } from '../../api/cards';
import { getTransferHistory, transfer } from '../../api/transfers';
import { toaster } from '../../components/ui/toaster';
import type { CardResponse, Page, TransferResponse } from '../../types/api';
import { Pagination } from '../../components/Pagination';

export function TransfersPage() {
    // Состояние карт
    const [cards, setCards] = useState<CardResponse[]>([]);
    const [loadingCards, setLoadingCards] = useState(true);

    // Форма перевода
    const [fromCardId, setFromCardId] = useState('');
    const [toCardId, setToCardId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // История
    const [historyCardId, setHistoryCardId] = useState('');
    const [historyPage, setHistoryPage] = useState(0);
    const [historyData, setHistoryData] = useState<Page<TransferResponse> | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Загружаем карты при монтировании (только активные)
    useEffect(() => {
        getMyCards(0, 100, 'ACTIVE')
            .then((res) => {
                setCards(res.content);
                if (res.content.length > 0) {
                    setFromCardId(String(res.content[0].id));
                    setHistoryCardId(String(res.content[0].id));
                    if (res.content.length > 1) {
                        setToCardId(String(res.content[1].id));
                    }
                }
            })
            .catch((e) => toaster.create({ title: 'Ошибка загрузки карт', description: e.message, type: 'error' }))
            .finally(() => setLoadingCards(false));
    }, []);

    // Загружаем историю при смене карты или страницы
    useEffect(() => {
        if (!historyCardId) return;
        setLoadingHistory(true);
        getTransferHistory(Number(historyCardId), historyPage, 5)
            .then(setHistoryData)
            .catch((e) => toaster.create({ title: 'Ошибка истории', description: e.message, type: 'error' }))
            .finally(() => setLoadingHistory(false));
    }, [historyCardId, historyPage]);

    async function handleTransfer(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (fromCardId === toCardId) {
            toaster.create({ title: 'Ошибка', description: 'Нельзя перевести на ту же карту', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            await transfer({
                fromCardId: Number(fromCardId),
                toCardId: Number(toCardId),
                amount: Number(amount),
                description: description || undefined,
            });
            toaster.create({ title: 'Успех', description: 'Перевод выполнен', type: 'success' });

            // Очищаем форму и обновляем историю
            setAmount('');
            setDescription('');
            setHistoryPage(0); // сбросит страницу и вызовет useEffect
            if (historyPage === 0) {
                // Если уже были на 0-й, принудительно дергаем обновление
                getTransferHistory(Number(historyCardId), 0, 5).then(setHistoryData);
            }
        } catch (err: any) {
            toaster.create({ title: 'Ошибка перевода', description: err.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingCards) return <Center h="50vh"><Spinner size="xl" /></Center>;

    if (cards.length < 2) {
        return (
            <Box>
                <Heading mb={6} size="lg">Переводы</Heading>
                <Text color="orange.500">Для переводов нужно минимум две активные карты.</Text>
            </Box>
        );
    }

    return (
        <Box>
            <Heading mb={6} size="lg">Переводы</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                {/* ЛЕВАЯ КОЛОНКА: ФОРМА */}
                <Card.Root>
                    <Card.Header>
                        <Heading size="md">Новый перевод</Heading>
                    </Card.Header>
                    <Card.Body>
                        <form onSubmit={handleTransfer}>
                            <Stack gap={4}>
                                <Field.Root>
                                    <Field.Label>С карты (списание)</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={fromCardId} onChange={(e) => setFromCardId(e.target.value)}>
                                            {cards.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.maskedNumber} ({c.balance.toFixed(2)} ₽)
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>На карту (зачисление)</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={toCardId} onChange={(e) => setToCardId(e.target.value)}>
                                            {cards.filter(c => String(c.id) !== fromCardId).map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.maskedNumber}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Сумма (₽)</Field.Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Описание (необязательно)</Field.Label>
                                    <Input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Например: за обед"
                                    />
                                </Field.Root>

                                <Button type="submit" colorPalette="blue" loading={submitting} w="full">
                                    Перевести
                                </Button>
                            </Stack>
                        </form>
                    </Card.Body>
                </Card.Root>

                {/* ПРАВАЯ КОЛОНКА: ИСТОРИЯ */}
                <Card.Root>
                    <Card.Header>
                        <Heading size="md">История операций</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Stack mb={4}>
                            <NativeSelect.Root size="sm">
                                <NativeSelect.Field
                                    value={historyCardId}
                                    onChange={(e) => { setHistoryCardId(e.target.value); setHistoryPage(0); }}
                                >
                                    {cards.map((c) => (
                                        <option key={c.id} value={c.id}>{c.maskedNumber}</option>
                                    ))}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                            </NativeSelect.Root>
                        </Stack>

                        {loadingHistory ? (
                            <Center py={8}><Spinner /></Center>
                        ) : !historyData || historyData.content.length === 0 ? (
                            <Text color="gray.500" textAlign="center" py={4}>Переводов пока нет</Text>
                        ) : (
                            <>
                                <Table.Root size="sm" variant="line">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeader>Откуда</Table.ColumnHeader>
                                            <Table.ColumnHeader>Куда</Table.ColumnHeader>
                                            <Table.ColumnHeader textAlign="end">Сумма</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {historyData.content.map((t) => (
                                            <Table.Row key={t.id}>
                                                <Table.Cell fontSize="xs">{t.fromMaskedNumber}</Table.Cell>
                                                <Table.Cell fontSize="xs">{t.toMaskedNumber}</Table.Cell>
                                                <Table.Cell textAlign="end" fontWeight="bold" color={t.fromMaskedNumber === cards.find(c => String(c.id) === historyCardId)?.maskedNumber ? "red.500" : "green.500"}>
                                                    {t.amount.toFixed(2)} ₽
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>

                                {historyData.totalPages > 1 && (
                                    <Pagination
                                        page={historyPage}
                                        totalPages={historyData.totalPages}
                                        onPageChange={setHistoryPage}
                                    />
                                )}
                            </>
                        )}
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>
        </Box>
    );
}