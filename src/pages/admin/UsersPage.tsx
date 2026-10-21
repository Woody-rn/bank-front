import { useEffect, useState, type SubmitEvent } from 'react';
import {
    Box, Heading, Table, Badge, Button, Spinner, Center,
    Dialog, Field, Input, NativeSelect, Portal, Stack
} from '@chakra-ui/react';
import { getUsers, createUser } from '../../api/users';
import { toaster } from '../../components/ui/toaster';
import type { Page, User, Role } from '../../types/api';
import { Pagination } from '../../components/Pagination';

export function UsersPage() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<Page<User> | null>(null);
    const [loading, setLoading] = useState(true);

    // Модалка создания
    const [isOpen, setIsOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('USER');

    const loadUsers = () => {
        setLoading(true);
        getUsers(page, 10)
            .then(setData)
            .catch((e) => toaster.create({ title: 'Ошибка', description: e.message, type: 'error' }))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, [page]);

    async function handleCreate(e: SubmitEvent) {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await createUser({ username, password, email, role });
            toaster.create({ title: 'Успех', description: 'Пользователь создан', type: 'success' });
            setIsOpen(false);
            setUsername(''); setPassword(''); setEmail(''); setRole('USER');
            setPage(0);
            loadUsers();
        } catch (err: any) {
            toaster.create({ title: 'Ошибка', description: err.message, type: 'error' });
        } finally {
            setCreateLoading(false);
        }
    }

    if (loading) return <Center h="50vh"><Spinner size="xl" /></Center>;

    return (
        <Box>
            <Stack direction="row" justify="space-between" align="center" mb={6}>
                <Heading size="lg">Пользователи</Heading>

                <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                    <Dialog.Trigger asChild>
                        <Button colorPalette="blue">Добавить</Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <form onSubmit={handleCreate}>
                                    <Dialog.Header>
                                        <Dialog.Title>Новый пользователь</Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                        <Stack gap={4}>
                                            <Field.Root>
                                                <Field.Label>Логин (3-50 символов)</Field.Label>
                                                <Input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Пароль (5-20 символов)</Field.Label>
                                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={5} />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Email</Field.Label>
                                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Роль</Field.Label>
                                                <NativeSelect.Root>
                                                    <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value as Role)}>
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </NativeSelect.Field>
                                                    <NativeSelect.Indicator />
                                                </NativeSelect.Root>
                                            </Field.Root>
                                        </Stack>
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                        <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
                                        <Button type="submit" colorPalette="blue" loading={createLoading}>Создать</Button>
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
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Логин</Table.ColumnHeader>
                            <Table.ColumnHeader>Email</Table.ColumnHeader>
                            <Table.ColumnHeader>Роль</Table.ColumnHeader>
                            <Table.ColumnHeader>Статус</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {!data || data.content.length === 0 ? (
                            <Table.Row><Table.Cell colSpan={5} textAlign="center" py={8}>Нет пользователей</Table.Cell></Table.Row>
                        ) : (
                            data.content.map((u) => (
                                <Table.Row key={u.id}>
                                    <Table.Cell>{u.id}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{u.username}</Table.Cell>
                                    <Table.Cell>{u.email}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={u.role === 'ADMIN' ? 'purple' : 'blue'}>{u.role}</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={u.enabled ? 'green' : 'red'}>{u.enabled ? 'Активен' : 'Отключен'}</Badge>
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