import { Box, Flex, Heading, HStack, Button, Text, Spacer } from '@chakra-ui/react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const userLinks = [
        { to: '/user/cards', label: 'Мои карты' },
        { to: '/user/transfers', label: 'Переводы' },
    ];

    const adminLinks = [
        { to: '/admin/cards', label: 'Все карты' },
        { to: '/admin/users', label: 'Пользователи' },
        { to: '/admin/block-requests', label: 'Заявки' },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <Flex direction="column" minH="100vh">
            <Box as="header" bg="blue.600" color="white" px={6} py={3} boxShadow="md">
                <Flex align="center" gap={6}>
                    <Heading size="md" cursor="pointer" onClick={() => navigate(isAdmin ? '/admin/cards' : '/user/cards')}>
                        Bank Front
                    </Heading>

                    <HStack gap={2}>
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                style={({ isActive }) => ({
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                })}
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </HStack>

                    <Spacer />

                    <Text fontSize="sm">
                        {user?.username} ({user?.role})
                    </Text>
                    <Button size="sm" colorScheme="red" variant="solid" onClick={logout}>
                        Выйти
                    </Button>
                </Flex>
            </Box>

            <Box as="main" flex="1" p={6} bg="gray.50">
                <Outlet />
            </Box>
        </Flex>
    );
}