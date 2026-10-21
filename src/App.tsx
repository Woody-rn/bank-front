import { Routes, Route, Navigate } from 'react-router-dom';
import { Heading } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';

// временные заглушки — заменим в Блоке 4
function Stub({ title }: { title: string }) {
    return <Heading>{title} — скоро</Heading>;
}

function HomeRedirect() {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Navigate to={isAdmin ? '/admin/cards' : '/user/cards'} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<HomeRedirect />} />

                {/* USER */}
                <Route element={<ProtectedRoute role="USER" />}>
                    <Route element={<Layout />}>
                        <Route path="/user/cards" element={<Stub title="Мои карты" />} />
                        <Route path="/user/transfers" element={<Stub title="Переводы" />} />
                    </Route>
                </Route>

                {/* ADMIN */}
                <Route element={<ProtectedRoute role="ADMIN" />}>
                    <Route element={<Layout />}>
                        <Route path="/admin/cards" element={<Stub title="Все карты" />} />
                        <Route path="/admin/users" element={<Stub title="Пользователи" />} />
                        <Route path="/admin/block-requests" element={<Stub title="Заявки на блокировку" />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}