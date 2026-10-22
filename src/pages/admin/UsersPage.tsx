import {useEffect, useState, type SubmitEvent} from 'react';
import {
    Box, Heading, Table, Badge, Button, Spinner, Center, Text,
    Dialog, Field, Input, NativeSelect, Portal, Stack
} from '@chakra-ui/react';
import {getUsers, createUser, deleteUser, getUser} from '../../api/users';
import {useAuth} from '../../auth/AuthContext';
import {toaster} from '../../components/ui/toaster';
import type {Page, User, Role} from '../../types/api';
import {Pagination} from '../../components/Pagination';

export function UsersPage() {
    const {user: currentUser} = useAuth();

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

    // Модалка просмотра
    const [viewUser, setViewUser] = useState<User | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const loadUsers = () => {
        setLoading(true);
        getUsers(page, 10)
            .then(setData)
            .catch((e) => toaster.create({title: 'Ошибка', description: e.message, type: 'error'}))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, [page]);

    async function handleCreate(e: SubmitEvent) {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await createUser({username, password, email, role});
            toaster.create({title: 'Успех', description: 'Пользователь создан', type: 'success'});
            setIsOpen(false);
            setUsername('');
            setPassword('');
            setEmail('');
            setRole('USER');
            setPage(0);
            loadUsers();
        } catch (err: any) {
            toaster.create({title: 'Ошибка', description: err.message, type: 'error'});
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleDelete(id: number, name: string) {
        if (!window.confirm(`Отключить пользователя ${name}?`)) return;
        try {
            await deleteUser(id);
            toaster.create({title: 'Пользователь отключен', type: 'success'});
            loadUsers();
        } catch (err: any) {
            toaster.create({title: 'Ошибка', description: err.message, type: 'error'});
        }
    }

    async function handleViewUser(id: number) {
        try {
            const fullUser = await getUser(id);
            setViewUser(fullUser);
            setIsViewOpen(true);
        } catch (err: any) {
            toaster.create({title: 'Ошибка', description: err.message, type: 'error'});
        }
    }

    if (loading) return <Center h="50vh"><Spinner size="xl"/></Center>;

    return (
        <Box>
            <Stack direction="row" justify="space-between" align="center" mb={6}>
                <Heading size="lg">Пользователи</Heading>

                <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                    <Dialog.Trigger asChild>
                        <Button colorPalette="blue">Добавить</Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop/>
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
                                                <Input value={username} onChange={(e) => setUsername(e.target.value)}
                                                       required minLength={3}/>
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Пароль (5-20 символов)</Field.Label>
                                                <Input type="password" value={password}
                                                       onChange={(e) => setPassword(e.target.value)} required
                                                       minLength={5}/>
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Email</Field.Label>
                                                <Input type="email" value={email}
                                                       onChange={(e) => setEmail(e.target.value)} required/>
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Роль</Field.Label>
                                                <NativeSelect.Root>
                                                    <NativeSelect.Field value={role}
                                                                        onChange={(e) => setRole(e.target.value as Role)}>
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </NativeSelect.Field>
                                                    <NativeSelect.Indicator/>
                                                </NativeSelect.Root>
                                            </Field.Root>
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
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Логин</Table.ColumnHeader>
                            <Table.ColumnHeader>Email</Table.ColumnHeader>
                            <Table.ColumnHeader>Роль</Table.ColumnHeader>
                            <Table.ColumnHeader>Статус</Table.ColumnHeader>
                            <Table.ColumnHeader>Действия</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {!data || data.content.length === 0 ? (
                            <Table.Row><Table.Cell colSpan={6} textAlign="center" py={8}>Нет пользователей</Table.Cell></Table.Row>
                        ) : (
                            data.content.map((u) => (
                                <Table.Row key={u.id}>
                                    <Table.Cell>{u.id}</Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            variant="plain"
                                            fontWeight="bold"
                                            color="blue.500"
                                            onClick={() => handleViewUser(u.id)}
                                        >
                                            {u.username}
                                        </Button>
                                    </Table.Cell>
                                    <Table.Cell>{u.email}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={u.role === 'ADMIN' ? 'purple' : 'blue'}>{u.role}</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorPalette={u.enabled ? 'green' : 'red'}>{u.enabled ? 'Активен' : 'Отключен'}</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {u.enabled ? (
                                            u.username === currentUser?.username ? (
                                                <Text fontSize="xs" color="gray.500">Это вы</Text>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    colorPalette="red"
                                                    variant="outline"
                                                    onClick={() => handleDelete(u.id, u.username)}
                                                >
                                                    Отключить
                                                </Button>
                                            )
                                        ) : (
                                            <Text fontSize="xs" color="gray.500">—</Text>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>
            {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage}/>}

            {/* Модалка просмотра деталей пользователя */}
            <Dialog.Root open={isViewOpen} onOpenChange={(e) => setIsViewOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Информация о пользователе</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                {viewUser && (
                                    <Stack gap={3}>
                                        <Box><Text fontWeight="bold" fontSize="sm"
                                                   color="gray.500">ID:</Text> {viewUser.id}</Box>
                                        <Box><Text fontWeight="bold" fontSize="sm"
                                                   color="gray.500">Логин:</Text> {viewUser.username}</Box>
                                        <Box><Text fontWeight="bold" fontSize="sm"
                                                   color="gray.500">Email:</Text> {viewUser.email}</Box>
                                        <Box><Text fontWeight="bold" fontSize="sm" color="gray.500">Роль:</Text> <Badge
                                            colorPalette={viewUser.role === 'ADMIN' ? 'purple' : 'blue'}>{viewUser.role}</Badge></Box>
                                        <Box><Text fontWeight="bold" fontSize="sm" color="gray.500">Статус:</Text>
                                            <Badge
                                                colorPalette={viewUser.enabled ? 'green' : 'red'}>{viewUser.enabled ? 'Активен' : 'Отключен'}</Badge></Box>
                                        <Box><Text fontWeight="bold" fontSize="sm" color="gray.500">Дата
                                            регистрации:</Text> {new Date(viewUser.createdAt).toLocaleString('ru-RU')}
                                        </Box>
                                    </Stack>
                                )}
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button onClick={() => setIsViewOpen(false)}>Закрыть</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
}