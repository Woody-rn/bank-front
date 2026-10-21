import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Heading, Text, Button, Spinner, Center, Stack,
    Badge, Card, SimpleGrid, HStack,
} from '@chakra-ui/react';
import { getMyCard, requestBlock } from '../../api/cards';
import { toaster } from '../../components/ui/toaster';
import type { CardResponse, CardStatus } from '../../types/api';

const statusMap: Record<CardStatus, { label: string; color: string }> = {
    ACTIVE: { label: 'Активна', color: 'green' },
    BLOCKED: { label: 'Заблокирована', color: 'red' },
    EXPIRED: { label: 'Истекла', color: 'gray' },
};

export function CardDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [card, setCard] = useState<CardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [blocking, setBlocking] = useState(false);

    useEffect(() => {
        if (!id) return;
        getMyCard(Number(id))
            .then(setCard)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleBlockRequest() {
        if (!card) return;
        setBlocking(true);
        try {
            await requestBlock(card.id);
            toaster.create({
                title: 'Заявка отправлена',
                description: 'Ожидайте подтверждения администратора.',
                type: 'success',
            });
        } catch (e: any) {
            toaster.create({
                title: 'Ошибка',
                description: e.message,
                type: 'error'
            });
        } finally {
            setBlocking(false);
        }
    }

    if (loading) return <Center h="50vh"><Spinner size="xl" /></Center>;
    if (error || !card) return <Text color="red.500">{error || 'Карта не найдена'}</Text>;

    const st = statusMap[card.status];

    return (
        <Box>
            <HStack mb={6} justify="space-between">
                <Heading size="lg">Карта {card.maskedNumber}</Heading>
                <Button variant="ghost" onClick={() => navigate(-1)}>← Назад</Button>
            </HStack>

            <Card.Root maxW="600px">
                <Card.Body>
                    <SimpleGrid columns={2} gap={6}>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Владелец</Text>
                            <Text fontWeight="bold">{card.cardHolderName}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Срок действия</Text>
                            <Text fontWeight="bold">{card.expiryDate}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Статус</Text>
                            <Badge colorPalette={st.color} mt={1}>{st.label}</Badge>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">Баланс</Text>
                            <Text fontWeight="bold" fontSize="xl" color="blue.600">
                                {card.balance.toFixed(2)} ₽
                            </Text>
                        </Box>
                    </SimpleGrid>

                    <Stack mt={8} direction="row">
                        {card.status === 'ACTIVE' && (
                            <Button
                                colorPalette="red"
                                variant="outline"
                                loading={blocking}
                                onClick={handleBlockRequest}
                            >
                                Запросить блокировку
                            </Button>
                        )}
                    </Stack>
                </Card.Body>
            </Card.Root>
        </Box>
    );
}