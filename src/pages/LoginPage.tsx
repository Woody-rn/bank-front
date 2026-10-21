import {useState, type SubmitEvent} from 'react';
import {
    Box,
    Button,
    Card,
    Field,
    Heading,
    Input,
    Stack,
    Text,
} from '@chakra-ui/react';
import {useAuth} from '../auth/AuthContext';
import {ApiError} from '../api/client';

export function LoginPage() {
    const {login} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login({username, password});
        } catch (err) {
            if (err instanceof ApiError) setError(err.message);
            else setError('Не удалось войти');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" p={4}>
            <Card.Root w="400px" p={6}>
                <Card.Body>
                    <Heading mb={4} size="lg">Вход</Heading>

                    <form onSubmit={onSubmit}>
                        <Stack gap={4}>
                            <Field.Root>
                                <Field.Label>Логин</Field.Label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin или user"
                                    autoComplete="username"
                                />
                            </Field.Root>

                            <Field.Root>
                                <Field.Label>Пароль</Field.Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </Field.Root>

                            {error && <Text color="red.500" fontSize="sm">{error}</Text>}

                            <Button type="submit" colorScheme="blue" loading={loading} w="full">
                                Войти
                            </Button>
                        </Stack>
                    </form>

                    <Text mt={4} fontSize="xs" color="gray.500">
                        admin / admin123 &nbsp;·&nbsp; user / user123
                    </Text>
                </Card.Body>
            </Card.Root>
        </Box>
    );
}